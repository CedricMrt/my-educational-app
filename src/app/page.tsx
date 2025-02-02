"use client";
import LoginForm from "../app/components/LoginForms";
import Image from "next/image";
import "./globals.css";
import Navbar from "./components/Navbar";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./lib/firebaseConfig";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const [user] = useAuthState(auth);
  const [student, setStudent] = useState<string | null>(null);
  const router = useRouter();

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
    <div>
      <Layout>
        <header className='bg-[#00000050]'>
          <Navbar />
        </header>
        <main className='min-h-[calc(100vh-98.5px)] flex justify-center items-center bg-[#00000050]'>
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
      </Layout>
    </div>
  );
}
