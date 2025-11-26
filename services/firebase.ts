
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, writeBatch, updateDoc, increment } from "firebase/firestore";
import { Vehicle, Lead, Task, Menu } from "../types";

// ------------------------------------------------------------------
// CONFIGURACIÓN: REEMPLAZA ESTO CON TUS CLAVES DE FIREBASE CONSOLE
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Check if credentials are still placeholders
const isConfigured = firebaseConfig.apiKey !== "TU_API_KEY_AQUI" && firebaseConfig.projectId !== "TU_PROYECTO_ID";

let app;
let db: any;

// Only initialize if configured to avoid "Permission denied" errors on placeholder project
if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

// Collection References
const VEHICLES_COLLECTION = "vehicles";
const LEADS_COLLECTION = "leads";
const TASKS_COLLECTION = "tasks";
const MENUS_COLLECTION = "menus";

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
