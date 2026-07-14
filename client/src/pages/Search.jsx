import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BusinessCard from '../components/business/BusinessCard';
import SearchBar from '../components/common/SearchBar';
import Spinner from '../components/common/Spinner';
import api from '../services/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    featuredOnly: searchParams.get('featuredOnly') === 'true',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.set('page', page);
      params.set('limit', 9);
      if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
      if (filters.featuredOnly) params.set('featuredOnly', 'true');
      if (filters.minRating) params.set('minRating', filters.minRating);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);

      const res = await api.get(`/search/businesses?${params.toString()}`);
      if (res.data.success && res.data.data?.businesses?.length) {
        setBusinesses(res.data.data.businesses);
        setTotal(res.data.data.total);
      } else {
        setBusinesses([]);
        setTotal(0);
      }
    } catch {
      setBusinesses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, [searchParams, page, filters]);

  const handleSearch = ({ query, city }) => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('query', query); else params.delete('query');
    if (city) params.set('city', city); else params.delete('city');
    params.delete('page');
    setSearchParams(params);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-24 pb-16">
      {/* Search Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <SearchBar
            onSearch={handleSearch}
            initialQuery={searchParams.get('query') || ''}
            initialCity={searchParams.get('city') || ''}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 p-5 shadow-sm sticky top-28">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Filters
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.verifiedOnly}
                    onChange={e => setFilters(f => ({ ...f, verifiedOnly: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Verified only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.featuredOnly}
                    onChange={e => setFilters(f => ({ ...f, featuredOnly: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Featured only</span>
                </label>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Min Rating</label>
                  <select value={filters.minRating}
                    onChange={e => setFilters(f => ({ ...f, minRating: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Sort By</label>
                  <select value={filters.sortBy}
                    onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="highest_rated">Highest Rated</option>
                    <option value="nearest">Nearest</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? 'Searching...' : `${total} businesses found`}
              </p>
            </div>

            {loading ? (
              <Spinner size="large" />
            ) : businesses.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No businesses found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters, or check back after owners publish new listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {businesses.map((biz, i) => (
                  <motion.div key={biz._id || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <BusinessCard business={biz} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 9 && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(Math.ceil(total / 9))].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
