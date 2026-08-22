export interface Metrics {
  word_count: number;
  character_count: number;
  sentence_count: number;
  paragraph_count: number;
  average_words_per_sentence: number;
  hashtag_count: number;
  question_count: number;
}

export interface Analysis {
  engagement_score: number;
  sentiment_label?: string;
  sentiment_score?: number;
  sentiment_summary?: string;
  strengths: string[];
  improvements: string[];
  model_used?: string;
}

export interface AnalyzeResponse {
  filename?: string;
  file_type?: string;
  page_count?: number;
  extracted_text?: string;
  metrics?: Metrics;
  analysis?: Analysis;
  engagement_score?: number;
  sentiment_label?: string;
  sentiment_score?: number;
  sentiment_summary?: string;
  strengths?: string[];
  improvements?: string[];
  model_used?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  extracted_text: string;
  analysis: Analysis;
  question: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  model_used?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
