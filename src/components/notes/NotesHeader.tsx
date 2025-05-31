
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Plus } from 'lucide-react';

interface NotesHeaderProps {
  onCreateNote: () => void;
}

export const NotesHeader = ({ onCreateNote }: NotesHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Notes</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={onCreateNote} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </Button>
            <Button variant="outline" onClick={signOut} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
