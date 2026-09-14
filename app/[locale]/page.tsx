import { setRequestLocale } from "next-intl/server";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Education } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Projects } from "@/components/sections/projects";
import { Proof } from "@/components/sections/proof";
import { Stack } from "@/components/sections/stack";

// Months at Groupe Kohler are counted from the current date: rebuild daily.
export const revalidate = 86400;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Proof />
      <About />
      <Process />
      <Experience />
      <Projects />
      <Stack />
      <Education />
      <Contact />
    </>
  );
}
