/* Lecture seule : vérifie la collection homepages (subtitle réellement servi). */
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const uri = (env.match(/^MONGODB_URI=(.*)$/m) || [])[1]?.trim();
await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
const db = mongoose.connection.db;

const home = await db.collection('homepages').findOne();
if (!home) {
  console.log('AUCUN document homepages → le défaut CODE fait foi (defaultHomeData.subtitle).');
} else {
  console.log('Document homepages trouvé. Champs non vides :');
  for (const [k, v] of Object.entries(home)) {
    if (typeof v === 'string' && v.trim() && k !== '_id') console.log(`  ${k} = ${JSON.stringify(v.slice(0, 140))}`);
  }
}

const settings = await db.collection('settings').findOne();
console.log('\nsettings.siteTitle =', JSON.stringify(settings?.siteTitle));
console.log('settings keys:', settings ? Object.keys(settings).join(', ') : '-');

await mongoose.disconnect();
