import { THEME } from '@/shared/constants/theme';

interface SliderDotsProps {
  totalSlides: number;
  currentIndex: number;
  onDotClick: (index: number) => void;
}

export function SliderDots({ totalSlides, currentIndex, onDotClick }: SliderDotsProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      {Array.from({ length: totalSlides }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onDotClick(i)}
          className="h-2.5 w-2.5 rounded-full transition-colors"
          style={{ 
            backgroundColor: i === currentIndex ? THEME.colors.primary : '#C9D7F6' 
          }}
        />
      ))}
    </div>
  );
}

