import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CredibilityStrip } from './components/CredibilityStrip';
import { ProblemSolution } from './components/ProblemSolution';
import { ProductShowcase } from './components/ProductShowcase';
import { BrandedPortal } from './components/BrandedPortal';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

const App: React.FC = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <CredibilityStrip />
      <ProblemSolution />
      <ProductShowcase />
      <BrandedPortal />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

export default App;
