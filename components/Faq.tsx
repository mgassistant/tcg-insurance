"use client";

import { useState } from "react";
import { HOME_FAQ as ITEMS } from "@/lib/homeFaq";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq">
      {ITEMS.map((item, i) => (
        <div key={i} className={`faq-item${open === i ? " open" : ""}`}>
          <button
            className="faq-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
          </button>
          <div className="faq-a">
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
