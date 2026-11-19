import { useEffect, useState } from "react";
import { Image } from "react-native";

// Reads the real width/height of each image so it can be shown without
// cropping. Returns { [uri]: width / height } for the images loaded so far.
export function useImageRatios(uris) {
  const [ratios, setRatios] = useState({});
  const key = uris.filter(Boolean).join("|");

  useEffect(() => {
    let isActive = true;
    key
      .split("|")
      .filter(Boolean)
      .forEach((uri) => {
        Image.getSize(
          uri,
          (width, height) => {
            if (isActive && width > 0 && height > 0) {
              setRatios((current) => ({ ...current, [uri]: width / height }));
            }
          },
          () => {},
        );
      });
    return () => {
      isActive = false;
    };
  }, [key]);

  return ratios;
}
