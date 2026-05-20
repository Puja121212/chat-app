import { useState, useEffect } from 'react';
import { FiX, FiCamera, FiEdit2, FiUser, FiMail, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toApiUrl, toAssetUrl } from '../config/env';

const ProfileModal = ({ isOpen, onClose, userId }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      const targetUserId = userId || currentUser?._id;
      const token = localStorage.getItem('token');
      
      const response = await fetch(toApiUrl(`/api/users/profile/${targetUserId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setEditData({
          username: data.user.username,
          bio: data.user.bio || '',
          status: data.user.status || 'offline'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update profile data
      await fetch(toApiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        await fetch(toApiUrl('/api/users/avatar'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }

      await fetchProfile();
      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(toApiUrl('/api/users/status'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (profile) {
        setProfile({ ...profile, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatLastSeen = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const lastSeen = new Date(date);
    const diff = now - lastSeen;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return lastSeen.toLocaleDateString();
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isOwnProfile ? 'My Profile' : `${profile.username}'s Profile`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={toAssetUrl(profile.avatar)}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                  <FiCamera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center mt-3 space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(profile.status)}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {profile.status}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              {isEditing && isOwnProfile ? (
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.username}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="flex items-center space-x-2">
                <FiMail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{profile.email}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              {isEditing && isOwnProfile ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {profile.bio || 'No bio added yet'}
                </p>
              )}
            </div>

            {/* Status Selector (for own profile) */}
            {isOwnProfile && !isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="flex space-x-2">
                  {['online', 'away', 'busy', 'offline'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1 rounded-full text-sm capitalize transition ${
                        profile.status === status
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Last Seen */}
            {!isOwnProfile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Seen
                </label>
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {formatLastSeen(profile.lastSeen)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {isOwnProfile && (
            <div className="mt-6 flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarPreview(null);
                      setAvatarFile(null);
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center space-x-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
