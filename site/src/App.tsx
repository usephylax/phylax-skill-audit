import { LazyMotion, domAnimation } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TrustStrip } from "./components/TrustStrip";
import { Engines } from "./components/Engines";
import { RulesTable } from "./components/RulesTable";
import { ScoringVerdict } from "./components/ScoringVerdict";
import { ExampleOutput } from "./components/ExampleOutput";
import { Integration } from "./components/Integration";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative min-h-screen">
        <div className="noise-overlay" />
        <div className="relative z-10">
          <Navbar />
          <Hero />
          <TrustStrip />
          <div className="section-divider" />
          <Engines />
          <div className="section-divider" />
          <RulesTable />
          <div className="section-divider" />
          <ScoringVerdict />
          <div className="section-divider" />
          <ExampleOutput />
          <div className="section-divider" />
          <Integration />
          <div className="section-divider" />
          <FinalCta />
          <Footer />
        </div>
      </div>
    </LazyMotion>
  );
}
