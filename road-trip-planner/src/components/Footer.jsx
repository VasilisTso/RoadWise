import React from 'react'
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-20 py-6 bg-gray-900 text-gray-300 text-center">
        <p>&copy; {new Date().getFullYear()} Road Wise. All rights reserved.</p>
        
        <p className="mt-1">
          Personal Project Made using <span className="text-blue-400 font-medium">React</span> 
        </p>

        <div className="flex justify-center gap-5 mt-4 text-xl">
          <a href="https://github.com/VasilisTso" className="hover:text-violet-600 hover:scale-130 transition-all" target="_blank" rel="noreferrer" aria-label="GitHub">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/vasilis-tsomakas-dev/" className="hover:text-blue-600 hover:scale-130 transition-all" target="_blank" rel="noreferrer" aria-label="Instagram">
            <FaLinkedin />
          </a>
          <a href="mailto:vtsomakas@gmail.com" className="hover:text-red-600 hover:scale-130 transition-all" aria-label="Email">
            <FaEnvelope />
          </a>
        </div>
    </footer>
  )
}

export default Footer