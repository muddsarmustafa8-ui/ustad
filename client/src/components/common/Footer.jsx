import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <span className="text-xl font-bold font-outfit tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              ServeLocal
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connecting customers with trusted local professionals and service providers in Pakistan.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-blue-500 transition-colors"><Facebook size={18} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="hover:text-blue-700 transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  Search Businesses
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                  List Your Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2">
              <li><Link to="/search?category=barber" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">Barbers</Link></li>
              <li><Link to="/search?category=mechanic" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">Mechanics</Link></li>
              <li><Link to="/search?category=plumber" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">Plumbers</Link></li>
              <li><Link to="/search?category=electrician" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">Electricians</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">About Us</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-200 dark:border-dark-800" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ServeLocal. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Made by <Heart size={12} className="text-red-500 fill-red-500 mx-0.5" />{' '}
            <a
              href="https://www.nexvoragroup.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 transition-colors font-medium"
            >
              Nexvora Dev Pvt Ltd
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
