import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900">RoadWise</span>
          <span className="text-slate-300">•</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          <span className="text-slate-300">•</span>
          <span>
            Built with <span className="font-semibold text-slate-900">React &amp; OpenRouteService</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-base text-slate-500">
          <a
            href="https://github.com/VasilisTso"
            className="hover:text-slate-900 transition-colors"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/vasilis-tsomakas-dev/"
            className="hover:text-blue-600 transition-colors"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="mailto:vtsomakas@gmail.com"
            className="hover:text-amber-600 transition-colors"
            aria-label="Email"
          >
            <FaEnvelope />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;