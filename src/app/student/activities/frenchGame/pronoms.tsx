import { useState } from "react";
import { saveResponse } from "@/app/lib/firebaseConfig";

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}

const Tool = ({
  label,
  onClick,
  isActive,
}: {
  label: string;
  onClick: () => void;
  isActive: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className='flex items-center justify-center m-1 w-20 h-12 p-2 max-sm:w-14 max-sm:h-8 text-2xl rounded-xl cursor-pointer bg-gradient-to-r from-[#2D2305] to-[#433500] drop-shadow-lg h400:w-14 h400:h-8'
      style={{
        opacity: isActive ? 0.5 : 1,
      }}
    >
      {label}
    </div>
  );
};

const InteractiveCorrection = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const sentences = [
    "Moi et Harry rentrons à Poudlard en septembre.",
    "Ron et moi adorons le Quidditch.",
    "Moi et mes amis aimons les créatures magiques.",
    "Les élèves et toi allez à Pré-au-Lard mercredi soir.",
    "Harry et toi devez étudier à la bibliothèque.",
    "Toi et Neville venez au bal de Noël ensemble.",
    "Papa et maman nous accompagnent à la gare.",
    "Hagrid et Dumbledore discutent de la forêt interdite.",
    "Hermione et Luna parlent de leur prochain examen.",
    "Les filles vont au cours de potions.",
    "Cho Chang lit un livre étrange.",
    "Drago décore le sapin de Noël avec ses amis.",
    "Ginny s'entraîne à lancer des sorts.",
  ];

  const pronounReplacements = [
    "Drago",
    "Ginny",
    "Moi et Harry",
    "Ron et moi",
    "Moi et mes amis",
    "Les élèves et toi",
    "Harry et toi",
    "Toi et Neville",
    "Papa et maman",
    "Hagrid et Dumbledore",
    "Hermione et Luna",
    "Les filles",
    "Cho Chang",
  ];

  const [currentSentence, setCurrentSentence] = useState<string>(
    sentences[Math.floor(Math.random() * sentences.length)]
  );
  const [correctedSentence, setCorrectedSentence] =
    useState<string>(currentSentence);
  const [activeTool, setActiveTool] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const applyTool = (selectedPronoun: string) => {
    let modifiedSentence = currentSentence;

    pronounReplacements.forEach((group) => {
      if (modifiedSentence.includes(group)) {
        modifiedSentence = modifiedSentence.replace(group, selectedPronoun);
      }
    });

    setCorrectedSentence(modifiedSentence);
    setActiveTool(selectedPronoun);
  };

  const validateCorrection = async () => {
    const correctSentences = [
      "nous rentrons à Poudlard en septembre.",
      "nous adorons le Quidditch.",
      "nous aimons les créatures magiques.",
      "vous allez à Pré-au-Lard mercredi soir.",
      "vous devez étudier à la bibliothèque.",
      "vous venez au bal de Noël ensemble.",
      "ils nous accompagnent à la gare.",
      "ils discutent de la forêt interdite.",
      "elles parlent de leur prochain examen.",
      "elles vont au cours de potions.",
      "elle lit un livre étrange.",
      "il décore le sapin de Noël avec ses amis.",
      "elle s'entraîne à lancer des sorts.",
    ];

    try {
      const isCorrect = correctSentences.includes(correctedSentence);
      await saveResponse(
        school,
        studentId,
        subject,
        period,
        "pronoms",
        isCorrect
      );

      if (isCorrect) {
        onCorrectAnswer();
        setMessage("Bravo ! La correction est parfaite !");
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          const newSentence = sentences[randomIndex];
          setCurrentSentence(newSentence);
          setCorrectedSentence(newSentence);
          setActiveTool("");
          setMessage("");
        }, 2000);
      } else {
        setMessage("Ce n'est pas correct. Essayez encore !");
        setActiveTool("");
        setCorrectedSentence(currentSentence);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  return (
    <div className='flex flex-col justify-around items-center w-full h-full h400:w-[84%]'>
      <h1 className='text-2xl font-bold text-black'>Corrige la phrase</h1>
      <p className='max-w-[90%] text-xl text-black max-lg:text-2xl max-sm:text-base h780:text-2xl h1050:text-3xl'>
        {correctedSentence}
      </p>
      <div className='flex flex-wrap max-w-[92%]'>
        {["il", "elle", "nous", "vous", "ils", "elles"].map((pronoun) => (
          <Tool
            key={pronoun}
            label={pronoun}
            onClick={() => applyTool(pronoun)}
            isActive={activeTool === pronoun}
          />
        ))}
      </div>
      <button
        onClick={validateCorrection}
        className='p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-xl hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-xl'
      >
        Valider
      </button>
      <p
        className={`text-[#291b17] transition-opacity duration-500 ${
          message ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default InteractiveCorrection;
