import { FaReddit } from "react-icons/fa";
import { SiBluesky } from "react-icons/si";

type Platform = 'reddit' | 'bluesky';

interface PlatformIconProps {
  platform: Platform;
}

export function PlatformIcon({ platform }: PlatformIconProps) {
  switch (platform) {
    case 'reddit':
      return <FaReddit className="w-5 h-5 text-[#FF4500]" />;
    case 'bluesky':
      return <SiBluesky className="w-5 h-5 text-[#0560FF]" />;
    default:
      return null;
  }
} 