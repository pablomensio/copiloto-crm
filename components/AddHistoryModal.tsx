import React, { useState } from 'react';
import { X, Save, MessageSquare } from 'lucide-react';

interface AddHistoryModalProps {
  leadName: string;
  onAdd: (note: string) => void;
  onClose: () => void;
}

const AddHistoryModal: React.FC<AddHistoryModalProps> = ({ leadName, onAdd, onClose }) => {
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onAdd(note);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-50 p-1 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" />
          Agregar Nota al Historial
        </h2>
        <p className="text-sm text-gray-500 mb-4">Para: <span className="font-semibold">{leadName}</span></p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe los detalles de la interacción..."
            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
            autoFocus
          />

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={!note.trim()}
              className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Guardar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHistoryModal;