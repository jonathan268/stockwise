import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value, format = true, duration = 800 }) {
  const [display, setDisplay] = useState(format ? "0" : 0);
  const prevValue = useRef(0);
  const raf = useRef();

  useEffect(() => {
    const start = prevValue.current;
    const end = Number(value) || 0;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (format) {
        setDisplay(new Intl.NumberFormat("fr-FR").format(Math.round(current)));
      } else {
        setDisplay(Math.round(current));
      }

      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    };

    raf.current = requestAnimationFrame(step);
    prevValue.current = end;

    return () => cancelAnimationFrame(raf.current);
  }, [value, duration, format]);

  return <>{display}</>;
}
