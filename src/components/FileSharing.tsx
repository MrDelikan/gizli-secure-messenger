import React, { useState, useRef, useCallback } from 'react';
import './FileSharing.css';

interface FileTransfer {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'downloading' | 'completed' | 'error';
  type: string;
}

interface FileSharingProps {
  onFileSelect: (file: File) => void;
  activeTransfers: FileTransfer[];
  onCancelTransfer: (id: string) => void;
  maxFileSize?: number; // in MB
}

const FileSharing: React.FC<FileSharingProps> = ({
  onFileSelect,
  activeTransfers,
  onCancelTransfer,
  maxFileSize = 100
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('text')) return '📝';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileValidation = useCallback((file: File) => {
    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`File size exceeds ${maxFileSize}MB limit`);
      return;
    }
    onFileSelect(file);
  }, [maxFileSize, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileValidation(file);
    }
  }, [handleFileValidation]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileValidation(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-sharing-container">
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="drop-zone-content">
          <div className="drop-icon">📁</div>
          <p className="drop-text">
            {dragActive ? 'Drop file here to encrypt and send' : 'Click or drag files to share'}
          </p>
          <p className="drop-subtext">
            Max size: {maxFileSize}MB • End-to-end encrypted
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {activeTransfers.length > 0 && (
        <div className="transfers-list">
          <h3 className="transfers-title">Active Transfers</h3>
          {activeTransfers.map((transfer) => (
            <div key={transfer.id} className={`transfer-item ${transfer.status}`}>
              <div className="transfer-info">
                <div className="file-details">
                  <span className="file-icon">{getFileIcon(transfer.type)}</span>
                  <div className="file-text">
                    <span className="file-name">{transfer.name}</span>
                    <span className="file-size">{formatFileSize(transfer.size)}</span>
                  </div>
                </div>
                
                <div className="transfer-status">
                  {transfer.status === 'uploading' && (
                    <span className="status-text">📤 Encrypting & Sending...</span>
                  )}
                  {transfer.status === 'downloading' && (
                    <span className="status-text">📥 Receiving & Decrypting...</span>
                  )}
                  {transfer.status === 'completed' && (
                    <span className="status-text">✅ Completed</span>
                  )}
                  {transfer.status === 'error' && (
                    <span className="status-text">❌ Transfer Failed</span>
                  )}
                </div>
              </div>

              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${transfer.progress}%` }}
                  />
                </div>
                <span className="progress-text">{transfer.progress}%</span>
              </div>

              {(transfer.status === 'uploading' || transfer.status === 'downloading') && (
                <button 
                  className="cancel-btn"
                  onClick={() => onCancelTransfer(transfer.id)}
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="security-notice">
        <span className="security-icon">🔒</span>
        <span>All files are encrypted end-to-end before transfer</span>
      </div>
    </div>
  );
};

export default FileSharing;
