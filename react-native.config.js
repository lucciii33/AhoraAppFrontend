module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null, // 👈 evita que iOS copie las fuentes automáticamente
      },
    },
  },
  assets: ['./assets/fonts/'], // 👈 solo tus fuentes, no las de vector-icons
};
