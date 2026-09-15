import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { CommandMenu } from "@/components/layout/command-menu";
import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Preloader } from "@/components/intro/preloader";
import { SceneCanvas } from "@/components/three/lazy";
import "../globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: "%s · Nossair Sedki" },
    description: t("description"),
    authors: [{ name: site.name }],
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en", "x-default": "/fr" },
    },
    openGraph: {
      type: "profile",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      siteName: site.name,
      title: t("title"),
      description: t("description"),
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "meta" });
  const loader = await getTranslations({ locale, namespace: "hero.preloader" });
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "Software Engineer Full-Stack",
    description: t("description"),
    email: `mailto:${site.email}`,
    url: site.url,
    image: `${site.url}/images/nossair-sedki.png`,
    sameAs: [site.github],
    worksFor: { "@type": "Organization", name: "Groupe Kohler" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "École Nationale des Sciences Appliquées de Tétouan" },
    address: { "@type": "PostalAddress", addressLocality: "Tanger", addressCountry: "MA" },
  };

  return (
    <html lang={locale} id="top" className={`${dmSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Lets CSS hide text that is about to be animated, only when scripts run. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');try{if(sessionStorage.getItem('ns-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro-skip')}catch(e){}",
          }}
        />
      </head>
      {/* overflow-x is clipped on <body> with `clip`, which, unlike `hidden`,
          does not create a scroll container and keeps position: sticky working. */}
      <body className="min-h-svh overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        <Preloader title={loader("title")} status={loader("status")} lines={loader.raw("lines") as string[]} />
        <NextIntlClientProvider>
          <SmoothScroll>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
            <CommandMenu />
            <SceneCanvas />
            <Toaster position="bottom-center" toastOptions={{ className: "font-sans" }} />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
