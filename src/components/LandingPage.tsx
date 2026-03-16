"use client";

import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { PanoramaSection } from "@/components/PanoramaSection";
import { PlanosSection } from "@/components/PlanosSection";
import { AnaliseSection } from "@/components/AnaliseSection";
import { CalendarioSection } from "@/components/CalendarioSection";
import { FooterSection } from "@/components/FooterSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <PanoramaSection />
      <PlanosSection />
      <AnaliseSection />
      <CalendarioSection />
      <FooterSection />
    </main>
  );
}
