const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({
  maxInstances: 10,
});

exports.openGiftBox = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be signed in."
    );
  }

  const userUid = request.auth.uid;

  const userSnap = await db
    .collection("users")
    .doc(userUid)
    .get();

  if (!userSnap.exists) {
    throw new HttpsError(
      "not-found",
      "User profile not found."
    );
  }

  const userData = userSnap.data();

  if (userData.role !== "student") {
    throw new HttpsError(
      "permission-denied",
      "Student account required."
    );
  }

  const studentId = userData.studentId;

  if (!studentId) {
    throw new HttpsError(
      "failed-precondition",
      "Student ID is missing."
    );
  }

  const studentRef = db
    .collection("students")
    .doc(studentId);

  const prizes = [
    "Pen",
    "Pencil",
    "Notebook",
    "Eraser",
    "Pencil Sharpener",
    "Ruler",
    "Surprise",
  ];

  const result = await db.runTransaction(async (transaction) => {
    const studentSnap = await transaction.get(studentRef);

    if (!studentSnap.exists) {
      throw new HttpsError(
        "not-found",
        "Student profile not found."
      );
    }

    const studentData = studentSnap.data();
    const currentBalance = Number(
      studentData.crystalBalance ?? 0
    );

    if (currentBalance < 15) {
      throw new HttpsError(
        "failed-precondition",
        "Not enough crystals."
      );
    }

    const randomPrize =
      prizes[Math.floor(Math.random() * prizes.length)];

    const redemptionRef = studentRef
      .collection("redemptions")
      .doc();

    const newBalance = currentBalance - 15;

    transaction.update(studentRef, {
      crystalBalance: newBalance,
    });

    transaction.set(redemptionRef, {
      rewardId: "gift_box",
      rewardType: "Gift Box",
      prize: randomPrize,
      cost: 15,
      openedAt: admin.firestore.FieldValue.serverTimestamp(),
      claimed: false,
    });

    return {
      prize: randomPrize,
      newBalance,
    };
  });

  return result;
});