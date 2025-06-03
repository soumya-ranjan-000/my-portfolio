import HeroSection from '../components/HeroSection';
import AwardBadges from '../components/AwardBadges';

function Home() {

  return (
    <>
      <div className="min-h-screen flex flex-col items-center text-center justify-center bg-stone-100">
        <div className="w-full px-4 py-6 sm:px-8 sm:py-10">
          <HeroSection />
        </div>
        {/* Add spacing between HeroSection and AwardBadges */}
        <div className="my-8" />
        <div className="w-full px-4 py-6 sm:px-8 sm:py-10">
          <AwardBadges />
        </div>
      </div>
    </>
  );
}

export default Home;
