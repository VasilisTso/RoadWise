import React from 'react'
import { motion } from "framer-motion"; // eslint-disable-line
import { FaRoute } from "react-icons/fa";

const Header = () => {
  return (
    <motion.header className='w-full bg-gray-900/80 backdrop-blur-md text-white py-6 shadow-lg'
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      <div className='max-w-5xl mx-auto px-4 text-center'>
        <h1 className='text-3xl font-bold flex justify-center items-center gap-3'>
          RoadWise <FaRoute className="text-blue-400 text-4xl" />
        </h1>
        <p className='text-gray-300 mt-1'>Plan your road trip expenses easily</p>
      </div>
    </motion.header>
  )
}

export default Header