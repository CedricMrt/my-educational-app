"use client";
import Navbar from "@/app/components/Navbar";
import StudentGuard from "@/app/utils/StudentGuard";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const [, setStudent] = useState<string | null>(null);
  const [showBotruc, setShowBotruc] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const studentFromStorage = sessionStorage.getItem("student");
      setStudent(studentFromStorage);
    }

    setTimeout(() => {
      setShowBotruc(true);
    }, 1000);
  }, []);

  return (
    <StudentGuard>
      <div className='flex flex-col h-[100vh]'>
        <Navbar />

        <motion.div
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className='absolute top-20 left-0'
        >
          <Image
            width={200}
            height={200}
            alt='niffleur'
            src='/img/niffleur.png'
            priority={false}
            style={{ width: "auto", height: "auto" }}
          />
        </motion.div>
        {showBotruc && (
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className='absolute right-0 top-20'
          >
            <Image
              width={80}
              height={100}
              alt='botruc'
              src='/img/botruc.png'
              priority={false}
              style={{ width: "auto", height: "auto" }}
            />
          </motion.div>
        )}
        <div className='h-max flex flex-col items-center justify-center flex-grow'>
          <div className='box-outer [box-shadow:_0_0_4px_1px_rgb(172_171_171_/_0.8)] relative'>
            <div className='activityChoice'>
              <Link
                href='/student/activities?subject=frenchGame'
                className='activity'
              >
                Français
              </Link>
              <Link
                href='/student/activities?subject=mathsGame'
                className='activity'
              >
                Maths
              </Link>
              <Link
                href='/student/activities?subject=englishGame'
                className='activity'
              >
                Anglais
              </Link>
              <Link
                href='/student/activities?subject=discoveryWorldGame'
                className='activity'
              >
                Découverte du monde
              </Link>
            </div>
          </div>
          <h1 className='mt-4 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.8)]'>
            Quelle activité veux-tu faire aujourd&apos;hui ?
          </h1>
        </div>
      </div>
    </StudentGuard>
  );
};

export default StudentDashboard;
