import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import ParametersPanel from "./ParametersPanel";
import { Parameters } from "@/lib/types";

interface PromptPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  parameters: Parameters;
  setParameters: (parameters: Parameters) => void;
  onRun: () => void;
  onOpenHistory: () => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
}

const PromptPanel = ({
  prompt,
  setPrompt,
  parameters,
  setParameters,
  onRun,
  onOpenHistory,
  debugMode,
  setDebugMode,
}: PromptPanelProps) => {
  const [parametersExpanded, setParametersExpanded] = useState(true);

  return (
    <div className="lg:w-1/2 flex flex-col">
      <div className="bg-white rounded-lg border border-[#DADCE0] shadow-sm flex flex-col h-full">
        <div className="p-4 border-b border-[#DADCE0] flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#202124]">Prompt</h2>
          <button
            onClick={onOpenHistory}
            className="text-[#4285F4] hover:text-[#4285F4]/80 transition flex items-center"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            History
          </button>
        </div>
        <div className="p-4 flex-grow">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full h-64 p-3 border border-[#DADCE0] rounded-md resize-none focus:ring-2 focus:ring-[#4285F4] focus:outline-none code-font text-sm custom-scrollbar"
          />
        </div>

        {/* Parameters Panel */}
        <div className="border-t border-[#DADCE0]">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setParametersExpanded(!parametersExpanded)}
          >
            <h3 className="font-medium text-[#202124]">Parameters</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform ${
                parametersExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {parametersExpanded && (
            <ParametersPanel
              parameters={parameters}
              setParameters={setParameters}
            />
          )}
        </div>

        <div className="p-4 border-t border-[#DADCE0] flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full ${debugMode ? 'bg-[#4285F4]' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${debugMode ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm text-[#202124]">Debug Mode</div>
          </label>
          <Button
            onClick={onRun}
            className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white px-6 py-2 rounded-md transition"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Run
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;
