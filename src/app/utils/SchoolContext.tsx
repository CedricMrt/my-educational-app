"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

interface School {
  id: string;
  name: string;
  level: string;
}

const SchoolContext = createContext<{
  school: School | null;
  setSchool: React.Dispatch<React.SetStateAction<School | null>>;
}>({
  school: null,
  setSchool: () => {
    throw new Error("setSchool must be used within a SchoolProvider");
  },
});

export const SchoolProvider = ({ children }: { children: ReactNode }) => {
  const [school, setSchool] = useState<School | null>(() => {
    if (typeof window !== "undefined") {
      const savedSchool = sessionStorage.getItem("school");
      return savedSchool ? JSON.parse(savedSchool) : null;
    }
    return null;
  });

  useEffect(() => {
    if (school) {
      sessionStorage.setItem("school", JSON.stringify(school));
    } else {
      sessionStorage.removeItem("school");
    }
  }, [school]);

  return (
    <SchoolContext.Provider value={{ school, setSchool }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => useContext(SchoolContext);
