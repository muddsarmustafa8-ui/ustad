import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  Globe,
  Layers3,
  MessageSquare,
  MapPin,
  Image as ImageIcon,
  Star,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const emptyBusinessForm = {
  name: '',
  description: '',
  tagline: '',
  category: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  logo: '',
  coverImage: '',
  yearsOfExperience: '',
  establishedYear: '',
  highlightsText: '',
  galleryText: '',
  teamText: '',
  faqText: '',
  packagesText: '',
  serviceAreasCitiesText: '',
  serviceAreasAreasText: '',
  homeServiceRadius: '',
  onlineServiceAvailable: false,
  socialLinks: {
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  },
  address: {
    street: '',
    city: '',
    state: '',
    country: 'Pakistan',
    postalCode: '',
    googleMapsUrl: '',
  },
  about: {
    introduction: '',
    mission: '',
    vision: '',
    whyChooseUs: '',
    businessStory: '',
    professionalExperience: '',
  },
  workingHours: WEEK_DAYS.map((day) => ({ day, open: '09:00', close: '18:00', isClosed: false })),
};

const emptyServiceForm = {
  name: '',
  description: '',
  price: '',
  duration: '',
  image: '',
  isActive: true,
};

const splitLines = (value) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const splitCommaList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeBusiness = (business) => ({
  ...emptyBusinessForm,
  ...business,
  category: business?.category?._id || business?.category || '',
  coverImage: business?.coverImages?.[0] || '',
  logo: business?.logo || '',
  yearsOfExperience: business?.yearsOfExperience ?? '',
  establishedYear: business?.establishedYear ?? '',
  highlightsText: (business?.highlights || []).join('\n'),
  galleryText: (business?.gallery || []).join('\n'),
  teamText: (business?.teamMembers || [])
    .map((member) => [member.name, member.position, member.photo, member.experience, (member.skills || []).join('|'), member.contactInfo].join(' | '))
    .join('\n'),
  faqText: (business?.faqs || []).map((item) => `${item.question} || ${item.answer}`).join('\n'),
  packagesText: (business?.packages || [])
    .map((item) => [item.name, (item.includedServices || []).join('|'), item.price || '', item.discount || '', item.duration || '', (item.features || []).join('|')].join(' | '))
    .join('\n'),
  serviceAreasCitiesText: (business?.serviceAreas?.cities || []).join('\n'),
  serviceAreasAreasText: (business?.serviceAreas?.areas || []).join('\n'),
  homeServiceRadius: business?.serviceAreas?.homeServiceRadius ?? '',
  onlineServiceAvailable: Boolean(business?.serviceAreas?.onlineServiceAvailable),
  socialLinks: {
    facebook: business?.socialLinks?.facebook || '',
    instagram: business?.socialLinks?.instagram || '',
    linkedin: business?.socialLinks?.linkedin || '',
    youtube: business?.socialLinks?.youtube || '',
    tiktok: business?.socialLinks?.tiktok || '',
  },
  address: {
    street: business?.address?.street || '',
    city: business?.address?.city || '',
    state: business?.address?.state || '',
    country: business?.address?.country || 'Pakistan',
    postalCode: business?.address?.postalCode || '',
    googleMapsUrl: business?.address?.googleMapsUrl || '',
  },
  about: {
    introduction: business?.about?.introduction || business?.description || '',
    mission: business?.about?.mission || '',
    vision: business?.about?.vision || '',
    whyChooseUs: business?.about?.whyChooseUs || '',
    businessStory: business?.about?.businessStory || '',
    professionalExperience: business?.about?.professionalExperience || '',
  },
  workingHours: WEEK_DAYS.map((day) => {
    const existing = (business?.workingHours || []).find((item) => item.day === day);
    return existing || { day, open: '09:00', close: '18:00', isClosed: false };
  }),
});

const BusinessStudio = ({ initialTab = 'profile' }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [businessForm, setBusinessForm] = useState(emptyBusinessForm);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [services, setServices] = useState([]);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewReplies, setReviewReplies] = useState({});
  const [galleryDraft, setGalleryDraft] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loadStudio = async () => {
      try {
        const [categoriesResponse, businessesResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/businesses/my'),
        ]);

        setCategories(categoriesResponse.data.data || []);
        const ownerBusinesses = businessesResponse.data.data || [];
        setBusinesses(ownerBusinesses);

        if (ownerBusinesses.length > 0) {
          const business = ownerBusinesses[0];
          setActiveBusiness(business);
          setBusinessForm(normalizeBusiness(business));
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load business studio');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadStudio();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const loadServices = async () => {
      if (!activeBusiness?._id) {
        setServices([]);
        return;
      }

      try {
        const response = await api.get(`/services/business/${activeBusiness._id}`);
        setServices(response.data.data || []);
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, [activeBusiness]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!activeBusiness?._id || activeTab !== 'bookings') {
        return;
      }

      setLoadingBookings(true);
      try {
        const response = await api.get(`/bookings/business/${activeBusiness._id}`);
        setBookings(response.data.data || []);
      } catch {
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, [activeBusiness, activeTab]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!activeBusiness?._id || activeTab !== 'reviews') {
        return;
      }

      setLoadingReviews(true);
      try {
        const response = await api.get(`/reviews/business/${activeBusiness._id}`);
        setReviews(response.data.data || []);
      } catch {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [activeBusiness, activeTab]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category._id === businessForm.category),
    [categories, businessForm.category]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleInputChange = (field, value) => {
    setBusinessForm((current) => ({ ...current, [field]: value }));
  };

  const handleNestedChange = (group, field, value) => {
    setBusinessForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  const handleWorkingHourChange = (day, field, value) => {
    setBusinessForm((current) => ({
      ...current,
      workingHours: current.workingHours.map((item) =>
        item.day === day ? { ...item, [field]: field === 'isClosed' ? Boolean(value) : value } : item
      ),
    }));
  };

  const payloadFromForm = () => ({
    ...businessForm,
    yearsOfExperience: businessForm.yearsOfExperience ? Number(businessForm.yearsOfExperience) : undefined,
    establishedYear: businessForm.establishedYear ? Number(businessForm.establishedYear) : undefined,
    coverImages: businessForm.coverImage ? [businessForm.coverImage] : [],
    highlights: splitLines(businessForm.highlightsText),
    gallery: splitLines(businessForm.galleryText),
    teamMembers: splitLines(businessForm.teamText).map((line) => {
      const [name = '', position = '', photo = '', experience = '', skills = '', contactInfo = ''] = line.split('|').map((item) => item.trim());
      return {
        name,
        position,
        photo,
        experience,
        skills: skills ? skills.split(',').map((item) => item.trim()).filter(Boolean) : [],
        contactInfo,
      };
    }),
    faqs: splitLines(businessForm.faqText).map((line) => {
      const [question = '', answer = ''] = line.split('||').map((item) => item.trim());
      return { question, answer };
    }),
    packages: splitLines(businessForm.packagesText).map((line) => {
      const [name = '', includedServices = '', price = '', discount = '', duration = '', features = ''] = line.split('|').map((item) => item.trim());
      return {
        name,
        includedServices: includedServices ? includedServices.split(',').map((item) => item.trim()).filter(Boolean) : [],
        price: price ? Number(price) : undefined,
        discount: discount ? Number(discount) : undefined,
        duration: duration ? Number(duration) : undefined,
        features: features ? features.split(',').map((item) => item.trim()).filter(Boolean) : [],
      };
    }),
    serviceAreas: {
      cities: splitLines(businessForm.serviceAreasCitiesText),
      areas: splitLines(businessForm.serviceAreasAreasText),
      homeServiceRadius: businessForm.homeServiceRadius ? Number(businessForm.homeServiceRadius) : undefined,
      onlineServiceAvailable: Boolean(businessForm.onlineServiceAvailable),
    },
  });

  const saveBusiness = async () => {
    if (!businessForm.name || !businessForm.description || !businessForm.category || !businessForm.phone || !businessForm.address.city) {
      toast.error('Please complete the required business profile fields');
      return;
    }

    setSaving(true);
    try {
      const payload = payloadFromForm();
      let response;

      if (activeBusiness?._id) {
        response = await api.put(`/businesses/${activeBusiness._id}`, payload);
      } else {
        response = await api.post('/businesses', payload);
      }

      const business = response.data.data;
      toast.success('Business profile saved successfully');
      setActiveBusiness(business);
      setBusinesses((current) => {
        const exists = current.find((item) => item._id === business._id);
        if (exists) {
          return current.map((item) => (item._id === business._id ? business : item));
        }
        return [business, ...current];
      });
      setBusinessForm(normalizeBusiness(business));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save business profile');
    } finally {
      setSaving(false);
    }
  };

  const createNewService = async () => {
    if (!activeBusiness?._id) {
      toast.error('Create a business profile first');
      return;
    }

    if (!serviceForm.name || !serviceForm.description || !serviceForm.price || !serviceForm.duration) {
      toast.error('Please fill the required service fields');
      return;
    }

    setSaving(true);
    try {
      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, {
          ...serviceForm,
          price: Number(serviceForm.price),
          duration: Number(serviceForm.duration),
        });
        toast.success('Service updated');
      } else {
        await api.post('/services', {
          ...serviceForm,
          business: activeBusiness._id,
          price: Number(serviceForm.price),
          duration: Number(serviceForm.duration),
        });
        toast.success('Service created');
      }

      const response = await api.get(`/services/business/${activeBusiness._id}`);
      setServices(response.data.data || []);
      setServiceForm(emptyServiceForm);
      setEditingServiceId(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const editService = (service) => {
    setEditingServiceId(service._id);
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || '',
      image: service.image || '',
      isActive: service.isActive !== false,
    });
    setActiveTab('services');
  };

  const deleteService = async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      setServices((current) => current.filter((service) => service._id !== serviceId));
      toast.success('Service updated');
    } catch {
      toast.error('Failed to remove service');
    }
  };

  const saveGallery = async () => {
    const galleryItems = splitLines(galleryDraft);
    const currentGallery = galleryItems.length > 0 ? galleryItems : splitLines(businessForm.galleryText);

    try {
      const response = await api.put(`/businesses/${activeBusiness._id}`, {
        gallery: currentGallery,
      });
      const business = response.data.data;
      setActiveBusiness(business);
      setBusinessForm(normalizeBusiness(business));
      setGalleryDraft(currentGallery.join('\n'));
      toast.success('Gallery updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update gallery');
    }
  };

  const updateBooking = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? { ...booking, status } : booking)));
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update booking');
    }
  };

  const saveReply = async (reviewId) => {
    const reply = reviewReplies[reviewId] || '';
    if (!reply.trim()) {
      toast.error('Reply text is required');
      return;
    }

    try {
      const response = await api.put(`/reviews/${reviewId}/reply`, { reply });
      setReviews((current) => current.map((item) => (item._id === reviewId ? response.data.data : item)));
      toast.success('Reply saved');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save reply');
    }
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm"
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <Building2 size={12} /> Business Studio
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white font-outfit">Complete Business Profile Management</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Create a digital storefront with business details, service listings, working hours, service areas, and contact information.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['profile', 'services', 'gallery', 'bookings', 'reviews', 'faq', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-900 dark:text-gray-300 dark:hover:bg-dark-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {activeTab === 'profile' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">Business Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create or edit the public business profile.</p>
              </div>
              {activeBusiness && (
                <Link
                  to={`/business/${activeBusiness.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-950/20"
                >
                  <Eye size={14} /> Preview
                </Link>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input value={businessForm.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Business Name" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.tagline} onChange={(e) => handleInputChange('tagline', e.target.value)} placeholder="Business Tagline" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <select value={businessForm.category} onChange={(e) => handleInputChange('category', e.target.value)} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900 md:col-span-2">
                <option value="">Select business category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              <textarea value={businessForm.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Business Description" rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900 md:col-span-2" />
              <input value={businessForm.logo} onChange={(e) => handleInputChange('logo', e.target.value)} placeholder="Business Logo URL" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.coverImage} onChange={(e) => handleInputChange('coverImage', e.target.value)} placeholder="Cover Banner URL" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <input value={businessForm.yearsOfExperience} onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)} placeholder="Years of Experience" type="number" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.establishedYear} onChange={(e) => handleInputChange('establishedYear', e.target.value)} placeholder="Established Year" type="number" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="Website" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input value={businessForm.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="Phone Number" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.whatsapp} onChange={(e) => handleInputChange('whatsapp', e.target.value)} placeholder="WhatsApp Number" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Email Address" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <div className="grid grid-cols-3 gap-2">
                {selectedCategory && (
                  <div className="col-span-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
                    Category selected: {selectedCategory.icon} {selectedCategory.name}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input value={businessForm.address.street} onChange={(e) => handleNestedChange('address', 'street', e.target.value)} placeholder="Address Line" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.address.city} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} placeholder="City" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.address.state} onChange={(e) => handleNestedChange('address', 'state', e.target.value)} placeholder="State / Province" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.address.country} onChange={(e) => handleNestedChange('address', 'country', e.target.value)} placeholder="Country" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.address.postalCode} onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)} placeholder="ZIP / Postal Code" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <input value={businessForm.address.googleMapsUrl} onChange={(e) => handleNestedChange('address', 'googleMapsUrl', e.target.value)} placeholder="Google Maps Location URL" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Social Links</label>
                <div className="grid gap-3">
                  {['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'].map((item) => (
                    <input
                      key={item}
                      value={businessForm.socialLinks[item]}
                      onChange={(e) => handleNestedChange('socialLinks', item, e.target.value)}
                      placeholder={item.charAt(0).toUpperCase() + item.slice(1)}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">About Business</label>
                <div className="grid gap-3">
                  <textarea value={businessForm.about.introduction} onChange={(e) => handleNestedChange('about', 'introduction', e.target.value)} placeholder="Company introduction" rows={2} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
                  <textarea value={businessForm.about.whyChooseUs} onChange={(e) => handleNestedChange('about', 'whyChooseUs', e.target.value)} placeholder="Why choose us" rows={2} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <textarea value={businessForm.highlightsText} onChange={(e) => handleInputChange('highlightsText', e.target.value)} placeholder="Business highlights - one per line" rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <textarea value={businessForm.galleryText} onChange={(e) => handleInputChange('galleryText', e.target.value)} placeholder="Gallery image URLs - one per line" rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <textarea value={businessForm.serviceAreasCitiesText} onChange={(e) => handleInputChange('serviceAreasCitiesText', e.target.value)} placeholder="Cities served - one per line" rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <textarea value={businessForm.serviceAreasAreasText} onChange={(e) => handleInputChange('serviceAreasAreasText', e.target.value)} placeholder="Service areas - one per line" rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <textarea value={businessForm.faqText} onChange={(e) => handleInputChange('faqText', e.target.value)} placeholder="FAQ - Question || Answer (one per line)" rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <textarea value={businessForm.packagesText} onChange={(e) => handleInputChange('packagesText', e.target.value)} placeholder="Packages - Name | Included services | Price | Discount | Duration | Features" rows={4} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock3 size={16} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Working Hours</h3>
              </div>
              <div className="space-y-3">
                {businessForm.workingHours.map((day) => (
                  <div key={day.day} className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-dark-700 dark:bg-dark-900 md:grid-cols-[1fr_110px_110px_auto] md:items-center">
                    <div className="font-semibold capitalize text-gray-900 dark:text-white">{day.day}</div>
                    <input value={day.open || ''} onChange={(e) => handleWorkingHourChange(day.day, 'open', e.target.value)} disabled={day.isClosed} type="time" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-700 dark:bg-dark-800" />
                    <input value={day.close || ''} onChange={(e) => handleWorkingHourChange(day.day, 'close', e.target.value)} disabled={day.isClosed} type="time" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-700 dark:bg-dark-800" />
                    <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <input type="checkbox" checked={Boolean(day.isClosed)} onChange={(e) => handleWorkingHourChange(day.day, 'isClosed', e.target.checked)} />
                      Closed
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={saveBusiness}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 disabled:opacity-70"
              >
                <Save size={16} />
                {saving ? 'Saving...' : activeBusiness ? 'Update Business Profile' : 'Create Business Profile'}
              </button>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Business Status</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Verified badge</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeBusiness?.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {activeBusiness?.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Open / Closed</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                    Managed by working hours
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last updated</span>
                  <span>{activeBusiness?.updatedAt ? new Date(activeBusiness.updatedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Years in business</span>
                  <span>{businessForm.yearsOfExperience || activeBusiness?.yearsOfExperience || '0'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-dark-900">
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{activeBusiness?.viewCount || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400">Profile views</div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-dark-900">
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{services.length}</div>
                  <div className="text-gray-500 dark:text-gray-400">Services</div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-dark-900">
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{activeBusiness?.reviewCount || 0}</div>
                  <div className="text-gray-500 dark:text-gray-400">Reviews</div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-dark-900">
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{activeBusiness?.ratingAverage ? activeBusiness.ratingAverage.toFixed(1) : '0.0'}</div>
                  <div className="text-gray-500 dark:text-gray-400">Rating</div>
                </div>
              </div>
            </div>

            {businesses.length > 1 && (
              <div className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Layers3 size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Your Businesses</h3>
                </div>
                <div className="space-y-2">
                  {businesses.map((business) => (
                    <button
                      key={business._id}
                      onClick={() => {
                        setActiveBusiness(business);
                        setBusinessForm(normalizeBusiness(business));
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                        activeBusiness?._id === business._id
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20'
                          : 'border-gray-100 bg-gray-50 dark:border-dark-700 dark:bg-dark-900 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{business.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{business.category?.name || 'No category'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">Add or Edit Service</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Services appear on the public business profile.</p>
              </div>
              <button
                onClick={() => {
                  setServiceForm(emptyServiceForm);
                  setEditingServiceId(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-dark-700 dark:text-gray-300 dark:hover:bg-dark-700"
              >
                <Plus size={14} /> New
              </button>
            </div>

            <div className="space-y-4">
              <input value={serviceForm.name} onChange={(e) => setServiceForm((current) => ({ ...current, name: e.target.value }))} placeholder="Service Name" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <textarea value={serviceForm.description} onChange={(e) => setServiceForm((current) => ({ ...current, description: e.target.value }))} placeholder="Service Description" rows={4} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <div className="grid gap-4 md:grid-cols-3">
                <input value={serviceForm.price} onChange={(e) => setServiceForm((current) => ({ ...current, price: e.target.value }))} placeholder="Price" type="number" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
                <input value={serviceForm.duration} onChange={(e) => setServiceForm((current) => ({ ...current, duration: e.target.value }))} placeholder="Duration (mins)" type="number" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
                <input value={serviceForm.image} onChange={(e) => setServiceForm((current) => ({ ...current, image: e.target.value }))} placeholder="Image URL (optional)" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="checkbox" checked={serviceForm.isActive} onChange={(e) => setServiceForm((current) => ({ ...current, isActive: e.target.checked }))} />
                Service available
              </label>
              <button
                onClick={createNewService}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 disabled:opacity-70"
              >
                <Save size={16} />
                {saving ? 'Saving...' : editingServiceId ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">Service Cards</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unlimited services for your business.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                {services.length} services
              </span>
            </div>

            {services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-dark-700">
                <Sparkles className="mx-auto mb-3 text-gray-400" size={28} />
                <h4 className="font-semibold text-gray-900 dark:text-white">No services yet</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your first service to show customers what you offer.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <div key={service._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-dark-700 dark:bg-dark-900">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{service.description}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {service.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>PKR {service.price}</span>
                      <span>{service.duration} mins</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button onClick={() => editService(service)} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-950/20">
                        <Edit3 size={12} /> Edit
                      </button>
                      <button onClick={() => deleteService(service._id)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
            <div className="mb-5 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Gallery Manager</h3>
            </div>
            <textarea
              value={galleryDraft || businessForm.galleryText}
              onChange={(e) => setGalleryDraft(e.target.value)}
              placeholder="Paste one image URL per line"
              rows={10}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900"
            />
            <div className="mt-4 flex items-center gap-3">
              <button onClick={saveGallery} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                <Save size={16} /> Save Gallery
              </button>
              <button onClick={() => setGalleryDraft('')} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-dark-700 dark:text-gray-300">
                <X size={16} /> Reset
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Gallery Preview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click any image to preview it larger.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                {(splitLines(businessForm.galleryText).length || 0)} items
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {splitLines(businessForm.galleryText).length > 0 ? splitLines(businessForm.galleryText).map((src, index) => (
                <button key={`${src}-${index}`} onClick={() => setGalleryOpen(src)} className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-dark-700">
                  <img src={src} alt={`Gallery ${index + 1}`} className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              )) : (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-dark-700 dark:text-gray-400">
                  Add image URLs to show your gallery.
                </div>
              )}
            </div>
          </div>

          {galleryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setGalleryOpen(null)}>
              <img src={galleryOpen} alt="Gallery preview" className="max-h-[90vh] max-w-[92vw] rounded-3xl object-contain shadow-2xl" />
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <div className="mb-5 flex items-center gap-2">
            <CalendarCheck size={18} className="text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Booking Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Accept, reject, or complete customer bookings.</p>
            </div>
          </div>

          {loadingBookings ? (
            <Spinner size="large" />
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-dark-700 dark:text-gray-400">
              No bookings yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-dark-700 dark:bg-dark-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{booking.customer?.fullName || 'Customer'}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service?.name} • {booking.timeSlot}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()} • PKR {booking.price}</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => updateBooking(booking._id, 'confirmed')} className="rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white">Accept</button>
                    <button onClick={() => updateBooking(booking._id, 'cancelled')} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white">Reject</button>
                    <button onClick={() => updateBooking(booking._id, 'completed')} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Mark Complete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <div className="mb-5 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Review Replies</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Respond to customer reviews directly from the dashboard.</p>
            </div>
          </div>

          {loadingReviews ? (
            <Spinner size="large" />
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-dark-700 dark:text-gray-400">
              No reviews yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4 dark:border-dark-700 dark:bg-dark-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{review.rating}/5</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{review.review}</p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">{review.user?.fullName || 'Customer'} • {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <textarea
                      value={reviewReplies[review._id] ?? review.ownerReply ?? ''}
                      onChange={(e) => setReviewReplies((current) => ({ ...current, [review._id]: e.target.value }))}
                      placeholder="Write a reply..."
                      rows={3}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-800"
                    />
                    <button onClick={() => saveReply(review._id)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Save Reply</button>
                    {review.ownerReply && (
                      <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
                        <strong>Owner reply:</strong> {review.ownerReply}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">FAQ Manager</h3>
            </div>
            <textarea
              value={businessForm.faqText}
              onChange={(e) => handleInputChange('faqText', e.target.value)}
              placeholder="Question || Answer (one per line)"
              rows={12}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900"
            />
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Tip: use one line per FAQ with <span className="font-semibold">Question || Answer</span>.</p>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Business Highlights</h3>
            <textarea
              value={businessForm.highlightsText}
              onChange={(e) => handleInputChange('highlightsText', e.target.value)}
              placeholder="One highlight per line"
              rows={12}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900"
            />
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="text-blue-600" size={18} />
              <h3 className="font-semibold text-gray-900 dark:text-white">Service Areas</h3>
            </div>
            <textarea value={businessForm.serviceAreasCitiesText} onChange={(e) => handleInputChange('serviceAreasCitiesText', e.target.value)} placeholder="Cities served - one per line" rows={6} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
            <textarea value={businessForm.serviceAreasAreasText} onChange={(e) => handleInputChange('serviceAreasAreasText', e.target.value)} placeholder="Areas served - one per line" rows={6} className="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input value={businessForm.homeServiceRadius} onChange={(e) => handleInputChange('homeServiceRadius', e.target.value)} placeholder="Home service radius (km)" type="number" className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-dark-700 dark:bg-dark-900" />
              <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-dark-700 dark:bg-dark-900 dark:text-gray-300">
                <input type="checkbox" checked={Boolean(businessForm.onlineServiceAvailable)} onChange={(e) => handleInputChange('onlineServiceAvailable', e.target.checked)} />
                Online service available
              </label>
            </div>
          </div>
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-dark-700 dark:bg-dark-800">
            <Globe className="mx-auto mb-3 text-gray-400" size={28} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile settings</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Password, email, notification preferences, and account deletion can be layered in next.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessStudio;
