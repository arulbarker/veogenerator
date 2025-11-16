import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ModelVersion, GenerationType, VideoOrientation, GeneratedVideo, GenerationStatus } from './types';
import { MOCK_VIDEO_URL } from './constants';
import { generateVideo } from './services/geminiService';
import LoadingOverlay from './components/LoadingOverlay';
import GlitchText from './components/GlitchText';

const ControlPanel: React.FC<{
  apiKey: string;
  setApiKey: (key: string) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  modelVersion: ModelVersion;
  setModelVersion: (m: ModelVersion) => void;
  generationType: GenerationType;
  setGenerationType: (t: GenerationType) => void;
  videoOrientation: VideoOrientation;
  setVideoOrientation: (o: VideoOrientation) => void;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  onGenerate: () => void;
  processingCount: number;
}> = ({ apiKey, setApiKey, prompt, setPrompt, modelVersion, setModelVersion, generationType, setGenerationType, videoOrientation, setVideoOrientation, imageFile, setImageFile, onGenerate, processingCount }) => {
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const buttonStyle = "w-full px-4 py-2.5 text-center transition-all duration-200 rounded-lg font-medium border border-slate-600 enabled:hover:bg-blue-600 enabled:hover:border-blue-500 enabled:hover:shadow-lg enabled:hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Google AI API Key"
          className="w-full bg-slate-800/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white px-4 py-2.5 rounded-lg outline-none transition-all"
        />

        {/* API Key Info & Pricing */}
        <div className="mt-3 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg space-y-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-slate-300 space-y-2">
              <p>
                <span className="font-semibold text-blue-300">Aplikasi ini menggunakan API Key Gemini Veo pribadi.</span> Anda bayar langsung ke Google sesuai pemakaian (pay-as-you-go).
              </p>

              <div className="bg-slate-800/50 p-2 rounded">
                <p className="font-semibold text-blue-300 mb-1">💰 Harga (estimasi dalam Rupiah):</p>
                <ul className="space-y-0.5 ml-4 text-slate-400">
                  <li>• <span className="text-slate-300">Veo 2:</span> ~Rp 7.750/detik (~Rp 62.000 per 8 detik)</li>
                  <li>• <span className="text-slate-300">Veo 3:</span> Rp 11.625/detik (Rp 93.000 per 8 detik)</li>
                  <li>• <span className="text-slate-300">Veo 3 Fast:</span> Rp 6.200/detik (Rp 49.600 per 8 detik)</li>
                </ul>
                <p className="text-xs text-slate-500 mt-1 italic">*Kurs: 1 USD ≈ Rp 15.500</p>
              </div>
            </div>
          </div>

          {/* Tutorial & Alternative Buttons */}
          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-blue-700/30">
            <a
              href="https://youtu.be/GYQLT5yAD7M?si=CyTUysdt8iKkY2GJ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>📺 Tutorial: Cara Mendapatkan API Key Gemini</span>
            </a>

            <a
              href="https://labs.google/fx/tools/flow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <span>🎬 Alternatif: Google Labs Flow (Veo 3)</span>
            </a>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Video Prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Describe the video you want to generate..."
          className="w-full bg-slate-800/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white px-4 py-2.5 rounded-lg outline-none transition-all resize-none"
        />
      </div>

      <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Model Version</label>
          <div className="grid grid-cols-2 gap-3">
              {(Object.values(ModelVersion)).map(v => (
                  <button key={v} onClick={() => setModelVersion(v)} className={`${buttonStyle} ${modelVersion === v ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25' : 'text-slate-300 hover:text-white'}`}>{v}</button>
              ))}
          </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Generation Type</label>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {(Object.values(GenerationType)).map(t => (
                <button key={t} onClick={() => setGenerationType(t)} className={`${buttonStyle} ${generationType === t ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25' : 'text-slate-300 hover:text-white'}`}>{t}</button>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Video Orientation</label>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {(Object.values(VideoOrientation)).map(o => (
                <button key={o} onClick={() => setVideoOrientation(o)} className={`${buttonStyle} ${videoOrientation === o ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25' : 'text-slate-300 hover:text-white'}`}>{o}</button>
            ))}
        </div>
      </div>

      {generationType === GenerationType.IMAGE_TO_VIDEO && (
        <div>
          <label htmlFor="imageUpload" className={`${buttonStyle} text-slate-300 hover:text-white cursor-pointer block border-dashed border-2`}>
            {imageFile ? `Selected: ${imageFile.name}` : 'Upload Image'}
          </label>
          <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>
      )}

      <div className="space-y-2">
        <button onClick={onGenerate} disabled={!apiKey || !prompt || (generationType === GenerationType.IMAGE_TO_VIDEO && !imageFile)}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
          Generate Video
        </button>
        {processingCount > 0 && (
          <p className="text-center text-sm text-slate-400">
            {processingCount} video{processingCount > 1 ? 's' : ''} generating in background...
          </p>
        )}
      </div>
    </div>
  );
};

const HistoryPanel: React.FC<{ history: GeneratedVideo[] }> = ({ history }) => {
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
    const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());

    const downloadVideo = async (event: React.MouseEvent, video: GeneratedVideo) => {
        // Prevent any default button behavior that might cause refresh
        event.preventDefault();
        event.stopPropagation();

        if (!video.url) return;

        const fileName = `veo-video-${video.id.slice(-8)}.mp4`;

        // Add video to downloading state
        setDownloadingIds(prev => new Set(prev).add(video.id));

        try {
            // Fetch the video data in background
            const response = await fetch(video.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Check if we have a valid video blob
            if (blob.size === 0) {
                throw new Error('Video file is empty');
            }

            // Create blob URL for download (separate from video src)
            const downloadBlobUrl = window.URL.createObjectURL(blob);

            // Create download link and trigger download without affecting page
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadBlobUrl;
            downloadLink.download = fileName;
            downloadLink.style.display = 'none';
            downloadLink.rel = 'noopener noreferrer';

            // Add to DOM temporarily, click, then remove
            document.body.appendChild(downloadLink);

            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Clean up download blob URL after a delay (NOT the video src URL)
                setTimeout(() => {
                    window.URL.revokeObjectURL(downloadBlobUrl);
                }, 2000);
            }, 100);

        } catch (error) {
            console.error('Download failed:', error);

            // Show user-friendly error message without affecting the page
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setTimeout(() => {
                alert(`Download gagal: ${errorMsg}\n\nSilakan coba klik kanan pada video dan pilih "Save video as..."`);
            }, 100);
        } finally {
            // Remove video from downloading state after a delay to show feedback
            setTimeout(() => {
                setDownloadingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(video.id);
                    return newSet;
                });
            }, 500);
        }
    };

    const getStatusIcon = (status: GenerationStatus) => {
        switch (status) {
            case GenerationStatus.PROCESSING:
                return (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                );
            case GenerationStatus.COMPLETED:
                return (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case GenerationStatus.FAILED:
                return (
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    if (history.length === 0) {
        return (
            <div className="glass-panel p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 mb-4 text-slate-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Videos Yet</h3>
                <p className="text-slate-400">Your generated videos will appear here.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-slate-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generation History
            </h2>
            <div className="space-y-4">
                {history.map(video => (
                    <div key={video.id} className="relative bg-slate-800/30 rounded-lg p-4 border border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-3">
                            {getStatusIcon(video.status)}
                            <span className="text-xs font-medium capitalize text-slate-400">
                                {video.status === GenerationStatus.PROCESSING ? 'Generating...' : video.status}
                            </span>
                            {video.isSample && (
                                <div className="bg-amber-500 text-amber-900 text-xs font-medium px-2 py-1 rounded-full ml-auto">Sample</div>
                            )}
                        </div>

                        {video.status === GenerationStatus.COMPLETED && video.url ? (
                            <div className="space-y-3">
                                {videoErrors.has(video.id) ? (
                                    <div className="bg-slate-700/30 rounded-lg p-8 flex items-center justify-center text-slate-400 border border-red-500/30">
                                        <div className="text-center">
                                            <svg className="w-12 h-12 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm text-red-300 mb-2">Video playback error</p>
                                            <button
                                                onClick={() => {
                                                    setVideoErrors(prev => {
                                                        const newSet = new Set(prev);
                                                        newSet.delete(video.id);
                                                        return newSet;
                                                    });
                                                }}
                                                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                <video
                                    key={`video-${video.id}`}
                                    controls
                                    src={video.url}
                                    className="w-full rounded-lg bg-black"
                                    controlsList="download"
                                    preload="metadata"
                                    playsInline
                                    onContextMenu={(e) => {
                                        // Allow right-click on video for native save options
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        // Prevent event bubbling that might interfere with video controls
                                        e.stopPropagation();
                                    }}
                                    onPlay={(e) => {
                                        // Ensure video doesn't get interrupted by other events
                                        e.stopPropagation();
                                    }}
                                    onPause={(e) => {
                                        // Prevent pause event from bubbling up
                                        e.stopPropagation();
                                    }}
                                    onError={(e) => {
                                        // Handle video loading errors
                                        console.error('Video playback error for:', video.id, e);
                                        setVideoErrors(prev => new Set(prev).add(video.id));
                                        e.stopPropagation();
                                    }}
                                    onLoadStart={() => {
                                        // Clear any previous errors when video starts loading
                                        setVideoErrors(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(video.id);
                                            return newSet;
                                        });
                                    }}
                                    style={{ outline: 'none' }}
                                ></video>
                                )}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={(e) => downloadVideo(e, video)}
                                        disabled={downloadingIds.has(video.id)}
                                        type="button"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        {downloadingIds.has(video.id) ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </>
                                        )}
                                    </button>

                                    <div className="text-xs text-slate-400">
                                        MP4 • {video.orientation === 'Vertical (9:16)' ? '9:16' : '16:9'}
                                    </div>
                                </div>
                            </div>
                        ) : video.status === GenerationStatus.FAILED ? (
                            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-red-300 text-sm">
                                Generation failed: {video.error || 'Unknown error'}
                            </div>
                        ) : (
                            <div className="bg-slate-700/30 rounded-lg p-8 flex items-center justify-center text-slate-400">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm">Processing video...</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-3">
                            <p className="text-sm text-slate-300 font-medium mb-2">"{video.prompt}"</p>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span className="font-mono">{video.model} • {video.type} • {video.orientation}</span>
                                <span>{video.timestamp}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DevInfo: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const socialLinks = [
    { name: 'YouTube', url: 'https://www.youtube.com/@arulcg', icon: '📺' },
    { name: 'Instagram', url: 'https://www.instagram.com/arul.cg/', icon: '📷' },
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61578938703730', icon: '👥' },
    { name: 'Threads', url: 'https://www.threads.com/@arul.cg', icon: '🧵' },
    { name: 'X (Twitter)', url: 'https://x.com/ArulCg', icon: '🐦' },
    { name: 'LYNKID', url: 'https://lynk.id/arullagi', icon: '🔗' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Developer Support</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-slate-300 text-sm">Created by <span className="font-semibold text-blue-400">Arul CG</span></p>
          <p className="text-slate-400 text-xs mt-1">Support me by following on social media</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-blue-500 rounded-lg transition-all duration-200 text-slate-300 hover:text-white text-sm"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-600">
          <p className="text-xs text-slate-500 text-center">
            🎬 Veo 2: 720p Quality • Veo 3: 1080p (16:9) / 720p (9:16)<br/>
            Powered by Google Gemini Veo API
          </p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [modelVersion, setModelVersion] = useState<ModelVersion>(ModelVersion.VEO2);
  const [generationType, setGenerationType] = useState<GenerationType>(GenerationType.TEXT_TO_VIDEO);
  const [videoOrientation, setVideoOrientation] = useState<VideoOrientation>(VideoOrientation.HORIZONTAL);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<string>('');
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [showDevInfo, setShowDevInfo] = useState<boolean>(false);
  const generationQueue = useRef<Set<string>>(new Set());
  
  // Effect to clean up blob URLs to prevent memory leaks
  // Only cleanup when component unmounts, not when history changes
  useEffect(() => {
    return () => {
      history.forEach(video => {
        if (video.url && video.url.startsWith('blob:')) {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, []); // Remove history dependency to prevent premature cleanup

  const processingCount = history.filter(video => video.status === GenerationStatus.PROCESSING).length;

  const processVideoGeneration = useCallback(async (videoId: string, params: {
    apiKey: string;
    prompt: string;
    model: ModelVersion;
    orientation: VideoOrientation;
    type: GenerationType;
    imageFile?: File;
  }) => {
    try {
      generationQueue.current.add(videoId);

      const videoUrl = await generateVideo({
        apiKey: params.apiKey,
        prompt: params.prompt,
        model: params.model,
        orientation: params.orientation,
        imageFile: params.imageFile,
      });

      setHistory(prev => prev.map(video =>
        video.id === videoId
          ? { ...video, status: GenerationStatus.COMPLETED, url: videoUrl }
          : video
      ));

    } catch (err: any) {
      let errorMessage = err.message || 'An unknown error occurred during video generation.';

      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          // Smart Fallback: Show a notification and use sample video
          setNotification('API Quota Limit Reached. Displaying a sample video instead. Please check your Google AI Studio dashboard.');
          setHistory(prev => prev.map(video =>
            video.id === videoId
              ? { ...video, status: GenerationStatus.COMPLETED, url: MOCK_VIDEO_URL, isSample: true }
              : video
          ));
        } else {
          // Handle other errors normally
          if (errorMessage.includes('API key not valid')) {
            errorMessage = 'The API Key provided is not valid. Please check for typos or generate a new key from Google AI Studio.';
          } else if (errorMessage.includes('permission to access')) {
            errorMessage = 'The API key does not have permission for this model or service. Please ensure the Generative Language API is enabled in your Google Cloud project.';
          }

          setHistory(prev => prev.map(video =>
            video.id === videoId
              ? { ...video, status: GenerationStatus.FAILED, error: errorMessage }
              : video
          ));
        }
      } else {
        setHistory(prev => prev.map(video =>
          video.id === videoId
            ? { ...video, status: GenerationStatus.FAILED, error: 'Unknown error occurred' }
            : video
        ));
      }
    } finally {
      generationQueue.current.delete(videoId);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    setError('');
    setNotification('');

    const videoId = `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create pending video entry
    const newVideo: GeneratedVideo = {
      id: videoId,
      prompt,
      model: modelVersion,
      type: generationType,
      orientation: videoOrientation,
      timestamp: new Date().toLocaleString(),
      status: GenerationStatus.PROCESSING,
    };

    setHistory(prev => [newVideo, ...prev]);

    // Start background processing
    processVideoGeneration(videoId, {
      apiKey,
      prompt,
      model: modelVersion,
      orientation: videoOrientation,
      type: generationType,
      imageFile: generationType === GenerationType.IMAGE_TO_VIDEO ? imageFile! : undefined,
    });

  }, [apiKey, prompt, modelVersion, generationType, videoOrientation, imageFile, processVideoGeneration]);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="relative container mx-auto max-w-7xl">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setShowDevInfo(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-blue-500 rounded-lg transition-all duration-200 text-slate-300 hover:text-white text-sm"
              title="Developer Support"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Support Dev</span>
            </button>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 professional-glow">Veo Generator</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Transform your ideas into stunning videos with Google's Veo AI models</p>
        </header>

        {notification && (
            <div className="glass-panel bg-amber-500/10 border-amber-500/30 text-amber-200 p-4 mb-8 text-center rounded-lg" role="status">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Notice</span>
                </div>
                <p className="text-sm">{notification}</p>
            </div>
        )}

        {error && (
            <div className="glass-panel bg-red-500/10 border-red-500/30 text-red-200 p-4 mb-8 text-center rounded-lg" role="alert">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Error</span>
                </div>
                <p className="text-sm">{error}</p>
            </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="order-2 lg:order-1">
            <ControlPanel
              apiKey={apiKey} setApiKey={setApiKey}
              prompt={prompt} setPrompt={setPrompt}
              modelVersion={modelVersion} setModelVersion={setModelVersion}
              generationType={generationType} setGenerationType={setGenerationType}
              videoOrientation={videoOrientation} setVideoOrientation={setVideoOrientation}
              imageFile={imageFile} setImageFile={setImageFile}
              onGenerate={handleGenerate}
              processingCount={processingCount}
            />
          </section>
          <section className="order-1 lg:order-2 max-h-[50vh] lg:max-h-[80vh]">
            <HistoryPanel history={history} />
          </section>
        </main>

        <DevInfo isOpen={showDevInfo} onClose={() => setShowDevInfo(false)} />
      </div>
    </div>
  );
};

export default App;