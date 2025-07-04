import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLock, FaDownload, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';

const FileView = () => {
  const { fileId } = useParams();
  const [fileName, setFileName] = useState('');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/files/${fileId}`);
        if (res.data.status === 'success') {
          setFileInfo(res.data.data.file);
          setFileName(res.data.data.file.originalName);
        }
      } catch (err) {
        console.error('Error fetching file info:', err);
        setError('This file does not exist or has been deleted.');
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFileInfo();
    }
  }, [fileId]);

  const handleDownload = async (e) => {
    e.preventDefault();
    
    if (!decryptionKey.trim()) {
      toast.error('Please enter the decryption key');
      return;
    }
    
    try {
      setDownloading(true);
      toast.info('Preparing download...');
      
      const res = await api.get(`/files/download/${fileId}?key=${decryptionKey}`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(res.data);
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started successfully');
    } catch (error) {
      toast.error('Download failed: Invalid decryption key or file not available');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="file-view-loading">
        <FaSpinner className="spinning" size={30} />
        <p>Loading file information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-view-error">
        <h2>File Not Available</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Go to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="file-view-container">
      <div className="file-view-card">
        <div className="file-view-header">
          <FaLock size={30} className="lock-icon" />
          <h2>Secure File Download</h2>
        </div>
        
        <div className="file-view-body">
          <h3>{fileName}</h3>
          <p className="file-view-info">
            This file is encrypted and requires a decryption key to access.
            Please enter the decryption key that was provided to you.
          </p>
          
          <form onSubmit={handleDownload}>
            <div className="form-group">
              <label htmlFor="decryptionKey">Decryption Key</label>
              <input
                type="text"
                id="decryptionKey"
                className="form-control"
                placeholder="Enter the decryption key"
                value={decryptionKey}
                onChange={(e) => setDecryptionKey(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={downloading || !decryptionKey.trim()}
            >
              {downloading ? (
                <>
                  <FaSpinner className="spinning" style={{ marginRight: '8px' }} />
                  Decrypting...
                </>
              ) : (
                <>
                  <FaDownload style={{ marginRight: '8px' }} />
                  Download File
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="file-view-footer">
          <p>
            Powered by Secure File Share - End-to-end encrypted file sharing
          </p>
          <Link to="/" className="auth-link">Go to Homepage</Link>
        </div>
      </div>
    </div>
  );
};

export default FileView;
