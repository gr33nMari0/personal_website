import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HexBackground from "@/components/HexBackground";
import { About, Skills, Experience, Community, Upskilling } from "@/components/Sections";
import { Contact, Footer } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <HexBackground />
      <div className="relative z-10">
        <header>
          <Navbar />
        </header>
        <main id="main">
          <Hero />
          <About />
          <Community />
          <Upskilling />
          <Skills />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
