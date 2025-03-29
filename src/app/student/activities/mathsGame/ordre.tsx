"use client";
import { saveResponse } from "@/app/lib/firebaseConfig";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}

const SortingGame = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [orderType, setOrderType] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    generateNumbers(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  interface Range {
    min: number;
    max: number;
  }

  const generateNumbers = (period: number) => {
    const ranges: Range[] = [
      { min: 0, max: 20 }, // Range for period 1
      { min: 0, max: 60 }, // Range for period 2
      { min: 0, max: 69 }, // Range for period 3
    ];

    if (period < 1 || period > ranges.length) {
      console.error("Invalid period value");
      return;
    }

    const { min, max } = ranges[period - 1];
    const rangeArray = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    const shuffledArray = rangeArray.sort(() => Math.random() - 0.5);
    const uniqueNumbers = shuffledArray.slice(0, 6);

    const randomOrder: "asc" | "desc" = Math.random() < 0.5 ? "asc" : "desc";

    setOrderType(randomOrder);
    setNumbers(uniqueNumbers);
    setMessage("");
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedNumbers = Array.from(numbers);
    const [removed] = reorderedNumbers.splice(result.source.index, 1);
    reorderedNumbers.splice(result.destination.index, 0, removed);

    setNumbers(reorderedNumbers);
  };

  const handleValidate = async () => {
    const sortedNumbers = [...numbers].sort((a, b) =>
      orderType === "asc" ? a - b : b - a
    );

    const isCorrect = JSON.stringify(numbers) === JSON.stringify(sortedNumbers);

    try {
      await saveResponse(
        school,
        studentId,
        subject,
        period,
        "ordre",
        isCorrect
      );
      if (isCorrect) {
        onCorrectAnswer();
        setMessage("Bravo ! tu as bien classé tous les nombres 🎉");
        setTimeout(() => generateNumbers(period), 2000);
      } else {
        setMessage("Ce n'est pas correct. Essayez encore !");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  return (
    <div className='flex flex-col justify-around items-center w-full h-full'>
      <div className='text-black text-2xl font-bold flex items-center justify-center'>
        <span>
          Trier en ordre : {orderType === "asc" ? "Croissant" : "Décroissant"}
        </span>
        {orderType === "asc" ? (
          <Image
            src='/img/signalUp.png'
            alt='Signal montant'
            width={50}
            height={50}
            className='ml-2'
            style={{ width: "auto", height: "auto" }}
          />
        ) : (
          <Image
            src='/img/signalDown.png'
            alt='Signal descendant'
            width={50}
            height={50}
            className='ml-2'
            style={{ width: "auto", height: "auto" }}
          />
        )}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId='droppable-here'
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className='flex space-x-6'
            >
              {numbers.map((num, index) => (
                <Draggable
                  key={`${index + 1}`}
                  draggableId={`${index + 1}`}
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className='py-3 px-5 bg-gradient-to-r from-[#2D2305] to-[#433500] text-4xl max-lg:text-3xl max-md:text-xl max-sm:text-lg text-center rounded-xl'
                    >
                      {num}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
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

export default SortingGame;
