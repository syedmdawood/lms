import React from "react";
import Hero from "../../Components/Student/Hero";
import Compaies from "../../Components/Student/Compaies";
import CoursesSection from "../../Components/Student/CoursesSection";
import TestimonialSection from "../../Components/Student/TestimonialSection";
import CallToAction from "../../Components/Student/CallToAction";
import Footer from "../../Components/Student/Footer";

const Home = () => {
  return (
    <div className="flex flex-col items-center space-y-7 text-center">
      <Hero />
      <Compaies />
      <CoursesSection />
      <TestimonialSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
