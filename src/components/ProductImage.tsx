'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK = '/assets/logo.png';

type Props = Omit<ImageProps, 'src'> & { src: string };

export default function ProductImage({ src, alt, ...props }: Props) {
  const [imageSrc, setImageSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={() => setImageSrc((current) => current === FALLBACK ? current : FALLBACK)}
    />
  );
}
