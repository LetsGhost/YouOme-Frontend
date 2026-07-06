import { useThemeMode } from "../../app/ThemeModeContext";

export function LoadingScreen({ label = "Settling up..." }: { label?: string }) {
  const { mode } = useThemeMode();

  return (
    <div className="loading-screen">
      <img
        className="loading-coin"
        src={mode === "dark" ? "/AppIcon/Variant2Light.svg" : "/AppIcon/Variant2Dark.svg"}
        alt=""
      />
      <div className="loading-label">{label}</div>
    </div>
  );
}
