"use client";

import { useEffect, useState } from "react";

function format(date: Date, hour12: boolean) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12 }).format(date);
}

export function TimeWidget() {
  const [hour12, setHour12] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="hero-card" aria-label="Time widget">
      <div className="eyebrow">Time link</div>
      <p>{now ? format(now, hour12) : "--:--"} · {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
      <button className="chip" type="button" onClick={() => setHour12((value) => !value)}>{hour12 ? "12H" : "24H"}</button>
    </div>
  );
}
