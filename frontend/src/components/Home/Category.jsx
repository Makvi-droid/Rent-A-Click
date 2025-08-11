export default function Category() {
  const categories = [
    { 
      id: 1, 
      name: "DSLR", 
      description: "Professional quality",
      image: "https://m.media-amazon.com/images/I/81bWOuRQtmL._UF894,1000_QL80_.jpg"
    },
    { 
      id: 2, 
      name: "DIGITAL", 
      description: "Modern convenience",
      image: "https://www.sony.com.ph/image/9179835e50d48589408a5d9c54c5a990?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF"
    },
    { 
      id: 3, 
      name: "INSTANT", 
      description: "Capture the moment",
      image: "https://www.sweelee.ph/cdn/shop/files/products_2FP16-009077_2FP16-009077_1710367373021_1200x1200.jpg?v=1717081113"
    },
  ];

   return (
    <section className="bg-white w-screen flex flex-col px-4 md:px-16 pt-16 md:pt-20">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[#353535]">Categories</p>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#353535] sm:text-4xl lg:text-5xl">
          Discover cameras by the category
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-normal text-[#353535] lg:text-xl lg:leading-8">
          Browse by style, purpose, or photography type
        </p>
      </div>

      {/* Category boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1400px] mx-auto mt-12 sm:mt-16 lg:mt-20">
        {categories.map(({ id, name, description, image }) => (
          <article 
            key={id}
            className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 pb-8 pt-40 w-full h-96 cursor-pointer hover:scale-105 transition-transform duration-300"
          >
            <img 
              src={image} 
              alt={name} 
              className="absolute inset-0 h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
            <h3 className="z-10 mt-3 text-3xl font-bold text-white">{name}</h3>
            <div className="z-10 gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
              {description}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}