import { useState, useRef } from 'react';
import { FiX, FiSettings, FiBell, FiLock, FiHelpCircle, FiCamera, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SettingsModal from './modals/SettingsModal';
import NotificationsModal from './modals/NotificationsModal';
import PrivacyModal from './modals/PrivacyModal';
import HelpModal from './modals/HelpModal';

const UserProfile = ({ user, onClose }) => {
  const { updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:4001/api/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update user profile with new avatar
      await updateProfile(response.data.user);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.avatar) return;

    try {
      setUploading(true);
      const response = await axios.delete('http://localhost:4001/api/upload/profile-image', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update user profile without avatar
      await updateProfile(response.data.user);
    } catch (error) {
      console.error('Remove image error:', error);
      alert('Failed to remove image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Upload button overlay */}
              <div className="absolute bottom-0 right-0 flex space-x-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload profile picture"
                >
                  <FiCamera className="w-4 h-4" />
                </button>
                
                {user?.avatar && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove profile picture"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {user?.username}
            </h2>
            <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
            
            {uploading && (
              <div className="mb-4">
                <div className="text-sm text-blue-600">Uploading image...</div>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-xs text-gray-500">Messages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-xs text-gray-500">Contacts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">0</div>
              <div className="text-xs text-gray-500">Groups</div>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            <button 
              onClick={() => setActiveModal('settings')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
            >
              <FiSettings className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Settings</span>
            </button>
            
            <button 
              onClick={() => setActiveModal('notifications')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
            >
              <FiBell className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Notifications</span>
            </button>
            
            <button 
              onClick={() => setActiveModal('privacy')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
            >
              <FiLock className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Privacy</span>
            </button>
            
            <button 
              onClick={() => setActiveModal('help')}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
            >
              <FiHelpCircle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Help</span>
            </button>
          </div>

          {/* Account Info */}
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="text-gray-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Seen</span>
                <span className="text-gray-700">
                  {user?.lastSeen ? new Date(user.lastSeen).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'settings' && (
        <SettingsModal 
          user={user} 
          onClose={() => setActiveModal(null)} 
        />
      )}
      
      {activeModal === 'notifications' && (
        <NotificationsModal 
          onClose={() => setActiveModal(null)} 
        />
      )}
      
      {activeModal === 'privacy' && (
        <PrivacyModal 
          onClose={() => setActiveModal(null)} 
        />
      )}
      
      {activeModal === 'help' && (
        <HelpModal 
          onClose={() => setActiveModal(null)} 
        />
      )}
    </>
  );
};

export default UserProfile;
