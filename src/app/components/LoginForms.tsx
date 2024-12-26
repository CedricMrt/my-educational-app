"use client";
import { useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [formType, setFormType] = useState("teacherLogin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const router = useRouter();

  const handleTeacherLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleStudentLogin = async () => {
    try {
      const studentQuery = query(
        collection(db, "students"),
        where("name", "==", name.toLowerCase()),
        where("lastName", "==", surname.toLowerCase()),
        where("password", "==", password)
      );
      const studentSnapshot = await getDocs(studentQuery);
      sessionStorage.setItem(
        "student",
        JSON.stringify(studentSnapshot.docs[0].data())
      );
      if (!studentSnapshot.empty) {
        router.push("/student/dashboard");
      } else {
        toast.error("Elève non trouvé");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleTeacherSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const periods = [
        { id: 1, uid: user.uid, active: true },
        { id: 2, uid: user.uid, active: false },
        { id: 3, uid: user.uid, active: false },
      ];

      periods.forEach(async (period) => {
        await addDoc(collection(db, "periods"), period);
      });

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='mb-4 flex gap-2'>
        <button
          onClick={() => setFormType("teacherLogin")}
          className={`p-2 rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] ${
            formType === "teacherLogin" ? "" : "text-black"
          }`}
        >
          Connexion Administrateur
        </button>
        <button
          onClick={() => setFormType("studentLogin")}
          className={`p-2 rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] ${
            formType === "studentLogin" ? "" : "text-black"
          }`}
        >
          Connexion élève
        </button>
        <button
          onClick={() => setFormType("teacherSignUp")}
          className={`p-2 rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] ${
            formType === "teacherSignUp" ? "" : "text-black"
          }`}
        >
          Inscription Administrateur
        </button>
      </div>
      <div className='p-8 rounded-lg shadow-md w-full max-w-md border-2 border-[#f2a65a]'>
        {formType === "teacherLogin" && (
          <div>
            <h2 className='text-2xl font-bold mb-6 text-center [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)]'>
              Connexion Administrateur
            </h2>
            <div className='mb-4'>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold mb-2'
                htmlFor='email'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold mb-2'
                htmlFor='password'
              >
                Mot de passe
              </label>
              <input
                type='password'
                id='password'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <button
                onClick={handleTeacherLogin}
                className='w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
              >
                Connexion
              </button>
            </div>
          </div>
        )}

        {formType === "studentLogin" && (
          <div>
            <h2 className='text-2xl font-bold mb-6 text-center [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)]'>
              Connexion Elève
            </h2>
            <div className='mb-4'>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold mb-2'
                htmlFor='name'
              >
                Prénom
              </label>
              <input
                type='text'
                id='name'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold mb-2'
                htmlFor='surname'
              >
                Nom de famille
              </label>
              <input
                type='text'
                id='surname'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold mb-2'
                htmlFor='password'
              >
                Mot de passe
              </label>
              <input
                type='password'
                id='password'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <button
                onClick={handleStudentLogin}
                className='w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
              >
                Connexion
              </button>
            </div>
          </div>
        )}

        {formType === "teacherSignUp" && (
          <div>
            <h2 className='text-2xl font-bold mb-6 text-center [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)]'>
              Inscription Administrateur
            </h2>
            <div className='mb-4'>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold mb-2'
                htmlFor='email'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold mb-2'
                htmlFor='password'
              >
                Mot de passe
              </label>
              <input
                type='password'
                id='password'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <button
                onClick={handleTeacherSignUp}
                className='w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
              >
                Inscription
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
