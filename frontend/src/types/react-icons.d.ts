// Type declarations for react-icons to work with React 19
declare module 'react-icons/fa' {
  import { FC, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    className?: string;
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export const FaArrowLeft: FC<IconProps>;
  export const FaChartLine: FC<IconProps>;
  export const FaBook: FC<IconProps>;
  export const FaTrophy: FC<IconProps>;
  export const FaHome: FC<IconProps>;
  export const FaUser: FC<IconProps>;
  export const FaSignOutAlt: FC<IconProps>;
  export const FaStar: FC<IconProps>;
  export const FaPlay: FC<IconProps>;
  export const FaPause: FC<IconProps>;
  export const FaStop: FC<IconProps>;
  export const FaClock: FC<IconProps>;
  export const FaBolt: FC<IconProps>;
  export const FaExclamationTriangle: FC<IconProps>;
         export const FaBookOpen: FC<IconProps>;
         export const FaEnvelope: FC<IconProps>;
         export const FaLock: FC<IconProps>;
         export const FaUserPlus: FC<IconProps>;
         export const FaRobot: FC<IconProps>;
         export const FaTimes: FC<IconProps>;
         export const FaPaperPlane: FC<IconProps>;
         export const FaFileAlt: FC<IconProps>;
         export const FaPlusCircle: FC<IconProps>;
         export const FaPencilAlt: FC<IconProps>;
         export const FaTrashAlt: FC<IconProps>;
         export const FaBars: FC<IconProps>;
         export const FaTimes: FC<IconProps>;
       }


