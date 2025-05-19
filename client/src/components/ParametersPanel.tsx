import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { Parameters } from "@/lib/types";

interface ParametersPanelProps {
  parameters: Parameters;
  setParameters: (parameters: Parameters) => void;
}

const ParametersPanel = ({ parameters, setParameters }: ParametersPanelProps) => {
  const [advancedParamsVisible, setAdvancedParamsVisible] = useState(false);

  const handleParameterChange = (name: keyof Parameters, value: any) => {
    setParameters({ ...parameters, [name]: value });
  };

  return (
    <div className="p-4 border-t border-[#DADCE0]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm mb-1">Model</Label>
          <div className="flex items-center">
            <Input
              type="text"
              value={parameters.model}
              onChange={(e) => handleParameterChange("model", e.target.value)}
              placeholder="Enter model name (e.g., meta-llama/Llama-2-70b-chat-hf)"
              className="w-full p-2 border border-[#DADCE0] rounded-md focus:ring-2 focus:ring-[#4285F4] focus:outline-none bg-white code-font text-sm"
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Popular models: 
            <button 
              type="button" 
              onClick={() => handleParameterChange("model", "meta-llama/Llama-2-70b-chat-hf")}
              className="ml-1 text-[#4285F4] hover:underline"
            >
              Llama-2-70b
            </button>
            <span className="mx-1">•</span>
            <button 
              type="button" 
              onClick={() => handleParameterChange("model", "mistralai/Mistral-7B-Instruct-v0.2")}
              className="text-[#4285F4] hover:underline"
            >
              Mistral-7B
            </button>
            <span className="mx-1">•</span>
            <button 
              type="button" 
              onClick={() => handleParameterChange("model", "togethercomputer/llama-2-7b")}
              className="text-[#4285F4] hover:underline"
            >
              Llama-2-7b
            </button>
          </div>
        </div>
        <div>
          <Label className="block text-sm mb-1">Max Tokens</Label>
          <Input
            type="number"
            min={1}
            max={4096}
            value={parameters.max_tokens}
            onChange={(e) => handleParameterChange("max_tokens", parseInt(e.target.value) || 1)}
            className="w-full p-2 border border-[#DADCE0] rounded-md focus:ring-2 focus:ring-[#4285F4] focus:outline-none code-font text-sm"
          />
        </div>
        <div>
          <Label className="block text-sm mb-1">Temperature: {parameters.temperature.toFixed(2)}</Label>
          <div className="flex items-center">
            <Slider
              value={[parameters.temperature]}
              min={0}
              max={2}
              step={0.01}
              onValueChange={(value) => handleParameterChange("temperature", value[0])}
              className="w-full mr-2"
            />
            <span className="code-font text-sm w-10">{parameters.temperature.toFixed(2)}</span>
          </div>
        </div>
        <div>
          <Label className="block text-sm mb-1">Top P: {parameters.top_p.toFixed(2)}</Label>
          <div className="flex items-center">
            <Slider
              value={[parameters.top_p]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => handleParameterChange("top_p", value[0])}
              className="w-full mr-2"
            />
            <span className="code-font text-sm w-10">{parameters.top_p.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => setAdvancedParamsVisible(!advancedParamsVisible)}
          className="text-[#4285F4] hover:text-[#4285F4]/80 text-sm flex items-center"
        >
          {advancedParamsVisible ? (
            <Minus className="h-4 w-4 mr-1" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          Advanced Parameters
        </button>
        
        {advancedParamsVisible && (
          <div className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm mb-1">Top K</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={parameters.top_k}
                  onChange={(e) => handleParameterChange("top_k", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-[#DADCE0] rounded-md focus:ring-2 focus:ring-[#4285F4] focus:outline-none code-font text-sm"
                />
              </div>
              <div>
                <Label className="block text-sm mb-1">Repetition Penalty</Label>
                <Input
                  type="number"
                  min={1}
                  max={2}
                  step={0.01}
                  value={parameters.repetition_penalty}
                  onChange={(e) => handleParameterChange("repetition_penalty", parseFloat(e.target.value) || 1)}
                  className="w-full p-2 border border-[#DADCE0] rounded-md focus:ring-2 focus:ring-[#4285F4] focus:outline-none code-font text-sm"
                />
              </div>
              <div>
                <Label className="block text-sm mb-1">Stop Sequences</Label>
                <Input
                  type="text"
                  placeholder="e.g. ###"
                  value={parameters.stop}
                  onChange={(e) => handleParameterChange("stop", e.target.value)}
                  className="w-full p-2 border border-[#DADCE0] rounded-md focus:ring-2 focus:ring-[#4285F4] focus:outline-none code-font text-sm"
                />
              </div>
              <div>
                <Label className="block text-sm mb-1">Frequency Penalty</Label>
                <Input
                  type="number"
                  min={-2}
                  max={2}
                  step={0.01}
                  value={parameters.frequency_penalty}
                  onChange={(e) => handleParameterChange("frequency_penalty", parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-[#DADCE0] rounded-md focus:ring-2 focus:ring-[#4285F4] focus:outline-none code-font text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParametersPanel;
