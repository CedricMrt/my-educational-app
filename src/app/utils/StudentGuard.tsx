"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const StudentGuard = ({ children }: { children: React.ReactNode }) => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!user) {
        const student = sessionStorage.getItem("student");
        if (student) {
          router.push("/student/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  }, [user, router, isClient]);

  if (!user && isClient && !sessionStorage.getItem("student")) {
    return null;
  }

  return <>{children}</>;
};

export default StudentGuard;
