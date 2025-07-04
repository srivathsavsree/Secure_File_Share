import React from 'react';
import { FaSync } from 'react-icons/fa';

// Component to show when an API is being retried due to rate limiting
const RetryStatus = ({ isRetrying, retryCount, maxRetries }) => {
  if (!isRetrying) return null;
  
  return (
    <div className="retry-status">
      <FaSync className="retry-icon" />
      <span>
        Request limit reached. Retrying ({retryCount}/{maxRetries})...
      </span>
    </div>
  );
};

export default RetryStatus;