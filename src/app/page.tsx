"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import SchoolClassSelector from "./components/SchoolClassSelector";

export default function Home() {
  const [currentYear] = useState(new Date().getFullYear());
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (showLoader) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-black z-50'>
        <div className='text-center'>
          <Image
            src='/3dgifmaker54074.gif'
            alt='Loading...'
            width={500}
            height={500}
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <header className='bg-[#00000050]'>
        <Navbar />
      </header>
      <main className='min-h-[calc(100vh-106.5px)] flex justify-center items-center bg-[#00000050]'>
        <SchoolClassSelector />
      </main>
      <footer className='flex items-center justify-center bg-[#00000050]'>
        <p>© {currentYear} application made by</p>
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
}
