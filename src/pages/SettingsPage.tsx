import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building,
  FileText,
  Shield,
  Bell,
  CreditCard,
  Crown,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type Tab = 'profile' | 'account' | 'notifications' | 'billing';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    institution: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        institution: profile.institution || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [user, profile, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await updateProfile({
      full_name: formData.full_name || null,
      institution: formData.institution || null,
      bio: formData.bio || null,
      avatar_url: formData.avatar_url || null,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'account' as Tab, label: 'Account', icon: Shield },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'billing' as Tab, label: 'Billing', icon: CreditCard },
  ];

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-secondary-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-heading font-bold text-secondary-900 mb-8">
          Settings
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          <nav className="md:w-56 flex-shrink-0">
            <div className="card p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                  Profile Information
                </h2>

                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 rounded-lg bg-success-50 border border-success-200 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-success-700">
                      Profile updated successfully!
                    </p>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label htmlFor="avatar_url" className="label">
                      Avatar URL
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.avatar_url ? (
                        <img
                          src={formData.avatar_url}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-secondary-400" />
                        </div>
                      )}
                      <input
                        id="avatar_url"
                        type="url"
                        value={formData.avatar_url}
                        onChange={(e) =>
                          setFormData({ ...formData, avatar_url: e.target.value })
                        }
                        className="input flex-1"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="full_name" className="label">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        id="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        className="input pl-10"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="institution" className="label">
                      Institution
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        id="institution"
                        type="text"
                        value={formData.institution}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institution: e.target.value,
                          })
                        }
                        className="input pl-10"
                        placeholder="University or organization"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="label">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="input resize-none"
                      placeholder="Tell others about yourself..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                  Account Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="input pl-10 bg-secondary-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="pt-6 border-t border-secondary-200">
                    <h3 className="font-medium text-secondary-900 mb-2">
                      Password
                    </h3>
                    <p className="text-sm text-secondary-600 mb-4">
                      Manage your password and authentication settings.
                    </p>
                    <button className="btn-secondary">
                      Change Password
                    </button>
                  </div>

                  <div className="pt-6 border-t border-secondary-200">
                    <h3 className="font-medium text-error-600 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-secondary-600 mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <button className="btn bg-error-100 text-error-700 hover:bg-error-200">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      id: 'new_comments',
                      label: 'New Comments',
                      description: 'Get notified when someone comments on your notes',
                    },
                    {
                      id: 'ratings',
                      label: 'New Ratings',
                      description: 'Get notified when someone rates your notes',
                    },
                    {
                      id: 'followers',
                      label: 'Saved Notes',
                      description: 'Get notified when someone saves your notes',
                    },
                    {
                      id: 'updates',
                      label: 'Platform Updates',
                      description: 'News aboutNoteHub features and improvements',
                    },
                  ].map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-secondary-200"
                    >
                      <div>
                        <p className="font-medium text-secondary-900">
                          {pref.label}
                        </p>
                        <p className="text-sm text-secondary-500">
                          {pref.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-6">
                  Billing & Subscription
                </h2>

                <div className="p-4 rounded-lg bg-secondary-50 border border-secondary-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary-900">
                        Current Plan
                      </p>
                      <p className="text-sm text-secondary-500">
                        {profile.is_premium ? 'Premium' : 'Free'}
                      </p>
                    </div>
                    {!profile.is_premium && (
                      <button className="btn-accent">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </button>
                    )}
                  </div>
                </div>

                {!profile.is_premium && (
                  <div className="border border-accent-200 rounded-lg p-6 bg-accent-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Crown className="w-8 h-8 text-accent-600" />
                      <div>
                        <h3 className="font-semibold text-secondary-900">
                          Premium Plan
                        </h3>
                        <p className="text-accent-600">$9.99/month</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {[
                        'Unlimited note uploads',
                        'Premium note pricing options',
                        'Advanced analytics',
                        'Priority support',
                        'No ads',
                      ].map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-secondary-600"
                        >
                          <CheckCircle className="w-4 h-4 text-success-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="btn-accent w-full">
                      Subscribe Now
                    </button>
                  </div>
                )}

                {profile.is_premium && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-secondary-200">
                      <div>
                        <p className="font-medium text-secondary-900">
                          Next billing date
                        </p>
                        <p className="text-sm text-secondary-500">
                          January 15, 2025
                        </p>
                      </div>
                      <button className="text-sm text-error-600 hover:underline">
                        Cancel subscription
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
