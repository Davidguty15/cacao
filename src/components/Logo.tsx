import React from "react";
import logoImage from "../assets/images/logo.png";

interface LogoProps {
  className?: string;
  isFooter?: boolean;
}

export default function Logo({ className = "h-8", isFooter = false }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt="Cacao Logo"
      className={`${className} object-contain transition-all ${
        isFooter ? "brightness-0 invert" : ""
      }`}
    />
  );
}
