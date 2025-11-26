
import React, { useState, useEffect } from 'react';
import { AppView, Lead, SellerProfile, Vehicle, Task, Interaction, BudgetCalculation, Menu } from './types';
import { INITIAL_VEHICLES, LEADS as INITIAL_LEADS, INITIAL_TASKS } from './constants';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import VehicleDetailView from './components/VehicleDetailView';
import ProfileModal from './components/ProfileModal';
import BudgetCalculatorView from './components/BudgetCalculatorView';
import AddVehicleModal from './components/AddVehicleModal';
import BulkUploadModal from './components/BulkUploadModal';
import MarkupView from './components/MarkupView';
import CalendarView from './components/CalendarView';
import TaskListView from './components/TaskListView';
import AddTaskModal from './components/AddTaskModal';
import AddHistoryModal from './components/AddHistoryModal';
import MenuManagementView from './components/MenuManagementView';
import MenuEditorView from './components/MenuEditorView';
import PublicMenuView from './components/PublicMenuView';
import { Zap, LayoutDashboard, Car, Menu as MenuIcon, X, Edit, Calculator, TrendingUp, Database, AlertTriangle, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { fetchVehicles, fetchLeads, fetchTasks, fetchMenus, saveVehicle, saveLead, saveVehiclesBatch, saveTask, saveMenu, incrementMenuView, seedInitialData, getMenu } from './services/firebase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for dynamic data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [publicMenu, setPublicMenu] = useState<Menu | null>(null);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dbError, setDbError] = useState(false);
  
  const [markup, setMarkup] = useState(0);

  // State for Quote Context (Data passing between Dashboard and Calculator)
  const [quoteContext, setQuoteContext] = useState<{ lead: Lead | null, vehicle: Vehicle | null }>({ lead: null, vehicle: null });

  // State for Seller Profile
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>({
    name: 'John Doe',
    title: 'Senior Salesman',
    avatarUrl: `https://picsum.photos/seed/salesman/100/100`
  });

  // State for Modals
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [isAddHistoryModalOpen, setAddHistoryModalOpen] = useState(false);
  
  // Tracking which lead is being acted upon (for tasks/notes)
  const [targetLeadId, setTargetLeadId] = useState<string | undefined>(undefined);

  // Initial Data Fetching from Firebase and URL Param Check
  useEffect(() => {
    const loadData = async () => {
      // 1. Check for Public Menu URL Param (?menu=XYZ)
      const params = new URLSearchParams(window.location.search);
      const publicMenuId = params.get('menu');

      try {
        // Parallel fetching
        const [remoteVehicles, remoteLeads, remoteTasks, remoteMenus] = await Promise.all([
             fetchVehicles(),
             fetchLeads(),
             fetchTasks(),
             fetchMenus()
        ]);

        // Check if DB is empty (first run), if so, seed it
        if (Object.keys(remoteVehicles).length === 0 && remoteLeads.length === 0) {
           await seedInitialData(INITIAL_VEHICLES, INITIAL_LEADS, INITIAL_TASKS);
           setVehicles(INITIAL_VEHICLES);
           setLeads(INITIAL_LEADS);
           setTasks(INITIAL_TASKS);
           setMenus([]);
        } else {
           setVehicles(remoteVehicles);
           setLeads(remoteLeads);
           setTasks(remoteTasks);
           setMenus(remoteMenus);
        }

        // Handle Public Menu Logic
        if (publicMenuId) {
             const foundMenu = await getMenu(publicMenuId);
             if (foundMenu) {
                 setPublicMenu(foundMenu);
                 setCurrentView('public_menu');
                 // Increment view count in background
                 incrementMenuView(publicMenuId);
             } else {
                 console.warn("Menu ID from URL not found");
             }
        }

      } catch (e) {
        console.warn("Using local data (Offline Mode)");
        // Fallback to local data if Firebase fails (e.g., config not set)
        setDbError(true);
        setVehicles(INITIAL_VEHICLES);
        setLeads(INITIAL_LEADS);
        setTasks(INITIAL_TASKS);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Data handlers
  const handleLeadUpdate = async (updatedLead: Lead) => {
    // Optimistic Update
    setLeads(prevLeads => 
      prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
    );
    // Persist to Firebase
    try {
        await saveLead(updatedLead);
    } catch (e) {
        // Silent fail in offline mode
    }
  };

  const handleProfileUpdate = (newProfile: SellerProfile) => {
    setSellerProfile(newProfile);
    setProfileModalOpen(false);
  };

  const handleAddVehicle = async (newVehicle: Vehicle) => {
    // Optimistic Update
    setVehicles(prevVehicles => ({
      ...prevVehicles,
      [newVehicle.id]: newVehicle
    }));
    setAddVehicleModalOpen(false);
    
    // Persist to Firebase
    try {
        await saveVehicle(newVehicle);
    } catch (e) {
       // Silent fail in offline mode
    }
  };

  const handleBulkImport = async (newVehicles: Vehicle[]) => {
    // Optimistic Update
    setVehicles(prevVehicles => {
        const updated = { ...prevVehicles };
        newVehicles.forEach(v => {
            updated[v.id] = v;
        });
        return updated;
    });
    setBulkUploadModalOpen(false);

    // Persist to Firebase
    try {
        await saveVehiclesBatch(newVehicles);
    } catch (e) {
        // Silent fail in offline mode
    }
  };

  const handleAddTask = async (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
    setAddTaskModalOpen(false);
    try {
        await saveTask(newTask);
    } catch (e) {
        // Silent fail in offline mode
    }
  };

  const handleTaskToggle = async (task: Task) => {
      const updatedTask = { ...task, isCompleted: !task.isCompleted };
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      try {
          await saveTask(updatedTask);
      } catch (e) {
          // Silent fail in offline mode
      }
  };

  const handleSaveMenu = async (newMenu: Menu) => {
      setMenus(prev => {
          const exists = prev.find(m => m.id === newMenu.id);
          if (exists) {
              return prev.map(m => m.id === newMenu.id ? newMenu : m);
          }
          return [...prev, newMenu];
      });
      setCurrentView('menus');
      try {
          await saveMenu(newMenu);
      } catch (e) {
          // Silent fail in offline mode
      }
  };

  const handleAddHistoryNote = async (note: string) => {
    if (!targetLeadId) return;

    const lead = leads.find(l => l.id === targetLeadId);
    if (lead) {
      const newInteraction: Interaction = {
        id: `note_${Date.now()}`,
        type: 'note',
        date: new Date().toISOString(),
        notes: note
      };
      
      const updatedLead = {
        ...lead,
        history: [newInteraction, ...lead.history]
      };

      await handleLeadUpdate(updatedLead);
    }
    setAddHistoryModalOpen(false);
  };
  
  const handleMarkupChange = (amount: number) => {
    setMarkup(amount);
  };

  const handleStartQuote = (lead: Lead, vehicle: Vehicle) => {
    setQuoteContext({ lead, vehicle });
    setCurrentView('budget_calculator');
    setMobileMenuOpen(false);
  };

  const handleSaveQuote = async (budget: BudgetCalculation) => {
     if (quoteContext.lead) {
         const newInteraction: Interaction = {
             id: `budget_${Date.now()}`,
             type: 'budget',
             date: new Date().toISOString(),
             budget: budget,
             details: `Presupuesto para ${quoteContext.vehicle?.model}`
         };

         const updatedLead = {
             ...quoteContext.lead,
             history: [newInteraction, ...quoteContext.lead.history]
         };

         await handleLeadUpdate(updatedLead);
         
         // If successful, navigate back
         setCurrentView('dashboard');
         setQuoteContext({ lead: null, vehicle: null });
     }
  };

  // Navigation handlers
  const navigate = (view: AppView) => {
      // Remove query param if navigating away from public view explicitly
      if (currentView === 'public_menu' && view !== 'public_menu') {
          const url = new URL(window.location.href);
          url.searchParams.delete('menu');
          window.history.pushState({}, '', url);
          setPublicMenu(null);
      }

      setCurrentView(view);
      setMobileMenuOpen(false);
      // Clear quote context if navigating away manually
      if (view !== 'budget_calculator') {
          setQuoteContext({ lead: null, vehicle: null });
      }
  }

  const navigateToVehicleDetail = (id: string) => {
    setSelectedVehicleId(id);
    setCurrentView('vehicle_detail');
    setMobileMenuOpen(false);
  };

  // Modal Triggers
  const openAddTaskModal = (leadId?: string) => {
    setTargetLeadId(leadId);
    setAddTaskModalOpen(true);
  };

  const openAddHistoryModal = (leadId: string) => {
    setTargetLeadId(leadId);
    setAddHistoryModalOpen(true);
  };

  // Render logic
  const renderContent = () => {
    if (isLoadingData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-pulse">
                <Database size={48} className="mb-4" />
                <p>Cargando aplicación...</p>
            </div>
        )
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            leads={leads}
            vehicles={vehicles}
            onLeadUpdate={handleLeadUpdate}
            onVehicleClick={navigateToVehicleDetail} 
            markup={markup}
            onAddTask={openAddTaskModal}
            onAddNote={openAddHistoryModal}
            onQuote={handleStartQuote}
          />
        );
      case 'inventory':
        return (
          <InventoryView 
            vehicles={Object.values(vehicles)}
            onVehicleSelect={navigateToVehicleDetail} 
            onAddVehicleClick={() => setAddVehicleModalOpen(true)}
            onBulkUploadClick={() => setBulkUploadModalOpen(true)}
            markup={markup}
          />
        );
      case 'vehicle_detail':
        if (!selectedVehicleId || !vehicles[selectedVehicleId]) {
            // Fallback if ID invalid
            setCurrentView('inventory');
            return null;
        }
        return (
          <VehicleDetailView 
            vehicle={vehicles[selectedVehicleId]} 
            onBack={() => navigate('inventory')} 
            markup={markup}
          />
        );
      case 'budget_calculator':
        return (
            <BudgetCalculatorView 
                initialLead={quoteContext.lead}
                initialVehicle={quoteContext.vehicle}
                onBack={() => navigate('dashboard')}
                onSaveQuote={handleSaveQuote}
            />
        );
      case 'markup':
        return <MarkupView currentMarkup={markup} onMarkupChange={handleMarkupChange} />;
      case 'calendar':
        return <CalendarView tasks={tasks} onTaskToggle={handleTaskToggle} onAddTaskClick={() => openAddTaskModal()} />;
      case 'tasks':
        return <TaskListView tasks={tasks} onTaskToggle={handleTaskToggle} onAddTaskClick={() => openAddTaskModal()} />;
      case 'menus':
        return (
          <MenuManagementView 
            menus={menus} 
            vehicles={vehicles}
            onCreateClick={() => setCurrentView('menu_editor')}
          />
        );
      case 'menu_editor':
        return (
           <MenuEditorView 
              vehicles={Object.values(vehicles)}
              onSave={handleSaveMenu}
              onBack={() => setCurrentView('menus')}
           />
        );
      case 'public_menu':
        if (!publicMenu) return <div>Menú no encontrado</div>;
        const menuVehicles = publicMenu.vehicleIds.map(id => vehicles[id]).filter(Boolean);
        return (
            <PublicMenuView 
                menu={publicMenu} 
                vehicles={menuVehicles}
                sellerProfile={sellerProfile}
            />
        );
      default:
        return (
          <DashboardView 
            leads={leads}
            vehicles={vehicles}
            onLeadUpdate={handleLeadUpdate}
            onVehicleClick={navigateToVehicleDetail} 
            markup={markup}
            onAddTask={openAddTaskModal}
            onAddNote={openAddHistoryModal}
            onQuote={handleStartQuote}
          />
        );
    }
  };

  // If in Public Menu Mode, render simplified layout without Sidebar
  if (currentView === 'public_menu') {
      return renderContent();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AutoSales</h1>
            <p className="text-xs text-slate-400 font-medium">Copilot Edition</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => navigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button 
            onClick={() => navigate('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === 'tasks' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CheckSquare size={20} />
            <div className="flex-1 text-left flex justify-between items-center">
                <span className="font-medium">Tareas</span>
                {tasks.filter(t => !t.isCompleted).length > 0 && (
                    <span className="text-[10px] bg-red-500 text-white px-1.5 rounded-full">
                        {tasks.filter(t => !t.isCompleted).length}
                    </span>
                )}
            </div>
          </button>

          <button 
            onClick={() => navigate('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === 'calendar' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarIcon size={20} />
            <span className="font-medium">Calendario</span>
          </button>
          
          <button 
            onClick={() => navigate('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === 'inventory' || currentView === 'vehicle_detail'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Car size={20} />
            <span className="font-medium">Inventario</span>
          </button>
          
          <button 
            onClick={() => navigate('menus')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === 'menus' || currentView === 'menu_editor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MenuIcon size={20} />
            <span className="font-medium">Catálogos</span>
          </button>

          <button 
            onClick={() => navigate('budget_calculator')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === 'budget_calculator'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calculator size={20} />
            <span className="font-medium">Calculadora</span>
          </button>

          <button 
            onClick={() => navigate('markup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === 'markup'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp size={20} />
            <span className="font-medium">Sumar Ganancia</span>
          </button>
        </nav>

        <div className="mt-auto">
          {dbError && (
              <div className="mx-4 mb-4 p-3 bg-red-900/50 rounded-lg border border-red-800 text-xs text-red-200 flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span className="font-bold">Modo Offline</span>
                  </div>
                  <p>Para activar la nube, configura tus credenciales en <span className="font-mono bg-red-900/80 px-1 rounded">services/firebase.ts</span></p>
              </div>
          )}
          <button 
            onClick={() => setProfileModalOpen(true)}
            className="w-full p-4 border-t border-slate-800 group hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3 px-2 relative">
                <img className="w-10 h-10 rounded-full object-cover" src={sellerProfile.avatarUrl} alt={sellerProfile.name} />
                <div>
                    <p className="text-sm font-medium text-left">{sellerProfile.name}</p>
                    <p className="text-xs text-slate-500 text-left">{sellerProfile.title}</p>
                </div>
                <Edit size={14} className="absolute right-0 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-30">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded text-white">
                    <Zap size={16} fill="currentColor" />
                </div>
                <span className="font-bold text-gray-900">AutoSales Copilot</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
                {mobileMenuOpen ? <X /> : <MenuIcon />}
            </button>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto">
            {renderContent()}
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal 
          profile={sellerProfile}
          onUpdate={handleProfileUpdate}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      {/* Add Vehicle Modal */}
      {isAddVehicleModalOpen && (
        <AddVehicleModal 
          onAdd={handleAddVehicle}
          onClose={() => setAddVehicleModalOpen(false)}
        />
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadModalOpen && (
        <BulkUploadModal 
          onImport={handleBulkImport}
          onClose={() => setBulkUploadModalOpen(false)}
        />
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <AddTaskModal
          onAdd={handleAddTask}
          onClose={() => setAddTaskModalOpen(false)}
          initialLeadId={targetLeadId}
        />
      )}

      {/* Add History Modal */}
      {isAddHistoryModalOpen && targetLeadId && (
        <AddHistoryModal
          leadName={leads.find(l => l.id === targetLeadId)?.name || 'Cliente'}
          onAdd={handleAddHistoryNote}
          onClose={() => setAddHistoryModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
