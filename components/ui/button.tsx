"use client";

import { useRef } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-classes";

/** A soft highlight that follows the pointer across the button's surface. */
function useShine<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const onPointerMove = (event: React.PointerEvent) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--shine-x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--shine-y", `${event.clientY - rect.top}px`);
  };
  return { ref, onPointerMove };
}

function Shine({ variant }: { variant: ButtonVariant }) {
  if (variant === "ghost") return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100"
      style={{
        background: `radial-gradient(90px circle at var(--shine-x, 50%) var(--shine-y, 50%), ${
          variant === "primary" ? "rgb(255 255 255 / 0.28)" : "rgb(37 99 235 / 0.08)"
        }, transparent 70%)`,
      }}
    />
  );
}

type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant = "primary", size = "md", className, children, ...rest }: ButtonLinkProps) {
  const { ref, onPointerMove } = useShine<HTMLAnchorElement>();
  return (
    <a ref={ref} onPointerMove={onPointerMove} className={buttonClasses(variant, size, className)} {...rest}>
      <Shine variant={variant} />
      {children}
    </a>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant = "primary", size = "md", className, children, type = "button", ...rest }: ButtonProps) {
  const { ref, onPointerMove } = useShine<HTMLButtonElement>();
  return (
    <button ref={ref} type={type} onPointerMove={onPointerMove} className={buttonClasses(variant, size, className)} {...rest}>
      <Shine variant={variant} />
      {children}
    </button>
  );
}
