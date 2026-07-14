import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CategorySelect = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const toggle = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleContinue = async () => {
    if (selected.length === 0) { toast.error('Please select at least one category of interest.'); return; }
    try {
      setLoading(true);
      await api.post('/users/preferences', { categories: selected });
    } catch { /* non-critical */ }
    toast.success('Preferences saved!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-dark-900 dark:via-[#0d1b3e] dark:to-[#1a1060] px-4 py-24 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-3xl font-extrabold font-outfit bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent block mb-4">
            ServeLocal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">
            What services do you need?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">
            Select your interests so we can personalize your experience
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 mb-10"
        >
          {loadingCategories ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading categories from the marketplace...</div>
          ) : categories.length > 0 ? categories.map((cat, i) => {
            const isSelected = selected.includes(cat._id);
            return (
              <motion.button
                key={cat._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(cat._id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <Check size={10} className="text-blue-600" strokeWidth={3} />
                  </div>
                )}
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs font-medium text-center leading-tight transition-colors ${isSelected ? 'text-white' : 'text-gray-700 dark:text-white'}`}>{cat.name}</span>
              </motion.button>
            );
          }) : (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No categories are available yet.</div>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {selected.length > 0 ? `${selected.length} selected` : 'None selected yet — select at least one'}
          </p>
          <button
            onClick={handleContinue}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold text-lg bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-xl shadow-blue-600/30 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Continue to ServeLocal'}
            <ArrowRight size={20} />
          </button>
          <div className="mt-4">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Skip for now →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CategorySelect;
