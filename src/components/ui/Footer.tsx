import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'Browse Notes', to: '/browse' },
      { label: 'Subjects', to: '/subjects' },
      { label: 'Upload Note', to: '/upload' },
      { label: 'Premium Notes', to: '/browse?premium=true' },
    ],
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
    support: [
      { label: 'Help Center', to: '/help' },
      { label: 'Community', to: '/community' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
  };

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, to: '#', label: 'Twitter' },
    { icon: <Github className="w-5 h-5" />, to: '#', label: 'GitHub' },
    { icon: <Linkedin className="w-5 h-5" />, to: '#', label: 'LinkedIn' },
    { icon: <Mail className="w-5 h-5" />, to: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-secondary-900 text-secondary-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-white">
                NoteHub
              </span>
            </Link>
            <p className="text-sm text-secondary-400 mb-6 max-w-xs">
              Empowering students and professionals to share knowledge through
              collaborative note-taking and discovery.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.to}
                  aria-label={link.label}
                  className="p-2 rounded-lg bg-secondary-800 hover:bg-secondary-700 text-secondary-400 hover:text-white transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-secondary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-400">
            &copy; {currentYear} NoteHub. All rights reserved.
          </p>
          <p className="text-sm text-secondary-400 flex items-center gap-1">
            Made with{' '}
            <Heart className="w-4 h-4 text-error-500 fill-error-500" /> for
            learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
