// AHORA — tokens de diseño (Sagrado Corazón: beige cálido + rosa devoción +
// azul acción). Beige LIMPIO solo en fondos; rosa y azul VIVOS solo en
// acciones/acentos. Réplica de `T` del design handoff.

export const colors = {
  bone: '#F8F4EC',
  cream: '#F3EDE1',
  beige: '#EDE4D6',
  sand: '#D8CBB8',
  earth: '#8C7B66',
  ink: '#33302B',
  inkSoft: '#4A4339',

  blush: '#FBE3EB',
  petal: '#EBA8B8',
  rose: '#DD8198',
  roseInk: '#B05670',

  skySoft: '#E7EDFA',
  skyInk: '#3F559E',
  sky: '#7E99D6',
  skyDeep: '#5570C4',

  gold: '#E3AC7E',
  goldLight: '#F4D6B4',
  goldSoft: 'rgba(227, 172, 126, 0.28)',
  leaf: '#D9756A',

  surface: '#FFFDF9',
  border: 'rgba(184, 166, 142, 0.36)',
  white: '#FFFFFF',
};

// Degradados de "cielo" por variante (de arriba a abajo).
export const skyGradients: Record<string, string[]> = {
  dawn: ['#F3EBDC', '#F7F1E6', '#FBF7EF', '#FDFAF4'],
  day: ['#F4EDDF', '#FAF5EB', '#FDFAF4'],
  soft: ['#F9F4EA', '#F2EBDC'],
  reading: ['#F4ECDE', '#FCF8F0', '#FCF8F0'],
  night: ['#3A3142', '#5E5066', '#9B8493'],
};

export const shadow = {
  // Sombra suave estándar de tarjetas/botones (RN).
  rest: {
    shadowColor: 'rgba(70, 60, 46, 1)',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  lift: {
    shadowColor: 'rgba(70, 60, 46, 1)',
    shadowOpacity: 0.13,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};

export const radius = { sm: 12, md: 16, card: 24, lg: 26, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

// Tipografía. "Cormorant Garamond" (display/serif) y "Manrope" (body/sans).
// Si las fuentes no están enlazadas todavía, RN cae al sistema sin romper.
// Ver assets/fonts/README para añadir los .ttf.
export const font = {
  display: 'Cormorant Garamond',
  body: 'Manrope',
};

export const fontSize = {
  h1: 36,
  h2: 30,
  h3: 22,
  title: 18,
  body: 15,
  small: 13,
  tiny: 11,
};
