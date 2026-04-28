import { ReactNode } from "react";

interface RoutePlaceholderProps {
  title: string;
  children?: ReactNode;
}

export default function RoutePlaceholder({ title, children }: RoutePlaceholderProps) {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-16 text-[var(--text-primary)]">
      <div className="mx-auto max-w-5xl space-y-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">Foundation placeholder. UI implementation comes in feature prompts.</p>
        {children}
      </div>
    </main>
  );
}
