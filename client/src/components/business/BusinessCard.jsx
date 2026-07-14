import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Star, ShieldCheck, Zap } from 'lucide-react';

const BusinessCard = ({ business }) => {
  const navigate = useNavigate();

  if (!business) return null;

  const {
    name,
    slug,
    logo,
    coverImages,
    address,
    category,
    ratingAverage,
    reviewCount,
    isVerified,
    verificationLevel,
    isFeatured,
    phone,
    whatsapp,
  } = business;

  const coverImage = coverImages && coverImages.length > 0
    ? coverImages[0]
    : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80';

  const handleClick = () => {
    navigate(`/business/${slug}`);
  };

  const verificationColors = {
    bronze: 'text-amber-600',
    silver: 'text-slate-500',
    gold: 'text-yellow-500',
    premium: 'text-purple-500',
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-700 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
            <Zap size={10} fill="white" />
            Featured
          </div>
        )}

        {/* Logo overlay */}
        {logo && (
          <div className="absolute bottom-3 left-4">
            <img
              src={logo}
              alt={`${name} logo`}
              className="w-12 h-12 rounded-xl border-2 border-white shadow-md object-cover bg-white"
            />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Name + Verification */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 font-outfit truncate text-base leading-tight">
            {name}
          </h3>
          {isVerified && (
            <ShieldCheck
              size={18}
              className={`shrink-0 mt-0.5 ${verificationColors[verificationLevel] || 'text-blue-500'}`}
              title={`${verificationLevel} verified`}
            />
          )}
        </div>

        {/* Category */}
        {category && (
          <span className="inline-block text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full font-medium mb-2">
            {category.icon} {category.name}
          </span>
        )}

        {/* City */}
        {address?.city && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <MapPin size={12} />
            <span>{address.city}, {address.state || address.country}</span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {ratingAverage ? ratingAverage.toFixed(1) : '0.0'}
          </span>
          <span className="text-xs text-gray-400">({reviewCount || 0} reviews)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            >
              <Phone size={12} />
              Call
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
