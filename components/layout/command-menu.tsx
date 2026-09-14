"use client";

import { Command } from "cmdk";
import {
  ArrowDownToLine,
  AtSign,
  BookOpenText,
  Briefcase,
  CornerDownLeft,
  ExternalLink,
  FolderGit2,
  Languages,
  Layers,
  Mail,
  Route,
  UserRound,
  Workflow,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { GithubIcon } from "@/components/ui/brand-icon";
import { site } from "@/lib/site";

export const OPEN_COMMAND_EVENT = "portfolio:open-command";

const SECTIONS = [
  { id: "about", icon: UserRound },
  { id: "process", icon: Workflow },
  { id: "experience", icon: Briefcase },
  { id: "projects", icon: FolderGit2 },
  { id: "stack", icon: Layers },
  { id: "contact", icon: Mail },
] as const;

export async function copyEmail(message: string) {
  try {
    await navigator.clipboard.writeText(site.email);
    toast.success(message, { description: site.email });
  } catch {
    window.location.href = `mailto:${site.email}`;
  }
}

function download(href: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = "";
  link.click();
}

/** ⌘K / Ctrl+K: every destination and action of the site from the keyboard. */
export function CommandMenu() {
  const t = useTranslations("command");
  const nav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, []);

  function run(action: () => void) {
    setOpen(false);
    // Let the dialog close before scrolling or navigating.
    window.setTimeout(action, 60);
  }

  function goTo(id: string) {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  }

  const itemClass =
    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-fg-2 outline-none data-[selected=true]:bg-primary-soft data-[selected=true]:text-primary-strong [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-subtle data-[selected=true]:[&_svg]:text-primary";
  const groupClass =
    "px-2 py-1.5 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-subtle";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={nav("search")}
      overlayClassName="fixed inset-0 z-[80] bg-slate-900/20 backdrop-blur-[3px]"
      contentClassName="fixed left-1/2 top-[14vh] z-[81] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgb(15_23_42/0.08),0_30px_80px_-20px_rgb(15_23_42/0.35)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <AtSign aria-hidden className="size-4 text-subtle" />
        <Command.Input
          placeholder={t("placeholder")}
          className="h-14 w-full bg-transparent text-[0.9375rem] text-fg outline-none placeholder:text-subtle"
        />
        <kbd className="rounded-md border border-line bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.625rem] text-muted">ESC</kbd>
      </div>

      <Command.List data-lenis-prevent className="max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain py-2">
        <Command.Empty className="px-4 py-10 text-center text-sm text-muted">{t("empty")}</Command.Empty>

        <Command.Group heading={t("navigate")} className={groupClass}>
          {SECTIONS.map(({ id, icon: Icon }) => (
            <Command.Item key={id} value={`section ${nav(id)}`} onSelect={() => run(() => goTo(id))} className={itemClass}>
              <Icon aria-hidden />
              {nav(id)}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading={t("actions")} className={groupClass}>
          <Command.Item value={t("copyEmail")} onSelect={() => run(() => copyEmail(t("copied")))} className={itemClass}>
            <Mail aria-hidden />
            {t("copyEmail")}
            <span className="ml-auto font-mono text-xs text-subtle">{site.email}</span>
          </Command.Item>
          <Command.Item value={t("cvFr")} onSelect={() => run(() => download(site.cv.fr))} className={itemClass}>
            <ArrowDownToLine aria-hidden />
            {t("cvFr")}
          </Command.Item>
          <Command.Item value={t("cvEn")} onSelect={() => run(() => download(site.cv.en))} className={itemClass}>
            <ArrowDownToLine aria-hidden />
            {t("cvEn")}
          </Command.Item>
          <Command.Item
            value={t("switchLocale")}
            onSelect={() => run(() => router.replace(pathname, { locale: locale === "fr" ? "en" : "fr", scroll: false }))}
            className={itemClass}
          >
            <Languages aria-hidden />
            {t("switchLocale")}
          </Command.Item>
        </Command.Group>

        <Command.Group heading={t("links")} className={groupClass}>
          <Command.Item value={t("caseStudy")} onSelect={() => run(() => router.push("/projects/meta-ads-report-studio"))} className={itemClass}>
            <BookOpenText aria-hidden />
            {t("caseStudy")}
          </Command.Item>
          <Command.Item value={t("demo")} onSelect={() => run(() => window.open(site.metaAds.demo, "_blank", "noopener"))} className={itemClass}>
            <Route aria-hidden />
            {t("demo")}
            <ExternalLink aria-hidden className="ml-auto" />
          </Command.Item>
          <Command.Item value={t("github")} onSelect={() => run(() => window.open(site.github, "_blank", "noopener"))} className={itemClass}>
            <GithubIcon />
            {t("github")}
            <ExternalLink aria-hidden className="ml-auto" />
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className="flex items-center gap-4 border-t border-line bg-bg-subtle px-4 py-2.5 font-mono text-[0.6875rem] text-muted">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-line bg-white px-1">↑</kbd>
          <kbd className="rounded border border-line bg-white px-1">↓</kbd>
          {t("hint")}
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="grid place-items-center rounded border border-line bg-white px-1 py-0.5">
            <CornerDownLeft className="size-2.5" />
          </kbd>
          {t("open")}
        </span>
        <span className="ml-auto">Nossair Sedki</span>
      </div>
    </Command.Dialog>
  );
}
