"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import MathsGame1 from "./mathsGame/operations";
import MathsGame2 from "./mathsGame/ordre";
import MathsGame3 from "./mathsGame/comparaison";
import FrenchGame1 from "./frenchGame/ponctuation";
import FrenchGame2 from "./frenchGame/alphabet";
/* import EnglishGame from "./englishGame/page";
import DiscoveryWorldGame from "./discoveryWorldGame/page"; */
import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import Link from "next/link";

const SubjectPage = () => {
  interface Student {
    id: string;
    name: string;
    lastName: string;
    uid: string;
  }

  const [student, setStudent] = useState<Student | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const [period, setPeriod] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("student");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  useEffect(() => {
    const fetchActivePeriod = async () => {
      const periodsQuery = query(
        collection(db, "periods"),
        where("active", "==", true)
      );
      const periodsSnapshot = await getDocs(periodsQuery);
      const activePeriod = periodsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))[0];
      setPeriod(activePeriod);
    };

    fetchActivePeriod();
  }, []);

  interface ActivityClickHandler {
    (activity: string): void;
  }

  const handleActivityClick: ActivityClickHandler = (activity) => {
    setSelectedActivity(activity);
  };

  if (!period) {
    return (
      <div className="bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-screen flex justify-center items-center">
        <p className='text-2xl'>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat flex flex-col h-screen">
      <Navbar />
      <div className='flex flex-col items-center justify-center w-full h-full'>
        <div className='mb-4 min-h-16 w-full'>
          {subject === "mathsGame" && (
            <div className='flex justify-around w-full'>
              <div className='flex flex-col items-center'>
                <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                  Opérations
                </h2>
                <Image
                  className='cursor-pointer rounded-lg drop-shadow-lg'
                  width={80}
                  height={80}
                  src={"/img/griffondor.png"}
                  alt='activity icon'
                  onClick={() => handleActivityClick("mathsGame1")}
                />
              </div>
              <div className='flex flex-col items-center'>
                <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                  Ordre
                </h2>
                <Image
                  className='cursor-pointer rounded-lg drop-shadow-lg'
                  width={80}
                  height={80}
                  src={"/img/serdaigle.png"}
                  alt='activity icon'
                  onClick={() => handleActivityClick("mathsGame2")}
                />
              </div>
              <div className='flex flex-col items-center'>
                <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                  Comparaison
                </h2>
                <Image
                  className='cursor-pointer rounded-lg drop-shadow-lg'
                  width={80}
                  height={80}
                  src={"/img/serpentar.png"}
                  alt='activity icon'
                  onClick={() => handleActivityClick("mathsGame3")}
                />
              </div>
              <div className='flex flex-col items-center'>
                <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                  Positions
                </h2>
                <Image
                  className='cursor-pointer rounded-lg drop-shadow-lg'
                  width={80}
                  height={80}
                  src={"/img/poufsouffle.png"}
                  alt='activity icon'
                  onClick={() => handleActivityClick("mathsGame4")}
                />
              </div>
            </div>
          )}
          {subject === "frenchGame" && Number(period.id) === 1 && (
            <div className='flex justify-around w-full'>
              <div className='flex flex-col items-center'>
                <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                  Ponctuation
                </h2>
                <Image
                  className='cursor-pointer rounded-lg drop-shadow-lg'
                  width={80}
                  height={80}
                  src={"/img/griffondor.png"}
                  alt='activity icon'
                  onClick={() => handleActivityClick("frenchGame1")}
                />
              </div>
              <div className='flex flex-col items-center'>
                <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                  Alphabet
                </h2>
                <Image
                  className='cursor-pointer rounded-lg drop-shadow-lg'
                  width={80}
                  height={80}
                  src={"/img/serdaigle.png"}
                  alt='activity icon'
                  onClick={() => handleActivityClick("frenchGame2")}
                />
              </div>
            </div>
          )}
        </div>
        <div className="bg-[url('/img/livre_ouvert.png')] bg-contain bg-center bg-no-repeat self-center flex items-center justify-center w-3/4 h-[500px] max-md:h-[400px] max-sm:h-[300px] relative">
          {selectedActivity === "mathsGame1" && student && subject && (
            <MathsGame1
              subject={subject}
              studentId={student.id}
              period={Number(period.id)}
            />
          )}
          {selectedActivity === "mathsGame2" && student && subject && (
            <MathsGame2
              subject={subject}
              studentId={student.id}
              period={Number(period.id)}
            />
          )}
          {selectedActivity === "mathsGame3" && student && subject && (
            <MathsGame3
              subject={subject}
              studentId={student.id}
              period={Number(period.id)}
            />
          )}
          {selectedActivity === "frenchGame1" && student && subject && (
            <FrenchGame1
              subject={subject}
              studentId={student.id}
              period={Number(period.id)}
            />
          )}
          {selectedActivity === "frenchGame2" && student && subject && (
            <FrenchGame2
              subject={subject}
              studentId={student.id}
              period={Number(period.id)}
            />
          )}
          {/* {selectedActivity === "englishGame1" && student && subject && (
            <EnglishGame
              subject={subject}
              studentId={student.id}
              period={Number(period.id)}
            />
          )}
          {selectedActivity === "discoveryWorldGame" && student && subject && (
            <DiscoveryWorldGame
              subject={subject}
              studentId={student.id}
              period={Number(period.id)}
            />
          )} */}
          <Link
            href='/student/dashboard'
            className='absolute bottom-[-5px] [text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'
          >
            Retour vers la liste des matières
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
