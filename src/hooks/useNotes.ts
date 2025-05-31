
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export const useNotes = (searchQuery: string = '', currentPage: number = 1, itemsPerPage: number = 12) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('notes')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false });

      // Add search filter if query exists
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Add pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setNotes(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            title,
            content,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh notes to maintain pagination
      await fetchNotes();
      toast({
        title: "Success",
        description: "Note created successfully",
        className: "bg-green-50 border-green-200"
      });
      return true;
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateNote = async (noteId: string, title: string, content: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === noteId ? data : note
      ));
      toast({
        title: "Success",
        description: "Note updated successfully",
        className: "bg-green-50 border-green-200"
      });
      return true;
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      // Refresh notes to maintain pagination
      await fetchNotes();
      toast({
        title: "Success",
        description: "Note deleted successfully",
        className: "bg-green-50 border-green-200"
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user, searchQuery, currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return {
    notes,
    loading,
    totalCount,
    totalPages,
    currentPage,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
};
