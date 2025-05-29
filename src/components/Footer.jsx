import { FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="w-full bg-blue-700 text-white py-6 fixed bottom-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Soumya Ranjan. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="https://www.linkedin.com/in/soumya-ranjan-ghadei7609/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={24} className="hover:text-gray-300 transition" />
          </a>
          <a href="https://www.facebook.com/your-profile" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={24} className="hover:text-gray-300 transition" />
          </a>
          <a href="https://twitter.com/your-profile" target="_blank" rel="noopener noreferrer">
            <FaTwitter size={24} className="hover:text-gray-300 transition" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;