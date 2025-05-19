import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { History } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: History[];
  onSelect: (item: History) => void;
  onClear: () => void;
}

const HistoryModal = ({ isOpen, onClose, history, onSelect, onClear }: HistoryModalProps) => {
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Prompt History</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(80vh-10rem)] overflow-y-auto pr-4 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No history found
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="p-3 border border-[#DADCE0] rounded-md hover:bg-[#F1F3F4] cursor-pointer transition"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium truncate text-[#202124]">
                        {item.prompt.length > 50
                          ? `${item.prompt.substring(0, 50)}...`
                          : item.prompt}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {item.model} • {item.tokensUsed} tokens
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter className="border-t pt-4 mt-2">
          <Button
            variant="ghost"
            className="text-[#EA4335] hover:text-[#EA4335]/80 hover:bg-[#EA4335]/10"
            onClick={onClear}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;
