import React from "react";
import { assets } from "../../assets/assets";
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:py-20 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70">
      <h1 className="md:text-[48px] md:leading-[56px] text-[28px] leading-[34px] relative font-bold text-gray-800 max-w-3xl mx-auto">
        Explore your future with the courses designed to{" "}
        <span className="text-blue-600">fit your choice.</span>
        <img
          src={assets.sketch}
          alt="skectch"
          className="md:block hidden absolute -bottom-7 right-0"
        />
      </h1>

      <p className="md:block hidden text-gray-500 max-w-2xl mx-auto">
        We bring together world-class instructors, interactiev content, and a
        suportive community to help you achieve your personal and professonal
        goals.
      </p>
      <p className="md:hidden text-gray-500 max-w-sm mx-auto">
        We bring you world-class instructor to help you achieve your
        professional goals.
      </p>
      <SearchBar />
    </div>
  );
};

export default Hero;
