import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import About from './pages/About';
import Articles from './pages/Articles';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import ProjectDetail from './pages/ProjectDetail';

// Admin System Imports
import ProtectedRoute from './admin/components/ProtectedRoute';
import OAuthCallback from './admin/pages/OAuthCallback';
import AdminDashboard from './admin/pages/AdminDashboard';
import ProjectEditor from './admin/pages/ProjectEditor';
import ArticleEditor from './admin/pages/ArticleEditor';
import StorageSettings from './admin/pages/StorageSettings';

// Hidden Keyboard Shortcut Handler
function AdminShortcutListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

// Router content switcher that isolates Admin console layouts from standard website layouts
function MainContentLayout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminPath) {
      document.documentElement.classList.add('admin-theme');
    } else {
      document.documentElement.classList.remove('admin-theme');
    }
    return () => {
      document.documentElement.classList.remove('admin-theme');
    };
  }, [isAdminPath]);

  if (isAdminPath) {
    return (
      <main className="flex-grow w-full min-h-screen z-10 relative">
        <Routes>
          <Route path="/admin/callback" element={<OAuthCallback />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/storage" element={<ProtectedRoute><StorageSettings /></ProtectedRoute>} />
          <Route path="/admin/projects/new" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
          <Route path="/admin/projects/:slug" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
          <Route path="/admin/articles/new" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
          <Route path="/admin/articles/:slug" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="relative z-10 flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-16 sm:px-6 lg:px-8">
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
  );
}

function App() {
  return (
    <Router>
      <AdminShortcutListener />
      <div className="relative min-h-screen bg-black text-slate-200 overflow-x-hidden selection:bg-primary-500/30">


        {/* Content Wrapper */}
        <MainContentLayout />
      </div>
    </Router>
  );
}

export default App;
