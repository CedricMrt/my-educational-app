"use client";
import { useState, useEffect, useCallback } from "react";
import { db, auth, getStudentStats } from "../../lib/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import Navbar from "@/app/components/Navbar";
import AdminGuard from "@/app/utils/AdminGuard";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSchool } from "@/app/utils/SchoolContext";

const Dashboard = () => {
  interface Period {
    id: number;
    uid: string;
    active: boolean;
  }

  interface Student {
    id: string;
    name: string;
    lastName: string;
    password: string;
    uid: string;
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const { school } = useSchool();
  const [students, setStudents] = useState<Student[]>([
    { id: "", name: "", lastName: "", password: "", uid: "" },
  ]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [user, loading] = useAuthState(auth);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showStudentStats, setShowStudentStats] = useState(false);
  const [existingStudents, setExistingStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  interface GameStats {
    correctCount: number;
    incorrectCount: number;
  }
  interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
    options: {
      title: object;
      scales: object;
    };
    average: string;
    gameName: string;
  }

  const [chartData, setChartData] = useState<ChartData[] | null>(null);

  const fetchPeriods = useCallback(async () => {
    if (user && school) {
      const periodsQuery = query(
        collection(db, `schools/${school?.id}/periods`),
        where("uid", "==", user.uid)
      );
      const periodsSnapshot = await getDocs(periodsQuery);
      const periodsData = periodsSnapshot.docs.map((doc) => ({
        id: doc.data().id,
        uid: doc.data().uid,
        active: doc.data().active || false,
      }));
      setPeriods(periodsData);
    }
  }, [school, user]);

  const fetchStudents = useCallback(async () => {
    if (user && school) {
      const studentsQuery = query(
        collection(db, `schools/${school.id}/students`),
        where("uid", "==", user.uid)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        lastName: doc.data().lastName,
        password: doc.data().password,
        uid: doc.data().uid,
      }));
      setExistingStudents(studentsData);
    }
  }, [user, school]);

  useEffect(() => {
    fetchPeriods();
    fetchStudents();
  }, [user, fetchPeriods, fetchStudents]);

  const handleCreateStudent = async () => {
    try {
      const batch = writeBatch(db);
      students.forEach((student) => {
        if (student.name && student.lastName && student.password) {
          if (!school) {
            throw new Error("School is null");
          }

          // Création d'un identifiant unique (ex: "john.doe.281299")
          const uniquename = `${student.name.toLowerCase()}.${student.lastName.toLowerCase()}.${
            student.password
          }`;

          const studentRef = doc(
            collection(db, `schools/${school.id}/students`)
          );
          batch.set(studentRef, {
            id: studentRef.id,
            name: student.name.toLowerCase(),
            lastName: student.lastName.toLowerCase(),
            password: student.password,
            uniquename,
            uid: user?.uid,
          });
        }
      });
      await batch.commit();
      setStudents([{ id: "", name: "", lastName: "", password: "", uid: "" }]);
      await fetchStudents();
    } catch (error) {
      console.error("Error creating students:", error);
    }
  };

  const handleAddStudentField = () => {
    setStudents([
      ...students,
      { id: "", name: "", lastName: "", password: "", uid: "" },
    ]);
  };

  const handleStudentChange = (
    index: number,
    field: keyof Student,
    value: string
  ) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const handleTogglePeriod = async (periodId: number): Promise<void> => {
    const updatedPeriods: Period[] = periods.map((period) =>
      period.id === periodId
        ? { ...period, active: !period.active }
        : { ...period, active: false }
    );

    try {
      updatedPeriods.forEach(async (period) => {
        const periodQuery = query(
          collection(db, `schools/${school?.id}/periods`),
          where("uid", "==", user?.uid),
          where("id", "==", period.id)
        );
        const periodSnapshot = await getDocs(periodQuery);
        if (!periodSnapshot.empty) {
          const periodDoc = periodSnapshot.docs[0];
          const periodRef = doc(
            db,
            `schools/${school?.id}/periods`,
            periodDoc.id
          );
          await updateDoc(periodRef, { active: period.active });
        } else {
          console.error("Aucune période trouvée pour cet ID");
        }
      });
      setPeriods(updatedPeriods);
    } catch (error) {
      console.error("Error updating period:", error);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      if (!school) {
        throw new Error("School is null");
      }
      const studentRef = doc(db, `schools/${school.id}/students`, studentId);
      await deleteDoc(studentRef);
      await fetchStudents(); // Refresh the list of students
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleDeleteStudentField = (index: number) => {
    const newStudents = students.filter((_, i) => i !== index);
    setStudents(newStudents);
  };

  const toggleStudentForm = () => {
    setShowStudentStats(false);
    setShowStudentForm(!showStudentForm);
  };

  const toggleStudentStats = () => {
    setShowStudentForm(false);
    setShowStudentStats(!showStudentStats);
  };

  const calculateChartData = useCallback(
    (gameName: string, gameStats: GameStats) => {
      const totalResponses = gameStats.correctCount + gameStats.incorrectCount;
      const average =
        totalResponses > 0 ? (gameStats.correctCount / totalResponses) * 20 : 0;

      return {
        labels: ["Bonnes Réponses", "Mauvaises Réponses"],
        datasets: [
          {
            label: "Nombre de Réponses",
            data: [gameStats.correctCount, gameStats.incorrectCount],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 99, 132, 0.6)",
            ],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
            borderWidth: 2,
            borderRadius: 5,
            hoverBackgroundColor: [
              "rgba(75, 192, 192, 0.8)",
              "rgba(255, 99, 132, 0.8)",
            ],
          },
        ],
        options: {
          title: {
            display: true,
            text: `Statistiques pour ${gameName}`,
            color: "#F6EEB4",
            size: 20,
            weight: "bold",
          },
          responsive: true,
          plugins: {
            legend: {
              position: "top",
              color: "#F6EEB4",
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: false,
                text: "Type de Réponse",
                color: "#F6EEB4", // Couleur du titre de l'axe X
              },
              ticks: {
                color: "#F6EEB4", // Couleur des étiquettes de l'axe X
              },
              grid: {
                color: "#F6EEB4", // Couleur es de grill)
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: false,
                text: "Nombre de Réponses",
                color: "#F6EEB4", // Couleur du titre de l'axe Y
              },
              ticks: {
                color: "#F6EEB4", // Couleur des étiquettes de l'axe Y
              },
              grid: {
                color: "#F6EEB4", // Couleur des lignes de grille de l'axe Y
              },
            },
          },
        },
        average: average.toFixed(2),
        gameName: gameName,
      };
    },
    []
  );

  useEffect(() => {
    const fetchStats = async () => {
      if (selectedStudentId && selectedSubject) {
        const activePeriod = periods.find((period) => period.active)?.id;
        if (activePeriod) {
          const stats = await getStudentStats(
            school,
            selectedStudentId,
            activePeriod,
            selectedSubject
          );

          const gameNames = Object.keys(stats);
          const chartDataList = gameNames.map((gameName) => {
            const gameStats = stats[gameName];
            return calculateChartData(gameName, gameStats);
          });

          setChartData(chartDataList);
        }
      }
    };

    fetchStats();
  }, [school, selectedStudentId, selectedSubject, periods, calculateChartData]);

  if (loading) {
    return (
      <div className="bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-[100dvh] flex justify-center items-center">
        <p className='text-2xl'>Chargement...</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="bg-[url('/img/Hogwarts_Background.webp')] bg-cover bg-center bg-no-repeat h-[100dvh] flex flex-col text-[#F6EEB4]">
        <div className='bg-[#0000006b] h-[100dvh]'>
          <Navbar />
          <aside className='fixed left-0 z-40 w-64 bg-[#1B180F] pl-4 pt-2 mt-2 rounded-lg h-full'>
            <h1 className='text-2xl font-bold mb-4'>Tableau de bord</h1>
            <h2 className='text-xl'>Périodes actives:</h2>
            <div className='space-y-1'>
              {periods
                .sort((a, b) => a.id - b.id)
                .map((period) => (
                  <div
                    className={`${
                      period.active
                        ? "[box-shadow:_0_1px_0_rgb(255_255_255_/_40%)] rounded-l-full p-1"
                        : "p-1"
                    }`}
                    key={period.id}
                  >
                    <input
                      className='accent-black'
                      type='radio'
                      checked={period.active}
                      onChange={() => handleTogglePeriod(period.id)}
                    />
                    Période {period.id}
                  </div>
                ))}
            </div>
            <h2
              className={`w-full inline-block text-xl hover:[box-shadow:_0_1px_0_rgb(255_255_255_/_40%)] mt-4 cursor-pointer pl-1 rounded-l-full ${
                showStudentForm
                  ? "[box-shadow:_0_1px_0_rgb(255_255_255_/_40%)]"
                  : ""
              }`}
              onClick={toggleStudentForm}
            >
              Ajouter/Supprimer élèves
            </h2>
            <h2
              className={`w-full inline-block text-xl hover:[box-shadow:_0_1px_0_rgb(255_255_255_/_40%)] mt-4 cursor-pointer  pl-1 rounded-l-full ${
                showStudentStats
                  ? "[box-shadow:_0_1px_0_rgb(255_255_255_/_40%)]"
                  : ""
              }`}
              onClick={toggleStudentStats}
            >
              Stats d&apos;un élève
            </h2>
          </aside>
          <div className='ml-64 p-2 space-y-2'>
            {showStudentForm && (
              <>
                {students.map((student, index) => (
                  <div className='flex space-x-2 w-full' key={index}>
                    <input
                      className='w-1/3 max-h-7 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                      type='text'
                      value={student.name}
                      onChange={(e) =>
                        handleStudentChange(index, "name", e.target.value)
                      }
                      placeholder='Prénom'
                    />
                    <input
                      className='w-1/3 max-h-7 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                      type='text'
                      value={student.lastName}
                      onChange={(e) =>
                        handleStudentChange(index, "lastName", e.target.value)
                      }
                      placeholder='Nom'
                    />
                    <input
                      className='w-1/3 max-h-7 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
                      type='password'
                      value={student.password}
                      onChange={(e) =>
                        handleStudentChange(index, "password", e.target.value)
                      }
                      placeholder='Mot de passe'
                    />
                    {index !== 0 && (
                      <Image
                        className='cursor-pointer'
                        width={30}
                        height={30}
                        alt='delete icon'
                        src='/img/delete.svg'
                        onClick={() => handleDeleteStudentField(index)}
                      />
                    )}
                  </div>
                ))}
                <div className='mt-4 flex space-x-10'>
                  <button
                    className='p-2 rounded-xl bg-gradient-to-r from-[#2D2305] to-[#433500]'
                    onClick={handleAddStudentField}
                  >
                    Ajouter un Champs
                  </button>
                  <button
                    className='p-2 rounded-xl bg-gradient-to-r from-[#2D2305] to-[#433500]'
                    onClick={handleCreateStudent}
                  >
                    Créer compte(s) élèves
                  </button>
                </div>
                <h2 className='text-xl text-white mt-4'>Liste des élèves:</h2>
                <div className='w-full max-h-[calc(100vh-150px)] overflow-y-auto mt-4'>
                  <div className='grid grid-cols-2 gap-6'>
                    {existingStudents.map((student) => (
                      <div
                        key={student.id}
                        className='flex gap-2 items-center text-white text-md'
                      >
                        <span>
                          {student.name} {student.lastName} {student.password}
                        </span>
                        <Image
                          className='cursor-pointer'
                          width={30}
                          height={30}
                          alt='delete icon'
                          src={"/img/delete.svg"}
                          onClick={() => handleDeleteStudent(student.id)}
                        ></Image>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {showStudentStats && (
              <>
                <div className='space-x-5'>
                  <select
                    className='p-2 rounded-xl bg-[#433500] bg-gradient-to-r from-[#2D2305] to-[#433500]'
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value={""}>Choisir un éleve</option>
                    {existingStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} {student.lastName}
                      </option>
                    ))}
                  </select>
                  <select
                    className='p-2 rounded-xl bg-[#433500] bg-gradient-to-r from-[#2D2305] to-[#433500]'
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value=''>Choisir une matière</option>
                    <option value='frenchGame'>Français</option>
                    <option value='mathsGame'>Mathématiques</option>
                    <option value='englishGame'>Anglais</option>
                    <option value='discoveryWorldGame'>
                      Découverte du monde
                    </option>
                  </select>
                </div>
                <div className='w-full max-h-[calc(100vh-150px)] overflow-y-auto mt-4'>
                  <div className='flex flex-col gap-4'>
                    {chartData &&
                      chartData.map((data, index) => (
                        <div
                          className='px-1 bg-gradient-to-r from-[#2D2305] to-[#433500] opacity-80 rounded-lg h-max'
                          key={index}
                        >
                          <Bar data={data} options={data.options} />
                          <p>Moyenne: {data.average}/20</p>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default Dashboard;
