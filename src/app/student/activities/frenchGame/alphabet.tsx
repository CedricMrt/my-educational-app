import { saveResponse } from "@/app/lib/firebaseConfig";
import { useState } from "react";

interface GameProps {
  period: number;
  studentId: string;
  subject: string;
}

const AlphabetActivity = ({ period, studentId, subject }: GameProps) => {
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
          studentId,
          subject,
          period,
          "alphabet",
          correctAnswers
        );
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
    <div className='flex flex-col justify-around items-center w-[500px] max-md:w-[400px] max-sm:w-[300px] space-y-12 max-md:space-y-8 max-sm:space-y-5'>
      <h1 className='text-black'>Complétez l&apos;Alphabet</h1>
      <p className='text-black'>Remplissez les lettres manquantes :</p>
      <div className='flex justify-center flex-wrap gap-2 mt-5'>
        {fullAlphabet.map((letter, index) =>
          missingIndexes.includes(index) ? (
            <input
              key={index}
              className='w-8 h-8 text-2xl text-center bg-[#8f1818] rounded-lg'
              type='text'
              maxLength={1}
              value={userInput[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ) : (
            <span
              key={index}
              className='text-2xl font-bold w-8 text-center [text-shadow:_1px_2px_0px_rgb(0_0_0_/_0.8)]'
            >
              {letter}
            </span>
          )
        )}
      </div>
      <button
        className='mt-5 p-2 rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] cursor-pointer'
        onClick={checkAnswers}
      >
        Vérifier mes réponses
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