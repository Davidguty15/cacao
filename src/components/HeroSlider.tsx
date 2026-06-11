import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import banner1 from "../assets/images/banner1.png";
import banner2 from "../assets/images/banner2.png";
import banner3 from "../assets/images/banner3.png";

// Beautiful custom banner structures
const SLIDES = [
  {
    id: 1,
    image: banner1,
    subtitle: "Rendimiento y Precisión",
    title: "DISEÑO QUE SE ADAPTA A TU VELOCIDAD",
    description: "Materiales técnicos microporosos y geometría de compresión para superar tus propios límites con elegancia.",
    cta: "Explorar Shorts",
    targetCategory: "Shorts" as const,
  },
  {
    id: 2,
    image: banner2,
    subtitle: "Ingeniería de Tejidos Premium",
    title: "LEGGINGS ESCULPIDOS DE ALTO MOVIMIENTO",
    description: "Soporte absoluto abdominal de doble capa con opacidad squat-proof 100% garantizada. Estilo impoluto.",
    cta: "Ver Leggins",
    targetCategory: "Leggins" as const,
  },
  {
    id: 3,
    image: banner3,
    subtitle: "Protección Climática Sutil",
    title: "CORTAVIENTOS DE ALTO PERFIL",
    description: "Menor de 150 gramos, repelente a llovizna extrema y empacable en su propio bolsillo. Calidad de alta costura.",
    cta: "Ver Chaquetas",
    targetCategory: "Chaquetas" as const,
  },
];

interface HeroSliderProps {
  onSelectCategory: (category: "Shorts" | "Camisas" | "Leggins" | "Chaquetas" | "All") => void;
}

export default function HeroSlider({ onSelectCategory }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1: left, 1: right

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentSlide = SLIDES[currentIndex];

  // Variants for sliding transition effect
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-[32rem] sm:h-[38rem] bg-neutral-900 border-b-2 border-black overflow-hidden">
      
      {/* Background slide images with AnimatePresence */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Cover Overlay for beautiful dark-to-light elegant gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
          
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover object-center scale-102"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating typography contents */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl text-white">
            
            {/* Animated components inside slide */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs sm:text-sm font-black tracking-widest text-neutral-300 uppercase mb-3"
            >
              CACAO // {currentSlide.subtitle}
            </motion.p>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-4 uppercase leading-none"
            >
              {currentSlide.title}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xs sm:text-sm text-neutral-300 font-medium tracking-normal mb-8 leading-relaxed max-w-lg"
            >
              {currentSlide.description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={() => onSelectCategory(currentSlide.targetCategory)}
                className="group flex items-center gap-2.5 bg-white text-black text-xs sm:text-sm font-black tracking-widest uppercase px-8 py-4 border-2 border-white hover:bg-black hover:text-white transition-all duration-200"
              >
                {currentSlide.cta}
                <ArrowRight className="w-4 h-4 text-black group-hover:text-white stroke-[2.5] transition-transform group-hover:translate-x-1.5" />
              </button>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Left / Right chevron triggers */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 border-2 border-white bg-black hover:bg-white text-white hover:text-black focus:outline-none transition-all duration-200"
        aria-label="Anterior diapositiva"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 border-2 border-white bg-black hover:bg-white text-white hover:text-black focus:outline-none transition-all duration-200"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Dynamic Slide indicators dots */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2.5 font-mono">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => handleDotClick(i)}
            className={`h-3 transition-all duration-300 border border-white ${
              i === currentIndex ? "w-10 bg-white" : "w-3 bg-black/50 hover:bg-white/70"
            }`}
            aria-label={`Ir a diapositiva ${i + 1}`}
          ></button>
        ))}
      </div>

    </div>
  );
}
