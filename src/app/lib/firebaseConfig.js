import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

export const saveResponse = async (
  studentId,
  subject,
  period,
  gameName,
  isCorrect
) => {
  try {
    const studentDocRef = doc(db, "students", studentId);
    const studentDoc = await getDoc(studentDocRef);

    if (studentDoc.exists()) {
      console.log("Updating existing student document");
      await updateDoc(studentDocRef, {
        [`stats.${period}.${subject}.${gameName}.correctCount`]: increment(
          isCorrect ? 1 : 0
        ),
        [`stats.${period}.${subject}.${gameName}.incorrectCount`]: increment(
          !isCorrect ? 1 : 0
        ),
      });
    } else {
      console.log("Creating new student document");
      await setDoc(studentDocRef, {
        name: studentDoc.data().name,
        lastName: studentDoc.data().lastName,
        password: studentDoc.data().password,
        uid: studentDoc.data().uid,
        stats: {
          [period]: {
            [subject]: {
              [gameName]: {
                correctCount: isCorrect ? 1 : 0,
                incorrectCount: !isCorrect ? 1 : 0,
              },
            },
          },
        },
      });
    }

    console.log("Response saved successfully");
  } catch (error) {
    console.error("Error saving response: ", error);
  }
};

export const getStudentStats = async (studentId, period, subject) => {
  try {
    const studentDocRef = doc(db, "students", studentId);
    const studentDoc = await getDoc(studentDocRef);

    if (studentDoc.exists()) {
      const stats = studentDoc.data().stats;
      if (stats && stats[period] && stats[period][subject]) {
        return stats[period][subject];
      } else {
        return { gameName: { correctCount: 0, incorrectCount: 0 } };
      }
    } else {
      return { gameName: { correctCount: 0, incorrectCount: 0 } };
    }
  } catch (error) {
    console.error("Error getting student stats: ", error);
    return { gameName: { correctCount: 0, incorrectCount: 0 } };
  }
};
