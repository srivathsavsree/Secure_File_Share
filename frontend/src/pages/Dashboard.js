import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { FaUpload, FaQrcode, FaSpinner, FaTrash, FaSync, FaKey } from 'react-icons/fa';
import DecryptionKeyModal from '../components/DecryptionKeyModal';

// File Upload Component
const FileUpload = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const { uploadFile } = useFiles();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/plain': [],
      'application/zip': [],
      'application/x-rar-compressed': []
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      if (!recipientEmail) {
        toast.error('Please enter recipient email');
        return;
      }

      try {
        setUploading(true);
        await uploadFile(acceptedFiles[0], recipientEmail);
        toast.success('File uploaded and shared successfully. Refresh the list to see your shared file.');
        setRecipientEmail('');
      } catch (error) {
        toast.error(error.message || 'Failed to upload and share file');
      } finally {
        setUploading(false);
      }
    }
  });

  return (
    <div className="upload-section">
      <h3 style={{ marginBottom: '20px' }}>Share a File</h3>
      
      <div className="form-group">
        <label htmlFor="recipientEmail" className="form-label">Recipient Email *</label>
        <input
          type="email"
          id="recipientEmail"
          className="form-control"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          required
          placeholder="Enter recipient's email"
        />
      </div>
      
      <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <FaUpload size={36} color="#1976D2" style={{ marginBottom: '10px' }} />
          <p>CHOOSE FILE</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
            (Drag & drop a file here, or click to select)
          </p>
        </div>
      </div>

      <button 
        className="btn btn-primary btn-block" 
        style={{ marginTop: '20px' }}
        disabled={uploading || !recipientEmail}
      >
        {uploading ? (
          <>
            <FaSpinner style={{ marginRight: '10px', animation: 'spin 1s linear infinite' }} />
            UPLOADING...
          </>
        ) : (
          'UPLOAD & SHARE'
        )}
      </button>
    </div>
  );
};

// QR Code Modal
const QRCodeModal = ({ qrCode, fileName, onClose, decryptionKey }) => {
  // Get decryption key from the selected file
  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(decryptionKey);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content qr-modal">
        <div className="qr-header">
          <h3 className="modal-title">QR Code for {fileName}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="qr-code-container">
          <div className="qr-code">
            <img src={qrCode} alt="QR Code" width="200" height="200" />
          </div>
          <div className="qr-instructions">
            <h4>How to use:</h4>
            <ol>
              <li>Scan this QR code using your mobile device</li>
              <li>You'll be directed to a secure page</li>
              <li>Enter the decryption key shown below when prompted</li>
              <li>Download and access your file</li>
            </ol>
          </div>
        </div>
        
        <div className="qr-decryption-key">
          <h4>Decryption Key:</h4>
          <div className="key-display-container">
            <span className="key-display-full">{decryptionKey}</span>
            <button 
              className="copy-btn"
              onClick={handleCopyKey}
              title="Copy decryption key"
            >
              {copySuccess ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
          <p className="key-instruction">Share this key securely with the recipient</p>
        </div>
        
        <div className="qr-info-text">
          <p><strong>Security Note:</strong> When the QR code is scanned, the user will be directed to a secure page where they must enter this decryption key before downloading the file. This ensures end-to-end encryption for your data.</p>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// File Tabs Component
const FileTabs = () => {
  const [activeTab, setActiveTab] = useState('shared');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDecryptionModal, setShowDecryptionModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);
  const [decryptionLoading, setDecryptionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { sharedFiles, receivedFiles, loading, getSharedFiles, getReceivedFiles, downloadFile, deleteSharedFile, setIsInitialized } = useFiles();

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      if (activeTab === 'shared') {
        await getSharedFiles(forceRefresh);
      } else {
        await getReceivedFiles(forceRefresh);
      }
      
      // Mark initial load as complete after first successful fetch
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
        setIsInitialized(true); // Signal FileContext to start auto-refresh
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching files');
      toast.error(err.message || 'Failed to load files');
    }
  }, [activeTab, getSharedFiles, getReceivedFiles, initialLoadComplete, setIsInitialized]);

  // Function to handle manual refresh with visual feedback
  const handleRefresh = async () => {
    toast.info('Refreshing files...');
    await fetchData(true); // Force refresh from server
    toast.success('Files refreshed successfully');
  };

  useEffect(() => {
    fetchData(false); // Use cached data if available
  }, [fetchData]);

  const handleShowQR = (file) => {
    setSelectedFile(file);
    setShowQRModal(true);
  };

  const handleDownload = async (fileId, key) => {
    try {
      setDecryptionLoading(true);
      toast.info('Preparing download...');
      
      // Use our API service to handle the download
      const fileBlob = await downloadFile(fileId, key);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(fileBlob);
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ''); // This will use the file's name from Content-Disposition
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started successfully');
    } catch (error) {
      toast.error('Download failed: ' + (error.message || 'Unknown error'));
    } finally {
      setDecryptionLoading(false);
      setShowDecryptionModal(false);
      setFileToDownload(null);
    }
  };

  // Handle initiating download with decryption modal
  const initiateDownload = (file) => {
    setFileToDownload(file);
    setShowDecryptionModal(true);
  };

  // Handle decryption key submission
  const handleDecryptSubmit = (key) => {
    if (fileToDownload) {
      handleDownload(fileToDownload.file._id, key);
    }
  };

  return (
    <div className="tab-container">
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          SHARED FILES
        </div>
        <div
          className={`tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          RECEIVED FILES
        </div>
      </div>

      <div className="tab-content">
        {error ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              style={{ marginTop: '15px' }}
              onClick={() => handleRefresh()}
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <FaSpinner size={30} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '10px' }}>Loading files...</p>
          </div>
        ) : activeTab === 'shared' ? (
          <div className="file-list">
            <div className="file-list-actions">
              <h3>Your Shared Files</h3>
              <button 
                className="refresh-btn" 
                onClick={() => handleRefresh()} 
                title="Refresh List"
                disabled={loading}
              >
                <FaSync className={loading ? 'spinning' : ''} />
              </button>
            </div>              <div className="file-list-header">
              <div>File Name</div>
              <div>Shared With</div>
              <div>Date</div>
              <div>Status</div>
              <div style={{textAlign: 'center'}}>Actions</div>
            </div>
            {sharedFiles && sharedFiles.length > 0 ? (
              sharedFiles.map((share) => (
                <div className="file-item" key={share._id}>
                  <div className="file-name">{share.file.originalName}</div>
                  <div>{share.recipient.email}</div>
                  <div>{new Date(share.createdAt).toLocaleDateString()}</div>
                  <div className="file-status">
                    <span className={`status-badge ${share.isAccessed ? 'downloaded' : 'pending'}`}>
                      {share.isAccessed ? 'Downloaded' : 'Pending'}
                    </span>
                  </div>
                  <div className="file-actions">
                    <button
                      className="action-btn delete-btn"
                      onClick={async () => {
                        if(window.confirm(`Are you sure you want to delete the shared file "${share.file.originalName}"?`)) {
                          try {
                            await deleteSharedFile(share._id);
                            toast.success('File share deleted successfully. Click refresh to update the list.');
                          } catch (error) {
                            toast.error('Failed to delete: ' + (error.message || 'Unknown error'));
                          }
                        }
                      }}
                      title="Delete Share"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                No shared files found
              </div>
            )}
          </div>
        ) : (
          <div className="file-list">
            <div className="file-list-actions">
              <h3>Files Shared With You</h3>
              <button 
                className="refresh-btn" 
                onClick={() => handleRefresh()} 
                title="Refresh List"
                disabled={loading}
              >
                <FaSync className={loading ? 'spinning' : ''} />
              </button>
            </div>              <div className="file-list-header">
              <div>File Name</div>
              <div>From</div>
              <div>Date</div>
              <div>Decryption Key</div>
              <div style={{textAlign: 'center'}}>Actions</div>
            </div>
            {receivedFiles && receivedFiles.length > 0 ? (
              receivedFiles.map((share) => (
                <div className="file-item" key={share._id}>
                  <div className="file-name">{share.file.originalName}</div>
                  <div>{share.sender.email}</div>
                  <div>{new Date(share.createdAt).toLocaleDateString()}</div>
                  <div className="decryption-key-section">
                    <span className="key-display">{share.decryptionKey.substring(0, 8)}...</span>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(share.decryptionKey);
                        toast.info('Decryption key copied to clipboard');
                      }}
                      title="Copy key"
                    >
                      <FaKey style={{ marginRight: '4px' }} /> Copy
                    </button>
                  </div>
                  <div className="file-actions">
                    <button
                      className="action-btn download-btn"
                      onClick={() => initiateDownload(share)}
                      title="Download"
                    >
                      <FaKey />
                    </button>
                    <button
                      className="action-btn qrcode-btn"
                      onClick={() => handleShowQR(share)}
                      title="QR Code"
                    >
                      <FaQrcode />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                No received files found
              </div>
            )}
          </div>
        )}
      </div>

      {showQRModal && selectedFile && (
        <QRCodeModal
          qrCode={selectedFile.qrCode}
          fileName={selectedFile.file.originalName}
          decryptionKey={selectedFile.decryptionKey}
          onClose={() => {
            setShowQRModal(false);
            setSelectedFile(null);
          }}
        />
      )}
      
      {showDecryptionModal && fileToDownload && (
        <DecryptionKeyModal
          fileName={fileToDownload.file.originalName}
          onDecrypt={handleDecryptSubmit}
          onCancel={() => {
            setShowDecryptionModal(false);
            setFileToDownload(null);
          }}
          loading={decryptionLoading}
        />
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome {user.name}</h2>
      </div>
      
      <FileUpload />
      <FileTabs />
    </div>
  );
};

export default Dashboard;
