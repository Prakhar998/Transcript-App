import React from 'react';
import Microphone from './components/Microphone';
import ImageToText from './components/ImageToText';


const Page: React.FC = () => {
  return (
    <div>
      <Microphone apiKey={'67fff0dc0adde559f75d91b207fdef7d125dce81'} />
      <ImageToText />
    </div>
  );
};

export default Page;