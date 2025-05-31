
import React, { useState, useEffect } from 'react';
import { NotesHeader } from '@/components/notes/NotesHeader';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { NoteDialog } from '@/components/notes/NoteDialog';
import { NotesPagination } from '@/components/notes/NotesPagination';
import { useNotes } from '@/hooks/useNotes';

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export const NotesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const { notes, loading, totalPages, createNote, updateNote, deleteNote } = useNotes(debouncedSearchQuery, currentPage);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <NotesHeader 
        onCreateNote={handleCreateNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Notes'}
            </h2>
            <div className="text-sm text-gray-500">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </div>
          </div>
        </div>

        <NotesGrid
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />

        <NotesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
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
