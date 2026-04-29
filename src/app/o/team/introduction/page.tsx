import About from "@/components/team/About";
import Hero from "@/components/team/Hero";
import Ready from "@/components/team/Ready";

export default function TeamIntroductionPage() {
  return (
    <main className="bg-[#223066] text-white">
      <Hero />
      <About />
      <Ready />
    </main>
  );
}
