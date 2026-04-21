'use client';
import { useEffect, useRef, ReactNode } from 'react';

export default function FadeIn({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // 一度表示されたら監視終了
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' } // 下から100pxで発火
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="fade-in">
      {children}
    </div>
  );
}
