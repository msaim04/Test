import { THEME } from '@/shared/constants/theme';

interface BulletProps {
  n: number;
  active: boolean;
  onClick: () => void;
  isSlide3?: boolean;
}

export function Bullet({ n, active, onClick, isSlide3 = false }: BulletProps) {
  // On slide 3, inactive bullets (1 and 2) should be white bg with blue text
  const isInactiveOnSlide3 = isSlide3 && !active;
  
  return (
    <button
      type="button"
      aria-label={`Go to step ${n}`}
      onClick={onClick}
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-full text-base transition-colors',
        active 
          ? 'text-white' 
          : isInactiveOnSlide3
          ? 'bg-white hover:bg-white/90'
          : 'text-white',
      ].join(' ')}
      style={
        active
          ? { backgroundColor: THEME.colors.primary }
          : isInactiveOnSlide3
          ? { color: THEME.colors.primary }
          : { backgroundColor: `${THEME.colors.text.darkBlue}8C`, color: 'white' }
      }
    >
      {n}
    </button>
  );
}

