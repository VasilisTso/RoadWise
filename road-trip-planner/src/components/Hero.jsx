import React from 'react';
import { motion } from "framer-motion"; // eslint-disable-line

const Hero = () => {
  return (
    <motion.section
      className="bg-white border border-slate-200/90 rounded-xl px-5 py-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-num font-semibold text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
            Route &amp; Expense Dispatch
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tracking-tight">
          Calculate exact highway tolls, fuel burn, and passenger splits across Greece.
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 shrink-0">
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
          <span className="font-mono-num font-bold text-slate-900">01</span>
          <span>Set Origin &amp; Destination</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
          <span className="font-mono-num font-bold text-slate-900">02</span>
          <span>Tune Fuel &amp; Vehicle</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
          <span className="font-mono-num font-bold text-slate-900">03</span>
          <span>Inspect Tolls &amp; Cost</span>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;