import { db, storage } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TradeInAppraisal } from '../types';

const APPRAISALS_COLLECTION = 'appraisals';

export const saveAppraisal = async (appraisal: TradeInAppraisal): Promise<void> => {
    if (!db) throw new Error("Firestore not initialized");

    const docRef = doc(db, APPRAISALS_COLLECTION, appraisal.id);
    await setDoc(docRef, appraisal);
};

export const getAppraisal = async (id: string): Promise<TradeInAppraisal | null> => {
    if (!db) throw new Error("Firestore not initialized");

    const docRef = doc(db, APPRAISALS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as TradeInAppraisal;
    } else {
        return null;
    }
};

export const getLeadAppraisals = async (leadId: string): Promise<TradeInAppraisal[]> => {
    if (!db) throw new Error("Firestore not initialized");

    const q = query(
        collection(db, APPRAISALS_COLLECTION),
        where('leadId', '==', leadId),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const appraisals: TradeInAppraisal[] = [];
    querySnapshot.forEach((doc) => {
        appraisals.push(doc.data() as TradeInAppraisal);
    });
    return appraisals;
};

export const uploadAppraisalPDF = async (pdfBlob: Blob, leadId: string): Promise<string> => {
    if (!storage) throw new Error("Storage not initialized");

    const storageRef = ref(storage, `appraisals/${leadId}_${Date.now()}.pdf`);
    const snapshot = await uploadBytes(storageRef, pdfBlob);
    return getDownloadURL(snapshot.ref);
};
