import { FiCircle } from 'react-icons/fi';

const StatusIndicator = ({ status, size = 'sm' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      case 'busy':
        return 'text-red-500';
      case 'offline':
      default:
        return 'text-gray-400';
    }
  };

  const getSizeClass = (size) => {
    switch (size) {
      case 'xs':
        return 'w-2 h-2';
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <FiCircle 
      className={`${getSizeClass(size)} ${getStatusColor(status)} fill-current`}
      title={status || 'offline'}
    />
  );
};

export default StatusIndicator;
