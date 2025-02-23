import { useState } from "react";
import { type Note } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NoteListProps {
  folderId: number;
  selectedNoteId: number | null;
  onSelectNote: (noteId: number) => void;
}

export default function NoteList({
  folderId,
  selectedNoteId,
  onSelectNote,
}: NoteListProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes/folder", folderId],
    queryFn: () => apiRequest("GET", `/api/notes/folder/${folderId}`),
    enabled: !!folderId,
  });

  const createMutation = useMutation({
    mutationFn: async (title: string) => {
      await apiRequest("POST", "/api/notes", {
        title,
        content: "",
        folderId: folderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/notes/folder", folderId],
      });
      setShowCreateDialog(false);
      setNewNoteTitle("");
      toast({ description: "Note created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/notes/folder", folderId],
      });
      toast({ description: "Note deleted" });
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Notes</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent ${
              selectedNoteId === note.id ? "bg-accent" : ""
            }`}
          >
            <button
              className="flex-1 text-left truncate"
              onClick={() => onSelectNote(note.id)}
            >
              {note.title}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteMutation.mutate(note.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(newNoteTitle);
            }}
            className="space-y-4"
          >
            <Input
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter note title"
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !newNoteTitle.trim()}
              >
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
