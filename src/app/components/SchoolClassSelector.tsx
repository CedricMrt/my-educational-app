import React, { useState, useEffect } from "react";
import { db } from "../lib/firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const SchoolClassSelector = () => {
  const [schools, setSchools] = useState<
    { id: string; name: string; level: string }[]
  >([]);
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const router = useRouter();

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
      };

      sessionStorage.setItem("school", JSON.stringify(schoolData));
      router.push("/home");
    } else {
      toast.error("Veuillez sélectionner une école existante !");
    }
  };

  const handleCreateSchool = async () => {
    if (newSchool && level) {
      const newSchoolData = {
        name: newSchool,
        level: level,
      };

      const docRef = await addDoc(collection(db, "schools"), newSchoolData);

      const newEntry = { id: docRef.id, ...newSchoolData };
      setSchools([...schools, newEntry]);

      sessionStorage.setItem("school", JSON.stringify(newEntry));
      toast.success("École créée et sauvegardée !");
      router.push("/home");

      setSchool(docRef.id);
      setNewSchool("");
    } else {
      toast.error("Veuillez entrer un nom d'école et un niveau !");
    }
  };

  return (
    <div className='rounded-lg p-6 bg-transparent border-2 border-solid border-[#F3D768] backdrop-blur-sm [box-shadow:_0_1px_10px_2px_rgb(255_255_255_/_40%)]'>
      <div className='flex flex-col items-center justify-center space-y-4 text-yellow'>
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
          className='p-2 text-2xl border-[#FDCB225C] text-[#FEE949F5] rounded-xl border bg-[#362B00] cursor-pointer'
          onClick={handleSubmit}
        >
          Sélectionner
        </button>

        <label className='text-lg font-bold'>Créer une école :</label>
        <input
          type='text'
          className='p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4C767] bg-[#FFFAB8] text-[#473B1F]'
          value={newSchool}
          onChange={(e) => setNewSchool(e.target.value)}
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
            className='p-2 text-2xl border-[#FDCB225C] text-[#FEE949F5] rounded-xl border bg-[#362B00] cursor-pointer'
            onClick={handleCreateSchool}
          >
            Créer école
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolClassSelector;
