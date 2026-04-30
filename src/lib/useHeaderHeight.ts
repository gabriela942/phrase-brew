import { useEffect, useState } from "react";

/**
 * Returns the current rendered height of the sticky <header> element.
 * Updates whenever the header resizes (e.g. mobile rows collapse/expand).
 */
export function useHeaderHeight() {
  const [height, setHeight] = useState(58); // desktop default

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const update = () => setHeight(header.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  return height;
}
