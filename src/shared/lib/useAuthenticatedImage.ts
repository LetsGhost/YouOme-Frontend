import { useEffect, useState } from "react";

import { fetchImageBlob } from "../api/backend";

// Avatar endpoints require an auth header the browser won't attach to a bare
// <img src>, so this fetches the bytes once (with the header) and hands back
// a local object URL instead. Re-fetches whenever `src`/`token` change, and
// revokes the previous object URL so we don't leak blob URLs as avatars change.
export function useAuthenticatedImage(src: string | null | undefined, token?: string): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setObjectUrl(null);
      return;
    }

    let isActive = true;
    let localUrl: string | null = null;
    const controller = new AbortController();

    fetchImageBlob(src, token, controller.signal)
      .then((blob) => {
        if (!isActive) return;
        localUrl = URL.createObjectURL(blob);
        setObjectUrl(localUrl);
      })
      .catch(() => {
        if (isActive) setObjectUrl(null);
      });

    return () => {
      isActive = false;
      controller.abort();
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [src, token]);

  return objectUrl;
}
