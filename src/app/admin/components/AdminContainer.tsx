'use client'

import React, { useCallback, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { ChatInterface } from './ChatInterface';
import { getFiles } from '@/utils/api';

export default function AdminContainer() {
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadFiles = useCallback(async (isRefresh = false, fileOffset = 0, limit = 500) => {
    setLoading(true);
    try {
      const response = await getFiles(fileOffset, limit);
      // Deduplicate files based on file_id
      const newFiles = response.results;
      if (isRefresh) {
        // For refresh, just use the new files after deduplication
        const uniqueFiles = Array.from(new Map(newFiles.map((file: any) => [file.file_id, file])).values());
        setSelectedFiles(uniqueFiles.map((file: any) => file.file_id));
        setFiles(uniqueFiles);
      } else {
        // For pagination, combine with existing files and deduplicate
        const combinedFiles = [...files, ...newFiles];
        const uniqueFiles = Array.from(new Map(combinedFiles.map((file: any) => [file.file_id, file])).values());
        setSelectedFiles(uniqueFiles.map((file: any) => file.file_id));
        setFiles(uniqueFiles);
      }

      setHasMore(response.results.length === 500);
      if (isRefresh) {
        setPage(0);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [page, files, setSelectedFiles]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ToastContainer position="top-right" />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <FileUpload onUploadSuccess={loadFiles} />
            <FileList
              onFileSelect={(fileId: any) => {
                setSelectedFiles(prev =>
                  prev.includes(fileId)
                    ? prev.filter(id => id !== fileId)
                    : [...prev, fileId]
                );
              }}
              setSelectedFiles={setSelectedFiles}
              selectedFiles={selectedFiles}
              refreshTrigger={refreshTrigger} // Add this prop
              loadFiles={loadFiles}
              files={files}
              hasMore={hasMore}
              loading={loading}
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