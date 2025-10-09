'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const background_imgs_hardcode = [
  'https://i0.hdslb.com/bfs/new_dyn/6739704cbbb34ced416e562ec4bd2222381596072.png@850w.avif',
  'https://i0.hdslb.com/bfs/new_dyn/aa6ea05163a06d2947546aa1b67d2939381596072.png@850w.avif',
  'https://i1.hdslb.com/bfs/new_dyn/226808f5de76748eac35e5f280adab53381596072.png@850w.avif',
  'https://i1.hdslb.com/bfs/new_dyn/21d221d37db714cbce09d9508c2ca989381596072.png@850w.avif',
  'https://i1.hdslb.com/bfs/album/9e889a4f8b60e1a88c847a96677574411a52e896.jpg@850w.avif',
  'https://i1.hdslb.com/bfs/new_dyn/f261b17e97b869a7be3c19ce327c1cf1703007996.png@850w.avif',
  'https://i1.hdslb.com/bfs/new_dyn/b96d57972e4265dedbe472af3f20961e703007996.jpg@850w.avif',
];

const Background: React.FC = () => {
  const [no, setNo] = useState<number>();
  const uri = no?.toString()
    ? background_imgs_hardcode[Number.parseInt(no?.toString(), 10)]
    : '';
  const img = useRef<HTMLImageElement>(null);

  const onMouseOver = (e) => {
    console.log(e);
  };

  useEffect(() => {
    if (img.current) {
      document.addEventListener('mouseover', onMouseOver);
      return document.removeEventListener('mouseover', onMouseOver);
    }
  }, [img.current]);

  useEffect(() => {
    setNo((Math.random() * 1000) % background_imgs_hardcode.length);
  }, []);
  return (
    <div className="-z-50 fixed top-0 flex h-full w-full flex-1 items-center justify-center">
      <div className="absolute top-0 z-10 h-full w-full bg-white opacity-65" />
      {/** biome-ignore lint/performance/noImgElement: <explanation> */}
      {/** biome-ignore lint/nursery/useImageSize: <explanation> */}
      {/** biome-ignore lint/a11y/useAltText: <explanation> */}
      {
        <Image
          alt={''}
          className={`h-[125%] w-[125%] object-cover blur-sm ease-in-out ${no ?? 'invisible'}`}
          height={0}
          ref={img}
          referrerPolicy="no-referrer"
          sizes="100vw 100vh"
          src={uri}
          width={0}
        />
      }
    </div>
  );
};

export default Background;
