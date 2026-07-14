import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, MapPin, Star, Clock, Sparkles } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import CategoryCard from '../components/business/CategoryCard';
import BusinessCard from '../components/business/BusinessCard';
import api from '../services/api';
import { getSocket } from '../services/socket';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }),
};

const Home = () => {
  const navigate = useNavigate();
  const [homeFeed, setHomeFeed] = useState({
    featuredBusinesses: [],
    popularCategories: [],
    recentBusinesses: [],
    topRatedBusinesses: [],
    trendingServices: [],
    latestReviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = () => {
      api.get('/marketplace/home')
        .then((r) => {
          if (r.data.success) setHomeFeed(r.data.data || {});
        })
        .catch(() => setHomeFeed({ featuredBusinesses: [], popularCategories: [], recentBusinesses: [], topRatedBusinesses: [], trendingServices: [], latestReviews: [] }))
        .finally(() => setLoading(false));
    };

    fetchFeed();

    // Real-time updates via Socket.io
    const socket = getSocket();
    socket.on('business:created', fetchFeed);
    socket.on('business:updated', fetchFeed);
    socket.on('service:created', fetchFeed);
    socket.on('review:created', fetchFeed);

    return () => {
      socket.off('business:created', fetchFeed);
      socket.off('business:updated', fetchFeed);
      socket.off('service:created', fetchFeed);
      socket.off('review:created', fetchFeed);
    };
  }, []);

  const handleSearch = ({ query, city, latitude, longitude }) => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (city) params.set('city', city);
    if (latitude) params.set('latitude', latitude);
    if (longitude) params.set('longitude', longitude);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="overflow-x-hidden">
      {/* ─────────────── HERO SECTION ─────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-dark-900 dark:via-[#0d1b3e] dark:to-[#1a1060] -z-10" />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-5xl w-full space-y-6"
        >
          {/* Tag */}
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Sparkles size={14} /> UstadHub - Book Smart. Live Easy.
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} custom={1}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white font-outfit leading-tight tracking-tight"
          >
            Find Trusted<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Local Services
            </span>{' '}
            Near You
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} custom={2}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Browse real businesses, compare services, and book trusted local professionals from live MongoDB-backed listings.
          </motion.p>

          {/* Search Bar */}
          <motion.div variants={fadeUp} custom={3} className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </motion.div>

          {/* Stats Row */}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-gray-400" />
          </div>
        </motion.div>
      </section>

      {/* ─────────────── CATEGORIES ─────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">Browse by Category</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Find any service you need from our curated categories</p>
          </motion.div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading live marketplace data...</div>
          ) : homeFeed.popularCategories?.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {homeFeed.popularCategories.slice(0, 12).map((cat, i) => (
                <CategoryCard key={cat._id || i} category={cat} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No categories have been published yet.</div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-900/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            >
              View all categories <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── FEATURED BUSINESSES ─────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">Featured Businesses</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Top-rated, verified service providers our customers trust</p>
          </motion.div>

          {homeFeed.featuredBusinesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeFeed.featuredBusinesses.map((biz, i) => (
                <motion.div key={biz._id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <BusinessCard business={biz} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No featured businesses are available yet.</div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Explore All Businesses <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── RECENT BUSINESSES ─────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">Recently Joined Businesses</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Fresh listings created by real business owners</p>
          </motion.div>
          {homeFeed.recentBusinesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeFeed.recentBusinesses.map((biz, i) => (
                <motion.div key={biz._id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <BusinessCard business={biz} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No businesses published yet.</div>
          )}
        </div>
      </section>

      {/* ─────────────── TOP RATED ─────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">Top Rated Businesses</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Businesses with the strongest customer feedback</p>
          </motion.div>
          {homeFeed.topRatedBusinesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeFeed.topRatedBusinesses.map((biz, i) => (
                <motion.div key={biz._id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <BusinessCard business={biz} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No rated businesses available yet.</div>
          )}
        </div>
      </section>

      {/* ─────────────── TRENDING SERVICES ─────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">Trending Services</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Active services customers are viewing right now</p>
          </motion.div>
          {homeFeed.trendingServices?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {homeFeed.trendingServices.map((service) => (
                <div key={service._id} className="rounded-2xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{service.category?.name || 'Service'}</div>
                      <h3 className="mt-1 font-bold text-gray-900 dark:text-white">{service.name}</h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{service.description}</p>
                    </div>
                    <span className="rounded-full bg-white dark:bg-dark-800 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300">PKR {service.price}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {service.duration} mins</span>
                    <button onClick={() => navigate(`/business/${service.business?.slug}`)} className="font-semibold text-blue-600 dark:text-blue-400">View business</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No services published yet.</div>
          )}
        </div>
      </section>

      {/* ─────────────── LATEST REVIEWS ─────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-outfit">Latest Reviews</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Customer feedback pulled directly from the marketplace</p>
          </motion.div>

          {homeFeed.latestReviews?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {homeFeed.latestReviews.map((review, i) => (
                <motion.div key={review._id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-gray-100 dark:border-dark-700 shadow-sm">
                  <div className="flex items-center gap-1 mb-4 text-amber-500">{[...Array(Math.max(1, review.rating || 0))].map((_, s) => <span key={s}>★</span>)}</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">"{review.review}"</p>
                  <div className="flex items-center gap-3">
                    <img src={review.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} alt={review.user?.fullName || 'Customer'} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{review.user?.fullName || 'Customer'}</div>
                      <div className="text-xs text-gray-400">{review.business?.name || 'Marketplace review'}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No customer reviews yet.</div>
          )}
        </div>
      </section>

      {/* ─────────────── CTA BANNER ─────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-center overflow-hidden shadow-2xl shadow-blue-700/30"
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full" />

            <h2 className="text-4xl font-extrabold text-white font-outfit mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of local businesses already getting more customers through ServeLocal. Setup takes less than 5 minutes.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4 text-blue-700 bg-white font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-xl"
            >
              List Your Business Free <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
