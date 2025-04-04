"use client";
import React, { useState, useEffect } from "react";
import { db } from "../lib/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const SchoolClassSelector = () => {
  const [selectedRole, setSelectedRole] = useState<"student" | "admin" | null>(
    null
  );
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [schools, setSchools] = useState<
    { id: string; name: string; level: string }[]
  >([]);
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const router = useRouter();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 4) {
      setPin(value);

      if (value.length === 4) {
        verifierPinCode(value);
      }
    }
  };

  const verifierPinCode = async (code: string) => {
    try {
      const pinCodesRef = collection(db, "pinCode");
      const q = query(pinCodesRef, where("code", "==", Number(code)));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.success("Bienvenue professeur !");
        setShowPinInput(false);
        setPin("");
        setSelectedRole("admin");
      } else {
        setPin("");
        setShowPinInput(false);

        toast.error("Code PIN incorrect. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
    }
  };

  useEffect(() => {
    const fetchSchools = async () => {
      const schoolsCollection = collection(db, "schools");
      const schoolsSnapshot = await getDocs(schoolsCollection);
      const schoolList = schoolsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          level: data.level,
        };
      });
      setSchools(schoolList);
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    if (school) {
      const selectedSchool = schools.find((s) => s.id === school);
      if (selectedSchool) {
        setLevel(selectedSchool.level);
      }
    }
  }, [school, schools]);

  const handleSubmit = () => {
    const selectedSchool = schools.find((s) => s.id === school);

    if (selectedSchool) {
      const schoolData = {
        id: selectedSchool.id,
        name: selectedSchool.name,
        level: selectedSchool.level,
        role: selectedRole,
      };

      sessionStorage.setItem("school", JSON.stringify(schoolData));
      sessionStorage.setItem("userRole", selectedRole || "");
      router.push("/home");
    } else {
      toast.error("Veuillez sélectionner une école existante !");
    }
  };

  const handleCreateSchool = async () => {
    if (!newSchool || !level) {
      toast.error("Veuillez entrer un nom d'école et un niveau");
      return;
    }

    try {
      const newSchoolData = {
        name: newSchool,
        level: level,
      };

      const docRef = await addDoc(collection(db, "schools"), newSchoolData);
      const newSchoolEntry = { id: docRef.id, ...newSchoolData };
      const periodsCollection = collection(db, `schools/${docRef.id}/periods`);

      const defaultPeriods = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: false },
      ];

      const batch = writeBatch(db);
      defaultPeriods.forEach((period) => {
        const periodRef = doc(periodsCollection);
        batch.set(periodRef, period);
      });
      await batch.commit();

      setSchools([...schools, newSchoolEntry]);
      sessionStorage.setItem(
        "school",
        JSON.stringify({ newSchoolEntry, role: "admin" })
      );
      sessionStorage.setItem("userRole", "admin");

      toast.success("École créées avec succès !");
      router.push("/home");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la création");
    }
  };

  if (selectedRole === null) {
    return (
      <div className='w-full flex flex-col items-center justify-center'>
        <h1 className='text-2xl'>Bonjour, qui êtes vous ?</h1>
        <div className='flex flex-col landscape:flex-row items-center justify-around h-1/2 w-1/2'>
          <button
            className='m-4 p-2 text-2xl border-[#FDCB225C] text-[#FEE949F5] rounded-xl border bg-[#362B00] cursor-pointer drop-shadow-lg'
            onClick={() => setSelectedRole("student")}
          >
            Élève
          </button>
          <button
            className='p-2 text-2xl border-[#FDCB225C] text-[#FEE949F5] rounded-xl border bg-[#362B00] cursor-pointer drop-shadow-lg'
            onClick={() => setShowPinInput(!showPinInput)}
          >
            Professeur
          </button>
          {showPinInput && (
            <input
              type='text'
              className='m-2 p-2 text-center border-[#FDCB225C] text-[#FEE949F5] rounded-xl border bg-[#362B00] max-w-24'
              placeholder='Code Pin'
              value={pin}
              onChange={handlePinChange}
              maxLength={4}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='relative rounded-lg p-6 bg-transparent border-2 border-solid border-[#F3D768] [box-shadow:_0_1px_10px_2px_rgb(255_255_255_/_40%)]'>
        <div className='absolute inset-0 rounded-lg backdrop-blur-sm'></div>
        <div className='relative z-10 flex flex-col items-center justify-center space-y-4 text-yellow'>
          <label className='text-lg font-bold'>Sélectionnez une école :</label>
          <select
            className='p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4C767] bg-[#FFFAB8] text-[#473B1F]'
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          >
            <option value=''>Choisissez</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.level})
              </option>
            ))}
          </select>

          <button
            className='p-2 text-2xl border-[#FDCB225C] text-[#FEE949F5] rounded-xl border bg-[#362B00] cursor-pointer drop-shadow-lg'
            onClick={handleSubmit}
          >
            Sélectionner
          </button>

          {selectedRole === "admin" && (
            <>
              <label className='text-lg font-bold'>Créer une école :</label>
              <input
                type='text'
                className='p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4C767] bg-[#FFFAB8] text-[#473B1F]'
                value={newSchool}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-z\s]+$/.test(value) || value === "") {
                    setNewSchool(value);
                  }
                }}
                pattern='^[A-Za-z\s]+$'
                title='Veuillez entrer uniquement des lettres et des espaces.'
                placeholder='Nom de la nouvelle école'
              />
              <select
                className='p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4C767] bg-[#FFFAB8] text-[#473B1F]'
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value=''>Sélectionnez un niveau</option>
                <option value='CP'>CP</option>
                <option value='CE1'>CE1</option>
                <option value='CE2'>CE2</option>
                <option value='CM1'>CM1</option>
                <option value='CM2'>CM2</option>
              </select>

              <div className='flex items-center space-x-3'>
                <button
                  className='p-2 text-2xl border-[#FDCB225C] text-[#FEE949F5] rounded-xl border bg-[#362B00] cursor-pointer drop-shadow-lg'
                  onClick={handleCreateSchool}
                >
                  Créer école
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        <button
          onClick={() => setSelectedRole(null)}
          className='text-center [text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)] mt-4'
        >
          Retour au choix précédent
        </button>
      </div>
    </div>
  );
};

export default SchoolClassSelector;
