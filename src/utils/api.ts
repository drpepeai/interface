'use client'

import axios from 'axios';

// Constants
const SUPAVEC_API = 'https://api.supavec.com';
const GAIA_API = 'https://llama3b.gaia.domains/v1/chat/completions';

/**
 * Uploads a file to the server.
 * @param {File} file - The file to upload.
 * @param {number} chunk_size - The chunk size to use for the file.
 * @param {number} chunk_overlap - The chunk overlap to use for the file.
 * @returns {Promise<object>} - The response data from the server.
*/
export const uploadFile = async (file: File, chunk_size = 1000, chunk_overlap = 200) => {
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
      params: {
        chunk_size,
        chunk_overlap
      },
      data: formData
    });

    if (response.status !== 200) {
      throw new Error('File upload failed');
    }

    return response.data;
  } catch (error) {
    console.log({ error })
    throw new Error("File upload error");
  }
};


/**
 * Uploads text content to the server.
 * @param {string} name - The name of the text content.
 * @param {string} contents - The text content to upload.
 * @returns {Promise<object>} - The response data from the server.
*/
export const uploadText = async (name: string, contents: string) => {
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
export const getFiles = async (offset = 0, limit = 500, order_dir = 'desc') => {
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
export const searchEmbeddings = async (query: string, file_ids: string[], k = 3) => {
  console.log("searchEmbeddings query: ", { query, file_ids, k })
  const response = await axios({
    url: `${SUPAVEC_API}/embeddings`,
    method: 'POST',
    headers: {
      authorization: process.env.NEXT_PUBLIC_SUPAVEC_API_KEY,
    },
    data: { query, file_ids, k },
    timeout: 30_000
  });

  console.log("searchEmbeddings response: ", { response })

  if (response.status !== 200) {
    console.log("searchEmbeddings error: ", { response })
    throw new Error('Failed to search embeddings');
  }

  return response.data;
};

/**
 * Asks a question about documents using Gaia.
 * @param {string} question - The question to ask.
 * @param {string} context - The context from documents to provide for the question.
 * @param {string} systemPrompt - The system prompt to use for the question.
 * @returns {Promise<object>} - The response data from the server.
*/
export const askQuestion = async (question: string, context: string, systemPrompt?: string) => {
  console.log("askQuestion question: ", { question, context, systemPrompt })
  try {
    // Format the prompt with context
    const prompt = `Context from documents: ${context}\n\nQuestion: ${question}\n\nAnswer based on the provided context:`;

    const response = await axios.post(GAIA_API, {
      messages: [
        { role: 'system', content: systemPrompt || 'You are an AI assistant tasked with providing detailed answers based on the given context. Your goal is to analyze the information provided and formulate a comprehensive, well-structured response to the question.\n\n When answering questions:\n1. Thoroughly analyze both the context from the knowledge base and the specific question\n 2. Organize your thoughts and plan your response to ensure a logical flow\n 3. Formulate a detailed answer using only information from the provided context\n 4. Be comprehensive while staying focused on the question\n 5. If the available context lacks sufficient information, clearly state this\n Important: Base your response solely on the provided context from the knowledge base and question.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama'
    });

    console.log("askQuestion response: ", { response })

    return response.data;
  } catch (error) {
    console.log({ error })
    throw new Error('Failed to ask question');
  }
};