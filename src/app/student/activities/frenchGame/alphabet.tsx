import { saveResponse } from "@/app/lib/firebaseConfig";
import { useState } from "react";

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}

const AlphabetActivity = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [message, setMessage] = useState("");
  const fullAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [missingIndexes, setMissingIndexes] = useState<number[]>(
    generateMissingIndexes()
  );
  const [userInput, setUserInput] = useState<{ [key: number]: string }>({});

  function generateMissingIndexes(): number[] {
    const missingCount = Math.floor(Math.random() * 5) + 3;
    const indexes = new Set<number>();
    while (indexes.size < missingCount) {
      indexes.add(Math.floor(Math.random() * fullAlphabet.length));
    }
    return Array.from(indexes);
  }

  const handleInputChange = (index: number, value: string) => {
    setUserInput({ ...userInput, [index]: value.toUpperCase() });
  };

  const checkAnswers = async () => {
    const correctAnswers = missingIndexes.every(
      (index) => (userInput[index] || "") === fullAlphabet[index]
    );
    if (correctAnswers) {
      try {
        await saveResponse(
          school,
          studentId,
          subject,
          period,
          "alphabet",
          correctAnswers
        );
        onCorrectAnswer();
        setMessage("Bravo ! Toutes les réponses sont correctes 🎉");
        setTimeout(() => {
          setMissingIndexes(generateMissingIndexes());
          setUserInput({});
          setMessage("");
        }, 2000);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
      }
    } else {
      setMessage("Certaines réponses sont incorrectes. Réessaye !");
    }
  };

  return (
    <div className='flex flex-col justify-around items-center w-full h-full'>
      <h1 className='text-black font-bold text-2xl'>
        Complétez l&apos;Alphabet
      </h1>
      <p className='text-black font-bold'>
        Remplissez les lettres manquantes :
      </p>
      <div className='flex justify-center flex-wrap gap-2 mt-5'>
        {fullAlphabet.map((letter, index) =>
          missingIndexes.includes(index) ? (
            <input
              key={index}
              className='w-10 h-10 text-2xl text-center bg-[#14120B] rounded-lg'
              type='text'
              maxLength={1}
              value={userInput[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ) : (
            <span
              key={index}
              className='text-3xl font-bold w-8 text-center [text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'
            >
              {letter}
            </span>
          )
        )}
      </div>
      <button
        className='mt-5 p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer'
        onClick={checkAnswers}
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

export default AlphabetActivity;
