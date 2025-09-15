<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Veo Video Generator

A modern, professional web application for generating videos using Google's Veo 2 and Veo 3 AI models.

## Features

- 🎥 **Veo 2 & Veo 3 Support**: Generate videos with both Veo model versions
- 📝 **Text-to-Video**: Create videos from text descriptions
- 🖼️ **Image-to-Video**: Transform static images into dynamic videos
- 🔄 **Background Processing**: Generate multiple videos simultaneously without waiting
- 📐 **Video Orientation**: Choose between horizontal (16:9) or vertical (9:16) formats
- 💾 **Universal Download**: Smart download system that works on desktop and mobile with fallback options
- 📱 **Responsive Design**: Professional UI that works on all devices
- 📊 **Generation Status**: Real-time status tracking with visual indicators
- ⚡ **Fast & Modern**: Built with React 19, TypeScript, and Vite

## Getting Started

### Prerequisites

- Node.js 18+
- Google AI Studio API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd veogenerator
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your Google AI API key to `.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

## Deployment to Vercel

### Via GitHub (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`: Your Google AI API key
4. Deploy automatically on push

### Via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables:
```bash
vercel env add GEMINI_API_KEY
```

## API Keys and Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Enable the Generative Language API in Google Cloud Console
4. Add the API key to your environment variables

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **AI Integration**: Google GenAI SDK
- **Deployment**: Vercel

## Project Structure

```
src/
├── components/          # React components
├── services/           # API services
├── types.ts           # TypeScript types
├── constants.ts       # App constants
├── App.tsx           # Main application
└── index.tsx         # Entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
