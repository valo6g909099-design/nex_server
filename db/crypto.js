const { db } = require("./init");
const admin = require("firebase-admin");

const usersCollection = db.collection("crypto");

const {
  comparePortfolio,
  createCryptoData,
  updatePortfolioAmount,
} = require("./../utils/cryptoManager");

const FIVE_MIN = 5 * 60 * 1000;

function cleanPortfolio(data) {
  const copy = { ...data };
  delete copy.createdAt;
  delete copy.updatedAt;
  delete copy.type;
  return copy;
}
async function deleteCryptoDocsByEmails(emailList) {
  try {
    if (!emailList || emailList.length === 0) {
    console.log("No emails provided.");
    return;
  }

  const batch = db.batch();
  let deletedCount = 0;

  for (const email of emailList) {
   try {
     const snapshot = await usersCollection
      .where("email", "==", email)
      .get();

    if (!snapshot.empty) {
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });
    } else {
      console.log("No crypto docs found for email:", email);
    }
   } catch (error) {
    
   }
  }

  await batch.commit();
  console.log(`Deleted ${deletedCount} crypto docs.`);
  } catch (error) {
    
  }
}

module.exports = { getProtfolio, deleteCryptoDocsByEmails };
async function deleteAllCryptoDocs() {
  try {
    const snapshot = await db.collection("crypto").get();

    if (snapshot.empty) {
      console.log("No documents to delete");
      return;
    }

    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log("All crypto documents deleted successfully");
  } catch (error) {
    console.error("Error deleting crypto docs:", error);
  }
}







async function getProtfolio(userCryptoData) {
// await  deleteAllCryptoDocs()
  try {
    const newsnapshot = await usersCollection.where("type", "==", "new").get();
    const prevsnapshot = await usersCollection
      .where("type", "==", "prev")
      .get();

    let newDoc, prevDoc;
    let newSnapDoc, prevSnapDoc;

    if (newsnapshot.empty || prevsnapshot.empty) {
      const prevData = createCryptoData();
      const newData = createCryptoData();

      const newRef = await usersCollection.add({
        ...newData,
        type: "new",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const prevRef = await usersCollection.add({
        ...prevData,
        type: "prev",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      newDoc = newData;
      prevDoc = prevData;
    } else {
      newSnapDoc = newsnapshot.docs[0];
      prevSnapDoc = prevsnapshot.docs[0];

      newDoc = newSnapDoc.data();
      prevDoc = prevSnapDoc.data();

      const lastUpdate = newDoc.updatedAt?.toDate()?.getTime() || 0;
      const now = Date.now();

      if (now - lastUpdate > FIVE_MIN) {
        await usersCollection.doc(prevSnapDoc.id).delete();

        await usersCollection.doc(newSnapDoc.id).update({
          type: "prev",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const freshData = createCryptoData();

        await usersCollection.add({
          ...freshData,
          type: "new",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        prevDoc = newDoc;
        newDoc = freshData;
      }
    }

    const cleanPrev = cleanPortfolio(prevDoc);
    const cleanNew = cleanPortfolio(newDoc);

    const userPrev = updatePortfolioAmount(cleanPrev, userCryptoData);
    const userNew = updatePortfolioAmount(cleanNew, userCryptoData);

    const compare = comparePortfolio(userPrev, userNew);

    return {
      success: true,
      portfolio: userNew,
      compare,
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: "Failed to fetch portfolio",
    };
  }
}

module.exports = { getProtfolio ,deleteCryptoDocsByEmails};




