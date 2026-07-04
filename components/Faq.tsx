"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "What kinds of trading cards can be covered?",
    a: "Coverage may be available for graded slabs, raw singles, sealed product, and store inventory across major TCGs — including Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, and more. Eligibility and limits depend on your collection and are confirmed during the quote process.",
  },
  {
    q: "Is my collection covered while it's being graded or shipped?",
    a: "In-transit and grading-submission coverage may be available, so your cards can be protected while they travel to a grader, a show, or a buyer. Specific terms are confirmed when your quote is prepared.",
  },
  {
    q: "How is the value of my cards determined?",
    a: "Coverage is typically written against market value using recent sales data and, where applicable, grading and provenance. We'll walk through valuation with you so your limits reflect what your collection is actually worth.",
  },
  {
    q: "Do you cover game stores and dealers, not just collectors?",
    a: "Yes. Coverage may be available for store inventory, tournament stock, convention booths, and dealer shipments in addition to personal collections. Let us know your setup and we'll tailor a quote.",
  },
  {
    q: "How fast can I get covered?",
    a: "Getting a quote takes just a few minutes. Once you submit the form, a licensed agent follows up to confirm details and finalize eligibility. Turnaround depends on your collection and the coverage you need.",
  },
];

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
