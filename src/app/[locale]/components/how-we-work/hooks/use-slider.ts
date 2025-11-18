import { useState, useEffect, useCallback } from 'react';

interface UseSliderOptions {
  totalSlides: number;
  enableKeyboard?: boolean;
}

export function useSlider({ totalSlides, enableKeyboard = true }: UseSliderOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Keyboard support (← →)
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, nextSlide, prevSlide]);

  return {
    currentIndex,
    goToSlide,
    nextSlide,
    prevSlide,
  };
}

