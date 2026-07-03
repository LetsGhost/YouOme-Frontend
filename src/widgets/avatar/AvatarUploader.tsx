import { useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { Avatar, Box, CircularProgress, IconButton } from "@mui/material";
import { Camera, X } from "lucide-react";

import { useAuthenticatedImage } from "../../shared/lib/useAuthenticatedImage";

type AvatarUploaderProps = {
  src?: string | null;
  token?: string;
  fallback: ReactNode;
  size?: number;
  editable?: boolean;
  shape?: "circle" | "rounded";
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
};

export function AvatarUploader({
  src,
  token,
  fallback,
  size = 72,
  editable = false,
  shape = "circle",
  onUpload,
  onRemove,
}: AvatarUploaderProps) {
  const borderRadius = shape === "circle" ? "50%" : "var(--radius-sm)";
  const imageUrl = useAuthenticatedImage(src, token);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsBusy(true);
    try {
      await onUpload(file);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemove = async () => {
    setIsBusy(true);
    try {
      await onRemove();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <Avatar
        src={imageUrl ?? undefined}
        variant={shape === "circle" ? "circular" : "rounded"}
        sx={{
          width: size,
          height: size,
          borderRadius,
          bgcolor: "var(--color-accent-soft-bg)",
          color: "var(--color-accent-soft-ink)",
          fontWeight: 700,
          fontSize: size / 2.5,
        }}
      >
        {fallback}
      </Avatar>

      {isBusy && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(0,0,0,0.35)",
            borderRadius,
          }}
        >
          <CircularProgress size={size / 3} sx={{ color: "#fff" }} />
        </Box>
      )}

      {editable && !isBusy && (
        <>
          <IconButton
            size="small"
            aria-label="Upload image"
            onClick={() => inputRef.current?.click()}
            sx={{
              position: "absolute",
              bottom: -6,
              right: imageUrl ? 22 : -6,
              width: 26,
              height: 26,
              bgcolor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              border: "2px solid var(--color-surface)",
              "&:hover": { bgcolor: "var(--color-accent)", filter: "brightness(0.92)" },
            }}
          >
            <Camera size={13} strokeWidth={2.5} />
          </IconButton>

          {imageUrl && (
            <IconButton
              size="small"
              aria-label="Remove image"
              onClick={() => void handleRemove()}
              sx={{
                position: "absolute",
                bottom: -6,
                right: -6,
                width: 26,
                height: 26,
                bgcolor: "var(--color-danger)",
                color: "var(--color-accent-contrast)",
                border: "2px solid var(--color-surface)",
                "&:hover": { bgcolor: "var(--color-danger)", filter: "brightness(0.92)" },
              }}
            >
              <X size={13} strokeWidth={2.5} />
            </IconButton>
          )}

          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => void handleFileChange(event)} />
        </>
      )}
    </Box>
  );
}
