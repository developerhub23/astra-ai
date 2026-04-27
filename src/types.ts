export type AssistantType = 'astra' | 'lumina';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  assistantType: AssistantType;
  updatedAt: Date;
  createdAt: Date;
  lastMessage?: string;
  userId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'assistant';
  content: string;
  multimodalData?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    mimeType?: string;
  };
  feedback?: number;
  createdAt: Date;
}
