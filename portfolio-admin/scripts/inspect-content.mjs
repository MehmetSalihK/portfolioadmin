/* Inspection du contenu réel (lecture seule) : homeData, projets, expériences.
   Sert à caler le copywriting et les case studies sur des données réelles. */
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const uri = (env.match(/^MONGODB_URI=(.*)$/m) || [])[1]?.trim();
if (!uri) { console.error('MONGODB_URI introuvable'); process.exit(1); }

await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

const db = mongoose.connection.db;
const home = await db.collection('homepagees').findOne().catch(() => null)
  || await db.collection('homepage').findOne().catch(() => null);

console.log('=== HOME ===');
if (home) {
  console.log('title:', JSON.stringify(home.title));
  console.log('subtitle:', JSON.stringify(home.subtitle));
  console.log('subtitle_en:', JSON.stringify(home.subtitle_en));
  console.log('aboutText:', JSON.stringify(home.aboutText));
} else console.log('aucun document home');

console.log('\n=== COLLECTIONS ===');
console.log((await db.listCollections().toArray()).map(c => c.name).join(', '));

const projects = await db.collection('projects').find({ archived: { $ne: true } }).toArray();
console.log(`\n=== PROJETS (${projects.length}) ===`);
for (const p of projects) {
  const gh = p.githubData ? `gh[lang=${p.githubData.language ?? '-'},★${p.githubData.stars ?? 0},f${p.githubData.forks ?? 0}]` : 'gh:none';
  console.log(
    `— ${String(p.title).slice(0, 46).padEnd(46)} | cat=${String(p.category ?? '-').padEnd(9)} | feat=${p.featured ? 'Y' : 'n'} | show=${p.showOnHomepage ? 'Y' : 'n'} | ${gh} | demo=${p.demoUrl ? 'Y' : 'n'} gh=${p.githubUrl ? 'Y' : 'n'} gal=${(p.gallery || []).length} | desc=${String(p.description || '').replace(/\s+/g, ' ').slice(0, 70)}`
  );
}
const cats = {};
projects.forEach(p => { cats[p.category ?? '(none)'] = (cats[p.category ?? '(none)'] || 0) + 1; });
console.log('catégories:', JSON.stringify(cats));
console.log('avec githubData:', projects.filter(p => p.githubData).length);
console.log('avec description longue (>120):', projects.filter(p => (p.description || '').length > 120).length);

const exps = await db.collection('experiences').find({ isVisible: { $ne: false } }).toArray();
console.log(`\n=== EXPÉRIENCES (${exps.length}) ===`);
for (const e of exps) console.log(`— ${e.title} @ ${e.company} (${e.location}) ${String(e.startDate).slice(0, 10)} → ${e.endDate ? String(e.endDate).slice(0, 10) : 'présent'}`);

const seo = await db.collection('seos').find({}).toArray().catch(() => []);
console.log(`\n=== SEO (${seo.length}) ===`);
seo.forEach(s => console.log(`— ${s.page}: ${JSON.stringify(s.title)} / ${JSON.stringify(String(s.description || '').slice(0, 90))}`));

await mongoose.disconnect();
