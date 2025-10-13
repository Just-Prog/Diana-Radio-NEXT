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
  const [uri, setUri] = useState<string>('');
  const [mouseEntered, setMouseEntered] = useState(true);
  const img = useRef<HTMLImageElement>(null);

  const onMouseOver = (e: MouseEvent) => {
    if (img.current) {
      // 这个实现方法会导致在打开Chrome DevTools的时候爆卡
      // 暂时不修
      img.current.style = `transform: translate3d(calc(${e.clientX / 50}px - 1vw), calc(${e.clientY / 50}px - 1vh), 0)`;
    }
  };

  const onMouseEnter = (e: MouseEvent) => {
    setMouseEntered(true);
  };
  const onMouseLeave = (e: MouseEvent) => {
    setMouseEntered(false);
    if (img.current) {
      img.current.style = 'transform: translate3d(0px, 0px, 0px)';
    }
  };

  useEffect(() => {
    setUri(
      background_imgs_hardcode[
        Number.parseInt(
          ((Math.random() * 1000) % background_imgs_hardcode.length).toString(),
          10
        )
      ]
    );
    document.addEventListener('mousemove', onMouseOver);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      document.removeEventListener('mousemove', onMouseOver);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div className="-z-50 -top-4 -left-6 fixed flex h-[120%] w-[120%] flex-1 items-center justify-center">
      <div
        className={`'bg-white' absolute top-0 z-10 h-full w-full bg-white transition duration-500 ease-in-out ${mouseEntered ? 'opacity-65' : 'opacity-55'}`}
        id="bg-overlay"
      />
      {uri !== '' ? (
        <Image
          alt={''}
          className={
            'relative h-full w-full object-cover object-center blur-sm transition duration-200 ease-linear'
          }
          height={0}
          ref={img}
          referrerPolicy="no-referrer"
          sizes="100vw 100vh"
          src={uri}
          width={0}
        />
      ) : null}
    </div>
  );
};

export default Background;
