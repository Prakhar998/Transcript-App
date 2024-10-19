# Real-Time Voice-to-Text Application

### App deployed : https://transcript-app-sage.vercel.app/

This is a real-time voice-to-text web application built using the **Deepgram** API for voice recognition, **Next.js** as the React framework, and **Material-UI (MUI)** for the user interface components. The app allows users to convert their spoken words into written text in real time by leveraging the browser's microphone.

## Features

- **Start Microphone**: Users can initiate voice input by clicking on the "Start Microphone" button.
- **Pause Microphone**: Users can pause the voice input during an ongoing session.
- **Real-time Transcript**: The transcript is displayed on the screen as the user speaks, with minimal delay.
- **Stop Microphone**: Users can stop the voice input session and end the transcript.

## Technology Stack

- **Next.js**: React-based framework for building server-side rendered and static web applications.
- **Material-UI (MUI)**: Library for creating elegant user interfaces using React components.
- **Deepgram**: Real-time speech-to-text API for voice recognition and transcription.
- **TypeScript**: Provides type safety and better developer experience in a React environment.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: v14.0.0 or higher.
- **npm**: v6.0.0 or higher (comes with Node.js).
- **Deepgram API Key**: You will need an API key from [Deepgram](https://deepgram.com) to access their real-time voice recognition services.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/voice-to-text-app.git
   cd voice-to-text-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Deepgram API**:
   - Go to [Deepgram](https://deepgram.com) and create an account.
   - Get your API key from the dashboard.
   - Create a `.env.local` file in the root of the project and add your API key:
     ```
     NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key
     ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   - Navigate to `http://localhost:3000` in your browser.

## File Structure

```plaintext
.
├── app/
│   ├── components/
│   │   └── Microphone.tsx     # Microphone component handling real-time voice-to-text
│   ├── page.tsx               # Main page displaying the Microphone component
├── public/                    # Static assets (if any)
├── styles/                    # Global styles (if needed)
├── .env.local                 # API key for Deepgram
├── README.md                  # Project documentation
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies and scripts
```

## Usage

1. **Start the Microphone**: Click the "Start Microphone" button to begin recording your voice.
2. **Real-time Transcription**: As you speak, the application will convert your speech to text in real time, displaying the transcript on the screen.
3. **Stop the Microphone**: Click "Stop Microphone" to stop recording and end the voice input session.

## Customization

You can customize various aspects of the application, including:

- **Language**: The transcription language is currently set to `en-US`. You can change this in the `Microphone.tsx` component by modifying the `language` property when connecting to Deepgram.
- **Appearance**: The UI is built using Material-UI, so you can easily modify the styles and components in the `Microphone.tsx` component.

## Known Issues

- This application currently supports only the Chrome browser due to its reliance on the WebRTC API for accessing the microphone.
- Ensure that microphone permissions are enabled in your browser.

## Troubleshooting

1. **API Errors**: If you encounter API errors, ensure that your Deepgram API key is valid and correctly set in the `.env.local` file.
2. **No Transcript**: If the transcript is not showing, check the browser console for any errors and ensure your microphone is working.


---

This `README.md` provides clear instructions on how to use, set up, and customize your application, as well as relevant details on the technology stack.


