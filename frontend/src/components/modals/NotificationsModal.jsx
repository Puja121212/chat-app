import { useState } from 'react';
import { FiX, FiBell, FiMail, FiMessageSquare, FiUserPlus, FiVolume2, FiVolumeX, FiUser } from 'react-icons/fi';

const NotificationsModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState({
    messageNotifications: true,
    emailNotifications: false,
    soundNotifications: true,
    friendRequestNotifications: true,
    onlineNotifications: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    console.log('Notification settings saved:', notifications);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FiBell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your notification preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(95vh - 140px)' }}>
          <div className="p-4 space-y-4">
          {/* Message Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiMessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Message Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified for new messages</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('messageNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.messageNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.messageNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiMail className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive email updates</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Sound Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {notifications.soundNotifications ? (
                <FiVolume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <FiVolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Play sound for new messages</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('soundNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.soundNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.soundNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Friend Request Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiUserPlus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Friend Requests</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Notify for new friend requests</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('friendRequestNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.friendRequestNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.friendRequestNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Online Status Notifications */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiUser className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Online Status</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Notify when friends come online</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('onlineNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.onlineNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.onlineNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          </div>
          </div>

        {/* Sticky Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 sticky bottom-0">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black rounded-xl hover:bg-gray-400 dark:hover:bg-gray-600 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-black rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
