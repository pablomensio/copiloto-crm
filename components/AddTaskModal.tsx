import React, { useState } from 'react';
import { Task, Priority, TaskType } from '../types';
import { X, Calendar, Clock, Flag, Tag, Save, Type } from 'lucide-react';

interface AddTaskModalProps {
  onAdd: (task: Task) => void;
  onClose: () => void;
  initialLeadId?: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onAdd, onClose, initialLeadId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [type, setType] = useState<TaskType>('Call');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const dateTime = new Date(`${date}T${time}:00`).toISOString();

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title,
      description,
      date: dateTime,
      isCompleted: false,
      priority,
      type,
      relatedLeadId: initialLeadId
    };

    onAdd(newTask);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scaleIn" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Calendar size={20}/>
            </div>
            Nueva Tarea
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Título</label>
            <div className="relative">
                <Type size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="text" 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej: Llamar al taller, Comprar regalo..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tipo</label>
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <select 
                    value={type}
                    onChange={e => setType(e.target.value as TaskType)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                    <option value="Call">Llamada</option>
                    <option value="Meeting">Reunión</option>
                    <option value="Email">Email</option>
                    <option value="FollowUp">Seguimiento</option>
                    <option value="Personal">Personal</option>
                    <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Prioridad</label>
              <div className="relative">
                <Flag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                    <option value="High">Alta</option>
                    <option value="Medium">Media</option>
                    <option value="Low">Baja</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Fecha</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Hora</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="time" 
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Descripción (Opcional)</label>
            <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
            >
                Cancelar
            </button>
            <button 
                type="submit"
                className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
                <Save size={16} />
                Guardar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;