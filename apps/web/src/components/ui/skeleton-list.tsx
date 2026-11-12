export function SkeletonList() {
  return (
    <output aria-label="Loading" className="flex flex-col gap-2">
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-16 rounded-2xl bg-muted motion-safe:animate-pulse" />
      ))}
    </output>
  );
}
