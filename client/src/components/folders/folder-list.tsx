import { useState } from "react";
import { type Folder } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Folder as FolderIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FolderDialog from "./folder-dialog";

interface FolderListProps {
  folders: Folder[];
  selectedFolder: Folder | null;
  onSelectFolder: (folder: Folder) => void;
}

export default function FolderList({
  folders,
  selectedFolder,
  onSelectFolder,
}: FolderListProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      toast({ description: "Folder deleted" });
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent ${
              selectedFolder?.id === folder.id ? "bg-accent" : ""
            }`}
          >
            <button
              className="flex items-center gap-2 flex-1"
              onClick={() => onSelectFolder(folder)}
            >
              <FolderIcon className="h-4 w-4" />
              <span>{folder.name}</span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEditingFolder(folder)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteMutation.mutate(folder.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <FolderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        folder={null}
      />
      
      <FolderDialog
        open={!!editingFolder}
        onOpenChange={(open) => !open && setEditingFolder(null)}
        folder={editingFolder}
      />
    </div>
  );
}
