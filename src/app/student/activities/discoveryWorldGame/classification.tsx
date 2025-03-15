import { saveResponse } from "@/app/lib/firebaseConfig";
import React, { useReducer, useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface Proposition {
  word: string;
  category: string;
}

interface GameProps {
  school: { id: string; name: string; level: string };
  period: number;
  studentId: string;
  subject: string;
  onCorrectAnswer: () => void;
}

interface Theme {
  categories: { name: string; definition: string }[];
  propositions: Proposition[];
}

const themes: Record<string, Theme> = {
  "marin-terrestre-aerien": {
    categories: [
      { name: "Marin", definition: "Les créatures marines vivent dans l'eau." },
      {
        name: "Terrestre",
        definition: "Les animaux terrestres vivent sur terre.",
      },
      {
        name: "Aérien",
        definition: "Les animaux aériens vivent dans les airs.",
      },
    ],
    propositions: [
      { word: "requin", category: "Marin" },
      { word: "Lion", category: "Terrestre" },
      { word: "aigle", category: "Aérien" },
      { word: "Serpent", category: "Terrestre" },
      { word: "chat", category: "Terrestre" },
      { word: "saumon", category: "Marin" },
      { word: "baleine", category: "Marin" },
      { word: "poule", category: "Terrestre" },
      { word: "vache", category: "Terrestre" },
      { word: "mouette", category: "Aérien" },
      { word: "corbeau", category: "Aérien" },
      { word: "cygne", category: "Aérien" },
      { word: "hibou", category: "Aérien" },
      { word: "orc", category: "Marin" },
      { word: "phoque", category: "Marin" },
    ],
  },

  "carnivore-herbivore-omnivore": {
    categories: [
      {
        name: "Carnivore",
        definition: "Les carnivores se nourrissent principalement de viande.",
      },
      {
        name: "Herbivore",
        definition: "Les herbivores se nourrissent principalement de plantes.",
      },
      {
        name: "Omnivore",
        definition:
          "Les omnivores mangent à la fois des plantes et des animaux.",
      },
    ],
    propositions: [
      { word: "lion", category: "Carnivore" },
      { word: "tigre", category: "Carnivore" },
      { word: "aigle", category: "Carnivore" },
      { word: "loup", category: "Carnivore" },
      { word: "requin", category: "Carnivore" },
      { word: "éléphant", category: "Herbivore" },
      { word: "girafe", category: "Herbivore" },
      { word: "vache", category: "Herbivore" },
      { word: "cheval", category: "Herbivore" },
      { word: "baleine", category: "Herbivore" },
      { word: "ours", category: "Omnivore" },
      { word: "cochon", category: "Omnivore" },
      { word: "panda", category: "Omnivore" },
      { word: "poulet", category: "Omnivore" },
      { word: "serpent", category: "Omnivore" },
    ],
  },

  "ovipare-vivipare": {
    categories: [
      {
        name: "Ovipare",
        definition:
          "Les animaux ovipares pondent des œufs qui se développent à l'extérieur du corps.",
      },
      {
        name: "Vivipare",
        definition:
          "Les animaux vivipares donnent naissance à des petits déjà formés, développés à l'intérieur du corps.",
      },
    ],
    propositions: [
      { word: "tortue", category: "Ovipare" },
      { word: "serpent", category: "Ovipare" },
      { word: "poisson", category: "Ovipare" },
      { word: "lézard", category: "Ovipare" },
      { word: "oiseau", category: "Ovipare" },
      { word: "chat", category: "Vivipare" },
      { word: "chien", category: "Vivipare" },
      { word: "humain", category: "Vivipare" },
      { word: "kangourou", category: "Vivipare" },
      { word: "cheval", category: "Vivipare" },
    ],
  },

  "vivant-non-vivant": {
    categories: [
      {
        name: "Vivant",
        definition:
          "Les éléments vivants sont ceux qui ont la capacité de croître, de se reproduire et d'effectuer des processus biologiques.",
      },
      {
        name: "Non-Vivant",
        definition:
          "Les éléments non vivants ne possèdent pas de telles capacités.",
      },
    ],
    propositions: [
      { word: "chat", category: "Vivant" },
      { word: "chien", category: "Vivant" },
      { word: "arbre", category: "Vivant" },
      { word: "oiseau", category: "Vivant" },
      { word: "poisson", category: "Vivant" },
      { word: "rocher", category: "Non-Vivant" },
      { word: "montagne", category: "Non-Vivant" },
      { word: "rue", category: "Non-Vivant" },
      { word: "voiture", category: "Non-Vivant" },
      { word: "bâtiment", category: "Non-Vivant" },
    ],
  },
};

const getRandomTheme = (previousTheme?: string) => {
  const themeNames = Object.keys(themes);
  let randomTheme;
  do {
    randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
  } while (randomTheme === previousTheme);
  return randomTheme;
};

const getRandomPropositions = (theme: string, count: number): Proposition[] => {
  return [...themes[theme].propositions]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};

const initialState: Record<string, string[]> = {
  Marin: [],
  Terrestre: [],
  Aérien: [],
  Carnivore: [],
  Herbivore: [],
  Omnivore: [],
  propositions: [],
};

type StateType = typeof initialState;

type ActionType =
  | {
      type: "MOVE_WORD";
      payload: {
        source: DropResult["source"];
        destination: DropResult["destination"];
      };
    }
  | { type: "RESET" }
  | { type: "SET_PROPOSITIONS"; payload: Proposition[] };

const dragReducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "MOVE_WORD":
      const { source, destination } = action.payload;
      if (!destination) return state;

      const sourceList = [...state[source.droppableId as keyof StateType]];
      const destList = [...state[destination.droppableId as keyof StateType]];
      const [movedItem] = sourceList.splice(source.index, 1);

      destList.splice(destination.index, 0, movedItem);

      return {
        ...state,
        [source.droppableId]: sourceList,
        [destination.droppableId]: destList,
      };

    case "RESET":
      return initialState;

    case "SET_PROPOSITIONS":
      const initialCategories = themes[
        action.payload[0].category
      ]?.categories.reduce((acc: Record<string, string[]>, category) => {
        acc[category.name] = [];
        return acc;
      }, {});
      return {
        ...state,
        ...initialCategories,
        propositions: action.payload.map((p) => p.word),
      };

    default:
      return state;
  }
};

const ClassificationGame: React.FC<GameProps> = ({
  school,
  studentId,
  subject,
  period,
  onCorrectAnswer,
}) => {
  const [categoriesData, dispatch] = useReducer(dragReducer, initialState);
  const [theme, setTheme] = useState<string>(getRandomTheme());
  const [, setPropositions] = useState<Proposition[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNewPropositions(theme);
  }, [theme]);

  const loadNewPropositions = (theme: string) => {
    const newPropositions = getRandomPropositions(theme, 5);
    setPropositions(newPropositions);
    dispatch({
      type: "SET_PROPOSITIONS",
      payload: newPropositions,
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    dispatch({
      type: "MOVE_WORD",
      payload: { source: result.source, destination: result.destination },
    });
  };

  const handleValidate = async () => {
    try {
      const isCorrect = Object.entries(categoriesData).every(
        ([category, words]) =>
          words.every((word) =>
            themes[theme].propositions.some(
              (p) => p.word === word && p.category === category
            )
          )
      );

      await saveResponse(
        school,
        studentId,
        subject,
        period,
        "classification",
        isCorrect
      );

      if (isCorrect) {
        onCorrectAnswer();
        setMessage("Bravo ! Toutes les réponses sont correctes 🎉");
        setTimeout(() => {
          dispatch({ type: "RESET" });
          setTheme(getRandomTheme(theme));
          loadNewPropositions(theme);
          setMessage("");
        }, 2000);
      } else {
        setMessage("Incorrect, essaie encore !");
      }
    } catch (error) {
      setMessage("Une erreur s'est produite. Réessaie plus tard.");
      console.error("Erreur lors de la validation :", error);
    }
  };

  return (
    <div className='flex flex-col justify-around items-center w-full h-full'>
      <h2 className='text-black text-2xl font-bold'>
        Classe les mots dans les bonnes catégories
      </h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className='w-3/4 flex justify-center bg-[#14120B]'>
          {theme &&
            themes[theme]?.categories?.map((category) => (
              <Droppable
                key={category.name}
                droppableId={category.name}
                isDropDisabled={false}
                isCombineEnabled={false}
                ignoreContainerClipping={false}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className='p-2 w-full border-r-2 border-l-2 min-h-[100px] flex flex-col items-center'
                  >
                    <h3 className='text-lg font-semibold'>{category.name}</h3>
                    <p className='text-sm text-gray-600'>
                      {category.definition}
                    </p>{" "}
                    {categoriesData &&
                      categoriesData[category.name]?.map(
                        (word: string, index: number) => (
                          <Draggable
                            key={word}
                            draggableId={word}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='mb-2 p-2 text-2xl rounded-lg cursor-grab bg-[#433500] drop-shadow-lg'
                              >
                                {word}
                              </div>
                            )}
                          </Draggable>
                        )
                      )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
        </div>

        <Droppable
          droppableId='propositions'
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='p-2 w-3/4 flex justify-center'
            >
              {categoriesData.propositions.map(
                (word: string, index: number) => (
                  <Draggable key={word} draggableId={word} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className='mr-2 p-2 text-2xl rounded-lg cursor-pointer bg-[#433500] drop-shadow-lg'
                      >
                        {word}
                      </div>
                    )}
                  </Draggable>
                )
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <p
        className={`text-[#291b17] transition-opacity duration-500 ${
          message ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </p>
      <button
        className='p-2 bg-[#FFE770] text-[#5C7C2F] text-2xl py-1 rounded-lg hover:bg-[#F3D768] focus:outline-none focus:ring-2 focus:ring-[#FFE770] transition-transform duration-200 active:scale-95 cursor-pointer'
        onClick={handleValidate}
      >
        Valider
      </button>
    </div>
  );
};

export default ClassificationGame;
