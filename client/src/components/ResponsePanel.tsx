import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponsePanelProps {
  response: string | null;
  loading: boolean;
  error: string | null;
  debugMode: boolean;
  requestData: any;
  responseData: any;
}

const ResponsePanel = ({
  response,
  loading,
  error,
  debugMode,
  requestData,
  responseData,
}: ResponsePanelProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      toast({
        title: "Copied to clipboard",
        description: "The response has been copied to your clipboard.",
      });
    }
  };

  const handleDownload = () => {
    if (response) {
      const blob = new Blob([response], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "together-ai-response.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="lg:w-1/2 flex flex-col">
      <Card className="flex flex-col h-full border-[#DADCE0]">
        <div className="p-4 border-b border-[#DADCE0] flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#202124]">Response</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!response}
              className="text-[#202124] hover:text-[#202124]/80 transition"
            >
              <Copy className="h-5 w-5" />
              <span className="sr-only">Copy to clipboard</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={!response}
              className="text-[#202124] hover:text-[#202124]/80 transition"
            >
              <Download className="h-5 w-5" />
              <span className="sr-only">Download response</span>
            </Button>
          </div>
        </div>

        {/* Response Content */}
        {!debugMode ? (
          <div className="p-4 flex-grow overflow-auto custom-scrollbar">
            {loading && (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4285F4]"></div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-[#EA4335]/10 border border-[#EA4335]/30 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-[#EA4335] mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-[#EA4335] font-medium">Error</h3>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {response && !loading && !error && (
              <div className="whitespace-pre-wrap code-font text-sm">
                {response}
              </div>
            )}

            {!response && !loading && !error && (
              <div className="text-center text-[#202124]/70 h-full flex items-center justify-center">
                <p>Run a prompt to see the response here</p>
              </div>
            )}
          </div>
        ) : (
          // Debug View
          <div className="p-4 flex-grow overflow-auto bg-[#F1F3F4] custom-scrollbar">
            <div className="space-y-4">
              {requestData && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Request</h3>
                  <pre className="bg-white p-3 rounded-md border border-[#DADCE0] overflow-x-auto code-font text-xs">
                    {JSON.stringify(requestData, null, 2)}
                  </pre>
                </div>
              )}

              {responseData && responseData.headers && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Response Headers</h3>
                  <pre className="bg-white p-3 rounded-md border border-[#DADCE0] overflow-x-auto code-font text-xs">
                    {JSON.stringify(responseData.headers, null, 2)}
                  </pre>
                </div>
              )}

              {responseData && responseData.body && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Response Body</h3>
                  <pre className="bg-white p-3 rounded-md border border-[#DADCE0] overflow-x-auto code-font text-xs">
                    {JSON.stringify(responseData.body, null, 2)}
                  </pre>
                </div>
              )}

              {responseData && responseData.metrics && (
                <div>
                  <h3 className="text-sm font-medium mb-2">API Call Metrics</h3>
                  <div className="bg-white p-3 rounded-md border border-[#DADCE0] code-font text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Request Time:</span>{" "}
                        {responseData.metrics.requestTime}s
                      </div>
                      <div>
                        <span className="font-medium">Tokens Used:</span>{" "}
                        {responseData.usage?.total_tokens || 0}
                      </div>
                      <div>
                        <span className="font-medium">Model:</span>{" "}
                        {requestData?.model || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <span className="text-[#34A853]">
                          {error ? "Failed" : "Success"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!requestData && !responseData && !loading && (
                <div className="text-center text-[#202124]/70 h-full flex items-center justify-center">
                  <p>Run a prompt to see debug information</p>
                </div>
              )}

              {loading && (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4285F4]"></div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-[#DADCE0] text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {error ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#EA4335] mr-2"></div>
                  <span>Error occurred</span>
                </>
              ) : loading ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#4285F4] mr-2"></div>
                  <span>Processing request</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#34A853] mr-2"></div>
                  <span>Ready for new requests</span>
                </>
              )}
            </div>
            <div>
              {responseData?.usage && (
                <span className="text-xs code-font">
                  Used: {responseData.usage.total_tokens} tokens
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResponsePanel;
