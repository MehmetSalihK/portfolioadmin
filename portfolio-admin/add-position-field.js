const { MongoClient } = require('mongodb');

// URI de connexion MongoDB
const uri = 'mongodb+srv://portfolio:port123@portfolio.64jmn.mongodb.net/';
const dbName = 'test'; // Base de données par défaut

async function addPositionField() {
    const client = new MongoClient(uri);
    
    try {
        // Se connecter à MongoDB
        await client.connect();
        console.log('Connexion à MongoDB réussie!');
        
        const db = client.db(dbName);
        const collection = db.collection('settings');
        
        // Vérifier le document actuel
        const currentDoc = await collection.findOne({});
        console.log('Document actuel:', JSON.stringify(currentDoc, null, 2));
        
        if (currentDoc && !currentDoc.hasOwnProperty('position')) {
            console.log('\nLe champ position n\'existe pas. Ajout en cours...');
            
            // Ajouter le champ position
            const result = await collection.updateOne(
                {},
                { $set: { position: '60180 Nogent-sur-Oise' } },
                { upsert: true }
            );
            
            console.log('Résultat de la mise à jour:', result);
            
            // Vérifier le document après mise à jour
            const updatedDoc = await collection.findOne({});
            console.log('\nDocument après mise à jour:', JSON.stringify(updatedDoc, null, 2));
            
        } else if (currentDoc && currentDoc.hasOwnProperty('position')) {
            console.log('\nLe champ position existe déjà avec la valeur:', currentDoc.position);
        } else {
            console.log('\nAucun document trouvé. Création d\'un nouveau document...');
            
            const newDoc = {
                email: 'contact@mehmetsalihk.fr',
                siteDescription: '',
                siteTitle: 'Bienvenue sur mon Portfolio',
                github: 'https://github.com/mehmetsalihk',
                linkedin: 'https://www.linkedin.com/in/mehmetsalihk',
                phone: '',
                telegram: '',
                twitter: '',
                whatsapp: '',
                position: '60180 Nogent-sur-Oise'
            };
            
            const result = await collection.insertOne(newDoc);
            console.log('Nouveau document créé:', result);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await client.close();
        console.log('\nConnexion fermée.');
    }
}

// Exécuter le script
addPositionField().catch(console.error);