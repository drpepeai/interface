'use client'

import { useState, useEffect, useCallback } from 'react';
import { getFiles } from '@/utils/api';

export function FileList({ onFileSelect, setSelectedFiles, selectedFiles, refreshTrigger }: { onFileSelect: Function, setSelectedFiles: Function, selectedFiles: any, refreshTrigger: any }) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Move loadFiles into useCallback to prevent unnecessary recreations
  const loadFiles = useCallback(async (isRefresh = false) => {
    setLoading(true);
    try {
      const response = await getFiles(isRefresh ? 0 : page * 100);
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

      setHasMore(response.results.length === 100);
      if (isRefresh) {
        setPage(0);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [page, files, setSelectedFiles]);

  // Check for duplicate file names
  const getDuplicateStatus = (fileName: any) => {
    return files.filter((file: any) => file.file_name === fileName).length > 1;
  };

  useEffect(() => {
    loadFiles();
  }, [page]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadFiles(true); // Pass true to indicate this is a refresh
    }
  }, [refreshTrigger, loadFiles]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Files</h2>
        <span>
          <span className="text-sm text-gray-500">
            {files.length} total files | {" "}
          </span>
          <span className="text-sm text-gray-500">
            {selectedFiles.length} selected files
          </span>
        </span>
      </div>
      <div className='flex flex-row items-center space-x-2 mb-4 justify-end'>
        {!loading && hasMore && (
          <button
            type="button"
            className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => setPage(p => p + 1)}
          >
            Load More
          </button>
        )}
        <button
          type="button"
          className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => setSelectedFiles([])}
        >
          Deselect All
        </button>
        <button
          type="button"
          className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => setSelectedFiles(files.map((file: any) => file.file_id))}
        >
          Select All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading files...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => {
            const isDuplicate = getDuplicateStatus(file.file_name);
            return (
              <div
                key={file.file_id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedFiles.includes(file.file_id)
                  ? 'border-blue-500 bg-blue-50'
                  : isDuplicate
                    ? 'border-yellow-300 hover:border-yellow-400'
                    : 'hover:border-gray-300'
                  }`}
                onClick={() => onFileSelect(file.file_id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{file.file_name}</h3>
                      {isDuplicate && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Duplicate
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                    {isDuplicate && (
                      <p className="text-xs text-yellow-600 mt-1">
                        File ID: {file.file_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                  {selectedFiles.includes(file.file_id) && (
                    <span className="text-blue-500 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}