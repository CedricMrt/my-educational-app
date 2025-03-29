"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";

interface School {
  id: string;
  name: string;
  level: string;
}

const LoginForm = () => {
  const [formType, setFormType] = useState("teacherLogin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  /*   const [surname, setSurname] = useState(""); */
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [school, setSchool] = useState<School>({ id: "", name: "", level: "" });

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

  useEffect(() => {
    const storedSchool = sessionStorage.getItem("school");
    if (storedSchool) {
      try {
        const parsedSchool = JSON.parse(storedSchool);
        setSchool(parsedSchool);
      } catch (error) {
        console.error("Erreur de parsing du sessionStorage:", error);
      }
    }
  }, []);

  const handleStudentLogin = async () => {
    try {
      const uniquename = `${name.toLowerCase()}.${password}`;

      const studentQuery = query(
        collection(db, `schools/${school.id}/students`),
        where("uniquename", "==", uniquename)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        toast.error("Élève non trouvé ou mot de passe incorrect.");
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

      if (!school.id) {
        toast.error("École non trouvée. Veuillez réessayer.");
        return;
      }

      const periods = [
        { id: 1, uid: user.uid, active: true },
        { id: 2, uid: user.uid, active: false },
        { id: 3, uid: user.uid, active: false },
      ];

      const schoolPeriodsCollection = collection(
        db,
        `schools/${school.id}/periods`
      );

      for (const period of periods) {
        await addDoc(schoolPeriodsCollection, period);
      }

      toast.success("Inscription réussie !");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Erreur d'inscription. Veuillez réessayer.");
    }
  };

  const deleteSchoolStorage = () => {
    sessionStorage.removeItem("school");
  };

  return (
    <>
      <header className='bg-[#00000050]'>
        <Navbar />
      </header>
      <main className='min-h-[calc(100vh-98.5px)] flex flex-col justify-center items-center bg-[#00000050] space-y-10'>
        <div className='flex items-center justify-around w-full px-6'>
          <div className='flex flex-col'>
            <button
              onClick={() => setFormType("teacherLogin")}
              className={`[box-shadow:1px_3px_4px_0px_rgb(255_255_255_/_40%)] mb-4 p-2 rounded-xl transition-transform duration-200 active:scale-95 ${
                formType === "teacherLogin"
                  ? "text-[#473B1F] bg-gradient-to-r from-[#FEFCE9] to-[#FFFAB8]"
                  : "text-[#fee949f5] bg-gradient-to-r from-[#14120B] to-[#1B180F]"
              }`}
            >
              Connexion Administrateur
            </button>
            <button
              onClick={() => setFormType("studentLogin")}
              className={`[box-shadow:1px_3px_4px_0px_rgb(255_255_255_/_40%)] mb-4 p-2 rounded-xl transition-transform duration-200 active:scale-95 ${
                formType === "studentLogin"
                  ? "text-[#473B1F] bg-gradient-to-r from-[#FEFCE9] to-[#FFFAB8]"
                  : "text-[#fee949f5] bg-gradient-to-r from-[#14120B] to-[#1B180F]"
              }`}
            >
              Connexion élève
            </button>
            <button
              onClick={() => setFormType("teacherSignUp")}
              className={`[box-shadow:1px_3px_4px_0px_rgb(255_255_255_/_40%)] p-2 rounded-xl transition-transform duration-200 active:scale-95 ${
                formType === "teacherSignUp"
                  ? "text-[#473B1F] bg-gradient-to-r from-[#FEFCE9] to-[#FFFAB8]"
                  : "text-[#fee949f5] bg-gradient-to-r from-[#14120B] to-[#1B180F]"
              }`}
            >
              Inscription Administrateur
            </button>
          </div>
          <div className='transition-opacity duration-500 ease-in-out [box-shadow:3px_3px_14px_3px_rgb(255_255_255_/_40%)] rounded-lg backdrop-blur-sm'>
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
                    className='w-full bg-[#FFE770] text-[#5C7C2F] py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-lg'
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
                  {/* <div>
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
                  </div> */}
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
                    className='w-full bg-[#FFE770] text-[#5C7C2F] py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-lg'
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
                    className='w-full bg-[#FFE770] text-[#5C7C2F] py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-lg'
                  >
                    Inscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <Link
            href='/'
            className='px-4 py-2 bg-[#433500] rounded-lg hover:bg-[#2D2305] transition'
            onClick={deleteSchoolStorage}
          >
            Retour au choix d&apos;école
          </Link>
        </div>
      </main>
      <footer className='flex items-center justify-center bg-[#00000050]'>
        <p>
          © {currentYear} {school.name || "School"} website made by
        </p>
        <a href='https://cedricmrt.github.io/' target='_blank' rel='noreferrer'>
          <Image
            src='/img/logo-cm.png'
            alt='logo createur du site'
            width={30}
            height={30}
            style={{ width: "auto", height: "auto" }}
          />
        </a>
      </footer>
    </>
  );
};

export default LoginForm;
