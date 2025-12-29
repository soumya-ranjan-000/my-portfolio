import { motion } from 'framer-motion';
import { FaPaperPlane, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

function Contact() {
    return (
        <div className="py-20 px-4 max-w-4xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
                    Get in <span className="gradient-text">Touch</span>
                </h2>
                <p className="text-slate-400 text-lg">
                    Have a question or want to work together? Drop me a message!
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-8"
                >
                    <div className="glass-card p-6 flex items-start gap-4">
                        <div className="p-3 bg-primary-500/10 rounded-lg text-primary-400">
                            <FaEnvelope size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Email</h3>
                            <p className="text-slate-400">hello@example.com</p>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex items-start gap-4">
                        <div className="p-3 bg-secondary-500/10 rounded-lg text-secondary-400">
                            <FaMapMarkerAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Location</h3>
                            <p className="text-slate-400">Bhubaneswar, India</p>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-8"
                >
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                            <input
                                type="text"
                                className="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                            <textarea
                                rows="4"
                                className="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
                                placeholder="Your message..."
                            ></textarea>
                        </div>
                        <button
                            type="button" // Type button to prevent refresh for demo
                            className="w-full btn-primary flex items-center justify-center gap-2 group"
                        >
                            <span>Send Message</span>
                            <FaPaperPlane className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default Contact;