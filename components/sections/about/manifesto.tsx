"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

type Token = { text: string; note: number | null; tail?: string };
export type ManifestoNote = { title: string; text: string };

const NBSP = String.fromCharCode(160);

/** "plain [marked] plain" → words, where a bracketed phrase stays one token. */
function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let note = 0;
  for (const part of source.split(/(\[[^\]]+\])/)) {
    if (!part) continue;
    if (part.startsWith("[")) {
      tokens.push({ text: part.slice(1, -1), note: note++ });
      continue;
    }
    const words = part.split(/\s+/);
    const previous = tokens.at(-1);
    if (previous?.note != null) {
      // Punctuation right after a marked phrase stays glued to it: "business:"
      // directly, and French " :" with a non-breaking space so it never wraps.
      if (words[0]) previous.tail = words.shift();
      else if (/^[:;!?»]$/.test(words[1] ?? "")) previous.tail = NBSP + words.splice(0, 2)[1];
    }
    for (const word of words) if (word) tokens.push({ text: word, note: null });
  }
  return tokens;
}

const index = (n: number) => String(n + 1).padStart(2, "0");

/** Portion of the scroll the statement itself takes; the notes follow it. */
const TEXT_SHARE = 0.78;

function Word({ token, progress, range }: { token: Token; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const drawn = useTransform(progress, [range[0], range[1] + 0.04], [0, 1]);

  if (token.note === null) {
    return <motion.span style={{ opacity }}>{token.text}</motion.span>;
  }

  return (
    <span className="inline-block whitespace-nowrap">
      <span className="relative">
        <motion.span style={{ opacity }}>{token.text}</motion.span>
        {/* The underline is drawn as the reader reaches the idea. */}
        <motion.span
          aria-hidden
          style={{ scaleX: drawn }}
          className="absolute inset-x-0 -bottom-[0.04em] h-[0.075em] origin-left rounded-full bg-primary"
        />
      </span>
      <motion.sup
        style={{ opacity: drawn }}
        className="ml-[0.12em] align-super font-mono text-[0.3em] font-medium tracking-normal text-primary"
      >
        {index(token.note)}
      </motion.sup>
      {token.tail ? <motion.span style={{ opacity }}>{token.tail}</motion.span> : null}
    </span>
  );
}

function Note({ note, i, progress, range }: { note: ManifestoNote; i: number; progress: MotionValue<number>; range: [number, number] }) {
  const lit = useTransform(progress, range, [0, 1]);
  const opacity = useTransform(lit, [0, 1], [0.35, 1]);
  const y = useTransform(lit, [0, 1], [10, 0]);

  return (
    <motion.li style={{ opacity, y }} className="relative pt-5">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-line-strong" />
      <motion.span aria-hidden style={{ scaleX: lit }} className="absolute inset-x-0 top-0 h-px origin-left bg-primary" />
      <p className="flex items-baseline gap-2.5">
        <span className="font-mono text-[0.6875rem] text-primary">{index(i)}</span>
        <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-fg">{note.title}</span>
      </p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{note.text}</p>
    </motion.li>
  );
}

/**
 * The profile statement, set like an editorial pull quote with a byline. It is
 * read at the pace of the scroll: words settle into ink, the key ideas are
 * underlined and numbered, and each number resolves into a note that says
 * where that idea shows in the work.
 */
export function Manifesto({
  text,
  notes,
  eyebrow,
  byline,
}: {
  text: string;
  notes: ManifestoNote[];
  eyebrow: string;
  byline: { name: string; role: string; alt: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Fully inked before the block reaches the middle of the screen: the text is
  // never left greyed out while someone is reading it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 82%", "end 62%"] });
  const tokens = tokenize(text);
  const plain = text.replace(/[[\]]/g, "");
  const noteIndex = tokens.flatMap((t, i) => (t.note === null ? [] : [i]));

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <aside className="flex items-start justify-between gap-6 lg:col-span-3 lg:flex-col lg:justify-start">
        <p className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
          <span className="h-px w-6 bg-primary" />
          {eyebrow}
        </p>
        <div className="flex items-center gap-3 lg:mt-8">
          <span className="relative size-11 overflow-hidden rounded-full bg-[#e8f0fe] ring-1 ring-fg/[0.06]">
            <Image src="/images/nossair-sedki.png" alt={byline.alt} fill sizes="44px" className="object-cover object-[50%_12%] [transform:scale(1.9)] [transform-origin:50%_8%]" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-fg">{byline.name}</span>
            <span className="block text-[0.8125rem] text-muted">{byline.role}</span>
          </span>
        </div>
      </aside>

      <div className="lg:col-span-9">
        <p
          aria-label={plain}
          className="text-[clamp(1.875rem,4vw,3.5rem)] font-medium leading-[1.12] tracking-[-0.035em] text-fg text-pretty"
        >
          {tokens.map((token, i) =>
            reduce ? (
              <span key={i} aria-hidden className={cn(token.note !== null && "underline decoration-primary decoration-[0.07em] underline-offset-[0.14em]")}>
                {token.text}
                {token.tail}{" "}
              </span>
            ) : (
              <span key={i} aria-hidden>
                <Word
                  token={token}
                  progress={scrollYProgress}
                  range={[(i / tokens.length) * TEXT_SHARE, ((i + 1) / tokens.length) * TEXT_SHARE]}
                />{" "}
              </span>
            ),
          )}
        </p>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-8 md:mt-14">
          {notes.map((note, i) => {
            const at = ((noteIndex[i] ?? 0) + 1) / tokens.length;
            const start = at * TEXT_SHARE;
            return (
              <Note
                key={note.title}
                note={note}
                i={i}
                progress={scrollYProgress}
                // With reduced motion every note is simply shown.
                range={reduce ? [-1, 0] : [start, Math.min(1, start + 0.2)]}
              />
            );
          })}
        </ol>
      </div>
    </div>
  );
}
