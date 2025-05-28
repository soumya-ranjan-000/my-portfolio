import { motion } from 'framer-motion';
import AwardCard from '../components/AwardCard';

const awards = [
  {
    title: 'Top 1% Automation Engineer',
    org: 'Wipro',
    year: '2024',
    logo: 'src/assets/wip_logo.png',
    description: 'Awarded for exceptional contributions to automation framework design.',
  },
  {
    title: 'LambdaTest Hackathon Finalist',
    org: 'LambdaTest',
    year: '2023',
    logo: "src/assets/lambdatest.png",
    description: 'Recognized in global hackathon for Playwright automation.',
  },
  // Add more...
];

function AwardSection() {
  return (
  <section className="mt-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">🏆 Awards & Recognitions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AwardCard {...award} />
            </motion.div>
          ))}
        </div>
      </section>
  );
}

export default AwardSection;