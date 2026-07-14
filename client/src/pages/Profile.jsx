import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Edit3, Heart, MapPin, Phone, Star, Briefcase, Sparkles, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import BusinessCard from '../components/business/BusinessCard';
import Spinner from '../components/common/Spinner';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    setProfileData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
  }, [user]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await api.get('/users/favorites');
        setFavorites(Array.isArray(response.data.data) ? response.data.data : []);
      } catch {
        setFavorites([]);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, []);

  const serviceHighlights = useMemo(() => {
    return favorites.flatMap((business) => {
      const services = Array.isArray(business.servicesList) ? business.servicesList : [];
      return services.slice(0, 3).map((service) => ({
        id: `${business._id}-${service._id}`,
        business,
        service,
      }));
    });
  }, [favorites]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-dark-700 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.28),transparent_30%)]" />
          <div className="relative grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                <Sparkles size={14} /> Customer Profile
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold font-outfit">Your profile and saved services</h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-blue-100/80">
                  Manage your details, keep track of favorite businesses, and jump directly into the services they offer.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-blue-50/90">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  <Heart size={14} /> {favorites.length} favorite businesses
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  <Briefcase size={14} /> {serviceHighlights.length} saved services
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-xl">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={profileData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
                      alt={profileData.fullName || 'User'}
                      className="h-20 w-20 rounded-2xl object-cover border border-white/20"
                    />
                    <span className="absolute -bottom-2 -right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg">
                      <Camera size={14} />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-white">{user?.fullName || 'Your account'}</h2>
                    <p className="truncate text-sm text-blue-100/80">{user?.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-blue-200/70">{user?.role || 'customer'}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={profileData.fullName}
                    onChange={(e) => setProfileData((current) => ({ ...current, fullName: e.target.value }))}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-blue-100/50 outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <input
                    value={profileData.phone}
                    onChange={(e) => setProfileData((current) => ({ ...current, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-blue-100/50 outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <input
                    value={profileData.avatar}
                    onChange={(e) => setProfileData((current) => ({ ...current, avatar: e.target.value }))}
                    placeholder="Avatar URL"
                    className="sm:col-span-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-blue-100/50 outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <Edit3 size={16} />
                    {editing ? 'Hide details' : 'Edit details'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">Favorite Businesses</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Businesses you saved for quick access.</p>
              </div>
              <Link to="/search" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Browse more
              </Link>
            </div>

            {loadingFavorites ? (
              <Spinner size="large" />
            ) : favorites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center">
                <Heart className="mx-auto mb-3 text-gray-400" size={28} />
                <h4 className="font-semibold text-gray-900 dark:text-white">No favorites yet</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Save businesses from search or profile pages to see them here.</p>
                <Link
                  to="/search"
                  className="mt-4 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Find businesses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.slice(0, 3).map((business) => (
                  <BusinessCard key={business._id} business={business} />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">Services For You</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active services from your favorite businesses.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                <Briefcase size={12} /> {serviceHighlights.length}
              </span>
            </div>

            {serviceHighlights.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center">
                <Sparkles className="mx-auto mb-3 text-gray-400" size={28} />
                <h4 className="font-semibold text-gray-900 dark:text-white">No services to show yet</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add favorite businesses that have services listed to see them here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {serviceHighlights.map(({ id, business, service }) => (
                  <div key={id} className="rounded-2xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{business.category?.name || 'Service'}</p>
                        <h4 className="mt-1 font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{service.description}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/business/${business.slug}`)}
                        className="rounded-xl border border-gray-200 dark:border-dark-700 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-800"
                      >
                        View
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-dark-800 px-3 py-1">
                        <Star size={12} className="text-amber-500" />
                        {service.price ? `PKR ${service.price}` : 'Price on request'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-dark-800 px-3 py-1">
                        <Briefcase size={12} />
                        {service.duration ? `${service.duration} mins` : 'Flexible duration'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-dark-800 px-3 py-1">
                        <MapPin size={12} />
                        {business.address?.city || 'Local'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">Quick Access</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fast links to places customers usually go next.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/search" className="rounded-2xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Briefcase size={18} />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Search Services</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Find nearby businesses, ratings, and offers.</p>
            </Link>
            <Link to="/category-select" className="rounded-2xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <Sparkles size={18} />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Pick Categories</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose the service categories you care about most.</p>
            </Link>
            <Link to="/" className="rounded-2xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Phone size={18} />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Back to Home</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Return to the main marketplace overview.</p>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Profile;
