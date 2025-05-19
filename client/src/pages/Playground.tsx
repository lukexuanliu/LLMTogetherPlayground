import { useState, useEffect } from "react";
import PromptPanel from "@/components/PromptPanel";
import ResponsePanel from "@/components/ResponsePanel";
import APIKeyModal from "@/components/APIKeyModal";
import HistoryModal from "@/components/HistoryModal";
import { useToast } from "@/hooks/use-toast";
import { History } from "@/lib/types";
import { useTogetherAI } from "@/hooks/useTogetherAI";

const Playground = () => {
  const [prompt, setPrompt] = useState<string>("Write a short story about a robot learning to feel emotions.");
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<History[]>([]);
  const [parameters, setParameters] = useState({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    max_tokens: 256,
    temperature: 0.7,
    top_p: 0.8,
    top_k: 40,
    repetition_penalty: 1,
    stop: "",
    frequency_penalty: 0,
  });

  const { toast } = useToast();
  const { 
    generateCompletion, 
    response, 
    loading, 
    error, 
    requestData, 
    responseData 
  } = useTogetherAI();

  // Check if API key exists on load
  useEffect(() => {
    const apiKey = localStorage.getItem("togetherApiKey");
    // Don't force API key modal open anymore since server can use env variable
    // Just load it if it exists
    
    // Load history from localStorage
    const savedHistory = localStorage.getItem("promptHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("promptHistory", JSON.stringify(history));
  }, [history]);

  const handleSaveApiKey = (apiKey: string) => {
    localStorage.setItem("togetherApiKey", apiKey);
    setApiKeyModalOpen(false);
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved locally and will be used for requests.",
    });
  };

  const handleRun = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt before running.",
        variant: "destructive",
      });
      return;
    }

    // Get API key if it exists, but it's optional now
    const apiKey = localStorage.getItem("togetherApiKey") || undefined;

    try {
      await generateCompletion(prompt, parameters, apiKey);
      
      // Add to history if successful
      if (response) {
        const newHistoryItem: History = {
          id: Date.now().toString(),
          prompt,
          model: parameters.model,
          timestamp: new Date(),
          tokensUsed: responseData?.usage?.total_tokens || 0,
        };
        
        setHistory((prev) => [newHistoryItem, ...prev].slice(0, 50));
      }
    } catch (err) {
      console.error("Error generating completion:", err);
    }
  };

  const handleLoadFromHistory = (item: History) => {
    setPrompt(item.prompt);
    setHistoryModalOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "Your prompt history has been cleared.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      {/* Header */}
      <header className="border-b border-[#DADCE0] sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#2D2D2D]">
              Together.ai <span className="text-[#4285F4]">Playground</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="flex items-center px-4 py-2 bg-[#F1F3F4] hover:bg-gray-200 rounded-md transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              {localStorage.getItem("togetherApiKey") ? "Change API Key" : "Set API Key (Optional)"}
            </button>
            <a
              href="https://docs.together.ai/reference/inference"
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-[#4285F4] hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              Docs
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-6">
          <PromptPanel
            prompt={prompt}
            setPrompt={setPrompt}
            parameters={parameters}
            setParameters={setParameters}
            onRun={handleRun}
            onOpenHistory={() => setHistoryModalOpen(true)}
            debugMode={debugMode}
            setDebugMode={setDebugMode}
          />
          <ResponsePanel
            response={response}
            loading={loading}
            error={error}
            debugMode={debugMode}
            requestData={requestData}
            responseData={responseData}
          />
        </div>
      </div>

      {/* Modals */}
      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
      />
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={history}
        onSelect={handleLoadFromHistory}
        onClear={handleClearHistory}
      />
    </div>
  );
};

export default Playground;
