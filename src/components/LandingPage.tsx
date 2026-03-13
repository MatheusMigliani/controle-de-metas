"use client";

import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PanoramaSection } from "@/components/PanoramaSection";
import { PlanosSection } from "@/components/PlanosSection";
import { AnaliseSection } from "@/components/AnaliseSection";
import { CalendarioSection } from "@/components/CalendarioSection";
import { FooterSection } from "@/components/FooterSection";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PanoramaSection />
      <PlanosSection />
      <AnaliseSection />
      <CalendarioSection />
      <FooterSection />
    </div>
  );
};

export default Landing;
