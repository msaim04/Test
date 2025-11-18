import Image from 'next/image';
import { MEDIA } from '@/shared/constants/media';

interface MiniCardContainerProps {
  show?: boolean;
}

export function MiniCardContainer({ show }: MiniCardContainerProps) {
  if (!show) return null;
  
  return (
    <div className="hidden sm:block md:hidden lg:hidden xl:block absolute -bottom-[30px] sm:-bottom-[40px] xl:-bottom-[60px] -left-2 sm:-left-4 xl:-left-6 bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 xl:p-4 shadow-sm w-[140px] sm:w-[160px] xl:w-[200px] z-10">
      <Image
        src={MEDIA.landing.section3.img9}
        alt="Vast Range of Services"
        width={200}
        height={160}
        className="w-full h-auto max-h-[100px] sm:max-h-[120px] xl:max-h-[160px] object-contain"
      />
    </div>
  );
}

