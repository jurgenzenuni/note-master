import { useEffect } from "react";
import { type Note } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { debounce } from "@/lib/utils";

interface NoteEditorProps {
  noteId: number;
}

export default function NoteEditor({ noteId }: NoteEditorProps) {
  const { toast } = useToast();

  const { data: note } = useQuery<Note>({
    queryKey: ["/api/notes", noteId],
    queryFn: () => fetch(`/api/notes/${noteId}`).then((r) => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Note>) => {
      await apiRequest("PATCH", `/api/notes/${noteId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", noteId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/folders", note?.folderId, "notes"],
      });
    },
  });

  const debouncedUpdate = debounce((data: Partial<Note>) => {
    updateMutation.mutate(data);
  }, 500);

  if (!note) return null;

  return (
    <div className="p-4 h-screen flex flex-col gap-4">
      <Input
        value={note.title}
        onChange={(e) => debouncedUpdate({ title: e.target.value })}
        className="text-xl font-semibold"
      />
      
      <Textarea
        value={note.content}
        onChange={(e) => debouncedUpdate({ content: e.target.value })}
        className="flex-1 resize-none"
      />
    </div>
  );
}
