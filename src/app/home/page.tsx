"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

import Link from "next/link";
import Image from "next/image";

interface School {
  id: string;
  name: string;
  level: string;
}

const LoginForm = () => {
  const [formType, setFormType] = useState("teacherLogin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [name, setName] = useState("");
  /*   const [surname, setSurname] = useState(""); */
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [school, setSchool] = useState<School>({ id: "", name: "", level: "" });
  const [userRole, setUserRole] = useState<"student" | "admin" | null>(null);

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
    const storedRole = sessionStorage.getItem("userRole");

    if (storedSchool) {
      try {
        const parsedSchool = JSON.parse(storedSchool);
        setSchool(parsedSchool);
      } catch (error) {
        console.error("Erreur de parsing du sessionStorage:", error);
      }
    }

    if (storedRole) {
      setUserRole(storedRole as "student" | "admin");
      if (storedRole === "student") {
        setFormType("student");
      } else {
        setFormType("teacherLogin");
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const hasMinLength = value.length >= 6;
    const hasUppercase = /[A-Z]/.test(value);
    setPasswordValid(hasMinLength && hasUppercase);
  };

  const handleTeacherSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      if (!school.id) {
        toast.error("École non trouvée. Veuillez réessayer.");
        return;
      }

      toast.success("Inscription réussie !");
      router.push("/admin/dashboard");
    } catch (error) {
      if ((error as { code: string }).code === "auth/email-already-in-use") {
        toast.error("Ce compte existe déjà, veuillez vous connecter.");
      } else {
        toast.error("Erreur d'inscription. Veuillez réessayer.");
      }
    }
  };

  const deleteSchoolStorage = () => {
    sessionStorage.removeItem("school");
    sessionStorage.removeItem("userRole");
  };

  if (userRole === "student") {
    return (
      <>
        <header className='bg-[#00000050]'>
          <Navbar />
        </header>
        <main className='min-h-[calc(100vh-106.5px)] flex flex-col justify-center items-center bg-[#00000050] space-y-10'>
          <div className='transition-opacity duration-500 ease-in-out [box-shadow:3px_3px_14px_3px_rgb(255_255_255_/_40%)] rounded-lg relative'>
            <div className='absolute inset-0 rounded-lg backdrop-blur-sm'></div>
            <div className='relative z-10'>
              <div className='p-4 rounded-lg shadow-md border-2 border-[#f2a65a] w-full space-y-3 opacity-100'>
                <h2 className='text-2xl font-bold text-center [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.8)]'>
                  Connexion Elève - {school.name}
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
                      className='w-full px-2 py-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                    className='w-full px-2 py-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    onClick={handleStudentLogin}
                    className='w-full bg-[#FFE770] text-[#5C7C2F] py-1 rounded-xl hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-lg'
                  >
                    Connexion
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Link
              href='/'
              className='px-4 py-2 bg-[#433500] rounded-xl hover:bg-[#2D2305] transition drop-shadow-lg'
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
          <a
            href='https://cedricmrt.github.io/'
            target='_blank'
            rel='noreferrer'
          >
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
  }

  // Si l'utilisateur est un admin, on affiche les options de connexion/inscription professeur
  return (
    <>
      <header className='bg-[#00000050]'>
        <Navbar />
      </header>
      <main className='min-h-[calc(100vh-106.5px)] flex flex-col justify-center items-center bg-[#00000050] space-y-10'>
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
              Connexion Professeur
            </button>
            <button
              onClick={() => setFormType("teacherSignUp")}
              className={`[box-shadow:1px_3px_4px_0px_rgb(255_255_255_/_40%)] p-2 rounded-xl transition-transform duration-200 active:scale-95 ${
                formType === "teacherSignUp"
                  ? "text-[#473B1F] bg-gradient-to-r from-[#FEFCE9] to-[#FFFAB8]"
                  : "text-[#fee949f5] bg-gradient-to-r from-[#14120B] to-[#1B180F]"
              }`}
            >
              Inscription Professeur
            </button>
          </div>
          <div className='transition-opacity duration-500 ease-in-out [box-shadow:3px_3px_14px_3px_rgb(255_255_255_/_40%)] rounded-lg relative'>
            <div className='absolute inset-0 rounded-lg backdrop-blur-sm'></div>
            <div className='relative z-10'>
              {formType === "teacherLogin" && (
                <div className='p-4 rounded-lg shadow-md border-2 border-[#f2a65a] w-full space-y-3 opacity-100'>
                  <h2 className='text-2xl font-bold text-center [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.8)]'>
                    Connexion Professeur - {school.name}
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
                      className='w-full px-2 py-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
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
                      className='w-full px-2 py-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className=''>
                    <button
                      onClick={handleTeacherLogin}
                      className='w-full bg-[#FFE770] text-[#5C7C2F] py-1 rounded-xl hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-lg'
                    >
                      Connexion
                    </button>
                  </div>
                </div>
              )}

              {formType === "teacherSignUp" && (
                <div className='p-4 rounded-lg shadow-md border-2 border-[#f2a65a] w-full space-y-3 opacity-100'>
                  <h2 className='text-2xl font-bold text-center [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.8)]'>
                    Inscription Professeur - {school.name}
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
                      className='w-full px-2 py-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
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
                      <span className='text-xs block font-normal mt-1'>
                        (6 caractères minimum, dont une majuscule)
                      </span>
                    </label>
                    <input
                      type='password'
                      id='password'
                      className={`w-full px-2 py-1 border rounded-xl focus:outline-none focus:ring-2 ${
                        passwordValid
                          ? "border-green-500 focus:ring-green-500"
                          : password.length > 0
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-green-500"
                      } bg-green-200 text-gray-600`}
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    {password.length > 0 && (
                      <div className='text-xs mt-1'>
                        <p
                          className={
                            password.length >= 6
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {password.length >= 6 ? "✓" : "✗"} 6 caractères
                          minimum
                        </p>
                        <p
                          className={
                            /[A-Z]/.test(password)
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {/[A-Z]/.test(password) ? "✓" : "✗"} Contient une
                          majuscule
                        </p>
                      </div>
                    )}
                  </div>
                  <div className='mb-4'>
                    <button
                      onClick={handleTeacherSignUp}
                      className='w-full bg-[#FFE770] text-[#5C7C2F] py-1 rounded-xl hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-lg'
                    >
                      Inscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <Link
            href='/'
            className='px-4 py-2 bg-[#433500] rounded-xl hover:bg-[#2D2305] transition drop-shadow-lg'
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
