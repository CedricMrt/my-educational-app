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

const getRandomTime = (period: number) => {
  const hours = Math.floor(Math.random() * 12) + 1;
  let minutes;

  if (period === 1) {
    // Si period = 1, on ne prend que 00, 15, 30, 45
    const validMinutes = [0, 15, 30, 45];
    minutes = validMinutes[Math.floor(Math.random() * validMinutes.length)];
  } else {
    // Sinon, on garde des minutes en multiples de 5
    minutes = Math.floor(Math.random() * 12) * 5;
  }

  return { hours, minutes };
};

const ClockGame = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [targetTime, setTargetTime] = useState(getRandomTime(period));
  const [selectedTime, setSelectedTime] = useState({ hours: 12, minutes: 0 });
  const [inputTime, setInputTime] = useState("");
  const [message, setMessage] = useState("");
  const [gameMode, setGameMode] = useState(1);
  const [isSettingHours, setIsSettingHours] = useState(false);

  useEffect(() => {
    setTargetTime(getRandomTime(period));
    setSelectedTime({ hours: 12, minutes: 0 });
    setInputTime("");
    setMessage("");
    setGameMode(Math.random() < 0.5 ? 1 : 2); // Mode 1 ou 2 aléatoire
  }, [period]);

  const handleValidate = async () => {
    let isCorrect = false;

    if (gameMode === 1) {
      // Mode 1 - Lecture de l'heure
      const [inputHours, inputMinutes] = inputTime.split(":").map(Number);
      isCorrect =
        inputHours === targetTime.hours && inputMinutes === targetTime.minutes;
    } else {
      // Mode 2 - Réglage des aiguilles
      isCorrect =
        selectedTime.hours === targetTime.hours &&
        selectedTime.minutes === targetTime.minutes;
    }

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
        setTargetTime(getRandomTime(period));
        setSelectedTime({ hours: 12, minutes: 0 });
        setInputTime("");
        setMessage("");
        setGameMode(Math.random() < 0.5 ? 1 : 2); // Changer de mode à chaque fois
      }, 2000);
    } else {
      setMessage("Incorrect, essaie encore !");
    }
  };

  const handleClockClick = (event: React.MouseEvent) => {
    if (gameMode !== 2) return;

    const clockRect = (event.target as HTMLElement).getBoundingClientRect();
    const centerX = clockRect.left + clockRect.width / 2;
    const centerY = clockRect.top + clockRect.height / 2;
    const clickX = event.clientX;
    const clickY = event.clientY;

    const deltaX = clickX - centerX;
    const deltaY = clickY - centerY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    const normalizedAngle = angle < 0 ? 360 + angle : angle;

    // Mise à jour des minutes ou des heures en fonction du clic
    if (isSettingHours) {
      // Réglage des heures
      const hours = Math.round(normalizedAngle / 30) || 12;
      setSelectedTime((prev) => ({ ...prev, hours }));
    } else {
      let minutes;
      if (period === 1) {
        // Si period = 1, ne prendre que 00, 15, 30, 45
        const validMinutes = [0, 15, 30, 45];
        const index = Math.round(normalizedAngle / 90) % 4;
        minutes = validMinutes[index];
      } else {
        minutes = (Math.round(normalizedAngle / 30) * 5) % 60;
      }
      setSelectedTime((prev) => ({ ...prev, minutes }));
    }
  };

  /* const hourDeg =
    (gameMode === 1 ? targetTime.hours % 12 : selectedTime.hours % 12) * 30 +
    (gameMode === 1 ? targetTime.minutes : selectedTime.minutes) * 0.5;
  const minuteDeg =
    (gameMode === 1 ? targetTime.minutes : selectedTime.minutes) * 6; */

  return (
    <div className='flex flex-col justify-around items-center w-full h-full'>
      {gameMode === 1 ? (
        <>
          <p className='text-black font-bold text-2xl'>Quelle heure est-il ?</p>
          <article className='clock'>
            <div className='hours-container'>
              <div
                className='hours'
                style={{
                  transform: `rotate(${
                    (targetTime.hours % 12) * 30 + targetTime.minutes * 0.5
                  }deg)`,
                }}
              ></div>
            </div>
            <div className='minutes-container'>
              <div
                className='minutes'
                style={{ transform: `rotate(${targetTime.minutes * 6}deg)` }}
              ></div>
            </div>
          </article>
          <input
            type='text'
            placeholder='hh:mm'
            value={inputTime}
            onChange={(e) => {
              const value = e.target.value;
              const regex = /^([0-9]{1,2}):([0-9]{2})$/;
              const match = value.match(regex);
              if (match) {
                const minutes = parseInt(match[2]);
                if (period === 1 && ![0, 15, 30, 45].includes(minutes)) {
                  return;
                }
              }
              setInputTime(value);
            }}
            className='mt-4 p-2 text-center text-xl border rounded-lg bg-[#2D2305] max-w-32'
          />
        </>
      ) : (
        <>
          <p className='text-black font-bold text-2xl'>
            Place les aiguilles pour afficher :{" "}
            {targetTime.hours.toString().padStart(2, "0")}:
            {targetTime.minutes.toString().padStart(2, "0")}
          </p>
          <article className='clock' onClick={handleClockClick}>
            <div className='hours-container'>
              <div
                className='hours'
                style={{
                  transform: `rotate(${
                    (selectedTime.hours % 12) * 30 + selectedTime.minutes * 0.5
                  }deg)`,
                }}
              ></div>
            </div>
            <div className='minutes-container'>
              <div
                className='minutes'
                style={{ transform: `rotate(${selectedTime.minutes * 6}deg)` }}
              ></div>
            </div>
          </article>
          <button
            onClick={() => setIsSettingHours((prev) => !prev)}
            className={`mt-2 p-2 text-xl rounded-lg ${
              isSettingHours
                ? "bg-[#F5E147] text-[#433500]"
                : "bg-[#433500] text-[#F5E147]"
            }`}
          >
            {isSettingHours ? "Réglage des heures" : "Réglage des minutes"}
          </button>
        </>
      )}

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
