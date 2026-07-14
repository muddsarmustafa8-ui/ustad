import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Globe, ShieldCheck, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/common/Spinner';
import api from '../services/api';
import { getSocket } from '../services/socket';

const BusinessProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/businesses/profile/${slug}`);
        if (res.data.success) setBusiness(res.data.data);
        else setBusiness(null);
      } catch { setBusiness(null); }
      finally { setLoading(false); }
    };
    fetch();
  }, [slug]);

  const loadReviews = async (businessId) => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`/reviews/business/${businessId}`);
      if (res.data.success) setReviews(res.data.data || []);
      else setReviews([]);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (!business) return;
    loadReviews(business._id);
  }, [business?._id]);

  useEffect(() => {
    if (!business) return;
    const socket = getSocket();
    const handleReviewCreated = (payload) => {
      if (payload?.businessId === business._id) {
        loadReviews(business._id);
      }
    };

    socket.on('review:created', handleReviewCreated);

    return () => {
      socket.off('review:created', handleReviewCreated);
    };
  }, [business?._id]);

  if (loading) return <div className="pt-24"><Spinner size="large" /></div>;
  if (!business) return <div className="pt-24 text-center text-gray-500">Business not found.</div>;

  const verificationBadge = { bronze: '🥉', silver: '🥈', gold: '🥇', premium: '💎' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      {/* Cover Image */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={business.coverImages?.[0] || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80'}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 pb-16">
        {/* Business Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-dark-700 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Logo */}
            {business.logo && (
              <img src={business.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0" />
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-outfit">{business.name}</h1>
                {business.isVerified && (
                  <span className="text-lg" title={`${business.verificationLevel} verified`}>
                    {verificationBadge[business.verificationLevel] || '✅'}
                  </span>
                )}
                {business.isFeatured && (
                  <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                    ⚡ Featured
                  </span>
                )}
              </div>

              {business.category && (
                <span className="inline-block text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full font-medium mt-1">
                  {business.category.icon} {business.category.name}
                </span>
              )}

              {business.address && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <MapPin size={14} />
                  {business.address.street && `${business.address.street}, `}
                  {business.address.city}, {business.address.state}
                </div>
              )}

              <div className="flex items-center gap-3 mt-3">
                <StarRating rating={business.ratingAverage || 0} count={business.reviewCount || 0} />
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{business.viewCount?.toLocaleString()} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              {business.phone && (
                <a href={`tel:${business.phone}`}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md"
                >
                  <Phone size={16} /> Call Now
                </a>
              )}
              {business.whatsapp && (
                <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-md"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-dark-800 rounded-xl p-1 border border-gray-100 dark:border-dark-700 mb-6 overflow-x-auto">
          {['about', 'services', 'gallery', 'reviews', 'hours'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-lg capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'about' && (
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-outfit">About</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{business.description}</p>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-outfit">Services Offered</h2>
              {(business.servicesList || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  This business has not added services yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.servicesList.map((svc) => (
                    <div key={svc._id} className="rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{svc.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5"><Clock size={10} className="inline mr-0.5" />{svc.duration} mins</div>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">PKR {svc.price}</span>
                      </div>
                      <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{svc.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-outfit">Gallery</h2>
              {(business.gallery || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No gallery images available yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {business.gallery.map((item, index) => (
                    <a key={`${item}-${index}`} href={item} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-gray-100 dark:border-dark-700">
                      <img src={item} alt={`Gallery ${index + 1}`} className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-outfit">Customer Reviews</h2>
              {loadingReviews ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this business!</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-gray-100 dark:border-dark-700 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">{r.user?.fullName?.[0] || '?'}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.user?.fullName || 'Customer'}</div>
                          <StarRating rating={r.rating} size={12} />
                        </div>
                        <span className="ml-auto text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{r.review}</p>
                      {r.ownerReply && (
                        <div className="mt-3 ml-8 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Business Reply</p>
                          <p className="text-sm text-blue-900 dark:text-blue-100">{r.ownerReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-100 dark:border-dark-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-outfit">Working Hours</h2>
              <div className="space-y-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                  const hours = business.workingHours?.find(h => h.day === day);
                  return (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-700 last:border-0">
                      <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-300">{day}</span>
                      {hours?.isClosed ? (
                        <span className="text-xs text-red-500 font-medium">Closed</span>
                      ) : hours ? (
                        <span className="text-xs text-gray-600 dark:text-gray-400">{hours.open} – {hours.close}</span>
                      ) : (
                        <span className="text-xs text-gray-500">9:00 AM – 9:00 PM</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessProfile;
