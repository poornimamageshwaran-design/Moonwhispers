import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-accent/80 to-transparent" />
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent/80 font-sans">
            {eyebrow}
          </p>
        </div>
      ) : null}
      <h2 className="mt-3 text-3xl sm:text-4xl font-light tracking-tight font-serif text-moon/90 italic">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[#b8a898] leading-relaxed font-sans font-light">{description}</p>
      ) : null}
    </div>
  );
}