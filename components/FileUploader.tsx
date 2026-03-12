'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploaderProps {
  onUpload: (file: File) => void
  isLoading: boolean
  disabled?: boolean
}

export default function FileUploader({ onUpload, isLoading, disabled }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled) {
        onUpload(acceptedFiles[0])
      }
    },
    [onUpload, disabled]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: isLoading || disabled,
  })

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? '#7dd4a0' : disabled ? '#1a1a28' : '#2a2a3a'}`,
        borderRadius: 8,
        padding: '48px 32px',
        textAlign: 'center',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        background: isDragActive ? 'rgba(125,212,160,0.05)' : '#0c0c16',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40,
            border: '2px solid #1a3a26',
            borderTop: '2px solid #7dd4a0',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#7dd4a0', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>
            Extracting data...
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 36 }}>
            {isDragActive ? '📂' : '📄'}
          </div>
          <div>
            <p style={{ color: isDragActive ? '#7dd4a0' : '#e8e4d9', fontSize: 15, marginBottom: 6 }}>
              {isDragActive ? 'Drop it here' : 'Drop invoice or receipt'}
            </p>
            <p style={{ color: '#555', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
              PDF, JPG, PNG, WebP · up to 10MB
            </p>
          </div>
          {!isDragActive && (
            <div style={{
              marginTop: 8,
              padding: '8px 20px',
              background: '#1a3a26',
              border: '1px solid #2a5a3a',
              borderRadius: 4,
              color: '#7dd4a0',
              fontSize: 12,
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.05em',
            }}>
              Browse files
            </div>
          )}
        </div>
      )}
    </div>
  )
}
