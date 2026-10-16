"use client";

import { useState } from "react";

export default function AuthShowcase() {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <aside className="auth-right">
      <div className="showcase-panel">
        <header className="showcase-header">
          <h2>Select &amp; Combine &amp; Integrate.</h2>
          <p>
            Develop and refine social marketplace channels using our intuitive
            interface.
          </p>
        </header>

        <div className="network-diagram">
          <svg className="network-svg" viewBox="0 0 320 320">
            <line x1="160" y1="160" x2="33" y2="33" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="160" y1="160" x2="160" y2="33" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="160" y1="160" x2="287" y2="33" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="160" y1="160" x2="33" y2="160" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="160" y1="160" x2="287" y2="160" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="160" y1="160" x2="33" y2="287" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="160" y1="160" x2="160" y2="287" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="160" y1="160" x2="287" y2="287" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="3,3" />
          </svg>

          <div className="node-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="5" />
              <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
              <path d="M8.5 14.5c1 1.5 2.5 2 3.5 2s2.5-.5 3.5-2" />
            </svg>
          </div>

          <div className="node-item node-top-left">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.739-8z" />
            </svg>
          </div>

          <div className="node-item node-top-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="M9 17V7h4a3 3 0 0 1 0 6H9l5 4" />
            </svg>
          </div>

          <div className="node-item node-top-right">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
          </div>

          <div className="node-item node-mid-left">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a7 7 0 0 1 7 7c0 4-3 7-7 7a4 4 0 0 1-4-4c0-2 1.5-3 3-3" />
            </svg>
          </div>

          <div className="node-item node-mid-right">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3h18v18H3z" />
              <path d="M8 8h8v8H8z" />
            </svg>
          </div>

          <div className="node-item node-bottom-left">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 0-6.36 15.36L12 12l6.36 6.36A9 9 0 0 0 12 3z" />
            </svg>
          </div>

          <div className="node-item node-bottom-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>

          <div className="node-item node-bottom-right">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 6.1H3" />
              <path d="M21 12.1H3" />
              <path d="M15.1 18H3" />
            </svg>
          </div>
        </div>

        <footer className="carousel-indicators">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className={`dot ${activeDot === idx ? "active" : ""}`}
              onClick={() => setActiveDot(idx)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </footer>
      </div>
    </aside>
  );
}
