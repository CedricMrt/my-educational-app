"use client";

import { useState, useEffect, useRef } from "react";
import { saveResponse } from "@/app/lib/firebaseConfig";

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}

type Verb =
  | "manger"
  | "chanter"
  | "faire"
  | "dire"
  | "venir"
  | "dormir"
  | "vendre"
  | "parler"
  | "regarder"
  | "aimer"
  | "lire";

const verbs: Record<Verb, { sujet: string; text?: string }[]> = {
  manger: [
    { sujet: "je", text: "mange" },
    { sujet: "tu", text: "manges" },
    { sujet: "il,elle", text: "mange" },
    { sujet: "nous", text: "mangeons" },
    { sujet: "vous", text: "mangez" },
    { sujet: "ils,elles", text: "mangent" },
  ],
  chanter: [
    { sujet: "je", text: "chante" },
    { sujet: "tu", text: "chantes" },
    { sujet: "il,elle", text: "chante" },
    { sujet: "nous", text: "chantons" },
    { sujet: "vous", text: "chantez" },
    { sujet: "ils,elles", text: "chantent" },
  ],
  faire: [
    { sujet: "je", text: "fais" },
    { sujet: "tu", text: "fais" },
    { sujet: "il,elle", text: "fait" },
    { sujet: "nous", text: "faisons" },
    { sujet: "vous", text: "faites" },
    { sujet: "ils,elles", text: "font" },
  ],
  dire: [
    { sujet: "je", text: "dis" },
    { sujet: "tu", text: "dis" },
    { sujet: "il,elle", text: "dit" },
    { sujet: "nous", text: "disons" },
    { sujet: "vous", text: "dites" },
    { sujet: "ils,elles", text: "disent" },
  ],
  venir: [
    { sujet: "je", text: "viens" },
    { sujet: "tu", text: "viens" },
    { sujet: "il,elle", text: "vient" },
    { sujet: "nous", text: "venons" },
    { sujet: "vous", text: "venez" },
    { sujet: "ils,elles", text: "viennent" },
  ],
  dormir: [
    { sujet: "je", text: "dors" },
    { sujet: "tu", text: "dors" },
    { sujet: "il,elle", text: "dort" },
    { sujet: "nous", text: "dormons" },
    { sujet: "vous", text: "dormez" },
    { sujet: "ils,elles", text: "dorment" },
  ],
  vendre: [
    { sujet: "je", text: "vends" },
    { sujet: "tu", text: "vends" },
    { sujet: "il,elle", text: "vend" },
    { sujet: "nous", text: "vendons" },
    { sujet: "vous", text: "vendez" },
    { sujet: "ils,elles", text: "vendent" },
  ],
  parler: [
    { sujet: "je", text: "parle" },
    { sujet: "tu", text: "parles" },
    { sujet: "il,elle", text: "parle" },
    { sujet: "nous", text: "parlons" },
    { sujet: "vous", text: "parlez" },
    { sujet: "ils,elles", text: "parlent" },
  ],
  regarder: [
    { sujet: "je", text: "regarde" },
    { sujet: "tu", text: "regardes" },
    { sujet: "il,elle", text: "regarde" },
    { sujet: "nous", text: "regardons" },
    { sujet: "vous", text: "regardez" },
    { sujet: "ils,elles", text: "regardent" },
  ],
  aimer: [
    { sujet: "j'", text: "aime" },
    { sujet: "tu", text: "aimes" },
    { sujet: "il,elle", text: "aime" },
    { sujet: "nous", text: "aimons" },
    { sujet: "vous", text: "aimez" },
    { sujet: "ils,elles", text: "aiment" },
  ],
  lire: [
    { sujet: "je", text: "lis" },
    { sujet: "tu", text: "lis" },
    { sujet: "il,elle", text: "lit" },
    { sujet: "nous", text: "lisons" },
    { sujet: "vous", text: "lisez" },
    { sujet: "ils,elles", text: "lisent" },
  ],
};

const getRandomVerb = (previousVerb?: Verb): Verb => {
  const keys = Object.keys(verbs) as Verb[];
  let newVerb;
  do {
    newVerb = keys[Math.floor(Math.random() * keys.length)];
  } while (newVerb === previousVerb);
  return newVerb;
};

const getRandomItems = (Verb: Verb) => {
  return verbs[Verb].sort(() => 0.5 - Math.random()).slice(0, 6);
};

const MatchingGame = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [Verb, setVerb] = useState(getRandomVerb());
  const [items, setItems] = useState<
    { sujet: string; image?: string; text?: string; color?: string }[]
  >([]);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [connections, setConnections] = useState<
    { sujet: string; match: string }[]
  >([]);
  const [selectedsujet, setSelectedsujet] = useState<string | null>(null);
  const [, setSelectedImg] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedItems = getRandomItems(Verb);
    setItems(selectedItems);

    const shuffledValues = selectedItems
      .map((item) => item.text)
      .sort(() => 0.5 - Math.random());

    setShuffledItems(shuffledValues as string[]);
    setConnections([]);
    setLines([]);
  }, [Verb]);

  const handleSelectsujet = (sujet: string) => {
    setSelectedsujet(sujet);
  };

  const handleResetLines = () => {
    setLines([]);
    setConnections([]);
    setSelectedsujet(null);
    setSelectedImg(null);
  };

  const handleSelectImg = (image: string, index: number) => {
    if (selectedsujet && containerRef.current) {
      const leftElement = containerRef.current.querySelector(
        `[data-sujet="${selectedsujet}"]`
      );
      const rightElement = containerRef.current.querySelector(
        `[data-image="${image}_${index}"]`
      );

      if (leftElement && rightElement) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const leftRect = leftElement.getBoundingClientRect();
        const rightRect = rightElement.getBoundingClientRect();

        const x1 = leftRect.right - containerRect.left + 56;
        const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
        const x2 = rightRect.left - containerRect.left + 56;
        const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;

        setLines((prev) => [...prev, { x1, y1, x2, y2 }]);

        setConnections((prev) => [
          ...prev,
          { sujet: selectedsujet, match: image },
        ]);
      }
    }
    setSelectedsujet(null);
    setSelectedImg(null);
  };

  const handleValidate = async () => {
    try {
      const correctConnections = connections.filter(({ sujet, match }) =>
        items.some((item) => item.sujet === sujet && item.text === match)
      );

      const isCorrect = correctConnections.length === items.length;

      await saveResponse(
        school,
        studentId,
        subject,
        period,
        "relier",
        isCorrect
      );

      if (isCorrect) {
        onCorrectAnswer();
        setMessage("Bravo ! Toutes les connexions sont correctes 🎉");
        setTimeout(() => {
          setVerb(getRandomVerb(Verb));
          setConnections([]);
          setLines([]);
          setMessage("");
        }, 2000);
      } else {
        setMessage("Incorrect, essaie encore !");

        const correctLines = lines.filter((_, index) =>
          correctConnections.some(
            (conn) =>
              conn.sujet === connections[index].sujet &&
              conn.match === connections[index].match
          )
        );

        setLines(correctLines);
        setConnections(correctConnections);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  return (
    <div className='flex flex-col justify-around items-center w-full h-full'>
      <h2 className='text-black text-2xl font-bold'>
        Relie le pronom sujet à la bonne terminaison
      </h2>
      <div className='flex relative max-h-[300px] w-3/4' ref={containerRef}>
        <div className='flex flex-col justify-between items-center w-1/2'>
          {items.map((item) => (
            <div key={item.sujet} className='flex items-center h-16 w-full'>
              <span
                className={`w-1/2 text-center p-2 rounded ${
                  selectedsujet === item.sujet ? "bg-[#14120B]" : "bg-[#1B180F]"
                }`}
                data-sujet={item.sujet}
                onClick={() => handleSelectsujet(item.sujet)}
              >
                {item.sujet}
              </span>
              <div
                className='w-1/2 flex justify-center cursor-pointer'
                data-sujet={item.sujet}
                onClick={() => handleSelectsujet(item.sujet)}
              >
                <div className='w-4 h-4 rounded-full bg-black'></div>
              </div>
            </div>
          ))}
        </div>
        <div className='flex flex-col justify-between items-center w-1/2'>
          {shuffledItems.map((item, index) => (
            <div key={index} className='flex items-center h-16 w-full'>
              <div
                className='w-1/2 flex justify-center cursor-pointer'
                data-image={`${item}_${index}`}
                onClick={() => handleSelectImg(item, index)}
              >
                <div className='w-4 h-4 rounded-full bg-black'></div>
              </div>
              <span
                className='w-1/2 p-2 max-h-14 bg-[#1B180F] rounded flex items-center justify-center'
                data-image={`${item}_${index}`}
                onClick={() => handleSelectImg(item, index)}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
        <svg className='absolute top-0 left-0 w-full h-full pointer-events-none'>
          {lines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke='black'
              strokeWidth='2'
            />
          ))}
        </svg>
      </div>
      <div className='w-1/2 flex justify-between items-center'>
        <button
          onClick={handleResetLines}
          className='p-2 bg-[#433500] text-[#F5E147] text-2xl py-1 rounded-xl hover:bg-[#362B00] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-xl'
        >
          Annuler
        </button>
        <div className=''>
          <button
            onClick={handleValidate}
            className='p-2 bg-[#FFE770] text-[#9E6C00] text-2xl py-1 rounded-xl hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer drop-shadow-xl'
          >
            Valider
          </button>
        </div>
      </div>

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

export default MatchingGame;
