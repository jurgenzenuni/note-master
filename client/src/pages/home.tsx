import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Folder } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import FolderList from "@/components/folders/folder-list";
import NoteList from "@/components/notes/note-list";
import NoteEditor from "@/components/notes/note-editor";
import { queryClient } from "@/lib/queryClient";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user } = useQuery<{ id: number; email: string }>({
    queryKey: ["user"],
  });

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.removeQueries();
      setLocation("/auth");
    },
  });

  const Sidebar = () => (
    <>
      <div className="p-4">
        <div className="font-semibold text-lg">Notes App</div>
        {user && (
          <div className="text-sm text-muted-foreground mt-1">{user.email}</div>
        )}
      </div>
      <div className="px-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-120px)]">
        <FolderList
          folders={folders}
          selectedFolder={selectedFolder}
          onSelectFolder={(folder) => {
            setSelectedFolder(folder);
            setSidebarOpen(false);
          }}
        />
      </ScrollArea>
    </>
  );

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-64 border-r">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden border-b p-2 flex items-center gap-2">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="font-semibold">Notes App</div>
      </div>

      {/* Notes Section */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-57px)] md:h-screen">
        {selectedFolder && (
          <>
            <div className="border-b md:border-b-0 md:border-r md:w-64">
              <ScrollArea className="h-[40vh] md:h-screen">
                <NoteList
                  folderId={selectedFolder.id}
                  selectedNoteId={selectedNoteId}
                  onSelectNote={setSelectedNoteId}
                />
              </ScrollArea>
            </div>

            <div className="flex-1">
              {selectedNoteId && <NoteEditor noteId={selectedNoteId} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
