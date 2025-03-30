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
  const [inputTimeHour, setInputTimeHour] = useState("");
  const [inputTimeMinutes, setInputTimeMinutes] = useState("");
  const [message, setMessage] = useState("");
  const [gameMode, setGameMode] = useState(1);
  const [isSettingHours, setIsSettingHours] = useState(false);

  useEffect(() => {
    setTargetTime(getRandomTime(period));
    setSelectedTime({ hours: 12, minutes: 0 });
    setInputTimeHour("");
    setInputTimeMinutes("");
    setMessage("");
    setGameMode(Math.random() < 0.5 ? 1 : 2); // Mode 1 ou 2 aléatoire
  }, [period]);

  const handleValidate = async () => {
    let isCorrect = false;

    if (gameMode === 1) {
      isCorrect =
        Number(inputTimeHour) === targetTime.hours &&
        Number(inputTimeMinutes) === targetTime.minutes;
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
        setInputTimeHour("");
        setInputTimeMinutes("");
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
          <p className='text-black font-bold text-2xl smallFont'>
            Quelle heure est-il ?
          </p>
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
          <div className='flex items-center justify-center'>
            <input
              type='text'
              placeholder='hh'
              value={inputTimeHour}
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^([0-9]{1,2})$/;
                const match = value.match(regex);
                if (match) {
                  const minutes = parseInt(match[2]);
                  if (period === 1 && ![0, 15, 30, 45].includes(minutes)) {
                    return;
                  }
                }
                setInputTimeHour(value);
              }}
              className='mt-4 p-2 text-center text-xl border rounded-xl bg-[#2D2305] max-w-16 smallInput smallMargin'
            />
            <p className='mt-4 mx-3 text-3xl smallMargin'>:</p>
            <input
              type='text'
              placeholder='mm'
              value={inputTimeMinutes}
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^([0-9]{2})$/;
                const match = value.match(regex);
                if (match) {
                  const minutes = parseInt(match[2]);
                  if (period === 1 && ![0, 15, 30, 45].includes(minutes)) {
                    return;
                  }
                }
                setInputTimeMinutes(value);
              }}
              className='mt-4 p-2 text-center text-xl border rounded-xl bg-[#2D2305] max-w-16 smallInput smallMargin smallFont'
            />
          </div>
        </>
      ) : (
        <>
          <p className='text-black font-bold text-2xl smallFont'>
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
            className={`mt-2 p-2 text-xl rounded-xl drop-shadow-lg smallFont smallPadding ${
              isSettingHours
                ? "bg-[#F5E147] text-[#433500]"
                : "bg-[#433500] text-[#F5E147]"
            }`}
          >
            {isSettingHours ? "Réglage des heures" : "Réglage des minutes"}
          </button>
        </>
      )}
      <p
        className={`text-[#291b17] mt-1 transition-opacity duration-500 ${
          message ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </p>
      <button
        onClick={handleValidate}
        className='mt-2 p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-xl hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-xl smallMargin smallPadding'
      >
        Valider
      </button>
    </div>
  );
};

export default ClockGame;
