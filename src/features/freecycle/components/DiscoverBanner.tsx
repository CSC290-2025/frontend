import { useEffect, useRef, useState } from 'react';
import { banners } from '@/features/freecycle/pages/Constants';

export default function DiscoverBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const scrollLeft = bannerRef.current.scrollLeft;
        const width = bannerRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / width);
        setCurrentBanner(newIndex);
      }
    };

    const banner = bannerRef.current;
    if (banner) {
      banner.addEventListener('scroll', handleScroll, { passive: true });
      return () => banner.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="mb-2">
      <div
        ref={bannerRef}
        className="scrollbar-hide w-full snap-x snap-mandatory overflow-x-auto rounded-3xl shadow-lg"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`relative flex h-64 min-w-full snap-start items-center justify-center overflow-hidden rounded-3xl`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url('${banner.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="p-4 text-center text-black">
                <h2 className="mb-2 text-3xl font-bold">{banner.title}</h2>
                <p className="text-lg opacity-90">{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Indicators */}
      <div className="flex justify-center gap-2 pt-6 pb-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentBanner === index ? 'w-8 bg-cyan-500' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
    </div>
  );
}
