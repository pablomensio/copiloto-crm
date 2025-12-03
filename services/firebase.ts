
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, deleteDoc, writeBatch, updateDoc, increment } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { Vehicle, Lead, Task, Menu, MultiBudget } from "../types";

import firebaseConfig from "../firebaseConfig";

// Check if credentials are still placeholders
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "TU_API_KEY_AQUI" && firebaseConfig.projectId !== "TU_PROYECTO_ID";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

let app;
let db: any;
let auth: any;
let messaging: any;
let storage: any;

// Only initialize if configured to avoid "Permission denied" errors on placeholder project
if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    messaging = getMessaging(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

export { auth, db, messaging, storage };

export const uploadVehicleImage = async (file: File): Promise<string> => {
  if (!storage) throw new Error("Storage not initialized");

  const storageRef = ref(storage, `vehicles/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const signIn = async (email, password) => {
  if (!auth) throw new Error("Auth not initialized");
  return signInWithEmailAndPassword(auth, email, password);
}

export const signOut = async () => {
  if (!auth) return;
  return firebaseSignOut(auth);
}

// Collection References
const VEHICLES_COLLECTION = "vehicles";
const LEADS_COLLECTION = "leads";
const TASKS_COLLECTION = "tasks";
const MENUS_COLLECTION = "menus";
const MULTI_BUDGETS_COLLECTION = "multi_budgets";

const checkDb = () => {
  if (!db) throw new Error("Firebase no está configurado. Edita services/firebase.ts con tus credenciales.");
};

/**
 * Fetch all vehicles from Firestore
 */
export const fetchVehicles = async (): Promise<Record<string, Vehicle>> => {
  checkDb();
  try {
    const querySnapshot = await getDocs(collection(db, VEHICLES_COLLECTION));
    const vehicles: Record<string, Vehicle> = {};
    querySnapshot.forEach((doc) => {
      vehicles[doc.id] = doc.data() as Vehicle;
    });
    return vehicles;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

/**
 * Fetch all leads from Firestore
 */
export const fetchLeads = async (): Promise<Lead[]> => {
  checkDb();
  try {
    const querySnapshot = await getDocs(collection(db, LEADS_COLLECTION));
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push(doc.data() as Lead);
    });
    return leads;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

/**
 * Fetch all tasks from Firestore
 */
export const fetchTasks = async (): Promise<Task[]> => {
  checkDb();
  try {
    const querySnapshot = await getDocs(collection(db, TASKS_COLLECTION));
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push(doc.data() as Task);
    });
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Fetch all menus
 */
export const fetchMenus = async (): Promise<Menu[]> => {
  checkDb();
  try {
    const querySnapshot = await getDocs(collection(db, MENUS_COLLECTION));
    const menus: Menu[] = [];
    querySnapshot.forEach((doc) => {
      menus.push(doc.data() as Menu);
    });
    return menus;
  } catch (error) {
    console.error("Error fetching menus:", error);
    throw error;
  }
};

/**
 * Get single menu by ID
 */
export const getMenu = async (id: string): Promise<Menu | null> => {
  checkDb();
  try {
    const docRef = doc(db, MENUS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Menu;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching menu:", error);
    throw error;
  }
}

/**
 * Save or Update a single vehicle
 */
/**
 * Save or Update a single vehicle
 */
export const saveVehicle = async (vehicle: Vehicle) => {
  checkDb();
  try {
    await setDoc(doc(db, VEHICLES_COLLECTION, vehicle.id), vehicle);
  } catch (error) {
    console.error("Error saving vehicle:", error);
    throw error;
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (vehicleId: string) => {
  checkDb();
  try {
    await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicleId));
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

/**
 * Save or Update a single lead
 */
export const saveLead = async (lead: Lead) => {
  checkDb();
  try {
    await setDoc(doc(db, LEADS_COLLECTION, lead.id), lead);
  } catch (error) {
    console.error("Error saving lead:", error);
    throw error;
  }
};

/**
 * Save or Update a single task
 */
export const saveTask = async (task: Task) => {
  checkDb();
  try {
    await setDoc(doc(db, TASKS_COLLECTION, task.id), task);
  } catch (error) {
    console.error("Error saving task:", error);
    throw error;
  }
};

/**
 * Save or Update a menu
 */
export const saveMenu = async (menu: Menu) => {
  checkDb();
  try {
    await setDoc(doc(db, MENUS_COLLECTION, menu.id), menu);
  } catch (error) {
    console.error("Error saving menu:", error);
    throw error;
  }
};

/**
 * Increment view count for a menu
 */
export const incrementMenuView = async (menuId: string) => {
  checkDb();
  try {
    const menuRef = doc(db, MENUS_COLLECTION, menuId);
    await updateDoc(menuRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    // Non-critical error, don't throw to avoid blocking UI
  }
};

/**
 * Bulk save vehicles (used for import or initial seeding)
 */
export const saveVehiclesBatch = async (vehicles: Vehicle[]) => {
  checkDb();
  try {
    const batch = writeBatch(db);
    vehicles.forEach((v) => {
      const ref = doc(db, VEHICLES_COLLECTION, v.id);
      batch.set(ref, v);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error batch saving vehicles:", error);
    throw error;
  }
};

/**
 * Seed initial data if DB is empty
 */
export const seedInitialData = async (
  initialVehicles: Record<string, Vehicle>,
  initialLeads: Lead[],
  initialTasks: Task[] = []
) => {
  checkDb();
  console.log("Seeding initial data to Firebase...");

  const batch = writeBatch(db);

  // Seed Vehicles
  Object.values(initialVehicles).forEach(v => {
    batch.set(doc(db, VEHICLES_COLLECTION, v.id), v);
  });

  // Seed Leads
  initialLeads.forEach(l => {
    batch.set(doc(db, LEADS_COLLECTION, l.id), l);
  });

  // Seed Tasks
  initialTasks.forEach(t => {
    batch.set(doc(db, TASKS_COLLECTION, t.id), t);
  });

  await batch.commit();
  console.log("Seeding complete.");
};

export const trackBudgetView = async (leadId: string, interactionId: string): Promise<Lead | null> => {
  checkDb();
  try {
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const leadSnap = await getDoc(leadRef);

    if (leadSnap.exists()) {
      const lead = leadSnap.data() as Lead;
      const updatedHistory = lead.history.map(interaction => {
        if (interaction.id === interactionId) {
          return {
            ...interaction,
            viewCount: (interaction.viewCount || 0) + 1,
            lastViewedAt: new Date().toISOString()
          };
        }
        return interaction;
      });

      const updatedLead = { ...lead, history: updatedHistory };
      await setDoc(leadRef, updatedLead);
      return updatedLead;
    }
    return null;
  } catch (error) {
    console.error("Error tracking budget view:", error);
    return null;
  }
};

/**
 * Multi-Budget Functions
 */

/**
 * Save a multi-vehicle budget comparison
 */
export const saveMultiBudget = async (multiBudget: MultiBudget): Promise<string> => {
  checkDb();
  try {
    await setDoc(doc(db, MULTI_BUDGETS_COLLECTION, multiBudget.id), multiBudget);
    return multiBudget.id;
  } catch (error) {
    console.error("Error saving multi-budget:", error);
    throw error;
  }
};

/**
 * Get a multi-budget by ID
 */
export const getMultiBudget = async (id: string): Promise<MultiBudget | null> => {
  checkDb();
  try {
    const docRef = doc(db, MULTI_BUDGETS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as MultiBudget;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching multi-budget:", error);
    throw error;
  }
};

/**
 * Track multi-budget view (increment viewCount)
 */
export const trackMultiBudgetView = async (budgetId: string): Promise<void> => {
  checkDb();
  try {
    const budgetRef = doc(db, MULTI_BUDGETS_COLLECTION, budgetId);
    await updateDoc(budgetRef, {
      viewCount: increment(1),
      lastViewedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error tracking multi-budget view:", error);
    // Non-critical error, don't throw
  }
};

/**
 * Get all multi-budgets for a specific lead
 */
export const getLeadMultiBudgets = async (leadId: string): Promise<MultiBudget[]> => {
  checkDb();
  try {
    const querySnapshot = await getDocs(collection(db, MULTI_BUDGETS_COLLECTION));
    const budgets: MultiBudget[] = [];
    querySnapshot.forEach((doc) => {
      const budget = doc.data() as MultiBudget;
      if (budget.leadId === leadId) {
        budgets.push(budget);
      }
    });
    return budgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching lead multi-budgets:", error);
    throw error;
  }
};
