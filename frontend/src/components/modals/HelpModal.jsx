import { useState } from 'react';
import { FiX, FiHelpCircle, FiMessageSquare, FiBook, FiMail, FiPhone, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const HelpModal = ({ onClose }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const faqSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <FiBook className="w-4 h-4" />,
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on the "Sign Up" button on the login page. Enter your username, email, and password to create your account.'
        },
        {
          q: 'How do I add friends?',
          a: 'Use the search bar in the sidebar to find users by username. Click on a user to start a conversation and they will be added to your contacts.'
        },
        {
          q: 'How do I change my profile picture?',
          a: 'Go to your profile section and click on the camera icon on your avatar. Select an image from your device to upload.'
        }
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: <FiMessageSquare className="w-4 h-4" />,
      questions: [
        {
          q: 'How do I send a message?',
          a: 'Select a conversation from the sidebar, type your message in the input field at the bottom, and press Enter or click the send button.'
        },
        {
          q: 'Can I send images or files?',
          a: 'Currently, text messages are supported. File and image sharing features will be available in future updates.'
        },
        {
          q: 'How do I know if someone read my message?',
          a: 'Read receipts show when someone has seen your message. You can manage this in Privacy Settings.'
        },
        {
          q: 'What are typing indicators?',
          a: 'When someone is typing a message to you, you\'ll see "..." or a typing indicator in the conversation.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: <FiHelpCircle className="w-4 h-4" />,
      questions: [
        {
          q: 'Who can see my profile?',
          a: 'You can control who sees your profile in Privacy Settings. Choose between Everyone, Friends Only, or Nobody.'
        },
        {
          q: 'How do I block someone?',
          a: 'Click the menu button (three dots) in a conversation and select "Block User". Blocked users cannot message you.'
        },
        {
          q: 'How do I report someone?',
          a: 'If someone is violating the terms of service, please contact our support team with details.'
        },
        {
          q: 'Is my data secure?',
          a: 'Yes, we use end-to-end encryption for messages and follow industry-standard security practices.'
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Help & Support</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Help */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Quick Help</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Can't find what you're looking for? Contact our support team at support@chatapp.com
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-3">
            {faqSections.map((section) => (
              <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600 dark:text-gray-400">
                      {section.icon}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {section.title}
                    </h4>
                  </div>
                  {expandedSection === section.id ? (
                    <FiChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <FiChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {expandedSection === section.id && (
                  <div className="px-4 pb-4 space-y-3">
                    {section.questions.map((item, index) => (
                      <div key={index} className="border-l-2 border-blue-200 dark:border-blue-800 pl-3">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                          {item.q}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Contact Support</h4>
            <div className="space-y-2">
              <a
                href="mailto:support@chatapp.com"
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Email Support</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">support@chatapp.com</p>
                </div>
              </a>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiPhone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Phone Support</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Chat App Version 1.0.0
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 Chat App. All rights reserved.
            </p>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
