import path from 'path';
import fs from 'fs/promises';

/**
 * Sécurisation des uploads (OWASP ASVS V5 / Top 10 A04-A08).
 *
 * 1. Le nom de fichier est sanitisé (aucun chemin, aucun caractère dangereux).
 * 2. L'extension est vérifiée contre une liste blanche.
 * 3. Le contenu est vérifié par MAGIC BYTES : le type MIME déclaré par le
 *    client est toujours considéré comme non fiable.
 * 4. SVG refusé : il permettrait du JavaScript stocké servi depuis le domaine.
 */

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'] as const;
export const DOC_EXTENSIONS = ['.pdf'] as const;
export const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, ...DOC_EXTENSIONS] as const;

/** Retire tout caractère de contrôle et tout caractère de chemin, limite la longueur. */
export function sanitizeFilename(name: string): string {
  const base = path
    .basename(String(name ?? ''))
    .replace(/[\u0000-\u001f\u007f]/g, '')
    // caractères autorisés uniquement (empêche espaces, quotes, `;`, etc.)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // évite les fichiers cachés / extensions doubles trompeuses
    .replace(/^\.+/, '')
    .slice(0, 120);

  return base || 'file';
}

export function extensionOf(name: string): string {
  return path.extname(name || '').toLowerCase();
}

export function isAllowedExtension(name: string, allowed: readonly string[] = ALL_EXTENSIONS): boolean {
  const ext = extensionOf(name);
  return ext.length > 1 && (allowed as readonly string[]).includes(ext);
}

export type FileKind = 'image' | 'pdf' | 'video' | 'audio' | 'text';

/** Extension → type de contenu attendu (liste blanche). */
const EXT_KIND: Record<string, FileKind> = {
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.webp': 'image',
  '.gif': 'image',
  '.avif': 'image',
  '.pdf': 'pdf',
  '.mp4': 'video',
  '.webm': 'video',
  '.mp3': 'audio',
  '.wav': 'audio',
  '.ogg': 'audio',
  '.txt': 'text',
};

export function expectedKindForExtension(name: string): FileKind | null {
  return EXT_KIND[extensionOf(name)] ?? null;
}

/** Famille de contenu (cohérence avec le type MIME déclaré). */
export function familyOf(kind: FileKind): 'image' | 'video' | 'audio' | 'document' {
  if (kind === 'image') return 'image';
  if (kind === 'video') return 'video';
  if (kind === 'audio') return 'audio';
  return 'document'; // pdf + txt
}

const AVIF_BRANDS = ['avif', 'avis', 'heic', 'heix', 'hevc', 'mif1', 'msf1'];

/** Identifie le contenu réel d'un fichier à partir de ses octets de signature. */
export function sniffFileKind(buffer: Buffer): FileKind | null {
  if (!buffer || buffer.length < 8) return null;

  const ascii = (start: number, end: number) => buffer.subarray(start, end).toString('latin1');

  // JPEG : FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image';
  // PNG : 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image';
  // GIF : "GIF87a" / "GIF89a"
  if (ascii(0, 4) === 'GIF8') return 'image';
  // ISO BMFF : .... "ftyp" → image (avif/heic) ou vidéo (mp4 et dérivés)
  if (ascii(4, 8) === 'ftyp') {
    return AVIF_BRANDS.includes(ascii(8, 12)) ? 'image' : 'video';
  }
  // RIFF : "WEBP" → image, "WAVE" → audio
  if (ascii(0, 4) === 'RIFF') {
    const format = ascii(8, 12);
    if (format === 'WEBP') return 'image';
    if (format === 'WAVE') return 'audio';
    return null;
  }
  // Matroska/WebM : 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return 'video';
  // Ogg : "OggS"
  if (ascii(0, 4) === 'OggS') return 'audio';
  // MP3 : en-tête "ID3" ou synchro de trame
  if (ascii(0, 3) === 'ID3') return 'audio';
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return 'audio';
  // PDF : "%PDF-"
  if (ascii(0, 5) === '%PDF-') return 'pdf';

  // Texte : aucun octet NUL et très peu de caractères de contrôle.
  const head = buffer.subarray(0, Math.min(buffer.length, 512));
  let hasNul = false;
  let control = 0;
  for (let i = 0; i < head.length; i += 1) {
    const byte = head[i];
    if (byte === 0) {
      hasNul = true;
      break;
    }
    if (byte < 9 || (byte > 13 && byte < 32) || byte === 127) control += 1;
  }
  if (!hasNul && control <= head.length * 0.1) return 'text';

  return null;
}

/** Lit les premiers octets d'un fichier (détection par signature). */
export async function readFileHead(filePath: string, bytes = 64): Promise<Buffer> {
  const handle = await fs.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const { bytesRead } = await handle.read(buf, 0, bytes, 0);
    return buf.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/**
 * Vérifie qu'une extension est autorisée et que le contenu réel correspond
 * au type de contenu attendu pour cette extension.
 */
export function validateUploadContent(
  filename: string,
  buffer: Buffer
): { ok: true; kind: FileKind } | { ok: false; error: string } {
  const expected = expectedKindForExtension(filename);
  if (!expected) {
    return { ok: false, error: `Extension non autorisée (autorisées : ${Object.keys(EXT_KIND).join(', ')})` };
  }

  const actual = sniffFileKind(buffer);
  if (!actual) {
    return { ok: false, error: 'Contenu du fichier non reconnu (signature invalide)' };
  }
  if (actual !== expected) {
    return { ok: false, error: 'Le contenu du fichier ne correspond pas à son extension' };
  }

  return { ok: true, kind: expected };
}
