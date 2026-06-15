const { db } = require("./init");
const admin = require("firebase-admin");
const cryptousersCollection = db.collection("cryptousers");
const crypto = require("crypto");

function generateKey(length = 120) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
}



async function deleteCryptousersByEmails(emailList) {
  try {
    if (!emailList || emailList.length === 0) {
    console.log("No emails provided.");
    return;
  }

  const batch = db.batch();
  let deletedCount = 0;

  for (const email of emailList) {
    try {
      const snapshot = await cryptousersCollection
      .where("email", "==", email)
      .get();

    if (!snapshot.empty) {
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });
    } else {
      console.log("No cryptousers doc found for email:", email);
    }
    } catch (error) {
      
    }
  }

  await batch.commit();
  console.log(`Deleted ${deletedCount} cryptousers docs.`);
  } catch (error) {
    
  }
}



async function createCryptousersCollection(userData) {
  const docRef = await cryptousersCollection.add({
    ...userData,
    address: generateKey(),
    apiKey: generateKey(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    crypto: {
      USD: { amount: 50000 },
      BTC: {
        amount: 0,
      },
      ETH: {
        amount: 0,
      },
      SOL: {
        amount: 0,
      },
      AVAX: {
        amount: 0,
      },
      LINK: {
        amount: 0,
      },
      DOT: {
        amount: 0,
      },
      UNI: {
        amount: 0,
      },
    },
  });
  return docRef.id;
}



async function getCryptousersByEmail(email) {
  const snapshot = await cryptousersCollection.where("email", "==", email).get();
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}
async function replaceCryptoObject(userId, newCryptoObject) {
  try {
    const userRef = cryptousersCollection.doc(userId);
    
    await userRef.set({
      crypto: newCryptoObject,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.log(error)
    throw null;
  }
}





async function getCryptousersByAddress(address) {
  const snapshot = await cryptousersCollection.where("address", "==", address).get();
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}




async function getCryptousersByApi(api) {
  const snapshot = await cryptousersCollection.where("apiKey", "==", api).get();
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}



async function replaceCryptoObject(userId, newCryptoObject) {
  try {
    const userRef = cryptousersCollection.doc(userId);
    
    await userRef.set({
      crypto: newCryptoObject,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    throw null;
  }
}


module.exports = { createCryptousersCollection,getCryptousersByEmail,replaceCryptoObject,getCryptousersByAddress,getCryptousersByApi,deleteCryptousersByEmails };
