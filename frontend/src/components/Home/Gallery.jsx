import React, { useState } from 'react';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Sample images with different aspect ratios to create the masonry effect
  const images = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop&crop=entropy&auto=format",
      alt: "Mountain landscape at sunrise",
      span: "row-span-2"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Dense forest canopy",
      span: "row-span-1"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=600&fit=crop&crop=entropy&auto=format",
      alt: "Ocean waves",
      span: "row-span-1"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=800&fit=crop&crop=entropy&auto=format",
      alt: "Rolling hills",
      span: "row-span-2"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Tropical beach",
      span: "row-span-1"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop&crop=entropy&auto=format",
      alt: "Desert dunes",
      span: "row-span-1"
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Misty lake",
      span: "row-span-1"
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Wide mountain vista",
      span: "col-span-2 row-span-1"
    },
    {
      id: 9,
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop&crop=entropy&auto=format",
      alt: "Starry night sky",
      span: "row-span-1"
    }
  ];

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20 xl:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-700">Gallery</p>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Your Next Masterpiece Starts Here
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-normal text-gray-700 lg:text-xl lg:leading-8">
            Be inspired by the incredible moments our customers have captured
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px] mt-12 sm:mt-16 lg:mt-20">
          {images.map((image) => (
            <div
              key={image.id}
              className={`${image.span} group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02]`}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                <p className="text-white font-medium text-lg drop-shadow-lg">
                  {image.alt}
                </p>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for selected image */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] animate-in fade-in zoom-in duration-300">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-lg font-medium drop-shadow-lg">
                  {selectedImage.alt}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="group relative px-8 py-4 bg-gray-50 border border-gray-300 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-900 hover:border-gray-900 hover:text-white transform hover:scale-105 transition-all duration-300">
            <span className="relative z-10">Start Creating Today</span>
          </button>
        </div>
      </div>
    </section>
  );
}