/**
 * Design sonore « mécanique de projection » — très subtil, généré à la volée
 * (aucun fichier, aucun réseau), désactivé par défaut, jamais d'autoplay :
 * le contexte AudioContext n'est créé qu'après un geste utilisateur explicite.
 *
 * Deux événements seulement :
 *  - 'tick' : l'avance d'une case (filtre, bascule de vue au laboratoire)
 *  - 'gate' : l'ouverture d'une planche (modale projet)
 */

const STORAGE_KEY = 'msk.sound';

let ctx: AudioContext | null = null;
let enabled = false;

export function initSound(): boolean {
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    enabled = false;
  }
  return enabled;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    /* stockage indisponible : la préférence vit en mémoire pour la session */
  }
  if (value) ensureContext();
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

/** Un événement mécanique : oscillateur court, enveloppe sèche, volume très bas. */
export function playSfx(kind: 'tick' | 'gate'): void {
  if (!enabled || typeof window === 'undefined') return;
  const c = ensureContext();
  if (!c) return;

  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  if (kind === 'tick') {
    /* Avance : clic aigu et bref (14 ms de montée, 45 ms de chute) */
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1560, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  } else {
    /* obturateur : claquement grave, un seul cycle */
    osc.type = 'square';
    osc.frequency.setValueAtTime(190, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  }

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.09);
  osc.onended = () => {
    try {
      osc.disconnect();
      gain.disconnect();
    } catch {
      /* déjà détaché */
    }
  };
}
