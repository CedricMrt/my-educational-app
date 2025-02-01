"use client";
import LoginForm from "../app/components/LoginForms";
import Image from "next/image";
import "./globals.css";
import Navbar from "./components/Navbar";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./lib/firebaseConfig";
import { useEffect, useState } from "react";
import LandscapeWarning from "./components/LandscapeWarning";
import "./components/LandscapeWarning.css";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const [user] = useAuthState(auth);
  const [student, setStudent] = useState<string | null>(null);
  const router = useRouter();
  const [isPortrait, setIsPortrait] = useState(true);

  const checkOrientation = () => {
    if (window.innerHeight > window.innerWidth) {
      setIsPortrait(true);
    } else {
      setIsPortrait(false);
    }
  };

  useEffect(() => {
    checkOrientation();
    window.addEventListener("resize", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const studentFromStorage = sessionStorage.getItem("student");
      setStudent(studentFromStorage);
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/admin/dashboard");
    } else if (student) {
      router.push("/student/dashboard");
    }
  }, [user, router, student]);

  return (
    <div
      className={
        isPortrait
          ? "bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-screen flex flex-col justify-center items-center"
          : "bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-screen flex flex-col justify-between"
      }
    >
      {isPortrait ? (
        <LandscapeWarning />
      ) : (
        <>
          <header>
            <Navbar />
          </header>
          <main>
            <LoginForm />
          </main>
          <footer className='flex items-center justify-center'>
            <p>© {currentYear} Ecole Chavernac website made by</p>
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
      )}
    </div>
  );
}
