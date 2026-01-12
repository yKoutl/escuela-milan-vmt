import React from 'react';
import Hero from '../components/landing/Hero';
import AboutCarousel from '../components/landing/AboutCarousel';
import Achievements from '../components/landing/Achievements';
import Schedule from '../components/landing/Schedule';
import PricingSection from '../components/landing/PricingSection';
import MembershipSection from '../components/landing/MembershipSection';
import News from '../components/landing/News';
import Sponsors from '../components/landing/Sponsors';
import DonationSection from '../components/landing/DonationSection';
import RegistrationSection from '../components/landing/RegistrationSection';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import FloatingWhatsApp from '../shared/FloatingWhatsApp';

export default function LandingScreen({
  setView,
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
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <Hero />
      <AboutCarousel />
      <Achievements achievements={achievements} />
      <Schedule schedules={schedules} />
      <PricingSection />
      <MembershipSection />
      <DonationSection />
      <Sponsors sponsors={[]} />
      <News news={news} />
      <RegistrationSection user={user} showNotification={showNotification} />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
