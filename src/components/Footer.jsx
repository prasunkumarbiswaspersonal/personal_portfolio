import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const LINKEDIN_URL = 'https://www.linkedin.com/in/prasun-kumar-biswas-789668415/';
const GITHUB_URL = 'https://github.com/prasunkumarbiswaspersonal';
const CONTACT_EMAIL = 'prasun.oct27@gmail.com';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hud-frame bg-[#020610]/85 backdrop-blur-md border-t border-sensor/20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <span className="font-mono text-2xl font-bold text-gradient">
              Prasun Kumar Biswas
            </span>
            <p className="text-base text-phosphor/90 mt-1.5 font-medium">
              Building at the intersection of hardware, aerospace, and AI.
            </p>
          </div>

          <div className="flex space-x-6">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="text-phosphor/80 hover:text-sensor transition-colors p-1"
            >
              <span className="sr-only">GitHub</span>
              <FaGithub className="h-7 w-7" />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="text-phosphor/80 hover:text-sensor transition-colors p-1"
            >
              <span className="sr-only">LinkedIn</span>
              <FaLinkedin className="h-7 w-7" />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label="Send Email"
              className="text-phosphor/80 hover:text-sensor transition-colors p-1"
            >
              <span className="sr-only">Email</span>
              <Mail className="h-7 w-7" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-sensor/20 pt-8 flex items-center justify-center">
          <p className="text-base text-phosphor/80 font-mono text-center">
            &copy; {currentYear} Prasun Kumar Biswas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
