import React from "react";

interface LogoProps {
  className?: string;
  isFooter?: boolean;
}

export default function Logo({ className = "h-8 text-black", isFooter = false }: LogoProps) {
  return (
    <svg
      viewBox="0 0 288 100"
      className={`${className} fill-none shrink-0 ${isFooter ? "text-white" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* C */}
      <path
        d="M 40.5 7.5 H 24 A 16.5 16.5 0 0 0 7.5 24 V 76 A 16.5 16.5 0 0 0 24 92.5 H 40.5"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* A */}
      <path
        d="M 100.5 7.5 V 92.5 M 100.5 7.5 H 84 A 16.5 16.5 0 0 0 67.5 24 V 76 A 16.5 16.5 0 0 0 84 92.5 H 100.5"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* C */}
      <path
        d="M 160.5 7.5 H 144 A 16.5 16.5 0 0 0 127.5 24 V 76 A 16.5 16.5 0 0 0 144 92.5 H 160.5"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* A */}
      <path
        d="M 220.5 7.5 V 92.5 M 220.5 7.5 H 204 A 16.5 16.5 0 0 0 187.5 24 V 76 A 16.5 16.5 0 0 0 204 92.5 H 220.5"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* O */}
      <rect
        x="247.5"
        y="7.5"
        width="33"
        height="85"
        rx="16.5"
        stroke="currentColor"
        strokeWidth="15"
      />
    </svg>
  );
}
