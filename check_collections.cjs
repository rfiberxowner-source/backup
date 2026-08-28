const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

db.listCollections().then(collections => {
  for (let collection of collections) {
    console.log(`Found collection: ${collection.id}`);
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
