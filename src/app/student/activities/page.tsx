"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import MathsGame1 from "./mathsGame/operations";
import MathsGame2 from "./mathsGame/ordre";
import MathsGame3 from "./mathsGame/comparaison";
import MathsGame4 from "./mathsGame/Heures";
import FrenchGame1 from "./frenchGame/ponctuation";
import FrenchGame2 from "./frenchGame/alphabet";
import EnglishGame1 from "./englishGame/relier";
import DiscoveryWorldGame1 from "./discoveryWorldGame/classification";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSchool } from "@/app/utils/SchoolContext";
import { motion } from "framer-motion";

const Loading = () => (
  <div className="bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-screen flex justify-center items-center">
    <p className='text-2xl'>Chargement...</p>
  </div>
);

const SubjectPage = () => {
  interface Student {
    id: string;
    name: string;
    lastName: string;
    uid: string;
  }

  const { school } = useSchool();
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const [period, setPeriod] = useState<{ id: string } | null>(null);
  const [showNiffleur, setShowNiffleur] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStudent = sessionStorage.getItem("student");
      if (storedStudent) {
        setStudent(JSON.parse(storedStudent));
      }
    }
  }, []);

  useEffect(() => {
    const fetchActivePeriod = async () => {
      const periodsQuery = query(
        collection(db, `schools/${school?.id}/periods`),
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
  }, [school]);
  console.log(student, period);
  interface ActivityClickHandler {
    (activity: string): void;
  }

  const handleActivityClick: ActivityClickHandler = (activity) => {
    setSelectedActivity(activity);
  };

  const handleCorrectAnswer = () => {
    setShowNiffleur(true);
    setTimeout(() => setShowNiffleur(false), 3000);
  };

  if (!student) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <p className='text-2xl'>Aucun étudiant trouvé.</p>
        <Link
          href='/'
          className='px-4 py-2 bg-[#433500] text-white rounded-lg hover:bg-[#2D2305] transition'
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className='bg-[#0000006b] h-[100vh] flex flex-col'>
        <Navbar />
        <div className='flex flex-col items-center justify-center w-full h-[65%] px-2 py-8 landscape:flex-row landscape:h-full'>
          <div className='flex flex-col items-center'>
            <div className='mb-4 min-h-16 w-full landscape:max-w-[200px]'>
              {subject === "mathsGame" && (
                <div className='flex justify-around w-full landscape:flex-wrap'>
                  <div className='flex flex-col items-center mr-4'>
                    <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                      Opérations
                    </h2>
                    <Image
                      className='cursor-pointer rounded-lg drop-shadow-lg'
                      width={60}
                      height={60}
                      src={"/img/griffondor.png"}
                      alt='activity icon'
                      onClick={() => handleActivityClick("mathsGame1")}
                    />
                  </div>
                  <div className='flex flex-col items-center mr-4'>
                    <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                      Ordre
                    </h2>
                    <Image
                      className='cursor-pointer rounded-lg drop-shadow-lg'
                      width={60}
                      height={60}
                      src={"/img/serdaigle.png"}
                      alt='activity icon'
                      onClick={() => handleActivityClick("mathsGame2")}
                    />
                  </div>
                  <div className='flex flex-col items-center mr-4'>
                    <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                      Comparaison
                    </h2>
                    <Image
                      className='cursor-pointer rounded-lg drop-shadow-lg'
                      width={60}
                      height={60}
                      src={"/img/serpentar.png"}
                      alt='activity icon'
                      onClick={() => handleActivityClick("mathsGame3")}
                    />
                  </div>
                  <div className='flex flex-col items-center mr-4'>
                    <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                      Les Heures
                    </h2>
                    <Image
                      className='cursor-pointer rounded-lg drop-shadow-lg'
                      width={60}
                      height={60}
                      src={"/img/poufsouffle.png"}
                      alt='activity icon'
                      onClick={() => handleActivityClick("mathsGame4")}
                    />
                  </div>
                </div>
              )}
              {subject === "frenchGame" &&
                period &&
                Number(period.id) === 1 && (
                  <div className='flex justify-around w-full'>
                    <div className='flex flex-col items-center mr-4'>
                      <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                        Ponctuation
                      </h2>
                      <Image
                        className='cursor-pointer rounded-lg drop-shadow-lg'
                        width={60}
                        height={60}
                        src={"/img/griffondor.png"}
                        alt='activity icon'
                        onClick={() => handleActivityClick("frenchGame1")}
                      />
                    </div>
                    <div className='flex flex-col items-center mr-4'>
                      <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                        Alphabet
                      </h2>
                      <Image
                        className='cursor-pointer rounded-lg drop-shadow-lg'
                        width={60}
                        height={60}
                        src={"/img/serdaigle.png"}
                        alt='activity icon'
                        onClick={() => handleActivityClick("frenchGame2")}
                      />
                    </div>
                  </div>
                )}
              {subject === "englishGame" && (
                <div className='flex justify-around w-full'>
                  <div className='flex flex-col items-center mr-4'>
                    <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                      Relier
                    </h2>
                    <Image
                      className='cursor-pointer rounded-lg drop-shadow-lg'
                      width={60}
                      height={60}
                      src={"/img/griffondor.png"}
                      alt='activity icon'
                      onClick={() => handleActivityClick("englishGame1")}
                    />
                  </div>
                </div>
              )}
              {subject === "discoveryWorldGame" && (
                <div className='flex justify-around w-full'>
                  <div className='flex flex-col items-center mr-4'>
                    <h2 className='[text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'>
                      Classification
                    </h2>
                    <Image
                      className='cursor-pointer rounded-lg drop-shadow-lg'
                      width={60}
                      height={60}
                      src={"/img/griffondor.png"}
                      alt='activity icon'
                      onClick={() => handleActivityClick("discoveryWorldGame1")}
                    />
                  </div>
                </div>
              )}
            </div>
            <Link
              href='/student/dashboard'
              className='text-center [text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)] mb-4'
            >
              Retour vers la liste des matières
            </Link>
          </div>
          <motion.img
            src='/img/niffleur-unscreen.gif'
            alt='gif niffleur'
            width={150}
            height={150}
            className='absolute top-[20px] left-50%'
            initial={{ opacity: 1, y: 135 }}
            animate={showNiffleur ? { y: 150 } : { y: 250 }}
            transition={{ duration: 0.4 }}
          />
          <div className="bg-[url('/img/livre_ouvert.png')] bg-[contain] bg-center bg-no-repeat self-center flex items-center justify-center relative flex-grow w-full max-w-[100%] h-full max-h-[calc(100vh)-600px)] landscape:max-h-[calc(100vh)-150px)] landscape:max-w-[70%]">
            <div className='w-[85%] h-[85%] flex items-center justify-center'>
              {selectedActivity === "mathsGame1" &&
                student &&
                subject &&
                school && (
                  <MathsGame1
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              {selectedActivity === "mathsGame2" &&
                student &&
                subject &&
                school && (
                  <MathsGame2
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              {selectedActivity === "mathsGame3" &&
                student &&
                subject &&
                school && (
                  <MathsGame3
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              {selectedActivity === "mathsGame4" &&
                student &&
                subject &&
                school && (
                  <MathsGame4
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              {selectedActivity === "frenchGame1" &&
                student &&
                subject &&
                school && (
                  <FrenchGame1
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              {selectedActivity === "frenchGame2" &&
                student &&
                subject &&
                school && (
                  <FrenchGame2
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              {selectedActivity === "englishGame1" &&
                student &&
                subject &&
                school && (
                  <EnglishGame1
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              {selectedActivity === "discoveryWorldGame1" &&
                student &&
                subject &&
                school && (
                  <DiscoveryWorldGame1
                    school={school}
                    subject={subject}
                    studentId={student.id}
                    period={period ? Number(period.id) : 0}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubjectPageWrapper = () => (
  <Suspense fallback={<Loading />}>
    <SubjectPage />
  </Suspense>
);

export default SubjectPageWrapper;
