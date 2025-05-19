import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Parameters } from "@/lib/types";

export function useTogetherAI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);

  const generateCompletion = async (
    prompt: string,
    parameters: Parameters,
    apiKey?: string
  ) => {
    setLoading(true);
    setError(null);
    
    const requestBody = {
      model: parameters.model,
      prompt: prompt,
      max_tokens: parameters.max_tokens,
      temperature: parameters.temperature,
      top_p: parameters.top_p,
      top_k: parameters.top_k,
      repetition_penalty: parameters.repetition_penalty,
      stop: parameters.stop ? parameters.stop : null,
      frequency_penalty: parameters.frequency_penalty,
    };
    
    setRequestData(requestBody);
    
    const startTime = Date.now();
    
    try {
      // Call API through our backend proxy to keep API key secure
      // API key is optional now as it can be provided by server environment variables
      const requestPayload: any = {
        prompt,
        parameters: requestBody,
      };
      
      // Only include API key if provided
      if (apiKey) {
        requestPayload.apiKey = apiKey;
      }
      
      const res = await apiRequest("POST", "/api/generate", requestPayload);
      
      const data = await res.json();
      const requestDuration = ((Date.now() - startTime) / 1000).toFixed(3);
      
      if (data.error) {
        setError(data.error);
        setResponse(null);
      } else {
        setResponse(data.text);
        setResponseData({
          ...data,
          headers: data.headers,
          body: data.body,
          metrics: {
            requestTime: requestDuration,
          },
          usage: data.usage,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    response,
    error,
    generateCompletion,
    requestData,
    responseData,
  };
}
