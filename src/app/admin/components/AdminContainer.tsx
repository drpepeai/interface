'use client'

import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { ChatInterface } from './ChatInterface';

export default function AdminContainer() {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refresh
  const handleFileUploadSuccess = (fileId:any) => {
    setSelectedFiles(prev => [...prev, fileId]);
    // Increment refreshTrigger to force FileList to reload
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ToastContainer position="top-right" />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <FileUpload onUploadSuccess={handleFileUploadSuccess} />
            <FileList
              onFileSelect={(fileId:any) => {
                setSelectedFiles(prev =>
                  prev.includes(fileId)
                    ? prev.filter(id => id !== fileId)
                    : [...prev, fileId]
                );
              }}
              setSelectedFiles={setSelectedFiles}
              selectedFiles={selectedFiles}
              refreshTrigger={refreshTrigger} // Add this prop
            />
          </div>

          <div className="md:col-span-4">
            <ChatInterface selectedFiles={selectedFiles} />
          </div>
        </div>
      </main>
    </div>
  );
}