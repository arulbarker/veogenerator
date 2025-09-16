import { GoogleGenAI } from "@google/genai";
import { ModelVersion, VideoOrientation } from '../types';
import { MODEL_MAP, MODEL_RESOLUTION_MAP } from '../constants';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface GenerateVideoParams {
  apiKey: string;
  prompt: string;
  model: ModelVersion;
  orientation: VideoOrientation;
  imageFile?: File;
}

export const generateVideo = async ({ apiKey, prompt, model, orientation, imageFile }: GenerateVideoParams): Promise<string> => {
  if (!apiKey) {
    throw new Error('API Key is required to generate video.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = MODEL_MAP[model];

  const aspectRatio = orientation === VideoOrientation.VERTICAL ? '9:16' : '16:9';

  const generateVideosParams: any = {
    model: modelName,
    prompt,
    config: {
      numberOfVideos: 1,
      aspectRatio: aspectRatio,
    }
  };

  // Only add resolution parameter for Veo 3 models that support it
  if (model === ModelVersion.VEO3) {
    generateVideosParams.config.resolution = MODEL_RESOLUTION_MAP[model];
  }

  if (imageFile) {
    const base64Image = await fileToBase64(imageFile);
    generateVideosParams.image = {
      imageBytes: base64Image,
      mimeType: imageFile.type,
    };
  }
  
  let operation = await ai.models.generateVideos(generateVideosParams);

  while (!operation.done) {
    // Wait for 10 seconds before checking the status again.
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error('Video generation failed or returned no link.');
  }

  // The download link needs the API key to be accessed.
  const finalUrl = `${downloadLink}&key=${apiKey}`;

  // **FIX:** Fetch the video data and create a blob URL to avoid CORS issues.
  const response = await fetch(finalUrl);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch generated video. Status: ${response.status}. Body: ${errorBody}`);
  }
  
  const videoBlob = await response.blob();
  const objectUrl = URL.createObjectURL(videoBlob);
  
  return objectUrl;
};