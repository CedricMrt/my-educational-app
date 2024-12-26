"use client";
import Navbar from "@/app/components/Navbar";
import StudentGuard from "@/app/utils/StudentGuard";
import Link from "next/link";

const studentDashboard = () => {
  return (
    <StudentGuard>
      <div className="bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat flex flex-col h-screen">
        <Navbar />
        <div className='h-max flex flex-col items-center justify-center flex-grow'>
          <div className='box-outer [box-shadow:_0_0_4px_1px_rgb(172_171_171_/_0.8)]'>
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
            Quelle activité veux tu faire aujourd&apos;hui ?
          </h1>
        </div>
      </div>
    </StudentGuard>
  );
};

export default studentDashboard;
