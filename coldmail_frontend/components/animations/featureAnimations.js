// components/animations/featureAnimations.js

export const getFeatureBoxVariant = (delay = 0) => ({
    initial: {
      opacity: 0,
      y: 50,
    },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once: true,
    },
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: delay,
    },
  });
  