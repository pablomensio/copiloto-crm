import { getToken } from "firebase/messaging";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { messaging, db } from "./firebase";

export const requestNotificationPermission = async (userId: string) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Get FCM Token
            const token = await getToken(messaging, {
                vapidKey: "BK71jBVNCld5SYDsn9S9ItLe9Eejtlzq9NY0LU_4kPNwUQnP0GAD_Nl80PXSwF61olBTBcj_96uED1Q7lllfiSw" // User needs to replace this
            });

            if (token) {
                console.log("FCM Token:", token);
                await saveTokenToProfile(userId, token);
                return token;
            }
        } else {
            console.log("Notification permission denied");
        }
    } catch (error) {
        console.error("Error requesting notification permission:", error);
    }
    return null;
};

const saveTokenToProfile = async (userId: string, token: string) => {
    if (!userId) return;

    const userRef = doc(db, "user_profiles", userId);

    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token)
            });
        } else {
            await setDoc(userRef, {
                fcmTokens: [token]
            });
        }
    } catch (error) {
        console.error("Error saving FCM token:", error);
    }
};
