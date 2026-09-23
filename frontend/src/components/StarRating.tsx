interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}

const STAR_PATH =
  "M10 1.5l2.47 5.4 5.93.62-4.45 4.02 1.24 5.86L10 14.77l-5.19 2.63 1.24-5.86L1.6 7.52l5.93-.62L10 1.5z";

export function StarRating({ value, onChange, readOnly = false, size = "sm" }: StarRatingProps) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? undefined : "radiogroup"}>
      {[1, 2, 3, 4, 5].map((estrela) => {
        const preenchida = estrela <= value;
        return (
          <button
            key={estrela}
            type="button"
            disabled={readOnly}
            aria-label={`Nota ${estrela} de 5`}
            aria-pressed={preenchida}
            onClick={() => onChange?.(estrela)}
            className={`${readOnly ? "cursor-default" : "cursor-pointer"} transition ${
              readOnly ? "" : "hover:scale-110"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              className={`${dimension} ${
                preenchida ? "fill-nexus-primary" : "fill-white/10"
              } transition-colors`}
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
