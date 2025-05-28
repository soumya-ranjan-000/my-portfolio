import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import AwardSection from '../components/AwardSection';
import HeroSection from '../components/HeroSection';
import AwardBadges from '../components/AwardBadges';

function Home() {

  return (
    <>
      <div className="min-h-screen flex flex-col items-center text-center justify-center bg-blue-50 px-4 transition-colors duration-300">
        <HeroSection />
        {/* Add spacing between HeroSection and AwardBadges */}
        <div className="my-8" />
        <AwardBadges />
      </div>
    </>
  );
}

export default Home;
