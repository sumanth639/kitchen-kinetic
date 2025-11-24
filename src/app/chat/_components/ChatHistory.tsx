'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatSession } from '@/types/index';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNewChat: () => void;
  isSidebarOpen: boolean;
}

export function ChatHistory({
  sessions,
  activeChatId,
  setActiveChatId,
  onRename,
  onDelete,
  onNewChat,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStartRename = (session: ChatSession) => {
    setEditingId(session.id);
    setRenameValue(session.title);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setRenameValue('');
  };

  const handleConfirmRename = async () => {
    if (!editingId || !renameValue.trim()) return;
    await onRename(editingId, renameValue.trim());
    setEditingId(null);
    setRenameValue('');
  };

  const handleConfirmDelete = async (sessionId: string) => {
    setDeletingId(sessionId);
    await onDelete(sessionId);
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 pb-0">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 mb-2 border-dashed border-border/60 hover:border-border hover:bg-muted/50"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
      
      {/* Added 'scrollbar-thin' and 'pr-2' here */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin pr-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`group relative rounded-md transition-colors ${
              activeChatId === session.id 
                ? 'bg-secondary text-secondary-foreground' 
                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {editingId === session.id ? (
              <div className="flex items-center gap-1 p-1 pr-2">
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-green-500"
                  onClick={handleConfirmRename}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-red-500"
                  onClick={handleCancelRename}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 flex-1 min-w-0 h-9 font-normal"
                  onClick={() => setActiveChatId(session.id)}
                >
                  <span className="truncate flex-1 text-left text-sm">
                    {session.title}
                  </span>
                </Button>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-secondary via-secondary to-transparent pl-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleStartRename(session)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{session.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleConfirmDelete(session.id)}
                              disabled={deletingId === session.id}
                            >
                              {deletingId === session.id ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                'Delete'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}