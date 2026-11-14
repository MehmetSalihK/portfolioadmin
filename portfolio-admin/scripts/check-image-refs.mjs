/**
 * Vérification en lecture seule : une image de /public peut être référencée
 * par le contenu MongoDB (imageUrl, gallery…) même si aucun fichier source
 * ne l'importe. On scanne toutes les collections avant toute suppression.
 */
import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const uri = env.match(/^MONGODB_URI=(.*)$/m)?.[1]?.trim();
if (!uri) throw new Error('MONGODB_URI introuvable dans .env');

const needles = [
  'montage.jpg',
  'Diagnostic & Réparation Smartphones',
  'Prototypage IoT',
  'Trends_05_Security',
];

const client = await MongoClient.connect(uri);
try {
  const db = client.db();
  const collections = await db.listCollections().toArray();
  let hits = 0;
  for (const c of collections) {
    const docs = await db.collection(c.name).find({}).toArray();
    for (const d of docs) {
      const s = JSON.stringify(d);
      for (const n of needles) {
        if (s.includes(n)) {
          hits++;
          console.log(`HIT  collection="${c.name}"  _id=${d._id}  contient "${n}"`);
        }
      }
    }
    if (docs.length) console.log(`scanned ${c.name}: ${docs.length} docs`);
  }
  console.log(hits === 0 ? 'AUCUNE RÉFÉRENCE EN BASE — suppression sûre' : `${hits} référence(s) trouvée(s) — NE PAS SUPPRIMER`);
} finally {
  await client.close();
}
