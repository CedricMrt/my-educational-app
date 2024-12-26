"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebaseConfig";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [userType, setUserType] = useState<null | "student" | "admin">(null);
  const [studentName, setStudentName] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        const student = sessionStorage.getItem("student");
        if (student) {
          const parsedStudent = JSON.parse(student);
          parsedStudent.name =
            parsedStudent.name.charAt(0).toUpperCase() +
            parsedStudent.name.slice(1);
          setUserType("student");
          setStudentName(parsedStudent.name);
        } else {
          setUserType("admin");
        }
      }
    };

    fetchUserType();
  }, [user]);

  const handleLogout = async () => {
    if (userType === "student") {
      sessionStorage.removeItem("student");
    } else {
      await signOut(auth);
    }
    router.push("/");
  };

  const handleSvgClick = () => {
    setShowLogout(!showLogout);
  };

  return (
    <nav className='flex justify-between p-4'>
      <Image
        src='/img/logo 4 maisons.png'
        alt='logo des 4 maisons harry potter'
        width={56}
        height={56}
      />
      {user || userType === "student" ? (
        <>
          <span className='text-2xl [text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
            Bienvenue, {user ? "Professeur" : studentName}
          </span>
          <svg
            width='46px'
            height='46px'
            className='cursor-pointer relative'
            onClick={handleSvgClick}
            viewBox='0 0 24.00 24.00'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            stroke='#000000'
            strokeWidth='0.00024000000000000003'
          >
            <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
            <g
              id='SVGRepo_tracerCarrier'
              strokeLinecap='round'
              strokeLinejoin='round'
              stroke='#c80303'
              strokeWidth='0.048'
            ></g>
            <g id='SVGRepo_iconCarrier'>
              {" "}
              <circle cx='12' cy='6' r='4' fill='#109e12'></circle>{" "}
              <path
                d='M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z'
                fill='#109e12'
              ></path>{" "}
            </g>
          </svg>
          {showLogout && (
            <div className='absolute right-2 top-16 border-2 border-[#f2a65a] rounded-xl p-2'>
              <button
                onClick={handleLogout}
                className=' cursor-pointer text-[#930c0c]'
              >
                Déconnexion
              </button>
            </div>
          )}
        </>
      ) : (
        <svg
          width='46px'
          height='46px'
          viewBox='0 0 24.00 24.00'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          stroke='#000000'
          strokeWidth='0.00024000000000000003'
        >
          <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
          <g
            id='SVGRepo_tracerCarrier'
            strokeLinecap='round'
            strokeLinejoin='round'
            stroke='#c80303'
            strokeWidth='0.048'
          ></g>
          <g id='SVGRepo_iconCarrier'>
            {" "}
            <circle cx='12' cy='6' r='4' fill='#c80303'></circle>{" "}
            <path
              d='M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z'
              fill='#c80303'
            ></path>{" "}
          </g>
        </svg>
      )}
    </nav>
  );
};

export default Navbar;
