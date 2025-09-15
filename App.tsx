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

    const downloadVideo = async (video: GeneratedVideo) => {
        if (!video.url) return;

        const fileName = `veo-video-${video.id.slice(-8)}.mp4`;

        // Add video to downloading state
        setDownloadingIds(prev => new Set(prev).add(video.id));

        try {
            // Fetch the video data
            const response = await fetch(video.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Check if we have a valid video blob
            if (blob.size === 0) {
                throw new Error('Video file is empty');
            }

            // Create blob URL for download
            const blobUrl = window.URL.createObjectURL(blob);

            // Create download link and trigger download
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = fileName;
            downloadLink.style.display = 'none';

            // Add to DOM, click, then remove immediately
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Clean up blob URL after download starts
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 1000);

        } catch (error) {
            console.error('Download failed:', error);

            // Show user-friendly error message
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            alert(`Download gagal: ${errorMsg}\n\nSilakan coba klik kanan pada video dan pilih "Save video as..."`);
        } finally {
            // Remove video from downloading state
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(video.id);
                return newSet;
            });
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
                    <div key={video.id} className="relative bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
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
                                <video
                                    controls
                                    src={video.url}
                                    className="w-full rounded-lg bg-black"
                                    controlsList="download"
                                    onContextMenu={(e) => {
                                        // Allow right-click on video for native save options
                                        e.stopPropagation();
                                    }}
                                ></video>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => downloadVideo(video)}
                                        disabled={downloadingIds.has(video.id)}
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
  const generationQueue = useRef<Set<string>>(new Set());
  
  // Effect to clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      history.forEach(video => {
        if (video.url && video.url.startsWith('blob:')) {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, [history]);

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
        <header className="text-center mb-12">
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
      </div>
    </div>
  );
};

export default App;