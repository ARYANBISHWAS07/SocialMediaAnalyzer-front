import type { AnalyzeResponse, ApiErrorResponse, ChatRequest, ChatResponse } from "@/types/analysis";

const API_BASE_URL = "http://3.6.187.53:8000";

console.info("Frontend API_BASE_URL:", API_BASE_URL);

export async function analyzeFile(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    console.info("Analyze API:", `${API_BASE_URL}/api/analyze`);
    response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      body: formData
    });
  } catch {
    throw new Error("Could not connect to the analysis service. Please try again in a moment.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as AnalyzeResponse;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  let response: Response;

  try {
    console.info("Chat API:", `${API_BASE_URL}/api/chat`);
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });
  } catch {
    throw new Error("Could not connect to the chat service. Please try again in a moment.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as ChatResponse;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.error?.message || "The analysis service could not process this file.";
  } catch {
    return "The analysis service could not process this file.";
  }
}
