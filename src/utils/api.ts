'use client'

import axios from 'axios';

// Constants
const SUPAVEC_API = 'https://api.supavec.com';
const GAIA_API = 'https://llama3b.gaia.domains/v1/chat/completions';

/**
 * Uploads a file to the server.
 * @param {File} file - The file to upload.
 * @returns {Promise<object>} - The response data from the server.
*/
export const uploadFile = async (file:File) => {
  try {
    // Create a new FormData instance
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios({
      url: `${SUPAVEC_API}/upload_file`,
      method: 'POST',
      headers: {
        authorization: process.env.NEXT_PUBLIC_SUPAVEC_API_KEY,
      },
      data: formData
    });

    if (response.status !== 200) {
      throw new Error('File upload failed');
    }

    return response.data;
  } catch (error) {
    console.log({error})
    throw new Error("File upload error");
  }
};


/**
 * Uploads text content to the server.
 * @param {string} name - The name of the text content.
 * @param {string} contents - The text content to upload.
 * @returns {Promise<object>} - The response data from the server.
*/
export const uploadText = async (name:string, contents:string) => {
  const response = await axios({
    url: `${SUPAVEC_API}/upload_text`,
    method: 'POST',
    headers: {
      authorization: process.env.NEXT_PUBLIC_SUPAVEC_API_KEY,
    },
    data: { name, contents }
  });

  if (response.status !== 200) {
    throw new Error('Failed to upload text');
  }

  return response.data;
};

// Get list of files
export const getFiles = async (offset = 0, limit = 50, order_dir = 'desc') => {
  const response = await axios({
    url: `${SUPAVEC_API}/user_files`,
    method: 'POST',
    headers: {
      authorization: process.env.NEXT_PUBLIC_SUPAVEC_API_KEY,
    },
    data: {
      pagination: { limit: limit, offset: offset },
      order_dir
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get files');
  }

  return response.data
};

/**
 * Searches embeddings based on a query and file IDs.
 * @param {string} query - The search query.
 * @param {Array<string>} fileIds - The IDs of the files to search within.
 * @param {number} k - The number of results to return.
 * @returns {Promise<object>} - The response data from the server.
*/
export const searchEmbeddings = async (query:string, file_ids:string[], k = 10) => {
  const response = await axios({
    url: `${SUPAVEC_API}/embeddings`,
    method: 'POST',
    headers: {
      authorization: process.env.NEXT_PUBLIC_SUPAVEC_API_KEY,
    },
    data: { query, file_ids, k }
  });

  if (response.status !== 200) {
    throw new Error('Failed to search embeddings');
  }

  return response.data;
};

/**
 * Asks a question about documents using Gaia.
 * @param {string} question - The question to ask.
 * @param {string} context - The context from documents to provide for the question.
 * @returns {Promise<object>} - The response data from the server.
*/
export const askQuestion = async (question:string, context:string) => {
  try {
    // Format the prompt with context
    const prompt = `Context from documents: ${context}\n\nQuestion: ${question}\n\nAnswer based on the provided context:`;

    const response = await axios.post(GAIA_API, {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that answers questions based on provided document context.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama'
    });

    return response.data;
  } catch (error) {
    console.log({error})
    throw new Error('Failed to ask question');
  }
};