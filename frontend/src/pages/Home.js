import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaClock, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
  return (
    <div>
      <div style={{ background: '#f5f8fa', padding: '50px 0', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Secure File Share</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 30px' }}>
          Secure File Share provides end-to-end encrypted file sharing to ensure
          your data remains private and secure.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '60px' }}>
        <div style={{ flex: '1', minWidth: '300px', background: 'white', padding: '30px', borderRadius: '4px', margin: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <FaLock size={40} color="#1976D2" />
          </div>
          <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>End-to-End Encryption</h2>
          <p style={{ textAlign: 'center' }}>Your files are encrypted before transmission and only decrypted by the recipient</p>
        </div>

        <div style={{ flex: '1', minWidth: '300px', background: 'white', padding: '30px', borderRadius: '4px', margin: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <FaClock size={40} color="#1976D2" />
          </div>
          <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Self-Destructing Files</h2>
          <p style={{ textAlign: 'center' }}>Files automatically delete after being downloaded or reaching expiration</p>
        </div>

        <div style={{ flex: '1', minWidth: '300px', background: 'white', padding: '30px', borderRadius: '4px', margin: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <FaShieldAlt size={40} color="#1976D2" />
          </div>
          <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Secure Sharing</h2>
          <p style={{ textAlign: 'center' }}>Generate secure links to share your files with anyone safely</p>
        </div>
      </div>

      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>How It Works</h2>
        <p style={{ marginBottom: '20px' }}>
          Secure File Share uses advanced encryption algorithms to protect your files during transit and storage. When you upload a
          file to share, we:
        </p>
        <ol style={{ marginLeft: '30px', lineHeight: '1.8' }}>
          <li>Encrypt your file with a unique encryption key</li>
          <li>Send a secure link to your recipient via email</li>
          <li>Separately send the decryption key to ensure maximum security</li>
          <li>Allow the recipient to download and decrypt the file</li>
          <li>Automatically delete the file after download or expiration</li>
        </ol>
      </div>

      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Our Commitment to Privacy</h2>
        <p>
          We designed Secure File Share with privacy as the top priority. We do not have access to your encryption keys, meaning
          even we cannot access your files. Your data remains private and secure at all times.
        </p>
      </div>

      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <Link to="/register" style={{ 
          background: '#1976D2', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '4px', 
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-block'
        }}>
          Get Started Now
        </Link>
      </div>
    </div>
  );
};

export default Home;
