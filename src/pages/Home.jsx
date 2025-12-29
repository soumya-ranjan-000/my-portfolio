import HeroSection from '../components/HeroSection';
import AwardBadges from '../components/AwardBadges'; // Keep this for now, will design later

function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full">
        <HeroSection />
      </section>

      {/* Award Badges (Will redesign next) */}
      <section className="py-20">
        <h2 className="text-3xl font-heading font-bold text-center mb-12 text-white">
          <span className="gradient-text">Certifications & Awards</span>
        </h2>
        <AwardBadges />
      </section>
    </div>
  );
}

export default Home;
