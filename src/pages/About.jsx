import { motion } from 'framer-motion';

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

            {/* Skills Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
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