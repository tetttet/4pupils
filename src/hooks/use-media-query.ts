"use client";

import { useEffect, useState } from "react";

type Device = "mobile" | "tablet" | "desktop";

type Dimensions = {
  width: number;
  height: number;
};

function getDevice(): Device {
  if (typeof window === "undefined") return "mobile";

  if (window.matchMedia("(min-width: 1024px)").matches) {
    return "desktop";
  }

  if (window.matchMedia("(min-width: 640px)").matches) {
    return "tablet";
  }

  return "mobile";
}

function getDimensions(): Dimensions {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useMediaQuery() {
  const [device, setDevice] = useState<Device>("mobile");
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const checkDevice = () => {
      setDevice(getDevice());
      setDimensions(getDimensions());
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return {
    device,
    width: dimensions.width,
    height: dimensions.height,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
  };
}
