const { db } = require("./init");
const admin = require("firebase-admin");
const cryptousersCollection = db.collection("record");
const crypto = require("crypto");

async function postCryptoRecord(userData) {
  const docRef = await cryptousersCollection.add({
    recv: userData.recv || "",
    send: userData.send || "",
    value: userData.value || "",
    time: admin.firestore.FieldValue.serverTimestamp(),
    type: userData.type,
  });
  return docRef.id;
}

async function getCryptoRecord(email) {
  const [recvSnap, sendSnap] = await Promise.all([
    cryptousersCollection.where("recv", "==", email).get(),
    cryptousersCollection.where("send", "==", email).get(),
  ]);

  const results = new Map();

  recvSnap.forEach((doc) => results.set(doc.id, { id: doc.id, ...doc.data() }));
  sendSnap.forEach((doc) => results.set(doc.id, { id: doc.id, ...doc.data() }));

  return Array.from(results.values());
}

async function deleteCryptoRecord(email) {
  const [recvSnap, sendSnap] = await Promise.all([
    cryptousersCollection.where("recv", "==", email).get(),
    cryptousersCollection.where("send", "==", email).get(),
  ]);

  const seen = new Set();
  const batch = db.batch();

  for (const doc of [...recvSnap.docs, ...sendSnap.docs]) {
    if (!seen.has(doc.id)) {
      seen.add(doc.id);
      batch.delete(doc.ref);
    }
  }
  await batch.commit();
  return seen.size;
}
async function deleteCryptoRecordByEmails(emails = []) {
  try {
    if (!emails.length) return 0;

    const seen = new Set();
    const chunkSize = 10;
    let totalDeleted = 0;

    let batch = db.batch();
    let opCount = 0;
    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      const [recvSnap, sendSnap] = await Promise.all([
        cryptousersCollection.where("recv", "in", chunk).get(),
        cryptousersCollection.where("send", "in", chunk).get(),
      ]);
      
      for (const doc of [...recvSnap.docs, ...sendSnap.docs]) {
        try {
          if (!seen.has(doc.id)) {
            seen.add(doc.id);
            batch.delete(doc.ref);
            opCount++;
            totalDeleted++;

            if (opCount === 500) {
              await batch.commit();
              batch = db.batch();
              opCount = 0;
            }
          }
        } catch (error) {

        }
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    return totalDeleted;
  } catch (error) {
  }
}

async function deleteOldCryptoRecords(days = 2) {
  const batchSize = 500;
  let totalDeleted = 0;

  const now = Date.now();
  const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);

  while (true) {
    const snapshot = await cryptousersCollection
      .where("time", "<", cutoff)
      .limit(batchSize)
      .get();

    if (snapshot.empty) break;

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    totalDeleted += snapshot.size;

    await new Promise(res => setTimeout(res, 100));
  }

  return totalDeleted;
}
module.exports = {
  postCryptoRecord,
  getCryptoRecord,
  deleteCryptoRecord,
  deleteCryptoRecordByEmails,
  deleteOldCryptoRecords,
  
};
