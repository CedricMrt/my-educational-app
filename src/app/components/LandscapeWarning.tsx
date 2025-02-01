import { IoIosTabletPortrait } from "react-icons/io";

const LandscapeWarning = () => {
  return (
    <>
      <div id='landscape-warning'>
        <div className='icon'>
          <IoIosTabletPortrait />
        </div>
      </div>
      <h1 className='text-center [text-shadow:_0_0px_4px_rgb(0_0_0_/_0.8)]'>
        Svp veuillez passer en mode paysage pour une meilleure experience
        utilisateur
      </h1>
    </>
  );
};

export default LandscapeWarning;
