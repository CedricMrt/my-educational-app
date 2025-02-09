"use client";
import { createContext, useState, useEffect, useContext } from "react";

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
  setSchool: () => {},
});

import { ReactNode } from "react";

export const SchoolProvider = ({ children }: { children: ReactNode }) => {
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const schoolData = sessionStorage.getItem("school");
      if (schoolData) {
        setSchool(JSON.parse(schoolData));
      }
    }
  }, []);

  return (
    <SchoolContext.Provider value={{ school, setSchool }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => useContext(SchoolContext);
