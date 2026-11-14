/**
 * next-sitemap injecte systématiquement un directive `Host:` héritée de
 * l'ancien format Yahoo/Bing — ignorée par Google et Bing, mais inutile.
 * Post-traitement : on la retire après la génération.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const robotsUrl = new URL('../public/robots.txt', import.meta.url);
const before = readFileSync(robotsUrl, 'utf8');
const after = before.replace(/# Host\nHost: [^\n]+\n\n?/g, '');

if (after !== before) {
  writeFileSync(robotsUrl, after);
  console.log('[fix-robots] directive Host retirée de public/robots.txt');
}
