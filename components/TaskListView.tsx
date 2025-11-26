import React, { useState } from 'react';
import { Task } from '../types';
import { CheckCircle, Circle, Clock, AlertTriangle, Calendar, Filter, Plus } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  onTaskToggle: (task: Task) => void;
  onAddTaskClick: () => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onTaskToggle, onAddTaskClick }) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const overdueTasks = sortedTasks.filter(t => !t.isCompleted && new Date(t.date).getTime() < now.getTime());
  const todayTasks = sortedTasks.filter(t => {
      const tDate = new Date(t.date).getTime();
      const endOfToday = startOfToday + (24 * 60 * 60 * 1000);
      return !t.isCompleted && tDate >= now.getTime() && tDate < endOfToday;
  });
  const upcomingTasks = sortedTasks.filter(t => {
      const tDate = new Date(t.date).getTime();
      const endOfToday = startOfToday + (24 * 60 * 60 * 1000);
      return !t.isCompleted && tDate >= endOfToday;
  });
  const completedTasks = sortedTasks.filter(t => t.isCompleted);

  const TaskRow = ({ task }: { task: Task }) => (
    <div className={`group flex items-center p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${task.isCompleted ? 'opacity-60' : ''}`}>
        <button 
            onClick={() => onTaskToggle(task)}
            className={`mr-4 shrink-0 transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-indigo-500'}`}
        >
            {task.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>
        
        <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium truncate ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {task.title}
            </h4>
            <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(task.date).toLocaleDateString()} {new Date(task.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                {task.description && (
                    <span className="text-xs text-gray-400 truncate max-w-[200px] hidden md:block">
                        - {task.description}
                    </span>
                )}
            </div>
        </div>

        <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                task.priority === 'High' ? 'bg-red-100 text-red-700' :
                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
            }`}>
                {task.priority}
            </span>
             <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                {task.type}
            </span>
        </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
                <p className="text-gray-500 text-sm">Gestiona tus pendientes y prioridades del día.</p>
            </div>
            <button 
                onClick={onAddTaskClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
                <Plus size={18} />
                Nueva Tarea
            </button>
        </div>

        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 font-bold uppercase">Pendientes Hoy</p>
                    <p className="text-2xl font-bold text-indigo-600">{todayTasks.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <p className="text-xs text-red-500 font-bold uppercase">Atrasadas</p>
                    <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
                </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 font-bold uppercase">Próximas</p>
                    <p className="text-2xl font-bold text-gray-800">{upcomingTasks.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                    <p className="text-xs text-green-600 font-bold uppercase">Completadas</p>
                    <p className="text-2xl font-bold text-green-700">{completedTasks.length}</p>
                </div>
            </div>

            {/* Main List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
                    <Filter size={16} className="text-gray-400" />
                    <button 
                        onClick={() => setFilter('Pending')}
                        className={`text-sm font-medium transition-colors ${filter === 'Pending' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Pendientes
                    </button>
                    <button 
                         onClick={() => setFilter('Completed')}
                         className={`text-sm font-medium transition-colors ${filter === 'Completed' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Historial Completadas
                    </button>
                     <button 
                         onClick={() => setFilter('All')}
                         className={`text-sm font-medium transition-colors ${filter === 'All' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Todas
                    </button>
                </div>

                {filter !== 'Completed' && overdueTasks.length > 0 && (
                    <div className="bg-red-50/30">
                        <div className="px-4 py-2 bg-red-50 text-red-800 text-xs font-bold uppercase flex items-center gap-2">
                            <AlertTriangle size={12} /> Tareas Atrasadas
                        </div>
                        {overdueTasks.map(task => <TaskRow key={task.id} task={task} />)}
                    </div>
                )}

                {filter !== 'Completed' && todayTasks.length > 0 && (
                    <div>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-800 text-xs font-bold uppercase flex items-center gap-2">
                           <Clock size={12} /> Para Hoy
                        </div>
                        {todayTasks.map(task => <TaskRow key={task.id} task={task} />)}
                    </div>
                )}
                
                {filter !== 'Completed' && upcomingTasks.length > 0 && (
                     <div>
                        <div className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase flex items-center gap-2">
                           <Calendar size={12} /> Próximamente
                        </div>
                        {upcomingTasks.map(task => <TaskRow key={task.id} task={task} />)}
                    </div>
                )}

                {(filter === 'Completed' || filter === 'All') && completedTasks.length > 0 && (
                     <div>
                        <div className="px-4 py-2 bg-green-50 text-green-800 text-xs font-bold uppercase flex items-center gap-2">
                           <CheckCircle size={12} /> Completadas
                        </div>
                        {completedTasks.map(task => <TaskRow key={task.id} task={task} />)}
                    </div>
                )}

                {tasks.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No hay tareas creadas. ¡Empieza añadiendo una!
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default TaskListView;