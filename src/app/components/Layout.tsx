// components/Layout.tsx
"use client";
import { useEffect, useState, ReactNode } from "react";
import LandscapeWarning from "./LandscapeWarning";
import "./LandscapeWarning.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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

  return (
    <div
      className={
        isPortrait
          ? "bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-[100vh] flex flex-col justify-center items-center"
          : "bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-[100vh] flex flex-col justify-between"
      }
    >
      {isPortrait ? (
        <LandscapeWarning />
      ) : (
        <>
          <main>{children}</main>
        </>
      )}
    </div>
  );
};

export default Layout;
