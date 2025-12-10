import React, { useState } from 'react';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, Circle } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onTaskToggle: (task: Task) => void;
  onAddTaskClick: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskToggle, onAddTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const grid = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= days; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date && typeof t.date === 'string' && t.date.startsWith(dateStr));

      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = selectedDate.toDateString() === new Date(year, month, day).toDateString();

      grid.push(
        <div
          key={day}
          onClick={() => setSelectedDate(new Date(year, month, day))}
          className={`h-24 border border-gray-100 p-2 cursor-pointer transition-colors relative hover:bg-indigo-50/30 ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white'
            }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
              }`}>
              {day}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-[10px] font-bold bg-gray-100 px-1.5 rounded text-gray-600">
                {dayTasks.length}
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1">
            {dayTasks.slice(0, 3).map(task => (
              <div key={task.id} className={`text-[10px] truncate px-1 py-0.5 rounded border-l-2 ${task.priority === 'High' ? 'border-red-500 bg-red-50 text-red-700' :
                  task.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                    'border-blue-500 bg-blue-50 text-blue-700'
                } ${task.isCompleted ? 'opacity-50 line-through' : ''}`}>
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-[10px] text-gray-400 pl-1">+ {dayTasks.length - 3} más</div>
            )}
          </div>
        </div>
      );
    }

    return grid;
  };

  const selectedDayTasks = tasks.filter(t =>
    new Date(t.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendario</h2>
          <p className="text-gray-500 text-sm">Organiza tu mes y visualiza tus compromisos.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-gray-900 w-32 text-center select-none">
            {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={onAddTaskClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-200"
        >
          + Nueva Tarea
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {renderCalendarGrid()}
          </div>
        </div>

        {/* Sidebar for Selected Day */}
        <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-600" />
              {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No hay tareas para este día.</p>
                <button onClick={onAddTaskClick} className="text-indigo-600 text-xs font-medium mt-2 hover:underline">Crear una tarea</button>
              </div>
            ) : (
              selectedDayTasks.map(task => (
                <div key={task.id} className="group flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <button
                    onClick={() => onTaskToggle(task)}
                    className={`mt-0.5 shrink-0 ${task.isCompleted ? 'text-green-500' : 'text-gray-300 group-hover:text-indigo-400'}`}
                  >
                    {task.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(task.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-[10px] px-1.5 rounded border ${task.priority === 'High' ? 'bg-red-50 border-red-100 text-red-600' :
                          task.priority === 'Medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-600' :
                            'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                        {task.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;