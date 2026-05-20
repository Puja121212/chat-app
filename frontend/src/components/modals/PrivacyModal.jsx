import { useState } from 'react';
import { FiX, FiLock, FiEye, FiEyeOff, FiUsers, FiGlobe, FiShield, FiTrash2 } from 'react-icons/fi';

const PrivacyModal = ({ onClose }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends',
    lastSeenVisibility: 'everyone',
    onlineStatusVisibility: 'everyone',
    readReceipts: true,
    profilePhoto: 'everyone',
    statusMessage: 'friends'
  });

  const handleSettingChange = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Privacy settings saved:', privacySettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Privacy Settings</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Profile Visibility */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FiUsers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Visibility</label>
            </div>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          {/* Last Seen */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FiEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Seen</label>
            </div>
            <select
              value={privacySettings.lastSeenVisibility}
              onChange={(e) => handleSettingChange('lastSeenVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          {/* Online Status */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FiGlobe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Online Status</label>
            </div>
            <select
              value={privacySettings.onlineStatusVisibility}
              onChange={(e) => handleSettingChange('onlineStatusVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          {/* Read Receipts */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiEye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Read Receipts</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Let others know you've read their messages</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('readReceipts', !privacySettings.readReceipts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.readReceipts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                privacySettings.readReceipts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Profile Photo */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FiShield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</label>
            </div>
            <select
              value={privacySettings.profilePhoto}
              onChange={(e) => handleSettingChange('profilePhoto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          {/* Status Message */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FiUsers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Message</label>
            </div>
            <select
              value={privacySettings.statusMessage}
              onChange={(e) => handleSettingChange('statusMessage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                <FiTrash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete Account</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-black rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
