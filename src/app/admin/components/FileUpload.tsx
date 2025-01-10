'use client'

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadFile } from '@/utils/api';
import Dropdown from './Dropdown';

export function FileUpload({ onUploadSuccess }: { onUploadSuccess: any }) {
  const [files, setFiles] = useState<File[]>([]); // Changed from single file to array
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);

  const handleFileChange = (e: any) => {
    const selectedFiles = Array.from(e.target.files);

    // Validate all files
    const validFiles: any[] = selectedFiles.filter((file: any) =>
      file.type === 'application/pdf' || file.type === 'text/plain'
    );

    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were rejected. Please only select PDF or text files');
    } else {
      setError(null);
    }

    setFiles(validFiles);
  };

  const handleFileUpload = async (e: any) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    const uploadedFileIds: any[] = [];
    const progressIncrement = 100 / files.length;

    for (const file of files) {
      try {
        const response = await uploadFile(file, chunkSize, chunkOverlap);
        setUploadProgress(progress => progress + progressIncrement);
        uploadedFileIds.push(response.file_id);

        // Reset the file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
          (fileInput as HTMLInputElement).value = '';
        }

        toast.success('File uploaded successfully!');
      } catch (error: any) {
        setError(error.message || 'Error uploading file');
        toast.error(error.message || 'Error uploading file');
      }
    };

    setUploadProgress(100);
    setLoading(false);
    onUploadSuccess(uploadedFileIds);
    setFiles([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>

      <form onSubmit={handleFileUpload} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt"
            multiple={true}
          />
          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="mt-2 text-sm text-gray-600">
              {files.length > 0
                ? `${files.length} files selected`
                : 'Drop files here or click to select'}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              PDF or TXT files only (max 100MB)
            </span>
          </label>
        </div>

        {/* Show selected files list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.name} className="flex items-center space-x-2">
                <span className="text-sm">{file.name}</span>
                {uploadProgress[file.name] > 0 && uploadProgress[file.name] < 100 && (
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className='flex flex-row space-x-4'>
          <Dropdown title="Settings" align='left'>
            <div>
              <label htmlFor="chunkSize" className="block text-sm/6 font-medium text-gray-900">
                Chunk Size
              </label>
              <div className="mt-2">
                <input
                  id="chunkSize"
                  name="chunkSize"
                  type="number"
                  placeholder="1000"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label htmlFor="chunkOverlap" className="block text-sm/6 font-medium text-gray-900">
                Chunk Overlap
              </label>
              <div className="mt-2">
                <input
                  id="chunkOverlap"
                  name="chunkOverlap"
                  type="number"
                  placeholder="200"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                />
              </div>
            </div>
          </Dropdown >
          <button
            type="submit"
            disabled={files.length === 0 || loading}
            className={`w-full py-1 px-4 rounded-lg text-white font-medium ${files.length === 0 || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {loading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </form>
    </div>
  );
}