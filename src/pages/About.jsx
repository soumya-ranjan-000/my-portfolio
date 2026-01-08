import { motion } from 'framer-motion';
import { aboutMeData } from '../data/aboutMe';
import Overview from '../components/about/Overview';
import Timeline from '../components/about/Timeline';
import Certifications from '../components/about/Certifications';
import Awards from '../components/about/Awards';

function About() {
    const skills = [
        { title: "Languages", items: ["Python", "Java", "JavaScript", "C#"] },
        { title: "Frontend", items: ["React", "Tailwind CSS", "HTML5/CSS3", "Framer Motion"] },
        { title: "Automation", items: ["Selenium", "Playwright", "Robot Framework", "Appium"] },
        { title: "Tools", items: ["Git", "Docker", "Jenkins", "JIRA", "Postman"] },
    ];

    return (
        <div className="py-20 px-4 max-w-6xl mx-auto w-full">
            {/* Bio Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row gap-12 items-center mb-20"
            >
                <div className="md:w-1/2">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
                        About <span className="gradient-text">Me</span>
                    </h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-6">
                        I'm a passionate SDET and Automation Engineer with a knack for building robust testing frameworks and modern web applications.
                        My journey involves constantly learning new technologies and applying them to solve real-world problems.
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                        When I'm not coding, you can find me exploring new tech trends, contributing to open source, or gaming.
                        I believe in the power of clean code and efficient automation to make software delivery smoother and faster.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <a
                            href="/resume.pdf"
                            download
                            className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Resume
                        </a>
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 border border-white/10 text-white rounded-md font-medium hover:bg-white/5 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Resume
                        </a>
                    </div>
                </div>
                {/* Placeholder for Image or Abstract Graphic */}
                <div className="md:w-1/2 flex justify-center">
                    <div className="relative w-64 h-64 md:w-80 md:h-80">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-2xl blur-2xl opacity-20 animate-blob"></div>
                        <div className="relative w-full h-full rounded-2xl rotate-3 border border-white/10 overflow-hidden shadow-2xl group">
                            <img
                                src="/images/about.png"
                                alt="About Me"
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://ui-avatars.com/api/?name=Soumya+Ranjan&background=0D8ABC&color=fff&size=512";
                                }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Overview Section */}
            <Overview data={aboutMeData.overview} />

            {/* Work History Section */}
            <Timeline
                title="Work History"
                data={aboutMeData.workHistory}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                }
            />

            {/* Education Section */}
            <Timeline
                title="Education"
                data={aboutMeData.education}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                }
            />

            {/* Certifications & Awards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-10">
                <Certifications data={aboutMeData.certifications} />
                <Awards data={aboutMeData.awards} />
            </div>

            {/* Skills Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="pt-10"
            >
                <h3 className="text-3xl font-heading font-bold text-white mb-10 text-center">Technical <span className="text-primary-400">Skills</span></h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {skills.map((category, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="glass-card p-6 rounded-xl hover:border-primary-500/30 transition-colors"
                        >
                            <h4 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{category.title}</h4>
                            <div className="flex flex-wrap gap-2">
                                {category.items.map((item, i) => (
                                    <span key={i} className="text-sm px-3 py-1 bg-white/5 text-slate-300 rounded-md border border-white/5 hover:bg-white/10 transition-colors">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default About;