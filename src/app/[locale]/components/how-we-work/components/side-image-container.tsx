import Image from 'next/image';
import { MEDIA } from '@/shared/constants/media';

interface SideImageContainerProps {
  imageSrc: string;
  showAvatars?: boolean;
}

export function SideImageContainer({ imageSrc, showAvatars }: SideImageContainerProps) {
  return (
    <div className="relative overflow-hidden max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%] max-h-[300px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-[550px] xl:max-h-[600px] mx-auto top-0 sm:top-2 md:top-4 lg:top-6">
      <Image src={imageSrc} alt="work-side" width={800} height={600} className="w-full h-full max-h-[300px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-[550px] xl:max-h-[600px] object-cover" />
      {showAvatars && (
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
          <Image 
            src={MEDIA.landing.section3.img10} 
            alt="Logo" 
            width={100}
            height={100}
            className="h-auto w-auto max-h-[60px] sm:max-h-[80px] md:max-h-[100px] max-w-[60px] sm:max-w-[80px] md:max-w-[100px] object-contain shadow-sm" 
          />
        </div>
      )}
    </div>
  );
}

