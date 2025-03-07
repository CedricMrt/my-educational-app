"use client";

import { useState, useEffect, useRef } from "react";
import { saveResponse } from "@/app/lib/firebaseConfig";
import Image from "next/image";

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}

type Category = "fruits" | "animals" | "numbers" | "colours";

const categories: Record<
  Category,
  { word: string; image?: string; text?: string; color?: string }[]
> = {
  fruits: [
    { word: "Apple", image: "/img/englishGameImg/apple.png" },
    { word: "Banana", image: "/img/englishGameImg/banana.png" },
    { word: "Orange", image: "/img/englishGameImg/orange.png" },
    { word: "Pear", image: "/img/englishGameImg/pear.png" },
    { word: "Lemon", image: "/img/englishGameImg/lemon.png" },
    { word: "Grape", image: "/img/englishGameImg/grape.png" },
    { word: "Cherry", image: "/img/englishGameImg/cherry.png" },
    { word: "Strawberry", image: "/img/englishGameImg/strawberry.png" },
    { word: "Pineapple", image: "/img/englishGameImg/pineapple.png" },
    { word: "Melon", image: "/img/englishGameImg/melon.png" },
  ],
  animals: [
    { word: "Dog", image: "/img/englishGameImg/dog.png" },
    { word: "Cat", image: "/img/englishGameImg/cat.png" },
    { word: "Fish", image: "/img/englishGameImg/fish.png" },
    { word: "Rabbit", image: "/img/englishGameImg/rabbit.png" },
    { word: "Mouse", image: "/img/englishGameImg/mouse.png" },
    { word: "Bird", image: "/img/englishGameImg/bird.png" },
    { word: "Elephant", image: "/img/englishGameImg/elephant.png" },
    { word: "Tiger", image: "/img/englishGameImg/tiger.png" },
    { word: "Lion", image: "/img/englishGameImg/lion.png" },
    { word: "Monkey", image: "/img/englishGameImg/monkey.png" },
  ],
  numbers: [
    { word: "One", text: "1" },
    { word: "Two", text: "2" },
    { word: "Three", text: "3" },
    { word: "Four", text: "4" },
    { word: "Five", text: "5" },
    { word: "Six", text: "6" },
    { word: "Seven", text: "7" },
    { word: "Eight", text: "8" },
    { word: "Nine", text: "9" },
    { word: "Ten", text: "10" },
  ],
  colours: [
    { word: "Red", color: "#FF0000" },
    { word: "Green", color: "#00FF00" },
    { word: "Blue", color: "#0000FF" },
    { word: "Yellow", color: "#FFFF00" },
    { word: "Purple", color: "#800080" },
    { word: "Orange", color: "#FFA500" },
    { word: "Pink", color: "#FFC0CB" },
    { word: "Brown", color: "#A52A2A" },
    { word: "Black", color: "#000000" },
    { word: "White", color: "#FFFFFF" },
  ],
};

const getRandomCategory = (previousCategory?: Category): Category => {
  const keys = Object.keys(categories) as Category[];
  let newCategory;
  do {
    newCategory = keys[Math.floor(Math.random() * keys.length)];
  } while (newCategory === previousCategory);
  return newCategory;
};

const getRandomItems = (category: Category) => {
  return categories[category].sort(() => 0.5 - Math.random()).slice(0, 5);
};

const MatchingGame = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [category, setCategory] = useState(getRandomCategory());
  const [items, setItems] = useState<
    { word: string; image?: string; text?: string; color?: string }[]
  >([]);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [connections, setConnections] = useState<
    { word: string; match: string }[]
  >([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [, setSelectedImg] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedItems = getRandomItems(category);
    setItems(selectedItems);

    const shuffledValues = selectedItems
      .map((item) => item.image || item.text || item.color)
      .sort(() => 0.5 - Math.random());

    setShuffledItems(shuffledValues as string[]);
    setConnections([]);
    setLines([]);
  }, [category]);

  const handleSelectWord = (word: string) => {
    setSelectedWord(word);
  };

  const handleSelectImg = (image: string) => {
    if (selectedWord && containerRef.current) {
      const leftElement = containerRef.current.querySelector(
        `[data-word="${selectedWord}"]`
      );
      const rightElement = containerRef.current.querySelector(
        `[data-image="${image}"]`
      );

      if (leftElement && rightElement) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const leftRect = leftElement.getBoundingClientRect();
        const rightRect = rightElement.getBoundingClientRect();

        const x1 = leftRect.right - containerRect.left - 25;
        const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
        const x2 = rightRect.left - containerRect.left - 25;
        const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;

        setLines((prev) => [...prev, { x1, y1, x2, y2 }]);

        setConnections((prev) => [
          ...prev,
          { word: selectedWord, match: image },
        ]);
      }
    }
    setSelectedWord(null);
    setSelectedImg(null);
  };

  const handleValidate = async () => {
    try {
      const correctConnections = connections.filter(({ word, match }) =>
        items.some(
          (item) =>
            item.word === word &&
            (item.image === match ||
              item.text === match ||
              item.color === match)
        )
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
          setCategory(getRandomCategory(category));
          setConnections([]);
          setLines([]);
          setMessage("");
        }, 2000);
      } else {
        setMessage("Incorrect, essaie encore !");

        const correctLines = lines.filter((_, index) =>
          correctConnections.some(
            (conn) =>
              conn.word === connections[index].word &&
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
        Relie les éléments entre eux
      </h2>
      <div className='flex space-x-10 mt-4 relative' ref={containerRef}>
        <div className='flex flex-col justify-between space-y-2'>
          {items.map((item) => (
            <div key={item.word} className='flex items-center space-x-2 h-16'>
              <span
                className={`p-2 rounded ${
                  selectedWord === item.word ? "bg-[#14120B]" : "bg-[#1B180F]"
                }`}
                data-word={item.word}
                onClick={() => handleSelectWord(item.word)}
              >
                {item.word}
              </span>
              <div
                className='w-4 h-4 bg-black rounded-full cursor-pointer'
                data-word={item.word}
                onClick={() => handleSelectWord(item.word)}
              ></div>
            </div>
          ))}
        </div>
        <div className='flex flex-col justify-between space-y-2'>
          {shuffledItems.map((item, index) => (
            <div key={index} className='flex items-center space-x-2 h-16'>
              <div
                className='w-4 h-4 bg-black rounded-full cursor-pointer'
                data-image={item}
                onClick={() => handleSelectImg(item)}
              ></div>
              <span data-image={item} onClick={() => handleSelectImg(item)}>
                {item.includes("/img/") && (
                  <Image
                    src={item}
                    alt={item}
                    width={50}
                    height={50}
                    className='max-h-14'
                  />
                )}
                {!item.includes("/img/") && !item.startsWith("#") && (
                  <span className='p-2 bg-[#1B180F] rounded'>{item}</span>
                )}
                {item.startsWith("#") && (
                  <div
                    className='w-10 h-10 rounded'
                    style={{ backgroundColor: item }}
                  ></div>
                )}
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

      <button
        onClick={handleValidate}
        className='p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer'
      >
        Valider
      </button>
      <p className='mt-2'>{message}</p>
    </div>
  );
};

export default MatchingGame;
