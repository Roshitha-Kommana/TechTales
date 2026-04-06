import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaPlusCircle, FaTimes, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { notesApi } from '../services/api';
import { Note } from '../types';
import toast from 'react-hot-toast';

const Notes: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const response = await notesApi.getAll();
      if (response.success && response.notes) {
        setNotes(response.notes);
      }
    } catch (error: any) {
      console.error('Error loading notes:', error);
      const errorMsg = error?.message || error?.error || 'Failed to load notes. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = () => {
    setFormData({ title: '', content: '' });
    setEditingNote(null);
    setShowCreateModal(true);
  };

  const handleSaveNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, formData);
        toast.success('Note updated successfully');
      } else {
        await notesApi.create(formData);
        toast.success('Note created successfully');
      }
      setShowCreateModal(false);
      setFormData({ title: '', content: '' });
      setEditingNote(null);
      loadNotes();
    } catch (error: any) {
      console.error('Error saving note:', error);
      const errorMsg = error?.message || error?.error || 'Failed to save note. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setShowCreateModal(true);
    setShowNoteDetail(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesApi.delete(id);
      toast.success('Note deleted successfully');
      if (selectedNote?.id === id) {
        setShowNoteDetail(false);
        setSelectedNote(null);
      }
      loadNotes();
    } catch (error: any) {
      console.error('Error deleting note:', error);
      const errorMsg = error?.message || error?.error || 'Failed to delete note. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setShowNoteDetail(true);
  };

  const getPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-papaya py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">My Notes</h1>
            <button
              onClick={() => navigate('/')}
              className="text-black hover:text-cyan font-semibold text-sm sm:text-base min-h-[44px]"
            >
              ← Back to Home
            </button>
          </div>
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-2 bg-cyan hover:bg-cyan-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm sm:text-base min-h-[44px] w-full sm:w-auto"
          >
            <FaPlusCircle />
            <span>Create Note</span>
          </button>
        </div>

        {/* Notes Grid - 4 columns on desktop, responsive */}
        {notes.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <FaFileAlt className="text-4xl sm:text-5xl md:text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4 text-base sm:text-lg">No notes yet.</p>
            <button
              onClick={handleCreateNote}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-cyan text-white rounded-lg font-semibold hover:bg-cyan-500 min-h-[44px] text-sm sm:text-base"
            >
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="bg-white rounded-lg shadow-md p-3 sm:p-4 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border border-gray-200 min-h-[180px] sm:min-h-[200px] flex flex-col min-h-[44px]"
              >
                <div className="flex items-start justify-between mb-2">
                  <FaFileAlt className="text-yellow-400 text-lg sm:text-xl" />
                  {note.storyTitle && (
                    <span className="text-xs bg-cyan-100 text-black px-2 py-1 rounded truncate max-w-[60%]">
                      {note.storyTitle}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm sm:text-base">{note.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 flex-1 line-clamp-3 sm:line-clamp-4 mb-2">
                  {getPreview(note.content, 80)}
                </p>
                <p className="text-xs text-gray-400 mt-auto">{formatDate(note.createdAt)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Note Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
              <div className="bg-cyan text-white p-3 sm:p-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', content: '' });
                    setEditingNote(null);
                  }}
                  className="text-white hover:text-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter note title..."
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan min-h-[44px] text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note here..."
                    rows={10}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan resize-none text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', content: '' });
                    setEditingNote(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg min-h-[44px] text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 sm:px-6 py-2 bg-cyan text-white rounded-lg hover:bg-cyan-500 font-semibold min-h-[44px] text-sm sm:text-base order-1 sm:order-2"
                >
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note Detail View */}
        {showNoteDetail && selectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0">
              <div className="bg-cyan text-white p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FaFileAlt className="text-xl sm:text-2xl flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl font-semibold truncate">{selectedNote.title}</h2>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditNote(selectedNote)}
                    className="text-white hover:text-gray-200 p-2 hover:bg-cyan-500 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Edit Note"
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="text-white hover:text-red-200 p-2 hover:bg-red-600 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Delete Note"
                  >
                    <FaTrashAlt />
                  </button>
                  <button
                    onClick={() => {
                      setShowNoteDetail(false);
                      setSelectedNote(null);
                    }}
                    className="text-white hover:text-gray-200 p-2 hover:bg-cyan-500 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                {selectedNote.storyTitle && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-papaya rounded-lg border border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <span className="font-semibold">From Story:</span> {selectedNote.storyTitle}
                      {selectedNote.pageNumber !== undefined && (
                        <span className="ml-2">(Page {selectedNote.pageNumber + 1})</span>
                      )}
                    </p>
                  </div>
                )}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-base">
                    {selectedNote.content}
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 text-xs sm:text-sm text-gray-500">
                  <p>Created: {formatDate(selectedNote.createdAt)}</p>
                  {selectedNote.updatedAt !== selectedNote.createdAt && (
                    <p>Updated: {formatDate(selectedNote.updatedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
