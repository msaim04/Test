import Image from 'next/image';
import { MEDIA } from '@/shared/constants/media';

interface MainImageContainerProps {
  imageSrc: string;
}

export function MainImageContainer({ imageSrc }: MainImageContainerProps) {
  return (
    <div className="relative overflow-hidden min-h-[200px] sm:min-h-[220px] md:min-h-[250px] max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] ml-0 sm:ml-auto mr-0">
      <Image src={imageSrc} alt="work-main" width={800} height={600} className="w-full h-full min-h-[200px] sm:min-h-[220px] md:min-h-[250px] object-cover" />
      {/* Logo (top-left) */}
      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10">
        <Image 
          src={MEDIA.icons.mini_logo} 
          alt="Logo" 
          width={40}
          height={40}
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm" 
        />
      </div>
    </div>
  );
}

