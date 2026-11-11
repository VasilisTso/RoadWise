import React from 'react';
import { motion } from "framer-motion"; // eslint-disable-line
import { FaRoute } from "react-icons/fa";

const Header = () => {
  return (
    <motion.header
      className="sticky top-0 z-40 w-full bg-slate-950 text-white border-b border-slate-800"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm">
            <FaRoute className="text-base" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              ROAD<span className="text-amber-400">WISE</span>
            </h1>
            <span className="hidden sm:inline-block text-xs font-mono-num uppercase tracking-widest text-slate-400 border-l border-slate-800 pl-2.5">
              GR // Toll &amp; Fuel Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-num bg-slate-900 text-slate-300 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ORS Routing Active
          </span>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;