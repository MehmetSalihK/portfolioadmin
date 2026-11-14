/* Lecture seule : champs réellement renseignés des projets + expériences. */
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const uri = (env.match(/^MONGODB_URI=(.*)$/m) || [])[1]?.trim();
await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
const db = mongoose.connection.db;

const ps = await db.collection('projects').find({ archived: { $ne: true } }).toArray();
const withTech = ps.filter(p => (p.technologies || []).length);
console.log('avec technologies:', withTech.length, '/', ps.length);
console.log('avec demoUrl:', ps.filter(p => p.demoUrl).length);
console.log('avec imageUrl:', ps.filter(p => p.imageUrl).length);
console.log('avec tags:', ps.filter(p => (p.tags || []).length).length);
console.log('status distincts:', JSON.stringify([...new Set(ps.map(p => p.status))]));
console.log('difficulty distincts:', JSON.stringify([...new Set(ps.map(p => p.difficulty))]));
const keys = new Set();
ps.forEach(p => Object.keys(p).forEach(k => keys.add(k)));
console.log('clés:', [...keys].join(', '));
console.log('\néchantillon technologies:');
withTech.slice(0, 6).forEach(p => console.log('—', p.title, '→', JSON.stringify(p.technologies)));
console.log('\ntechnologies vides:', ps.length - withTech.length);

console.log('\n=== EXPÉRIENCES (descriptions) ===');
const exps = await db.collection('experiences').find({}).toArray();
exps.forEach(e => console.log('—', e.title, '@', e.company, '|', String(e.description || '').replace(/\s+/g, ' ').slice(0, 260), '| tech:', JSON.stringify(e.technologies || [])));

console.log('\n=== SETTINGS ===');
const settings = await db.collection('settings').findOne();
console.log(settings ? JSON.stringify({ email: settings.email, position: settings.position, position_en: settings.position_en, siteTitle: settings.siteTitle, siteDescription: String(settings.siteDescription || '').slice(0, 120) }) : 'aucun');

await mongoose.disconnect();
