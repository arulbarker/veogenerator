export enum ModelVersion {
  VEO2 = 'Veo 2',
  VEO3 = 'Veo 3',
}

export enum GenerationType {
  TEXT_TO_VIDEO = 'Text-to-Video',
  IMAGE_TO_VIDEO = 'Image-to-Video',
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  model: ModelVersion;
  type: GenerationType;
  timestamp: string;
  thumbnail?: string; // For future use
  isSample?: boolean;
}