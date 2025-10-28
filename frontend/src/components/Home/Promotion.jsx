import {
  Camera,
  Clock,
  Star,
  Gift,
  ArrowRight,
  Zap,
  Shield,
  Heart,
  Users,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function Promotion() {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [currentOffer, setCurrentOffer] = useState(0);
  const [activePromotions, setActivePromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Get all promotions without any query constraints to avoid index issues
    const promotionsRef = collection(db, "promotions");

    const unsubscribe = onSnapshot(
      promotionsRef,
      (snapshot) => {
        const promos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter and sort client-side to avoid needing composite index
        const validPromos = promos
          .filter((promo) => {
            // Must be explicitly active
            if (promo.isActive !== true) return false;

            // No dates set means it's always live (as long as isActive is true)
            if (!promo.startDate || !promo.endDate) return true;

            const now = new Date();
            const start = new Date(promo.startDate + "T00:00:00");
            const end = new Date(promo.endDate + "T23:59:59");

            // Only show if current date/time is within range
            return now >= start && now <= end;
          })
          .sort((a, b) => (a.priority || 999) - (b.priority || 999)); // Sort by priority

        setActivePromotions(validPromos);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching promotions:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activePromotions.length === 0) return;

    const currentPromo = activePromotions[currentOffer];
    if (!currentPromo || !currentPromo.endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(currentPromo.endDate + "T23:59:59").getTime();
      const difference = end - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [activePromotions, currentOffer]);

  useEffect(() => {
    if (activePromotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % activePromotions.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activePromotions.length]);

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Promo code "${code}" copied to clipboard!`);
  };

  const benefits = [
    {
      icon: Shield,
      title: "Insured Equipment",
      description: "Full coverage on all rentals",
    },
    {
      icon: Clock,
      title: "24h Fast Delivery",
      description: "Get your gear when you need it",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Professional guidance included",
    },
    {
      icon: Heart,
      title: "Customer Loved",
      description: "4.9/5 rating from 10k+ users",
    },
  ];

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading promotions...</p>
        </div>
      </section>
    );
  }

  // Show error state if there's an error
  if (error) {
    console.error("Promotion error:", error);
    return null; // Silently hide the section if there's an error
  }

  // Don't render section at all if no active promotions
  if (activePromotions.length === 0) {
    return null;
  }

  const currentPromotion = activePromotions[currentOffer];

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-32 right-20 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-70"></div>
        <div className="absolute bottom-32 right-10 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-30"></div>

        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-24 h-24 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div
          className={`text-center mb-20 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-red-500/30 backdrop-blur-sm mb-6 animate-pulse">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm font-bold uppercase tracking-widest">
              Flash Sale Active
            </span>
          </div>

          <div className="relative mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-4 relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                {currentPromotion.discount}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30 blur-3xl -z-10"></div>
            </h1>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {currentPromotion.title}
            </h2>

            <p className="text-xl text-gray-400 mb-6 max-w-2xl mx-auto">
              {currentPromotion.description}
            </p>

            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl border border-purple-400/30 backdrop-blur-lg">
              <Gift className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Use code:</span>
              <span className="font-mono font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {currentPromotion.code}
              </span>
              <button
                onClick={() => copyPromoCode(currentPromotion.code)}
                className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Copy
              </button>
            </div>
          </div>

          {currentPromotion.showTimer !== false && currentPromotion.endDate && (
            <div className="mb-12">
              <h3 className="text-lg text-gray-400 mb-4">
                ⏰ Limited Time Offer Ends In:
              </h3>
              <div className="flex justify-center gap-4">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="relative">
                    <div className="bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 rounded-2xl p-4 border border-purple-400/30 backdrop-blur-lg min-w-[80px]">
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {value.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        {unit}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-lg opacity-50 animate-pulse -z-10"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <span className="relative flex items-center gap-3">
                <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Shop Now & Save
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>

            <button className="group px-8 py-4 border-2 border-purple-400/50 text-purple-400 font-bold rounded-xl hover:bg-purple-400/10 hover:border-purple-400 transition-all duration-300">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Browse Catalog
              </span>
            </button>
          </div>

          {activePromotions.length > 1 && (
            <div className="flex justify-center gap-2 mb-8">
              {activePromotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentOffer(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentOffer
                      ? "bg-purple-400 w-8"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className={`transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/80 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-400/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-lg"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                  <div className="relative z-10">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {benefit.title}
                    </h3>

                    <p className="text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
