// Script pour vérifier et ajouter le champ position dans MongoDB

// Se connecter à la base de données
use('test');

// Vérifier le document actuel
console.log('Document actuel dans settings:');
const currentDoc = db.settings.findOne();
console.log(JSON.stringify(currentDoc, null, 2));

// Vérifier si le champ position existe
if (currentDoc && !currentDoc.hasOwnProperty('position')) {
    console.log('\nLe champ position n\'existe pas. Ajout en cours...');
    
    // Ajouter le champ position avec une valeur par défaut
    const result = db.settings.updateOne(
        {},
        { $set: { position: "60180 Nogent-sur-Oise" } },
        { upsert: true }
    );
    
    console.log('Résultat de la mise à jour:', result);
    
    // Vérifier le document après mise à jour
    console.log('\nDocument après mise à jour:');
    const updatedDoc = db.settings.findOne();
    console.log(JSON.stringify(updatedDoc, null, 2));
} else if (currentDoc && currentDoc.hasOwnProperty('position')) {
    console.log('\nLe champ position existe déjà avec la valeur:', currentDoc.position);
} else {
    console.log('\nAucun document trouvé dans la collection settings.');
    
    // Créer un nouveau document avec tous les champs nécessaires
    const newDoc = {
        email: "contact@mehmetsalihk.fr",
        siteDescription: "",
        siteTitle: "Bienvenue sur mon Portfolio",
        github: "https://github.com/mehmetsalihk",
        linkedin: "https://www.linkedin.com/in/mehmetsalihk",
        phone: "",
        telegram: "",
        twitter: "",
        whatsapp: "",
        position: "60180 Nogent-sur-Oise"
    };
    
    const result = db.settings.insertOne(newDoc);
    console.log('Nouveau document créé:', result);
}