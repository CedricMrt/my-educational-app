"use client";
import { saveResponse } from "@/app/lib/firebaseConfig";
import { useState, useEffect } from "react";

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}
const Game = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [operation, setOperation] = useState("addition");
  const [units, setUnits] = useState("");
  const [tens, setTens] = useState("");
  const [hundreds, setHundreds] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [displayMode, setDisplayMode] = useState("inline");

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
    setUnits("");
    setTens("");
    setHundreds("");
    setMessage("");
    setDisplayMode(Math.random() < 0.5 ? "inline" : "column");
  };

  const handleValidate = async () => {
    const correctAnswer =
      operation === "addition"
        ? number1 + number2
        : Math.abs(number1 - number2);

    let userResponse = 0;

    if (displayMode === "inline") {
      userResponse = parseInt(userAnswer);
    } else {
      userResponse =
        (parseInt(hundreds) || 0) * 100 +
        (parseInt(tens) || 0) * 10 +
        (parseInt(units) || 0);
    }

    if (isNaN(userResponse)) {
      setMessage("Veuillez entrer un nombre valide.");
      return;
    }

    const isCorrect = userResponse === correctAnswer;

    try {
      await saveResponse(
        school,
        studentId,
        subject,
        period,
        "operations",
        isCorrect
      );
      if (isCorrect) {
        onCorrectAnswer();
        setMessage("Bravo ! Bonne réponse 🎉");
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
        className='p-2 rounded-xl text-2xl bg-gradient-to-r from-[#2D2305] to-[#433500]'
        value={operation}
        onChange={(e) => setOperation(e.target.value)}
      >
        <option className='bg-[#433500]' value='addition'>
          Addition
        </option>
        <option className='bg-[#433500]' value='soustraction'>
          Soustraction
        </option>
      </select>
      {displayMode === "inline" ? (
        <div className='space-x-3 flex'>
          <span className='text-6xl'>{number1}</span>
          <span className='text-6xl'>
            {operation === "addition" ? "+" : "-"}
          </span>
          <span className='text-6xl'>{number2}</span>
          <span className='text-6xl'>=</span>
          <input
            className='max-w-20 text-center text-4xl px-3 py-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-200 text-gray-600'
            type='text'
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
        </div>
      ) : (
        <div className='flex flex-col items-end text-6xl font-mono'>
          <div className='flex gap-2'>
            <span className='w-18 text-right tracking-[0.5rem]'>{number1}</span>
          </div>
          <div className='flex gap-2'>
            <span className='text-left w-6'>
              {operation === "addition" ? "+" : "-"}
            </span>
            <span className='w-32 text-right tracking-[0.5rem]'>{number2}</span>
          </div>
          <hr className='w-32 border-2 border-black my-2' />
          <div className='flex gap-2'>
            <input
              className='w-10 text-center text-4xl border rounded-xl bg-green-200 text-gray-600'
              type='text'
              maxLength={1}
              value={hundreds}
              onChange={(e) => setHundreds(e.target.value)}
            />
            <input
              className='w-10 text-center text-4xl border rounded-xl bg-green-200 text-gray-600'
              type='text'
              maxLength={1}
              value={tens}
              onChange={(e) => setTens(e.target.value)}
            />
            <input
              className='w-10 text-center text-4xl border rounded-xl bg-green-200 text-gray-600'
              type='text'
              maxLength={1}
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
          </div>
        </div>
      )}
      <button
        className='p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-xl hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-xl'
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
