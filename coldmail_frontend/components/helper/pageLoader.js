'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white z-50">
      <div className="w-24 h-24"> {/* Tailwind-based size control */}
        <DotLottieReact
          src="https://lottie.host/a83cb142-a40e-4861-8a40-25f0df8fe01e/iPXvjdKcrU.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
};

export default PageLoader;
