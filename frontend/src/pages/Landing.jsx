import Navbar from "../components/common/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import WhyCareerForge from "../components/landing/WhyCareerForge";
import CareerJourney from "../components/landing/CareerJourney";
import FAQ from "../components/landing/FAQ";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <WhyCareerForge />
      <CareerJourney />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}

export default Landing;