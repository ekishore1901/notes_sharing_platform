import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Upload,
  Bookmark,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/browse', label: 'Browse Notes' },
    { to: '/subjects', label: 'Subjects' },
    { to: '/about', label: 'About' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-white border-b border-secondary-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-secondary-900">
                NoteHub
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, topics..."
                className="input pl-10 py-2.5 bg-secondary-50 border-transparent focus:bg-white focus:border-primary-300"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="hidden sm:inline-flex btn-primary btn-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Profile'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-sm">
                        {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-secondary-500 transition-transform ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="dropdown right-0">
                      <div className="px-4 py-3 border-b border-secondary-100">
                        <p className="font-medium text-secondary-900 truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-secondary-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link to={`/profile/${user.id}`} className="dropdown-item">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link to="/saved" className="dropdown-item">
                        <Bookmark className="w-4 h-4" />
                        Saved Notes
                      </Link>
                      <Link to="/settings" className="dropdown-item">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="dropdown-item w-full text-left text-error-600 hover:bg-error-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="btn-ghost btn-sm hidden sm:inline-flex"
                >
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-secondary-700" />
              ) : (
                <Menu className="w-6 h-6 text-secondary-700" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200 animate-slide-down">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="input pl-10"
              />
            </form>
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/upload"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-100"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Note
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
