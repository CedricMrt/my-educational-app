"use client";
import { saveResponse } from "@/app/lib/firebaseConfig";
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

const ComparisonGame = ({
  school,
  period,
  studentId,
  subject,
  onCorrectAnswer,
}: GameProps) => {
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [message, setMessage] = useState("");
  const [signs] = useState(["<", ">", "="]);
  const [droppedSign, setDroppedSign] = useState<string | null>(null);

  useEffect(() => {
    generateGame(period);
  }, [period]);

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

    setNumber1(num1);
    setNumber2(num2);
    setMessage("");
    setDroppedSign(null);
  };

  const handleDragEnd = (result: DropResult) => {
    console.log("Drag result:", result); // Debug

    if (!result.destination) return;

    const draggedSign = signs[result.source.index];
    console.log("Dragged sign:", draggedSign); // Debug
    setDroppedSign(draggedSign);
  };

  const handleValidate = async () => {
    if (!droppedSign) {
      setMessage("Veuillez sélectionner un signe pour valider.");
      return;
    }
    try {
      const isAnswerCorrect =
        (droppedSign === "<" && number1 < number2) ||
        (droppedSign === ">" && number1 > number2) ||
        (droppedSign === "=" && number1 === number2);

      await saveResponse(
        school,
        studentId,
        subject,
        period,
        "comparaison",
        isAnswerCorrect
      );
      if (isAnswerCorrect) {
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
      <p className='text-black'>Glisse le signe correct entre les nombres !</p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className='flex items-center gap-5 p-2'>
          <span className='text-5xl max-sm:text-3xl text-center min-w-14'>
            {number1}
          </span>
          <Droppable
            droppableId='comparison-sign-target'
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
            {(provided) => (
              <div
                className={`flex items-center justify-center w-14 h-14 max-sm:w-12 max-sm:h-12 text-3xl rounded-lg ${
                  droppedSign !== null
                    ? "bg-gradient-to-r from-[#9d523c] to-[#f2a65a]"
                    : "bg-[#8f1818]"
                }`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {droppedSign || "?"}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <span className='text-5xl max-sm:text-3xl text-center min-w-14'>
            {number2}
          </span>
        </div>
        <Droppable
          droppableId='signs-droppable'
          direction='horizontal'
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided) => (
            <div
              className='flex justify-center gap-6'
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {signs.map((sign, index) => (
                <Draggable
                  key={`sign-${sign}`}
                  draggableId={`sign-${sign}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className='flex items-center justify-center w-14 h-14 max-sm:w-12 max-sm:h-12  text-3xl rounded-lg cursor-grab bg-gradient-to-r from-[#9d523c] to-[#f2a65a]'
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: "none",
                        ...provided.draggableProps.style,
                      }}
                    >
                      {sign}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
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

export default ComparisonGame;
