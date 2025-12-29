import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import About from './pages/About';
import Articles from './pages/Articles';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-black text-slate-200 overflow-x-hidden selection:bg-primary-500/30">
        {/* Background Mesh/Gradient - Fixed position behind content */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Blurs */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

          {/* Geometric Borders */}
          <div className="absolute top-[15%] left-[10%] w-24 h-24 border-2 border-primary-500/30 rounded-full animate-float opacity-50"></div>
          <div className="absolute top-[40%] right-[15%] w-32 h-32 border-2 border-secondary-500/30 rounded-xl rotate-45 animate-float animation-delay-2000 opacity-50"></div>
          <div className="absolute bottom-[20%] left-[5%] w-16 h-16 border-2 border-cyan-400/30 rounded-lg animate-float animation-delay-4000 opacity-40"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
