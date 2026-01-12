import React from 'react';
import Hero from '../components/landing/Hero';
import AboutCarousel from '../components/landing/AboutCarousel';
import Achievements from '../components/landing/Achievements';
import Schedule from '../components/landing/Schedule';
import News from '../components/landing/News';
import RegistrationSection from '../components/landing/RegistrationSection';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';

export default function LandingScreen({
  setView,
  isDarkMode,
  setIsDarkMode,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  achievements,
  schedules,
  news,
  user,
  showNotification
}) {
  return (
    <div className="bg-zinc-50 dark:bg-black transition-colors duration-300 min-h-screen">
      <Navbar 
        setView={setView}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <Hero />
      <AboutCarousel />
      <Achievements achievements={achievements} />
      <Schedule schedules={schedules} />
      <News news={news} />
      <RegistrationSection user={user} showNotification={showNotification} />
      <Footer />
    </div>
  );
}
