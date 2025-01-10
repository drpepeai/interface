'use client'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { searchEmbeddings, askQuestion } from '@/utils/api';
import { useState } from 'react';
import Dropdown from './Dropdown';
import files from '../../../../files.json';

export function ChatInterface({ selectedFiles }: { selectedFiles: any }) {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [k, setK] = useState(3);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [fileContext, setFileContext] = useState<any[]>([]);

    const handleSubmit = async (e: any) => {
        console.log("START")
        e.preventDefault();
        if (!question.trim() || selectedFiles.length === 0) return;

        setLoading(true);
        setError(null);
        setFileContext([]);
        try {
            console.log("SEARCHING EMBEDDINGS")
            // First, search for relevant context
            const searchResponse = await searchEmbeddings(question, selectedFiles, k);
            console.log("SEARCH RESPONSE: ", { searchResponse })
            const context = searchResponse.documents
                .map((doc: any) => doc.content)
                .join('\n\n');

            setFileContext(searchResponse.documents.map((doc: any) => {
                return {
                    name: files.find((file: any) => file.file_id === doc.file_id).file_name,
                    content: doc.content,
                    score: doc.score
                }
            }))

            // Then, ask Gaia using the context
            console.log("ASKING QUESTION")
            const systemPromptTrimmed = systemPrompt.trim();
            const answer = await askQuestion(question, context, systemPromptTrimmed.length > 0 ? systemPromptTrimmed : undefined);

            setMessages((prev: any) => [
                ...prev,
                { role: 'user', content: question },
                { role: 'assistant', content: formatResponse(answer.choices[0].message.content) }
            ]);

            setQuestion('');
        } catch (error: any) {
            console.error('Error asking question:', error);
            setError(error.message);
            setMessages((prev: any) => [
                ...prev,
                { role: 'user', content: question },
                {
                    role: 'system',
                    content: '❌ Sorry, I encountered an error processing your question. Please try again.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Format the response to enhance readability
    const formatResponse = (content: any) => {
        // Add proper markdown formatting for questions and answers
        return content.replace(/\*\*Question \d+\*\*/g, '\n### $&\n')
            .replace(/\*\*Answer\*\*/g, '\n#### Answer ')
            .replace(/([A-D]\.)(?=\s)/g, '\n$1') // Add newlines before options
            .trim();
    };

    return (
        <div>
            <div className="bg-white rounded-lg shadow-md p-6 h-[calc(100vh-200px)] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Chat</h2>
                    {selectedFiles.length > 0 && (
                        <span className="text-sm text-gray-500">
                            {selectedFiles.length} file(s) selected
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg ${message.role === 'user'
                                ? 'bg-blue-50 ml-8'
                                : message.role === 'system'
                                    ? 'bg-red-50'
                                    : 'bg-gray-50 mr-8'
                                }`}
                        >
                            <p className="text-sm font-medium mb-2 text-gray-600">
                                {message.role === 'user' ? '👤 You' :
                                    message.role === 'system' ? '⚠️ System' : '🤖 Assistant'}
                            </p>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                                        h4: ({ node, ...props }) => <h4 className="text-md font-medium mt-3 mb-2" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-pulse flex space-x-2">
                                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} >
                    <label htmlFor="comment" className="sr-only">
                        Comment
                    </label>
                    <div>
                        <textarea
                            id="comment"
                            name="comment"
                            rows={3}
                            placeholder={selectedFiles.length === 0
                                ? "Please select documents first..."
                                : "Ask a question about the selected documents..."}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            disabled={selectedFiles.length === 0 || loading}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>
                    <div className="mt-2 flex justify-end space-x-4">
                        <Dropdown title="Settings">
                            <label htmlFor="systemPrompt" className="block text-sm/6 font-medium text-gray-900">
                                System Prompt
                            </label>
                            <div>
                                <textarea
                                    id="systemPrompt"
                                    name="systemPrompt"
                                    rows={3}
                                    placeholder={selectedFiles.length === 0
                                        ? "Please select documents first..."
                                        : "Add your own system prompt here..."}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    disabled={selectedFiles.length === 0 || loading}
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === ' ') {
                                            e.stopPropagation();
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label htmlFor="k" className="block text-sm/6 font-medium text-gray-900">
                                    Number of Context Documents
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="k"
                                        name="k"
                                        type="number"
                                        placeholder="3"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </Dropdown>

                        <button
                            type="submit"
                            disabled={!question.trim() || selectedFiles.length === 0 || loading}
                            className="bg-blue-500 text-white px-4 py-1 rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
                        >
                            {loading ? 'Thinking...' : 'Ask'}
                        </button>
                    </div>
                </form>
            </div>
            <div className='w-full bg-white rounded-lg shadow-md p-6 mt-4'>
                {fileContext.map((file: any) => (
                    <div key={file.file_id} className='w-full'>
                        <h3 className='text-lg font-semibold'>{file.name} - {file.score}</h3>
                        <p className='text-sm text-gray-500 whitespace-pre-wrap break-words w-full'>
                            {file.content.replace(/([A-D]\.)(?=\s)/g, '\n$1').trim()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}