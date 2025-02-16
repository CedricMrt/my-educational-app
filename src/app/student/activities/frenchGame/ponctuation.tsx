import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState } from "react";
import { saveResponse } from "@/app/lib/firebaseConfig";

interface Punctuation {
  index: number;
  symbol: string;
}
interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}
const DRAG_TYPES = {
  TOOL: "tool",
};

const Tool = ({ label, type }: { label: string; type: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPES.TOOL,
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className='flex items-center justify-center w-20 h-12 p-2 max-sm:w-14 max-sm:h-8 text-2xl rounded-lg cursor-grab bg-gradient-to-r from-[#2D2305] to-[#433500] drop-shadow-lg'
      style={{
        backgroundColor: isDragging ? "#ddd" : "#0070f3",
      }}
    >
      {label}
    </div>
  );
};

const Word = ({
  word,
  index,
  punctuation,
  applyTool,
}: {
  word: string;
  index: number;
  punctuation: Punctuation[];
  applyTool: (index: number, tool: string) => void;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: DRAG_TYPES.TOOL,
    drop: (item: { type: string }) => applyTool(index, item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const punct = punctuation.find((p) => p.index === index)?.symbol || "";

  return (
    <span
      ref={drop as unknown as React.Ref<HTMLSpanElement>}
      className='inline-block break-all p-1 cursor-pointer text-black'
      style={{
        backgroundColor: isOver ? "#f0f0f0" : "transparent",
        border: isOver ? "1px dashed #0070f3" : "none",
        padding: isOver ? "1rem" : "4px",
      }}
    >
      {word}
      {punct}
    </span>
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
    [
      "harry",
      "mange",
      "à",
      "la",
      "table",
      "de",
      "gryffondor",
      "ron",
      "lui",
      "parle",
      "de",
      "sa",
      "dernière",
      "aventure",
    ],
    [
      "harry",
      "dort",
      "dans",
      "un",
      "placard",
      "sous",
      "l'escalier",
      "dudley",
      "le",
      "réveille",
      "en",
      "sautant",
      "sur",
      "les",
      "marches",
    ],
    [
      "hermione",
      "étudie",
      "dans",
      "la",
      "bibliothèque",
      "harry",
      "et",
      "ron",
      "jouent",
      "aux",
      "échecs",
      "magiques",
    ],
    [
      "draco",
      "malfoy",
      "se",
      "moque",
      "de",
      "harry",
      "dans",
      "le",
      "couloir",
      "pansy",
      "parkinson",
      "rit",
      "de",
      "ses",
      "blagues",
    ],
    [
      "hagrid",
      "prend",
      "soin",
      "de",
      "son",
      "dragon",
      "harry",
      "l’aide",
      "à",
      "nourrir",
      "norbert",
    ],
    [
      "dumbledore",
      "parle",
      "aux",
      "élèves",
      "dans",
      "la",
      "grande",
      "salle",
      "harry",
      "écoute",
      "attentivement",
    ],
    [
      "ron",
      "se",
      "dispute",
      "avec",
      "draco",
      "pendant",
      "le",
      "cours",
      "de",
      "potions",
      "hermione",
      "essaie",
      "de",
      "calmer",
      "tout",
      "le",
      "monde",
    ],
    [
      "les",
      "weasley",
      "décorent",
      "leur",
      "sapin",
      "de",
      "noël",
      "harry",
      "les",
      "aide",
      "en",
      "accrochant",
      "des",
      "guirlandes",
    ],
    [
      "luna",
      "lovegood",
      "lit",
      "un",
      "livre",
      "étrange",
      "harry",
      "la",
      "regarde",
      "en",
      "se",
      "demandant",
      "ce",
      "qu'elle",
      "fait",
    ],
    [
      "neville",
      "trébuche",
      "dans",
      "le",
      "hall",
      "ginny",
      "lui",
      "tend",
      "la",
      "main",
      "pour",
      "l’aider",
    ],
    [
      "harry",
      "vole",
      "sur",
      "son",
      "balai",
      "pendant",
      "le",
      "match",
      "de",
      "quidditch",
      "cho",
      "chang",
      "le",
      "regarde",
      "depuis",
      "les",
      "gradins",
    ],
  ];

  const [currentSentence, setCurrentSentence] = useState(sentences[0]);
  const [punctuation, setPunctuation] = useState<Punctuation[]>([]);

  const applyTool = (index: number, tool: string) => {
    setCurrentSentence((prevSentence) => {
      const updatedSentence = [...prevSentence];

      if (tool === "uppercase") {
        const currentWord = updatedSentence[index];
        const isUppercase =
          currentWord.charAt(0) === currentWord.charAt(0).toUpperCase();

        updatedSentence[index] = isUppercase
          ? currentWord.charAt(0).toLowerCase() + currentWord.slice(1)
          : currentWord.charAt(0).toUpperCase() + currentWord.slice(1);
      }

      return updatedSentence;
    });

    if (tool === "comma" || tool === "period") {
      const symbol = tool === "comma" ? "," : ".";
      setPunctuation((prevPunctuation) => {
        const existingPunctuation = prevPunctuation.find(
          (p) => p.index === index
        );

        if (existingPunctuation?.symbol === symbol) {
          return prevPunctuation.filter((p) => p.index !== index);
        } else {
          return [
            ...prevPunctuation.filter((p) => p.index !== index),
            { index, symbol },
          ];
        }
      });
    }
  };

  const getCorrectedSentence = () => {
    const wordsWithPunctuation = currentSentence.map((word, i) => {
      const punct = punctuation.find((p) => p.index === i);
      return punct ? `${word}${punct.symbol}` : word;
    });
    return wordsWithPunctuation.join(" ");
  };

  const [message, setMessage] = useState("");

  const validateCorrection = async () => {
    const correctedSentence = [
      "Harry mange à la table de Gryffondor, Ron lui parle de sa dernière aventure.",
      "Harry dort dans un placard sous l'escalier, Dudley le réveille en sautant sur les marches.",
      "Hermione étudie dans la bibliothèque, Harry et Ron jouent aux échecs magiques.",
      "Draco Malfoy se moque de Harry dans le couloir, Pansy Parkinson rit de ses blagues.",
      "Hagrid prend soin de son dragon, Harry l’aide à nourrir Norbert.",
      "Dumbledore parle aux élèves dans la grande salle, Harry écoute attentivement.",
      "Ron se dispute avec Draco pendant le cours de potions, Hermione essaie de calmer tout le monde.",
      "Les Weasley décorent leur sapin de Noël, Harry les aide en accrochant des guirlandes.",
      "Luna Lovegood lit un livre étrange, Harry la regarde en se demandant ce qu'elle fait.",
      "Neville trébuche dans le hall, Ginny lui tend la main pour l’aider.",
      "Harry vole sur son balai pendant le match de Quidditch, Cho Chang le regarde depuis les gradins.",
    ];
    try {
      const isCorrect = correctedSentence.includes(getCorrectedSentence());
      await saveResponse(
        school,
        studentId,
        subject,
        period,
        "ponctuation",
        isCorrect
      );

      if (isCorrect) {
        onCorrectAnswer();
        setMessage("Bravo ! La correction est parfaite !");
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * sentences.length);
          setCurrentSentence(sentences[randomIndex]);
          setMessage("");
          setPunctuation([]);
        }, 2000);
      } else {
        setMessage("Ce n'est pas correct. Essayez encore !");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex flex-col justify-around items-center w-full h-full'>
        <h1 className='text-2xl text-black'>Corrige la phrase</h1>
        <p className='max-w-[90%] text-xl max-lg:text-2xl max-sm:text-base h780:text-2xl h1050:text-3xl'>
          {currentSentence.map((word, index) => (
            <Word
              key={`${word}-${index}`}
              word={word}
              index={index}
              punctuation={punctuation}
              applyTool={applyTool}
            />
          ))}
        </p>
        <div className='space-x-5'>
          <strong className='[text-shadow:_1px_1px_0px_rgb(0_0_0_/_0.8)] max-sm:hidden'>
            Outils :
          </strong>
          <div className='flex gap-5'>
            <Tool label='ABC' type='uppercase' />
            <Tool label=',' type='comma' />
            <Tool label='.' type='period' />
          </div>
        </div>
        <button
          onClick={validateCorrection}
          className='p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer'
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
    </DndProvider>
  );
};

export default InteractiveCorrection;
