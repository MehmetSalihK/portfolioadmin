/** Vérification WCAG des couples texte/fond après la passe C2. */
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const blend = (fg, alpha, bg) => {
  const p = (h, i) => parseInt(h.slice(i, i + 2), 16);
  const c = [1, 3, 5].map((i) => Math.round(p(fg, i) * alpha + p(bg, i) * (1 - alpha)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};

const paper = '#efeae1', ink = '#0c0c0b', fgP = '#14130f', fgI = '#ede9e3';
const checks = [
  ['texte /60 sur Papier (avant 3.0:1)', blend(fgP, 0.6, paper), paper, 4.5],
  ['texte /60 sur Encre', blend(fgI, 0.6, ink), ink, 4.5],
  ['text-dim clair #6b665d sur Papier', '#6b665d', paper, 4.5],
  ['text-dim clair #6b665d sur surface #f6f2ea', '#6b665d', '#f6f2ea', 4.5],
  ['text-dim sombre #857f74 sur Encre', '#857f74', ink, 4.5],
  ['text-muted clair #55514a sur Papier', '#55514a', paper, 4.5],
  ['text-muted sombre #a09a91 sur Encre', '#a09a91', ink, 4.5],
  ['accent-text #c0330a sur Papier', '#c0330a', paper, 4.5],
];
let fail = 0;
for (const [label, fg, bg, min] of checks) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${r.toFixed(2)}:1  ${label}`);
}
process.exit(fail ? 1 : 0);
