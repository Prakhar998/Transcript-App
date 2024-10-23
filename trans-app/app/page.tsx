import React from 'react';
import Microphone from './components/Microphone';
import ImageToText from './components/ImageToText';


const Page: React.FC = () => {
  return (
    <div>
      <Microphone />
      <ImageToText />
    </div>
  );
};

export default Page;