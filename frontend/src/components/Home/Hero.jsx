import bgImage from "../../assets/images/hero-bg.jpg";

export default function Hero() {
  return (
    <section
      className="w-screen min-h-screen flex flex-col items-center justify-center px-4 md:px-16"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-full md:max-w-5xl text-center">
        <h1 className="font-medium text-white leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-7xl">
          Your Shot, Your Story — Rent <br />
          the Gear, Capture the Magic
        </h1>
        <p className="mt-2 font-extralight text-white text-sm sm:text-base md:text-lg leading-tight max-w-lg mx-auto">
          High-quality cameras and lenses, flexible rentals, and
          prices that fit your budget
        </p>
      </div>

      <div className="mt-6 flex">
        <button className="bg-white text-[#353535] rounded-[10px] px-6 py-2">
          Rent now
        </button>
      </div>
    </section>
  );
}
