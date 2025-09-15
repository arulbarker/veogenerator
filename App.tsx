import React, { useState, useCallback, useEffect } from 'react';
import { ModelVersion, GenerationType, GeneratedVideo } from './types';
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
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}> = ({ apiKey, setApiKey, prompt, setPrompt, modelVersion, setModelVersion, generationType, setGenerationType, imageFile, setImageFile, onGenerate, isLoading }) => {
  
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

      {generationType === GenerationType.IMAGE_TO_VIDEO && (
        <div>
          <label htmlFor="imageUpload" className={`${buttonStyle} text-slate-300 hover:text-white cursor-pointer block border-dashed border-2`}>
            {imageFile ? `Selected: ${imageFile.name}` : 'Upload Image'}
          </label>
          <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>
      )}

      <button onClick={onGenerate} disabled={isLoading || !apiKey || !prompt || (generationType === GenerationType.IMAGE_TO_VIDEO && !imageFile)}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? 'Generating...' : 'Generate Video'}
      </button>
    </div>
  );
};

const HistoryPanel: React.FC<{ history: GeneratedVideo[] }> = ({ history }) => {
    if (history.length === 0) {
        return (
            <div className="glass-panel p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 mb-4 text-slate-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
                        {video.isSample && (
                            <div className="absolute top-3 right-3 bg-amber-500 text-amber-900 text-xs font-medium px-2 py-1 rounded-full">Sample</div>
                        )}
                        <video controls src={video.url} className="w-full rounded-lg mb-3 bg-black"></video>
                        <p className="text-sm text-slate-300 font-medium mb-2">"{video.prompt}"</p>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span className="font-mono">{video.model} • {video.type}</span>
                            <span>{video.timestamp}</span>
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<string>('');
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  
  // Effect to clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      history.forEach(video => {
        if (video.url.startsWith('blob:')) {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, [history]);

  const handleGenerate = useCallback(async () => {
    setError('');
    setNotification('');
    setIsLoading(true);

    try {
      const videoUrl = await generateVideo({
        apiKey,
        prompt,
        model: modelVersion,
        imageFile: generationType === GenerationType.IMAGE_TO_VIDEO ? imageFile! : undefined,
      });

      const newVideo: GeneratedVideo = {
        id: new Date().toISOString(),
        url: videoUrl,
        prompt,
        model: modelVersion,
        type: generationType,
        timestamp: new Date().toLocaleString(),
      };

      setHistory(prev => [newVideo, ...prev]);

    } catch (err: any) {
      let errorMessage = err.message || 'An unknown error occurred during video generation.';
       if (typeof errorMessage === 'string') {
          if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            // Smart Fallback: Show a notification and a sample video instead of a hard error
            setNotification('API Quota Limit Reached. Displaying a sample video instead. Please check your Google AI Studio dashboard.');
            const sampleVideo: GeneratedVideo = {
              id: new Date().toISOString(),
              url: MOCK_VIDEO_URL,
              prompt: prompt,
              model: modelVersion,
              type: generationType,
              timestamp: new Date().toLocaleString(),
              isSample: true,
            };
            setHistory(prev => [sampleVideo, ...prev]);
          } else {
            // Handle other errors normally
            if (errorMessage.includes('API key not valid')) {
              errorMessage = 'The API Key provided is not valid. Please check for typos or generate a new key from Google AI Studio.';
            } else if (errorMessage.includes('permission to access')) {
              errorMessage = 'The API key does not have permission for this model or service. Please ensure the Generative Language API is enabled in your Google Cloud project.';
            }
            setError(`Generation Failed: ${errorMessage}`);
          }
       } else {
         setError(`Generation Failed: ${errorMessage}`);
       }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, prompt, modelVersion, generationType, imageFile]);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="relative container mx-auto max-w-7xl">
        {isLoading && <LoadingOverlay />}

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
              imageFile={imageFile} setImageFile={setImageFile}
              onGenerate={handleGenerate}
              isLoading={isLoading}
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