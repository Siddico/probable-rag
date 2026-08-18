import logo from "@/assets/logo.png.asset.json";

export function Logo({ size = 40, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-2xl bg-secondary/70 ring-1 ring-border"
      style={{ height: size, width: size }}
    >
      <img
        src={logo.url}
        alt="Probably RAG logo"
        width={size}
        height={size}
        className="h-[76%] w-[76%] object-contain"
      />
      {glow && <span className="absolute inset-0 rounded-2xl animate-glow-ring" />}
    </span>
  );
}
