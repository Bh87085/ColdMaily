"use client";
import FadeInSection from "../animations/FadeInSection";
import AnimatedSubtext from "../animations/AnimatedSubtext"; // Import the new component
import { FaBullseye, FaCalendarAlt, FaPenFancy, FaSyncAlt, FaHandshake, FaBriefcase, FaBullhorn, FaRocket } from "react-icons/fa";
import WhyUseUs from "./whyuseus";
import ModernSaaSHomepage from "./homesection";
import ScrollUseCases from "./UseCaseCarousel";
import HowItWorks from "./howitworks";
import KeyFeatures from "./features";
import FAQ from "./faq";
import FinalCTA
 from "./finalcta";
const Hero = () => {
  return (
    <>
    <ModernSaaSHomepage/>
    <WhyUseUs/>
    {/* <StatsSection/> */}
    <ScrollUseCases/>
    {/* how it works */}
    <HowItWorks/>
    {/* Key Features & Benefits */}
    <KeyFeatures/>
    {/* FAQ */}
    <FAQ/>
    {/* Final CTA Banner */}
    {/* <FinalCTA/> */}
    {/* Contact us */}

    {/* Footer */}

    </>
  );
};

export default Hero;
