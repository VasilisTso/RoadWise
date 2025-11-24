import React from 'react'
import { motion } from "framer-motion"; // eslint-disable-line

const Hero = () => {
  return (
    <motion.section className='text-center py-16 px-4 max-w-4xl mx-auto'
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <h2 className='text-2xl md:text-3xl font-semibold text-gray-800 leading-tight'>
        Find distance & routes between cities, and calculate full trip costs.
      </h2>

      <p className='text-gray-700 mt-4 text-lg'>
        Enter your start & destination and get fuel cost, toll expenses, directions, and alternative routes.
      </p>

      <h3 className="text-xl font-semibold mt-10 text-gray-900">Instructions</h3>

      <p className="text-gray-700 text-lg mt-2">
        Fill in the fields, set your fuel price, consumption, passengers, and choose a route type.
      </p>
    </motion.section>
  )
}

export default Hero