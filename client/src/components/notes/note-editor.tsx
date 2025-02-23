import { useEffect, useState } from "react";
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
  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");

  const { data: note } = useQuery<Note>({
    queryKey: ["/api/notes", noteId],
    queryFn: () => apiRequest("GET", `/api/notes/${noteId}`),
    enabled: !!noteId,
  });

  // Set initial local state when note loads
  useEffect(() => {
    if (note) {
      setLocalContent(note.content);
      setLocalTitle(note.title);
    }
  }, [note?.id]); // Only reset when note ID changes

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Note>) => {
      const updatedNote = await apiRequest<Note>("PATCH", `/api/notes/${noteId}`, {
        title: data.title,
        content: data.content ?? "",
      });
      return updatedNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", noteId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notes/folder", note?.folderId],
      });
    },
  });

  const debouncedUpdate = debounce((data: Partial<Note>) => {
    if (!data.title && !data.content) return; // Don't send empty updates
    updateMutation.mutate(data);
  }, 1000);

  if (!note) return null;

  return (
    <div className="p-4 h-screen flex flex-col gap-4">
      <Input
        value={localTitle}
        onChange={(e) => {
          const newTitle = e.target.value;
          setLocalTitle(newTitle);
          debouncedUpdate({ title: newTitle });
        }}
        className="text-xl font-semibold"
      />

      <Textarea
        value={localContent}
        onChange={(e) => {
          const newContent = e.target.value;
          setLocalContent(newContent);
          debouncedUpdate({ content: newContent });
        }}
        className="flex-1 resize-none"
      />
    </div>
  );
}
