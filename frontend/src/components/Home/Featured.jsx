export default function Featured() {
  const products = [
    { 
      id: 1, 
      name: "Canon EOS R50", 
      price: 199.99,
      image: "https://m.media-amazon.com/images/I/81bWOuRQtmL._UF894,1000_QL80_.jpg",
      rating: 4.8,
      reviews: 24,
      specs: "Full Frame • 45MP",
      badge: "New"
    },
    { 
      id: 2, 
      name: "Nikon Z7 II", 
      price: 249.99,
      image: "https://photo-op.ph/wp-content/uploads/2023/03/1653-Z7II-front.png",
      rating: 4.7,
      reviews: 18,
      specs: "Full Frame • 45.7MP",
      badge: "Popular"
    },
    { 
      id: 3, 
      name: "Sony A7 III", 
      price: 299.99,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1XpTFmPkm61n6BQiPXNSGT3mUK3bEgihwyA&s",
      rating: 4.9,
      reviews: 42,
      specs: "Full Frame • 24.2MP",
      badge: "Best Seller"
    },
    { 
      id: 4, 
      name: "Fujifilm X-T4", 
      price: 199.99,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToDqHoLVO0SKfBMCcz3xLSDgaNxj2WKEqGJQ&s",
      rating: 4.6,
      reviews: 31,
      specs: "APS-C • 26.1MP",
      badge: "New"
    },
    { 
      id: 5, 
      name: "Panasonic GH5", 
      price: 249.99,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvqJwoctVEaTQ0UYlgJdbjF5ZjAg4Kz05ztg&s",
      rating: 4.8,
      reviews: 27,
      specs: "Micro 4/3 • 20.3MP",
      badge: "Video Pro"
    },
    { 
      id: 6, 
      name: "Olympus OM-D E-M1", 
      price: 299.99,
      image: "https://www.olympus.co.jp/technology/museum/camera/products/images/e-m1.jpg",
      rating: 4.5,
      reviews: 19,
      specs: "Micro 4/3 • 20.4MP",
      badge: "Compact"
    },
  ];

  const StarIcon = ({ filled }) => (
    <i className={`fas ${filled ? 'fa-star' : 'fa-star'} ${filled ? 'text-teal-600' : 'text-gray-300'}`}></i>
  );

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon key={i} filled={i < fullStars} />
      );
    }
    
    return stars;
  };

  const getBadgeColors = (badge) => {
    switch (badge.toLowerCase()) {
      case 'new':
        return 'bg-teal-200 text-teal-800';
      case 'popular':
        return 'bg-blue-200 text-blue-800';
      case 'best seller':
        return 'bg-red-200 text-red-800';
      case 'video pro':
        return 'bg-purple-200 text-purple-800';
      case 'compact':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-teal-200 text-teal-800';
    }
  };

  return (
    <div className="antialiased text-gray-900">
      <div className="bg-gray-200 min-h-screen p-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#353535]">Featured Products</p>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#353535] sm:text-4xl lg:text-5xl">
            Featured Rentals
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-normal text-[#353535] lg:text-xl lg:leading-8">
            Our most popular cameras and gear — ready for your next capture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1400px] mt-12 sm:mt-16 lg:mt-20">
          {products.map(({ id, name, price, image, rating, reviews, specs, badge }) => (
            <div
              key={id}
              className="bg-white rounded-lg overflow-hidden shadow-2xl w-full"
            >
              <img 
                className="h-48 w-full object-contain bg-white" 
                src={image} 
                alt={name}
              />
              <div className="p-6">
                <div className="flex items-baseline">
                  <span className={`inline-block ${getBadgeColors(badge)} py-1 px-4 text-xs rounded-full uppercase font-semibold tracking-wide`}>
                    {badge}
                  </span>
                  <div className="ml-2 text-gray-600 text-xs uppercase font-semibold tracking-wide">
                    {specs}
                  </div>
                </div>
                <h4 className="mt-2 font-semibold text-lg leading-tight truncate">{name}</h4>
                <div className="mt-1">
                  <span>${price.toFixed(2)}</span>
                  <span className="text-gray-600 text-sm"> / day</span>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-teal-600 font-semibold flex items-center">
                    {renderStars(rating)}
                  </span>
                  <span className="ml-2 text-gray-600 text-sm">{reviews} reviews</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Font Awesome CDN */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css" 
        rel="stylesheet" 
      />
    </div>
  );
}