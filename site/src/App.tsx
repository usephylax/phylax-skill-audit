import { LazyMotion, domAnimation } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TrustStrip } from "./components/TrustStrip";
import { Engines } from "./components/Engines";
import { RulesTable } from "./components/RulesTable";
import { VerdictSection } from "./components/VerdictSection";
import { DevelopersSection } from "./components/DevelopersSection";
import { X402Section } from "./components/X402Section";
import { OfficialToken } from "./components/OfficialToken";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative min-h-screen">
        <div className="page-glow" />
        <div className="noise-overlay" />
        <div className="relative z-10">
          <Navbar />
          <main>
            <Hero />
            <TrustStrip />

            <div className="section-band">
              <Engines />
              <RulesTable />
            </div>

            <VerdictSection />

            <div className="section-band">
              <DevelopersSection />
              <X402Section />
            </div>

            <OfficialToken />
            <FinalCta />
          </main>
          <Footer />
        </div>
      </div>
    </LazyMotion>
  );
}
