import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <Loader2 size={48} className="loading-spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingScreen;
