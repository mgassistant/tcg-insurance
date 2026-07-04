"use client";

import { useRef } from "react";

export default function Slab() {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotY = (px - 0.5) * 18;
    const rotX = (0.5 - py) * 18;
    el.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
    el.style.setProperty("--holo-x", `${px * 100}%`);
    el.style.setProperty("--holo-y", `${py * 100}%`);
    el.style.setProperty("--shine-x", `${px * 100}%`);
    el.style.setProperty("--shine-angle", `${100 + px * 40}deg`);
    el.style.setProperty("--foil-rot", `${px * 360}deg`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "rotateY(0deg) rotateX(0deg)";
  }

  return (
    <div className="slab-stage">
      <div>
        <div
          className="slab"
          ref={ref}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          aria-label="Illustration of a graded card slab representing a certificate of coverage"
        >
          <div className="slab-label">
            <div className="l-name">
              CERTIFICATE OF COVERAGE
              <small>TCG Insurance · No. 00042871</small>
            </div>
            <div className="l-grade">
              <div className="g">10</div>
              <div className="t">GEM&nbsp;MT</div>
            </div>
          </div>
          <div className="slab-card">
            <div className="sc-top">
              <span>TCG INSURANCE</span>
              <span>EST. 2026</span>
            </div>
            <div className="sc-mid">
              <div className="shield">🛡️</div>
              <div className="cov">
                FULLY
                <br />
                COVERED
              </div>
              <div className="cov-sub">MARKET-VALUE PROTECTION</div>
            </div>
            <div className="sc-rows">
              <div className="sc-row">
                <span>THEFT &amp; BURGLARY</span>
                <b>✓</b>
              </div>
              <div className="sc-row">
                <span>FIRE / FLOOD / DAMAGE</span>
                <b>✓</b>
              </div>
              <div className="sc-row">
                <span>IN-TRANSIT &amp; GRADING</span>
                <b>✓</b>
              </div>
            </div>
          </div>
        </div>
        <p className="slab-caption">// TILT ME — COVERAGE FROM EVERY ANGLE</p>
      </div>
    </div>
  );
}
