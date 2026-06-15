const { db } = require("./init");
const admin = require("firebase-admin");

const usersCollection = db.collection("users");
async function deleteUsersByEmails(emailList) {
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
      .limit(1)
      .get();

    if (!snapshot.empty) {
      batch.delete(snapshot.docs[0].ref);
      deletedCount++;
    } else {
      console.log("User not found for email:", email);
    }
   } catch (error) {
    
   }
  }

  await batch.commit();
  console.log(`Deleted ${deletedCount} users.`);
  } catch (error) {
    
  }
}
async function getUsersEmailsNotAdmin() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const snapshot = await usersCollection
    .where("createdAt", "<=", twoDaysAgo)
    .get();

  const emails = snapshot.docs
    .map((doc) => doc.data())
    .filter((user) => !user.isAdmin) 
    .map((user) => user.email);

  console.log("Non-admin users (2+ days old) emails:", emails);
  return emails;
}
async function createUser(userData) {
  const docRef = await usersCollection.add({
    ...userData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("User created with ID:", docRef.id);
  return docRef.id;
}

async function getUserById(userId) {
  const doc = await usersCollection.doc(userId).get();

  if (!doc.exists) {
    console.log("User not found:", userId);
    return null;
  }

  return { id: doc.id, ...doc.data() };
}

async function getUserByEmail(email) {
  const snapshot = await usersCollection
    .where("email", "==", email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.log("User not found with email:", email);
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function getAllUsers() {
  const snapshot = await usersCollection.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function updateUser(userId, updatedData) {
  const docRef = usersCollection.doc(userId);

  await docRef.set(
    {
      ...updatedData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log("User updated (safe):", userId);
}

async function deleteUser(userId) {
  const docRef = usersCollection.doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log("User already not found:", userId);
    return;
  }

  await docRef.delete();
  console.log("User deleted:", userId);
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
  getUsersEmailsNotAdmin,deleteUsersByEmails
};
