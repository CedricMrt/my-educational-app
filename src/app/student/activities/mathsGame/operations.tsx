"use client";
import { saveResponse } from "@/app/lib/firebaseConfig";
import { useState, useEffect } from "react";

interface GameProps {
  period: number;
  studentId: string;
  subject: string;
}
const Game = ({ period, studentId, subject }: GameProps) => {
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [operation, setOperation] = useState("addition");
  const [userAnswer, setUserAnswer] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    generateGame(period);
  }, [operation, period]);

  const generateGame = (period: number) => {
    const ranges = [
      { min: 0, max: 20 },
      { min: 0, max: 60 },
      { min: 0, max: 69 },
    ];

    if (period < 1 || period > ranges.length) {
      console.error("Invalid period value");
      return;
    }

    const { min, max } = ranges[period - 1];
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    const sortedNumbers = [num1, num2].sort((a, b) => b - a);

    setNumber1(sortedNumbers[0]);
    setNumber2(sortedNumbers[1]);
    setUserAnswer("");
    setMessage("");
  };

  const handleValidate = async () => {
    if (isNaN(Number(userAnswer))) {
      setMessage("Veuillez entrer un nombre valide.");
      return;
    }

    const correctAnswer =
      operation === "addition"
        ? number1 + number2
        : Math.abs(number1 - number2);
    const isCorrect = parseInt(userAnswer) === correctAnswer;

    try {
      await saveResponse(studentId, subject, period, "operations", isCorrect);
      setMessage("Bravo ! Bonne réponse 🎉");
      if (isCorrect) {
        setTimeout(() => {
          generateGame(period);
        }, 2000);
      } else {
        setMessage("Ce n'est pas correct. Essayez encore !");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  return (
    <div className='flex flex-col justify-around items-center w-full h-full'>
      <select
        className='p-2 rounded-xl text-2xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a]'
        value={operation}
        onChange={(e) => setOperation(e.target.value)}
      >
        <option className='bg-black' value='addition'>
          Addition
        </option>
        <option className='bg-black' value='soustraction'>
          Soustraction
        </option>
      </select>
      <div className='space-x-3 flex'>
        <span className='text-6xl'>{number1}</span>
        <span className='text-6xl'>{operation === "addition" ? "+" : "-"}</span>
        <span className='text-6xl'>{number2}</span>
        <span className='text-6xl'>=</span>
        <input
          className='max-w-16 text-center text-4xl px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
          type='text'
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
      </div>
      <button
        className='p-2 text-2xl rounded-xl bg-gradient-to-r from-[#9d523c] to-[#f2a65a] cursor-pointer'
        onClick={handleValidate}
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

export default Game;
