import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, index = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/search?category=${category.slug}`);
  };

  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-orange-400 to-red-500',
    'from-emerald-400 to-teal-600',
    'from-purple-500 to-violet-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-blue-500',
    'from-fuchsia-500 to-purple-600',
    'from-lime-400 to-emerald-600',
    'from-sky-400 to-cyan-600',
    'from-red-400 to-rose-600',
    'from-indigo-400 to-violet-600',
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -4 }}
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-shadow`}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />

        <span className="text-4xl">{category.icon || '🏢'}</span>
        <span className="text-sm font-bold text-white font-outfit text-center leading-tight">
          {category.name}
        </span>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
