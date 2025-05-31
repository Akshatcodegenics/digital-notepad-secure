
import React, { useState } from 'react';
import { NotesHeader } from '@/components/notes/NotesHeader';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { NoteDialog } from '@/components/notes/NoteDialog';
import { useNotes } from '@/hooks/useNotes';

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export const NotesPage = () => {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleSaveNote = async (title: string, content: string) => {
    setSaving(true);
    let success = false;

    if (editingNote) {
      success = await updateNote(editingNote.id, title, content);
    } else {
      success = await createNote(title, content);
    }

    if (success) {
      setIsDialogOpen(false);
      setEditingNote(null);
    }
    setSaving(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotesHeader onCreateNote={handleCreateNote} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotesGrid
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      </main>

      <NoteDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        note={editingNote}
        loading={saving}
      />
    </div>
  );
};
