"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const StudentGuard = ({ children }: { children: React.ReactNode }) => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      const student = sessionStorage.getItem("student");
      if (student) {
        router.push("/student/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

  if (!user && !sessionStorage.getItem("student")) {
    return null;
  }

  return <>{children}</>;
};

export default StudentGuard;
