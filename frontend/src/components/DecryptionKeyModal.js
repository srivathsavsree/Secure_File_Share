import React, { useState } from 'react';
import { FaKey, FaSpinner } from 'react-icons/fa';

const DecryptionKeyModal = ({ fileName, onDecrypt, onCancel, loading }) => {
  const [decryptionKey, setDecryptionKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!decryptionKey.trim()) {
      setError('Please enter the decryption key');
      return;
    }
    
    setError('');
    onDecrypt(decryptionKey);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content decryption-modal">
        <h3 className="modal-title">
          <FaKey style={{ marginRight: '8px' }} /> Enter Decryption Key
        </h3>
        
        <p className="modal-subtitle">
          To download <strong>{fileName}</strong>, please enter the decryption key that was provided to you
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter decryption key"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinning" style={{ marginRight: '5px' }} />
                  Decrypting...
                </>
              ) : (
                'Download File'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DecryptionKeyModal;
