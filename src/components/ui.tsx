import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-rotary-gray-mid p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Barra({
  porcentaje,
  color = "bg-rotary-blue",
  className = "",
}: {
  porcentaje: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`h-3 w-full rounded-full bg-rotary-gray-mid overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }}
      />
    </div>
  );
}

/** Semáforo por sección según el promedio (0–15). */
export function nivelSeccion(promedio: number, requiereAtencion: boolean) {
  if (requiereAtencion) return { etiqueta: "Atender", color: "bg-rotary-cranberry", texto: "text-rotary-cranberry" };
  if (promedio < 12) return { etiqueta: "Mejorable", color: "bg-rotary-gold", texto: "text-rotary-gold-dark" };
  return { etiqueta: "Saludable", color: "bg-rotary-grass", texto: "text-rotary-grass" };
}

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${className}`}>
      {children}
    </span>
  );
}

const btnBase =
  "inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-rotary-blue text-white hover:bg-rotary-blue-dark",
  gold: "bg-rotary-gold text-rotary-blue-dark hover:bg-rotary-gold-dark",
  outline: "border border-rotary-blue text-rotary-blue hover:bg-blue-50",
  danger: "border border-rotary-cranberry text-rotary-cranberry hover:bg-pink-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return <button className={`${btnBase} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return <Link className={`${btnBase} ${variants[variant]} ${className}`} {...props} />;
}

export function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-rotary-gray-mid px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rotary-azure ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-rotary-gray-mid px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rotary-azure ${props.className ?? ""}`}
    />
  );
}
