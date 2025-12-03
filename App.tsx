import React, { useState, useEffect } from 'react';
import { AppView, Lead, SellerProfile, Vehicle, Task, Interaction, BudgetCalculation, Menu, MultiBudget, TradeInAppraisal } from './types';
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
import PublicVehicleDetail from './components/PublicVehicleDetail';
import LoginView from './components/LoginView';
import LeadSelectorModal from './components/LeadSelectorModal';
import AddClientModal from './components/AddClientModal';
import MultiBudgetSelector from './components/MultiBudgetSelector';
import MultiBudgetModal from './components/MultiBudgetModal';
import PublicMultiBudgetView from './components/PublicMultiBudgetView';
import TradeInAppraisalModal from './components/TradeInAppraisalModal';
import { Zap, LayoutDashboard, Car, Menu as MenuIcon, X, Edit, Calculator, TrendingUp, Database, AlertTriangle, Calendar as CalendarIcon, CheckSquare, LogOut } from 'lucide-react';
import { fetchVehicles, fetchLeads, fetchTasks, fetchMenus, saveVehicle, saveLead, saveVehiclesBatch, saveTask, saveMenu, incrementMenuView, seedInitialData, getMenu, auth, signOut, deleteVehicle, trackBudgetView, saveMultiBudget, getMultiBudget, trackMultiBudgetView } from './services/firebase';
import { saveAppraisal } from './services/appraisalService';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
  const [quoteContext, setQuoteContext] = useState<{ lead: Lead | null, vehicle: Vehicle | null, budget?: BudgetCalculation | null }>({ lead: null, vehicle: null, budget: null });

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
  const [isLeadSelectorOpen, setLeadSelectorOpen] = useState(false);
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  // Multi-Budget State
  const [isMultiBudgetSelectorOpen, setMultiBudgetSelectorOpen] = useState(false);
  const [isMultiBudgetModalOpen, setMultiBudgetModalOpen] = useState(false);
  const [selectedVehiclesForBudget, setSelectedVehiclesForBudget] = useState<Vehicle[]>([]);
  const [currentMultiBudget, setCurrentMultiBudget] = useState<MultiBudget | null>(null);

  // Appraisal State
  const [isAppraisalModalOpen, setAppraisalModalOpen] = useState(false);
  const [appraisalTargetLead, setAppraisalTargetLead] = useState<Lead | null>(null);

  // Tracking which lead is being acted upon (for tasks/notes)
  const [targetLeadId, setTargetLeadId] = useState<string | undefined>(undefined);

  // Tracking which vehicle is being edited
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);

  // Initial Data Fetching from Firebase and URL Param Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Always check for public URL params first
      const params = new URLSearchParams(window.location.search);
      const menuId = params.get('menu');
      const vehicleId = params.get('vehicle');

      let isPublicView = false;

      if (menuId) {
        try {
          const menuData = await getMenu(menuId);
          if (menuData) {
            setPublicMenu(menuData);
            setCurrentView('public_menu');
            isPublicView = true;
            // Fetch vehicles for this menu
            const vehiclesData = await fetchVehicles();
            setVehicles(vehiclesData);
          }
        } catch (e) {
          console.error("Error loading public menu", e);
        }
      } else if (vehicleId) {
        setSelectedVehicleId(vehicleId);
        setCurrentView('public_vehicle');
        isPublicView = true;
        // Fetch all vehicles to find the selected one
        try {
          const vehiclesData = await fetchVehicles();
          setVehicles(vehiclesData);
        } catch (e) {
          console.error("Error loading public vehicle", e);
        }
      } else if (params.get('view_budget') === 'true') {
        const leadId = params.get('leadId');
        const interactionId = params.get('interactionId');

        if (leadId && interactionId) {
          isPublicView = true;
          setCurrentView('public_budget');
          try {
            // Track view and get updated lead data
            const updatedLead = await trackBudgetView(leadId, interactionId);
            if (updatedLead) {
              const interaction = updatedLead.history.find(i => i.id === interactionId);
              if (interaction && interaction.budget) {
                // Fetch vehicles to get the vehicle details
                const vehiclesData = await fetchVehicles();
                setVehicles(vehiclesData);

                const vehicle = vehiclesData[updatedLead.interestedVehicleId];

                setQuoteContext({
                  lead: updatedLead,
                  vehicle: vehicle || null,
                  budget: interaction.budget
                });
              }
            }
          } catch (e) {
            console.error("Error tracking budget view", e);
          }
        }
      } else if (params.get('multi_budget')) {
        const multiBudgetId = params.get('multi_budget');
        if (multiBudgetId) {
          isPublicView = true;
          setCurrentView('multi_budget');
          try {
            const budgetData = await getMultiBudget(multiBudgetId);
            if (budgetData) {
              setCurrentMultiBudget(budgetData);
              // Fetch vehicles
              const vehiclesData = await fetchVehicles();
              setVehicles(vehiclesData);
            }
          } catch (e) {
            console.error("Error loading multi-budget", e);
          }
        }
      }

      if (user) {
        setCurrentUser(user);
        // Only set default view if NOT a public view
        if (!isPublicView) {
          // Stay on dashboard or whatever default
        }
      }

      setAuthLoading(false);
      setIsLoadingData(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Data when User is Authenticated
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [fetchedVehicles, fetchedLeads, fetchedTasks, fetchedMenus] = await Promise.all([
          fetchVehicles(),
          fetchLeads(),
          fetchTasks(),
          fetchMenus()
        ]);

        setVehicles(fetchedVehicles);
        setLeads(fetchedLeads);
        setTasks(fetchedTasks);
        setMenus(fetchedMenus);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDbError(true);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [currentUser]);

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

  const handleAddLead = async (newLead: Lead) => {
    // Optimistic Update
    setLeads(prev => {
      const exists = prev.find(l => l.id === newLead.id);
      if (exists) {
        return prev.map(l => l.id === newLead.id ? newLead : l);
      }
      return [newLead, ...prev];
    });
    setAddClientModalOpen(false);
    setEditingLead(undefined);

    try {
      await saveLead(newLead);
    } catch (e) {
      // Silent fail
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
    setEditingVehicle(undefined); // Clear editing state

    // Persist to Firebase
    try {
      await saveVehicle(newVehicle);
    } catch (e) {
      // Silent fail in offline mode
    }
  };

  const handleUpdateVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setAddVehicleModalOpen(true);
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    // Optimistic Update
    const updatedVehicles = { ...vehicles };
    delete updatedVehicles[vehicleId];
    setVehicles(updatedVehicles);
    setCurrentView('inventory');

    try {
      await deleteVehicle(vehicleId);
    } catch (e) {
      // Silent fail
    }
  }

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
    setQuoteContext({ lead, vehicle, budget: null });
    setCurrentView('budget_calculator');
    setMobileMenuOpen(false);
  };

  const handleOpenBudget = (lead: Lead, vehicle: Vehicle, budget: BudgetCalculation) => {
    setQuoteContext({ lead, vehicle, budget });
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
      setQuoteContext({ lead: null, vehicle: null, budget: null });
      return newInteraction.id;
    }
    return null;
  };

  // Multi-Budget Handlers
  const handleOpenMultiBudgetSelector = () => {
    setMultiBudgetSelectorOpen(true);
  };

  const handleCreateMultiBudget = (selectedVehicleIds: string[]) => {
    const selectedVehicles = selectedVehicleIds.map(id => vehicles[id]).filter(Boolean);
    setSelectedVehiclesForBudget(selectedVehicles);
    setMultiBudgetSelectorOpen(false);
    setMultiBudgetModalOpen(true);
  };

  const handleSaveMultiBudget = async (budgets: Array<{ vehicleId: string; budget: BudgetCalculation }>) => {
    if (!quoteContext.lead) {
      alert("Selecciona un cliente primero");
      return;
    }

    const multiBudget: MultiBudget = {
      id: `mb_${Date.now()}`,
      leadId: quoteContext.lead.id,
      leadName: quoteContext.lead.name,
      vehicles: budgets,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      sharedVia: 'link'
    };

    try {
      await saveMultiBudget(multiBudget);

      // Generate shareable link
      const shareUrl = `${window.location.origin}/?multi_budget=${multiBudget.id}`;

      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert(`¡Presupuesto creado! Link copiado al portapapeles:\n${shareUrl}`);

      setMultiBudgetModalOpen(false);
      setSelectedVehiclesForBudget([]);
    } catch (error) {
      console.error("Error saving multi-budget:", error);
      alert("Error al guardar el presupuesto");
    }
  };

  const handleTrackMultiBudgetView = async () => {
    if (currentMultiBudget) {
      await trackMultiBudgetView(currentMultiBudget.id);
    }
  };

  // Appraisal Handlers
  const handleOpenAppraisal = (lead: Lead) => {
    setAppraisalTargetLead(lead);
    setAppraisalModalOpen(true);
  };

  const handleSaveAppraisal = async (appraisal: TradeInAppraisal) => {
    if (!appraisalTargetLead) return;

    try {
      // Save to Firestore using the service (which we imported from firebase.ts but need to export there or import from appraisalService)
      // Wait, I imported saveAppraisal from firebase.ts but I created it in appraisalService.ts
      // I need to fix the import or re-export it. For now, let's assume I'll fix the import.
      // Actually, I should import it from appraisalService.ts directly.

      // Update Lead History
      const newInteraction: Interaction = {
        id: `appraisal_${Date.now()}`,
        type: 'appraisal',
        date: new Date().toISOString(),
        details: `Tasación: ${appraisal.vehicleData.make} ${appraisal.vehicleData.model}`,
        appraisal: appraisal,
        status: 'sent'
      };

      const updatedLead = {
        ...appraisalTargetLead,
        history: [newInteraction, ...appraisalTargetLead.history]
      };

      await handleLeadUpdate(updatedLead);

      // Also save the appraisal document itself (handled inside TradeInAppraisalModal via onSave prop? No, modal calls onSave which is this function)
      // The modal calls saveAppraisal service internally? 
      // Let's check TradeInAppraisalModal.tsx:
      // It calls `await onSave(newAppraisal);` inside `handleSave`.
      // And it ALSO calls `saveAppraisal` service? No, it imports it but doesn't seem to use it for the main save if onSave is provided?
      // Wait, in TradeInAppraisalModal.tsx:
      // `await onSave(newAppraisal);` is called.
      // AND `saveAppraisal` is imported but NOT USED in `handleSave`?
      // Let me re-read TradeInAppraisalModal.tsx content I wrote.

      // I wrote:
      // const handleSave = async () => { ...
      //   // 3. Save Appraisal
      //   await onSave(newAppraisal);
      // ... }

      // So the Modal expects the parent to handle the saving.
      // But I also imported `saveAppraisal` in the Modal. I probably meant to use it there or here.
      // Better to use it HERE in App.tsx to keep logic centralized or in the service.
      // I will import `saveAppraisal` from `./services/appraisalService` in App.tsx.

      // Let's fix the import in the first chunk and then use it here.
    } catch (error) {
      console.error("Error saving appraisal:", error);
      alert("Error al guardar la tasación");
    }
  };

  const handleLoadDemoData = async () => {
    setIsLoadingData(true);
    try {
      await seedInitialData(INITIAL_VEHICLES, INITIAL_LEADS, INITIAL_TASKS);
      setVehicles(INITIAL_VEHICLES);
      setLeads(INITIAL_LEADS);
      setTasks(INITIAL_TASKS);
    } catch (e) {
      console.error("Error loading demo data", e);
    } finally {
      setIsLoadingData(false);
    }
  }

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  }

  // Sharing Handlers
  const handleShareVehicle = () => {
    if (!selectedVehicleId) return;
    const url = `${window.location.origin}?vehicle=${selectedVehicleId}`;
    navigator.clipboard.writeText(url);
    // You might want to use a proper toast notification here
    alert('Enlace copiado al portapapeles: ' + url);
  };

  const handleSendToClient = () => {
    setLeadSelectorOpen(true);
  };

  const handleLeadSelectForVehicle = (lead: Lead) => {
    if (!selectedVehicleId) return;
    const vehicle = vehicles[selectedVehicleId];
    const url = `${window.location.origin}?vehicle=${selectedVehicleId}`;

    const message = `Hola ${lead.name}, pensé que te podría interesar este ${vehicle.make} ${vehicle.model}: ${url}`;
    const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
    setLeadSelectorOpen(false);
  };

  // Navigation handlers
  const navigate = (view: AppView) => {
    // Remove query param if navigating away from public view explicitly
    if ((currentView === 'public_menu' || currentView === 'public_vehicle') && view !== currentView) {
      const url = new URL(window.location.href);
      url.searchParams.delete('menu');
      url.searchParams.delete('vehicle');
      window.history.pushState({}, '', url);
      setPublicMenu(null);
    }

    setCurrentView(view);
    setMobileMenuOpen(false);
    // Clear quote context if navigating away manually
    if (view !== 'budget_calculator') {
      setQuoteContext({ lead: null, vehicle: null, budget: null });
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
    if (isLoadingData || authLoading) {
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
            onOpenBudget={handleOpenBudget}
            onAddClient={() => { setEditingLead(undefined); setAddClientModalOpen(true); }}
            onEditClient={(lead) => { setEditingLead(lead); setAddClientModalOpen(true); }}
            onAppraise={handleOpenAppraisal}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            vehicles={Object.values(vehicles)}
            onVehicleSelect={navigateToVehicleDetail}
            onAddVehicleClick={() => { setEditingVehicle(undefined); setAddVehicleModalOpen(true); }}
            onBulkUploadClick={() => setBulkUploadModalOpen(true)}
            onCreateMultiBudget={handleOpenMultiBudgetSelector}
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
            onShare={handleShareVehicle}
            onSendToClient={handleSendToClient}
            onEdit={handleUpdateVehicle}
            onDelete={handleDeleteVehicle}
          />
        );
      case 'budget_calculator':
        return (
          <BudgetCalculatorView
            initialLead={quoteContext.lead}
            initialVehicle={quoteContext.vehicle}
            initialBudget={quoteContext.budget}
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
      case 'public_vehicle':
        if (!selectedVehicleId || !vehicles[selectedVehicleId]) return <div>Vehículo no encontrado</div>;
        return (
          <PublicVehicleDetail
            vehicle={vehicles[selectedVehicleId]}
            sellerProfile={sellerProfile}
            onBack={() => { /* Optional: maybe redirect to home or do nothing */ }}
            showPrice={true}
          />
        );
      case 'multi_budget':
        if (!currentMultiBudget) return <div>Presupuesto no encontrado</div>;
        const budgetVehicles = currentMultiBudget.vehicles
          .map(item => vehicles[item.vehicleId])
          .filter(Boolean);
        return (
          <PublicMultiBudgetView
            multiBudget={currentMultiBudget}
            vehicles={budgetVehicles}
            onTrackView={handleTrackMultiBudgetView}
          />
        );
    }
  };

  // If in Public Menu Mode, render simplified layout without Sidebar
  if (currentView === 'public_menu' || currentView === 'public_vehicle' || currentView === 'multi_budget') {
    return renderContent();
  }

  // If not logged in and not loading, show Login View
  if (!currentUser && !authLoading && (currentView as string) !== 'public_menu' && (currentView as string) !== 'public_vehicle') {
    return <LoginView onLoginSuccess={() => { }} />;
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => navigate('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'tasks'
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'calendar'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <CalendarIcon size={20} />
            <span className="font-medium">Calendario</span>
          </button>

          <button
            onClick={() => navigate('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'inventory' || currentView === 'vehicle_detail'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Car size={20} />
            <span className="font-medium">Inventario</span>
          </button>

          <button
            onClick={() => navigate('menus')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'menus' || currentView === 'menu_editor'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <MenuIcon size={20} />
            <span className="font-medium">Catálogos</span>
          </button>

          <button
            onClick={() => navigate('budget_calculator')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'budget_calculator'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Calculator size={20} />
            <span className="font-medium">Calculadora</span>
          </button>

          <button
            onClick={() => navigate('markup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'markup'
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
          {/* Demo Data Button */}
          {leads.length === 0 && Object.keys(vehicles).length === 0 && (
            <button
              onClick={handleLoadDemoData}
              className="mx-4 mb-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Database size={14} />
              Cargar Datos de Ejemplo
            </button>
          )}

          <button
            onClick={() => setProfileModalOpen(true)}
            className="w-full p-4 border-t border-slate-800 group hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3 px-2 relative">
              <img className="w-10 h-10 rounded-full object-cover" src={sellerProfile.avatarUrl} alt={sellerProfile.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-left truncate">{sellerProfile.name}</p>
                <p className="text-xs text-slate-500 text-left truncate">{currentUser?.email}</p>
              </div>
              <Edit size={14} className="absolute right-2 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-3 text-slate-400 hover:text-white hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <LogOut size={16} />
            Cerrar Sesión
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
          initialVehicle={editingVehicle}
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

      {/* Lead Selector Modal */}
      {isLeadSelectorOpen && (
        <LeadSelectorModal
          leads={leads}
          onSelect={handleLeadSelectForVehicle}
          onClose={() => setLeadSelectorOpen(false)}
        />
      )}

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <AddClientModal
          onSave={handleAddLead}
          onClose={() => setAddClientModalOpen(false)}
          initialLead={editingLead}
        />
      )}

      {/* Multi-Budget Selector */}
      {isMultiBudgetSelectorOpen && (
        <MultiBudgetSelector
          vehicles={vehicles}
          onCreateMultiBudget={handleCreateMultiBudget}
          onCancel={() => setMultiBudgetSelectorOpen(false)}
        />
      )}

      {/* Multi-Budget Modal */}
      {isMultiBudgetModalOpen && (
        <MultiBudgetModal
          selectedVehicles={selectedVehiclesForBudget}
          lead={quoteContext.lead}
          onSave={handleSaveMultiBudget}
          onCancel={() => setMultiBudgetModalOpen(false)}
        />
      )}
      {isAppraisalModalOpen && appraisalTargetLead && (
        <TradeInAppraisalModal
          lead={appraisalTargetLead}
          sellerProfile={sellerProfile}
          onSave={async (appraisal) => {
            // We need to save the appraisal to the 'appraisals' collection AND update the lead.
            // I'll do both here.
            const { saveAppraisal } = await import('./services/appraisalService');
            await saveAppraisal(appraisal);
            await handleSaveAppraisal(appraisal);
          }}
          onClose={() => setAppraisalModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
