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
      toast.success("Connexion réussie !");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Erreur de connexion. Veuillez réessayer.");
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

      if (studentSnapshot.empty) {
        toast.error("Elève non trouvé ou mot de passe incorrect.");
        return;
      }

      const studentData = studentSnapshot.docs[0].data();
      sessionStorage.setItem("student", JSON.stringify(studentData));
      toast.success("Connexion réussie !");
      router.push("/student/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Erreur de connexion. Veuillez réessayer.");
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

      toast.success("Inscription réussie !");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Erreur d'inscription. Veuillez réessayer.");
    }
  };

  return (
    <div className='flex items-center justify-around w-full px-6'>
      <div className='flex gap-2 flex-col'>
        <button
          onClick={() => setFormType("teacherLogin")}
          className={`[box-shadow:1px_3px_4px_0px_rgb(255_255_255_/_40%)] p-2 rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] transition-transform duration-200 active:scale-95 ${
            formType === "teacherLogin" ? "" : "text-black"
          }`}
        >
          Connexion Administrateur
        </button>
        <button
          onClick={() => setFormType("studentLogin")}
          className={`[box-shadow:1px_3px_4px_0px_rgb(255_255_255_/_40%)] p-2 rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] transition-transform duration-200 active:scale-95 ${
            formType === "studentLogin" ? "" : "text-black"
          }`}
        >
          Connexion élève
        </button>
        <button
          onClick={() => setFormType("teacherSignUp")}
          className={`[box-shadow:1px_3px_4px_0px_rgb(255_255_255_/_40%)] p-2 rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] transition-transform duration-200 active:scale-95 ${
            formType === "teacherSignUp" ? "" : "text-black"
          }`}
        >
          Inscription Administrateur
        </button>
      </div>
      <div className='transition-opacity duration-500 ease-in-out [box-shadow:3px_3px_14px_3px_rgb(255_255_255_/_40%)] rounded-lg'>
        {formType === "teacherLogin" && (
          <div className='p-4 rounded-lg shadow-md border-2 border-[#f2a65a] w-full space-y-3 opacity-100'>
            <h2 className='text-2xl font-bold text-center [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.8)]'>
              Connexion Administrateur
            </h2>
            <div className=''>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold'
                htmlFor='email'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                className='w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className=''>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold'
                htmlFor='password'
              >
                Mot de passe
              </label>
              <input
                type='password'
                id='password'
                className='w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className=''>
              <button
                onClick={handleTeacherLogin}
                className='w-full bg-green-500 text-white py-1 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform duration-200 active:scale-95'
              >
                Connexion
              </button>
            </div>
          </div>
        )}

        {formType === "studentLogin" && (
          <div className='p-4 rounded-lg shadow-md border-2 border-[#f2a65a] w-full space-y-3 opacity-100'>
            <h2 className='text-2xl font-bold text-center [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.8)]'>
              Connexion Elève
            </h2>
            <div className='flex space-x-1 max-w-80'>
              <div>
                <label
                  className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold'
                  htmlFor='name'
                >
                  Prénom
                </label>
                <input
                  type='text'
                  id='name'
                  className='w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label
                  className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold'
                  htmlFor='surname'
                >
                  Nom de famille
                </label>
                <input
                  type='text'
                  id='surname'
                  className='w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold'
                htmlFor='password'
              >
                Mot de passe
              </label>
              <input
                type='password'
                id='password'
                className='w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button
                onClick={handleStudentLogin}
                className='w-full bg-green-500 text-white py-1 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform duration-200 active:scale-95'
              >
                Connexion
              </button>
            </div>
          </div>
        )}

        {formType === "teacherSignUp" && (
          <div className='p-4 rounded-lg shadow-md border-2 border-[#f2a65a] w-full space-y-3 opacity-100'>
            <h2 className='text-2xl font-bold text-center [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.8)]'>
              Inscription Administrateur
            </h2>
            <div>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold'
                htmlFor='email'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                className='w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                className='block [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)] text-sm font-bold'
                htmlFor='password'
              >
                Mot de passe
              </label>
              <input
                type='password'
                id='password'
                className='w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='mb-4'>
              <button
                onClick={handleTeacherSignUp}
                className='w-full bg-green-500 text-white py-1 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform duration-200 active:scale-95'
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
