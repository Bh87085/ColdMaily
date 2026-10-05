"use client";
import Header from "@/components/LandingPage/Header";
import Hero from "@/components/LandingPage/Hero";
import Footer from "@/components/LandingPage/Footer";

export default function Home() {
  return (
    <>
      <Header />  {/* 👈 header outside scrollable content */}
      <main className="flex flex-col min-h-screen">
        <Hero />
        <Footer />
      </main>
    </>
  );
}
