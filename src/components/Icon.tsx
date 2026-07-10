import React from 'react';
import Svg, {Path, G, Circle} from 'react-native-svg';
import {colors} from '../theme';

// Set de iconos con trazo (tipo Feather/Lucide), réplica del componente Icon
// del design handoff. Nombres compartidos con el prototipo.
export type IconName =
  | 'home' | 'book' | 'chat' | 'user' | 'arrowRight' | 'arrowLeft' | 'close'
  | 'bell' | 'heart' | 'bookmark' | 'check' | 'send' | 'sparkle' | 'moon'
  | 'settings' | 'sun' | 'feather' | 'wind' | 'apple' | 'google' | 'quote'
  | 'play' | 'flame' | 'list' | 'plus' | 'search';

function paths(name: IconName, color: string) {
  switch (name) {
    case 'home': return <Path d="M3 12 12 4l9 8M5 10v10h14V10" />;
    case 'book': return <Path d="M5 4h12a2 2 0 0 1 2 2v15l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />;
    case 'chat': return <Path d="M21 12a8 8 0 0 1-11.7 7.1L3 21l1.9-6.3A8 8 0 1 1 21 12Z" />;
    case 'user': return <G><Circle cx="12" cy="8" r="4" /><Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></G>;
    case 'arrowRight': return <Path d="M5 12h14M13 6l6 6-6 6" />;
    case 'arrowLeft': return <Path d="M19 12H5M11 6l-6 6 6 6" />;
    case 'close': return <Path d="M6 6l12 12M18 6 6 18" />;
    case 'bell': return <G><Path d="M19 14V8a7 7 0 1 0-14 0v6l-2 3h18l-2-3Z" /><Path d="M10 20a2 2 0 0 0 4 0" /></G>;
    case 'heart': return <Path d="m12 21-1.5-1.4C5 14.7 2 12 2 8.5A4.5 4.5 0 0 1 6.5 4 5 5 0 0 1 12 6a5 5 0 0 1 5.5-2A4.5 4.5 0 0 1 22 8.5c0 3.5-3 6.2-8.5 11.1L12 21Z" />;
    case 'bookmark': return <Path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-4 7 4Z" />;
    case 'check': return <Path d="m5 12 5 5L20 7" />;
    case 'send': return <Path d="M3 11 22 2l-9 19-2-8-8-2Z" />;
    case 'sparkle': return <G><Path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></G>;
    case 'moon': return <Path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />;
    case 'settings': return <G><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></G>;
    case 'sun': return <G><Circle cx="12" cy="12" r="5" /><Path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></G>;
    case 'feather': return <G><Path d="M20 4C13 4 8 9 6 16l-2 4 4-2c7-2 12-7 12-14Z" /><Path d="M16 8 8 16" /></G>;
    case 'wind': return <Path d="M3 8h11a3 3 0 1 0-3-3M3 16h8.5a2.5 2.5 0 1 1-2.5 2.5M3 12h15a3 3 0 1 0-3-3" />;
    case 'apple': return <Path d="M16 2c-1 1-2 3-1.5 5 2-.2 3.5-1.7 4-3.5C19 1.5 17 1 16 2ZM18 12c0-2 1-3 2-3.5C19 7 17.5 6 15.5 6 14 6 13 6.5 12 6.5S10 6 8.5 6C5 6 2 9 2 13.5 2 17 4.5 22 8 22c1.5 0 2.5-1 4-1s2.5 1 4 1c2.5 0 4.5-3 5-5-2.5-1-3-3-3-5Z" fill={color} stroke="none" />;
    case 'google': return <Path d="M12 4c2 0 3.6.8 4.8 1.8l-2 2C14 7 13.2 6.5 12 6.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c2.5 0 3.8-1.5 4.2-3H12v-2.5h7c.1.5.2 1 .2 1.7 0 4-2.5 6.8-6.7 6.8-3.8 0-7-3-7-6.8C5 6 8.2 4 12 4Z" fill={color} stroke="none" />;
    case 'quote': return <G><Path d="M7 17h2a3 3 0 0 0 3-3V8H6v6h3a2 2 0 0 1-2 2v1ZM15 17h2a3 3 0 0 0 3-3V8h-6v6h3a2 2 0 0 1-2 2v1Z" /></G>;
    case 'play': return <Path d="M7 4v16l13-8L7 4Z" />;
    case 'flame': return <Path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.5-2.2 1-3 .3 1 1 1.5 1.7 1.6C10.3 8 10 6 12 3Z" />;
    case 'list': return <Path d="M4 6h16M4 12h16M4 18h16" />;
    case 'plus': return <Path d="M12 5v14M5 12h14" />;
    case 'search': return <G><Circle cx="11" cy="11" r="7" /><Path d="m20 20-3.5-3.5" /></G>;
    default: return null;
  }
}

export function Icon({
  name,
  size = 24,
  color = colors.earth,
  strokeWidth = 1.5,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {paths(name, color)}
    </Svg>
  );
}
