import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { HeroSection } from "@/components/HeroSection";
import { HorizonScene } from "@/components/HorizonScene";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SiteNav } from "@/components/SiteNav";
import { SkillsSection } from "@/components/SkillsSection";

export default function Home() {
  return (
    <>
      <HorizonScene />
      <SiteNav />
      <main className="relative z-0">
        <HeroSection />
        <div className="relative bg-gradient-to-b from-transparent via-[#0c0908]/80 to-[#0c0908]">
          <ProjectsSection />
          <ExperienceSection />
          <SkillsSection />
          <AboutSection />
          <ContactSection />
        </div>
      </main>
    </>
  );
}
