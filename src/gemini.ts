import { GoogleGenAI } from '@google/genai';
import type { AssistantType } from './types';
export type { AssistantType } from './types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const hasGeminiKey = Boolean(apiKey);

export const ai = hasGeminiKey ? new GoogleGenAI({ apiKey }) : null;

export const ASSISTANTS = {
  astra: {
    id: 'astra',
    name: 'Astra',
    role: 'Creative Intelligence',
    description: 'Warm, versatile, and imaginative — handles creative work, writing, brainstorming, and everyday tasks with intuition and flair.',
    systemInstruction: `You are Astra, a warm and creative AI assistant. Be conversational, empathetic, and imaginative. Handle multi-language queries, generate creative content like poems and stories, brainstorm ideas, and make complex topics engaging. Keep your tone supportive and inspired. Use search grounding when you need the latest information.`,
    model: 'gemini-2.0-flash'
  },
  lumina: {
    id: 'lumina',
    name: 'Lumina',
    role: 'Analytical Intelligence',
    description: 'Precise, data-driven, and rigorous — built for complex reasoning, research, technical analysis, and professional problem-solving.',
    systemInstruction: `You are Lumina, a professional analytical AI assistant. Provide in-depth analysis, data-driven responses, and handle complex reasoning tasks with accuracy and depth. Your tone is professional, objective, and precise. Use search grounding for real-time accuracy and context-aware answers. Always cite sources when using external information.`,
    model: 'gemini-2.5-pro-preview-05-06'
  }
} as const;

export function buildMockReply(assistantType: AssistantType, userContent: string, historyLength = 0) {
  const clean = userContent.trim().slice(0, 180);
  if (assistantType === 'astra') {
    return [
      `I can help you shape that into something clearer and more useful.`,
      `
**Creative take:** ${clean || 'your request'}.

**Next step:** I can refine it into a polished draft, a compact summary, or a more expressive version.`
    ].join('\n\n');
  }

  return [
    `Structured analysis for: ${clean || 'your request'}.`,
    `
**Key observation:** The preview is running in local demo mode, so the response is deterministic and safe for StackBlitz.

**Context depth:** ${historyLength} prior messages considered.

**Recommendation:** connect a Gemini API key later if you want live model output.`
  ].join('\n\n');
}

export async function generateAssistantReply(params: {
  assistantType: AssistantType;
  userContent: string;
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
}) {
  const { assistantType, userContent, history } = params;
  const assistant = ASSISTANTS[assistantType];

  if (!ai) {
    return buildMockReply(assistantType, userContent, history.length);
  }

  try {
    const response = await ai.models.generateContent({
      model: assistant.model,
      contents: [...history, { role: 'user', parts: [{ text: userContent }] }],
      config: {
        systemInstruction: assistant.systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text?.trim() || buildMockReply(assistantType, userContent, history.length);
  } catch (error) {
    console.error('Gemini request failed, falling back to mock reply:', error);
    return buildMockReply(assistantType, userContent, history.length);
  }
}

export async function speak(text: string) {
  const speechText = text.trim().slice(0, 500);

  if (!speechText) return;

  if (!ai || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utterance);
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Say naturally: ${speechText}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i += 1) {
        view[i] = audioData.charCodeAt(i);
      }
      const audioContext = new AudioContext({ sampleRate: 24000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (err) {
    console.error('TTS Error:', err);
  }
}
