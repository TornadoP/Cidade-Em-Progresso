type SeloOrigemObraProps = {
  origem?: string | null;
  className?: string;
};

export default function SeloOrigemObra({
  origem,
  className = "",
}: SeloOrigemObraProps) {
  const ehSugestao = origem === "Sugestão popular";

  return (
    <span
      className={[
        "inline-flex h-9 items-center rounded-full px-4 text-xs font-black shadow-sm ring-1",
        ehSugestao
          ? "bg-yellow-400 text-black ring-yellow-500/20"
          : "bg-blue-600 text-white ring-blue-400/30",
        className,
      ].join(" ")}
    >
      {ehSugestao ? "Sugestão popular" : "Obra oficial"}
    </span>
  );
}
