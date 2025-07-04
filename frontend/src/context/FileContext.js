import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import api from '../utils/api';

const FileContext = createContext();

export const useFiles = () => useContext(FileContext);

export const FileProvider = ({ children }) => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create debounce timers using refs
  const sharedFilesTimer = useRef(null);
  const receivedFilesTimer = useRef(null);
  
  // Add cache timestamp refs for API calls
  const sharedFilesTimestamp = useRef(0);
  const receivedFilesTimestamp = useRef(0);
  
  // Polling interval refs
  const pollingInterval = useRef(null);
  const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds in milliseconds
  
  // Cache duration in milliseconds (1 minute)
  const CACHE_DURATION = 60 * 1000;
  
  // Function to debounce calls
  const debounce = (func, delay, timerRef) => {
    return (...args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      return new Promise((resolve) => {
        timerRef.current = setTimeout(() => {
          resolve(func(...args));
        }, delay);
      });
    };
  };

  // Compare function to check if there are actual changes in the files
  const haveFilesChanged = (oldFiles, newFiles) => {
    if (!oldFiles || !newFiles) return true;
    if (oldFiles.length !== newFiles.length) return true;
    
    // Create maps for quick lookup
    const oldMap = new Map(oldFiles.map(file => [file._id, file]));
    const newMap = new Map(newFiles.map(file => [file._id, file]));
    
    // Check if any files were added or removed
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) return true;
    }
    
    for (const id of newMap.keys()) {
      if (!oldMap.has(id)) return true;
    }
    
    // Check if any file status has changed (like isAccessed)
    for (const [id, newFile] of newMap.entries()) {
      const oldFile = oldMap.get(id);
      if (oldFile && oldFile.isAccessed !== newFile.isAccessed) return true;
    }
    
    return false;
  };

  // Auto-refresh function that polls for updates without showing loading state
  const autoRefreshData = useCallback(async () => {
    try {
      // Fetch shared files silently
      const sharedRes = await api.get('/files/shared');
      if (sharedRes.data.status === 'success') {
        const newSharedFiles = sharedRes.data.data.shares;
        if (haveFilesChanged(sharedFiles, newSharedFiles)) {
          setSharedFiles(newSharedFiles);
          sharedFilesTimestamp.current = Date.now();
          logCacheStatus('Shared files', false, true);
        }
      }
      
      // Fetch received files silently
      const receivedRes = await api.get('/files/received');
      if (receivedRes.data.status === 'success') {
        const newReceivedFiles = receivedRes.data.data.shares || [];
        if (haveFilesChanged(receivedFiles, newReceivedFiles)) {
          setReceivedFiles(newReceivedFiles);
          receivedFilesTimestamp.current = Date.now();
          logCacheStatus('Received files', false, true);
        }
      }
    } catch (err) {
      console.error('Silent auto-refresh error:', err);
      // Don't show error to the user for background refreshes
    }
  }, [sharedFiles, receivedFiles]);

  // Start polling when component mounts
  useEffect(() => {
    // Only start polling after initial data load
    if (!isInitialized) return;
    
    // Clear any existing polling interval
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    // Set up a new polling interval
    pollingInterval.current = setInterval(() => {
      autoRefreshData();
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isInitialized, autoRefreshData]);

  // Upload a file
  const uploadFile = async (file, recipientEmail) => {
    try {
      setLoading(true);
      
      // First upload the file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadRes.data.status !== 'success') {
        throw new Error('File upload failed');
      }
      
      // Then share the file if recipient email is provided
      if (recipientEmail) {
        const fileId = uploadRes.data.data.file.id;
        
        const shareRes = await api.post('/files/share', {
          fileId,
          recipientEmail
        });
        
        if (shareRes.data.status !== 'success') {
          throw new Error('File sharing failed');
        }
      }
      
      // Don't automatically refresh the shared files list
      // Let the user refresh manually for consistency
      
      setLoading(false);
      return uploadRes.data;
    } catch (err) {
      setLoading(false);
      throw err.response ? err.response.data : new Error(err.message);
    }
  };

  // Get files shared by the user with debouncing to prevent excessive requests
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getSharedFilesDebounced = useCallback(
    debounce(
      async (forceRefresh = false) => {
        try {
          setLoading(true);
          
          // Check cache first
          if (!forceRefresh && isCacheValid(sharedFilesTimestamp.current)) {
            logCacheStatus('Shared files', true);
            setLoading(false);
            return { status: 'success', message: 'Fetched from cache', data: { shares: sharedFiles } };
          }
          
          logCacheStatus('Shared files', false);
          const res = await api.get('/files/shared');
          
          if (res.data.status === 'success') {
            setSharedFiles(res.data.data.shares);
            sharedFilesTimestamp.current = Date.now(); // Update cache timestamp
          }
          
          setLoading(false);
          return res.data;
        } catch (err) {
          setLoading(false);
          console.error('Error fetching shared files:', err);
          return { status: 'error', message: 'Failed to fetch shared files' };
        }
      },
      300, // Debounce delay in ms
      sharedFilesTimer
    ),
    [sharedFiles] // Include sharedFiles dependency to access the latest state
  );

  // Wrapped version for external use
  const getSharedFiles = async (forceRefresh = false) => {
    try {
      return await getSharedFilesDebounced(forceRefresh);
    } catch (err) {
      console.error('Error in getSharedFiles:', err);
      return { status: 'error', message: 'Failed to fetch shared files' };
    }
  };

  // Get files shared with the user with debouncing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getReceivedFilesDebounced = useCallback(
    debounce(
      async (forceRefresh = false) => {
        try {
          setLoading(true);
          
          // Check cache first
          if (!forceRefresh && isCacheValid(receivedFilesTimestamp.current)) {
            logCacheStatus('Received files', true);
            setLoading(false);
            return { status: 'success', message: 'Fetched from cache', data: { shares: receivedFiles } };
          }
          
          logCacheStatus('Received files', false);
          const res = await api.get('/files/received');
          
          if (res.data.status === 'success') {
            setReceivedFiles(res.data.data.shares || []);
            receivedFilesTimestamp.current = Date.now(); // Update cache timestamp
          }
          
          setLoading(false);
          return res.data;
        } catch (err) {
          setLoading(false);
          console.error('Error fetching received files:', err);
          return { status: 'error', message: 'Failed to fetch received files' };
        }
      },
      300, // Debounce delay in ms
      receivedFilesTimer
    ),
    [receivedFiles] // Include receivedFiles dependency to access the latest state
  );

  // Wrapped version for external use
  const getReceivedFiles = async (forceRefresh = false) => {
    try {
      return await getReceivedFilesDebounced(forceRefresh);
    } catch (err) {
      console.error('Error in getReceivedFiles:', err);
      return { status: 'error', message: 'Failed to fetch received files' };
    }
  };

  // Download a file
  const downloadFile = async (fileId, key) => {
    try {
      setLoading(true);
      
      const res = await api.get(`/files/download/${fileId}?key=${key}`, {
        responseType: 'blob'
      });
      
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err.response ? err.response.data : new Error(err.message);
    }
  };

  // Get QR code for a file
  const getQRCode = async (fileId) => {
    try {
      setLoading(true);
      
      const res = await api.get(`/files/qr/${fileId}`);
      
      setLoading(false);
      return res.data.data.qrCode;
    } catch (err) {
      setLoading(false);
      throw err.response ? err.response.data : new Error(err.message);
    }
  };

  // Delete a shared file
  const deleteSharedFile = async (shareId) => {
    try {
      setLoading(true);
      
      const res = await api.delete(`/files/shares/${shareId}`);
      
      // Don't automatically update the list - let the user refresh manually
      // This avoids unexpected UI changes when deleting items
      
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err.response ? err.response.data : new Error(err.message);
    }
  };

  // Helper function to check if cache is valid
  const isCacheValid = (timestamp) => {
    return timestamp > 0 && (Date.now() - timestamp < CACHE_DURATION);
  };
  
  // Helper function to log cache status (useful for debugging)
  const logCacheStatus = (cacheType, isUsingCache, isSilent = false) => {
    if (process.env.NODE_ENV === 'development' && !isSilent) {
      console.log(`${cacheType} data: ${isUsingCache ? 'Using cache' : 'Fetching from server'}`);
    }
  };
  
  return (
    <FileContext.Provider
      value={{
        sharedFiles,
        receivedFiles,
        loading,
        uploadFile,
        getSharedFiles,
        getReceivedFiles,
        downloadFile,
        getQRCode,
        deleteSharedFile,
        setIsInitialized // Expose setIsInitialized to mark when initial data is loaded
      }}
    >
      {children}
    </FileContext.Provider>
  );
};
