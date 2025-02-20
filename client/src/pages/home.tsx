import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Folder } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import FolderList from "@/components/folders/folder-list";
import NoteList from "@/components/notes/note-list";
import NoteEditor from "@/components/notes/note-editor";

export default function Home() {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
  });

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        <div className="p-4 font-semibold text-lg">Notes App</div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-65px)]">
          <FolderList
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
          />
        </ScrollArea>
      </div>
      
      <div className="flex-1 flex">
        {selectedFolder && (
          <>
            <div className="w-64 border-r">
              <ScrollArea className="h-screen">
                <NoteList
                  folderId={selectedFolder.id}
                  selectedNoteId={selectedNoteId}
                  onSelectNote={setSelectedNoteId}
                />
              </ScrollArea>
            </div>
            
            <div className="flex-1">
              {selectedNoteId && (
                <NoteEditor noteId={selectedNoteId} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
