import { MainImageContainer } from './main-image-container';
import { SideImageContainer } from './side-image-container';
import { MiniCardContainer } from './mini-card-container';

interface MediaClusterProps {
  showMiniCard?: boolean;
  showAvatars?: boolean;
  mainImage: string;
  sideImage: string;
}

export function MediaCluster({
  showMiniCard,
  showAvatars,
  mainImage,
  sideImage,
}: MediaClusterProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3 md:gap-4 lg:gap-0 relative w-full">
      {/* Big (left) image container - grouped with img9 */}
      <div className="relative -mt-0 sm:-mt-2 md:-mt-4 group ml-0 sm:ml-2 md:ml-3 lg:ml-6">
        <MainImageContainer imageSrc={mainImage} />
        <MiniCardContainer show={showMiniCard} />
      </div>

      {/* Tall (right) image container */}
      <SideImageContainer imageSrc={sideImage} showAvatars={showAvatars} />
    </div>
  );
}

