"use client";
import { useState, useEffect } from "react";
import "./Heures.css";
import { saveResponse } from "@/app/lib/firebaseConfig";

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}

const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 12) + 1;
  const minutes = Math.floor(Math.random() * 12) * 5;
  return { hours, minutes };
};

const ClockGame = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [targetTime, setTargetTime] = useState(getRandomTime());
  const [inputTime, setInputTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTargetTime(getRandomTime());
    setInputTime("");
  }, [period]);

  const handleValidate = async () => {
    const [inputHours, inputMinutes] = inputTime.split(":").map(Number);
    const isCorrect =
      inputHours === targetTime.hours && inputMinutes === targetTime.minutes;

    await saveResponse(
      school,
      studentId,
      subject,
      period,
      "clock-game",
      isCorrect
    );

    if (isCorrect) {
      onCorrectAnswer();
      setMessage("Bravo ! Bonne réponse 🎉");
      setTimeout(() => {
        setTargetTime(getRandomTime());
        setInputTime("");
        setMessage("");
      }, 2000);
    } else {
      setMessage("Incorrect, essaie encore !");
    }
  };

  const hourDeg = (targetTime.hours % 12) * 30 + targetTime.minutes * 0.5;
  const minuteDeg = targetTime.minutes * 6;

  return (
    <div className='flex flex-col justify-around items-center w-full h-full'>
      <p className='text-black font-bold text-2xl'>
        Lis l&apos;heure sur l&apos;horloge et saisis-la :
      </p>
      <article className='clock'>
        <div className='hours-container'>
          <div
            className='hours'
            style={{ transform: `rotate(${hourDeg}deg)` }}
          ></div>
        </div>
        <div className='minutes-container'>
          <div
            className='minutes'
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          ></div>
        </div>
      </article>
      <input
        type='text'
        value={inputTime}
        onChange={(e) => setInputTime(e.target.value)}
        placeholder='HH:MM'
        className='mt-4 p-2 border rounded-lg max-w-24 text-center text-xl bg-gradient-to-r from-[#2D2305] to-[#433500]'
      />
      <button
        onClick={handleValidate}
        className='mt-4 p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer'
      >
        Valider
      </button>
      <p className='mt-2'>{message}</p>
    </div>
  );
};

export default ClockGame;
