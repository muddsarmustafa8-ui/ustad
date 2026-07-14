import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-gradient-to-br from-dark-900 to-[#0d1b3e] flex flex-col items-center justify-center text-center px-4">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <div className="text-[10rem] font-extrabold font-outfit leading-none bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-transparent select-none">
        404
      </div>
      <h1 className="text-3xl font-bold text-white font-outfit mt-4">Page Not Found</h1>
      <p className="text-gray-400 mt-3 max-w-sm mx-auto">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div className="flex items-center justify-center gap-4 mt-8">
        <Link to="/" className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/30">
          <Home size={16} /> Go Home
        </Link>
        <Link to="/search" className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-200 border border-white/10 hover:bg-white/5 rounded-xl transition-colors">
          <Search size={16} /> Browse Services
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFound;
