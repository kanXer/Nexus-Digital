"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  type User,
} from "@/lib/firebase";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: string;
  numericPrice?: number;
  description?: string;
  tier?: string;
}

export interface UserOrder {
  id: string;
  date: string;
  purchaseTime: string;
  title: string;
  amount: string;
  status: "Completed" | "Processing" | "Pending";
  planId?: string;
  isSubscription?: boolean;
  expiryDate?: string;
  numericAmount?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile;
  cart: CartItem[];
  orders: UserOrder[];
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  isCartOpen: boolean;
  isOrdersOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openCart: () => void;
  closeCart: () => void;
  openOrders: () => void;
  closeOrders: () => void;
  loginWithGoogle: () => Promise<void>;
  sendEmailLinkLogin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  requireAuthForAction: (actionCallback: () => void) => boolean;
  recordNewOrder: (orderData: { title: string; amount: string; planId?: string; isSubscription?: boolean; numericAmount?: number }) => Promise<UserOrder>;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  gstin: "",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);

  // Modals visibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Load from LocalStorage as fast initial state
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("nexus_user_profile");
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));

      const savedCart = localStorage.getItem("nexus_user_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem("nexus_user_orders");
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error("Error loading local auth state:", e);
    }
  }, []);

  // Complete passwordless email-link sign-in when the user returns from the email link
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const finishSignIn = async () => {
      let email = localStorage.getItem("nexus_emailForSignIn");
      if (!email) {
        email = window.prompt("Confirm your email address to finish signing in:");
      }
      if (!email) return;
      try {
        await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem("nexus_emailForSignIn");
        // Clean the oobCode / apiKey params from the address bar
        window.history.replaceState({}, "", window.location.pathname);
      } catch (err: any) {
        console.error("Email link sign-in failed:", err?.code || err?.message);
      }
    };
    finishSignIn();
  }, []);

  // Listen for Firebase Auth & sync with Firestore Database
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load User Profile from Firestore DB if available
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setUserProfile((prev) => ({ ...prev, ...data }));
          } else {
            // First time user in Firestore: save initial profile
            const initProfile: UserProfile = {
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              phone: currentUser.phoneNumber || "",
              company: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
              gstin: "",
            };
            await setDoc(userDocRef, initProfile, { merge: true });
            setUserProfile((prev) => ({ ...prev, ...initProfile }));
          }

          // Fetch Cart from Firestore DB
          const cartDocRef = doc(db, "carts", currentUser.uid);
          const cartSnap = await getDoc(cartDocRef);
          if (cartSnap.exists()) {
            const cartData = cartSnap.data();
            if (cartData?.items && Array.isArray(cartData.items)) {
              setCart(cartData.items);
            }
          }

          // Fetch Orders from Firestore DB
          const ordersQuery = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
          const ordersSnap = await getDocs(ordersQuery);
          const fetchedOrders: UserOrder[] = [];
          ordersSnap.forEach((docSnap) => {
            const d = docSnap.data();
            fetchedOrders.push({
              id: docSnap.id.slice(0, 8).toUpperCase(),
              date: d.date || new Date().toLocaleDateString(),
              purchaseTime: d.purchaseTime || "",
              title: d.title || "Marketing Subscription",
              amount: d.amount || "₹0",
              status: d.status || "Completed",
              planId: d.planId,
              isSubscription: d.isSubscription ?? true,
              expiryDate: d.expiryDate || "",
              numericAmount: d.numericAmount,
            });
          });
          if (fetchedOrders.length > 0) {
            setOrders(fetchedOrders);
          }
        } catch (dbErr) {
          console.warn("Firestore sync notice (Database may be in test mode):", dbErr);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync state changes to LocalStorage
  useEffect(() => {
    if (userProfile.name || userProfile.email || userProfile.phone) {
      localStorage.setItem("nexus_user_profile", JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("nexus_user_cart", JSON.stringify(cart));
    if (user) {
      setDoc(doc(db, "carts", user.uid), { items: cart, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    }
  }, [cart, user]);

  useEffect(() => {
    localStorage.setItem("nexus_user_orders", JSON.stringify(orders));
  }, [orders]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openOrders = () => setIsOrdersOpen(true);
  const closeOrders = () => setIsOrdersOpen(false);

  // Require Login Guard Function
  const requireAuthForAction = (actionCallback: () => void): boolean => {
    if (!user) {
      openAuthModal();
      return false;
    }
    actionCallback();
    return true;
  };

  const loginWithGoogle = async () => {
    const isDummy = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy");
    if (isDummy) {
      const mockUser = {
        uid: "demo_google_user_123",
        email: "client@nexusdigitalmarketing.shop",
        displayName: "Nexus Client",
      } as unknown as User;
      setUser(mockUser);
      setUserProfile((prev) => ({
        ...prev,
        name: prev.name || "Nexus Client",
        email: prev.email || "client@nexusdigitalmarketing.shop",
      }));
      closeAuthModal();
      return;
    }

    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        setUser(res.user);
        setUserProfile((prev) => ({
          ...prev,
          name: res.user.displayName || prev.name || "Client",
          email: res.user.email || prev.email || "",
        }));
        closeAuthModal();
      }
    } catch (err: any) {
      console.warn("Firebase Google Sign-In notice:", err?.code || err?.message);
      if (err?.code === "auth/configuration-not-found" || err?.message?.includes("configuration-not-found")) {
        const mockUser = {
          uid: "demo_google_user_123",
          email: "client@nexusdigitalmarketing.shop",
          displayName: "Nexus Client",
        } as unknown as User;
        setUser(mockUser);
        setUserProfile((prev) => ({
          ...prev,
          name: prev.name || "Nexus Client",
          email: prev.email || "client@nexusdigitalmarketing.shop",
        }));
        closeAuthModal();
        alert("Google Sign-In is disabled in Firebase Console. Logged in as Demo User!\n\nTo enable live Google Sign-In:\n1. Firebase Console -> Authentication -> Sign-in method -> Enable Google.\n2. Add 'localhost' to Authorized Domains.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        throw new Error("Sign in popup was closed before completing.");
      } else {
        throw new Error(err?.message || "Google Sign-In failed.");
      }
    }
  };

  const sendEmailLinkLogin = async (email: string) => {
    const isDummy = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy");
    if (isDummy) {
      const mockUser = {
        uid: "demo_email_user_123",
        email: email,
        displayName: email.split("@")[0],
      } as unknown as User;
      setUser(mockUser);
      setUserProfile((prev) => ({
        ...prev,
        name: prev.name || email.split("@")[0],
        email: email,
      }));
      closeAuthModal();
      return;
    }

    try {
      const actionCodeSettings = {
        url: typeof window !== "undefined"
          ? window.location.origin + window.location.pathname
          : "https://nexusdigitalmarketing.shop",
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem("nexus_emailForSignIn", email);
      setUserProfile((prev) => ({ ...prev, email }));
    } catch (err: any) {
      const code = err?.code || "";
      let msg = err?.message || "Failed to send email sign-in link.";
      if (code.includes("configuration-not-found") || code.includes("operation-not-allowed")) {
        msg = "Passwordless email sign-in is not enabled in the Firebase Console yet (Authentication → Sign-in method → Email link).";
      } else if (code.includes("unauthorized-domain")) {
        msg = "This website domain is not added under Firebase Console → Authentication → Settings → Authorized domains.";
      } else if (code.includes("invalid-email") || code.includes("missing-email")) {
        msg = "Please enter a valid email address.";
      }
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...profile };
      localStorage.setItem("nexus_user_profile", JSON.stringify(next));
      return next;
    });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid), profile, { merge: true });
      } catch (e) {
        console.warn("Firestore update profile notice:", e);
      }
    }
  }, []);

  const addToCart = (item: CartItem) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setCart((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const recordNewOrder = async (orderData: { title: string; amount: string; planId?: string; isSubscription?: boolean; numericAmount?: number }): Promise<UserOrder> => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Expiry date calculation for monthly subscription (30 days from now)
    const expiryDateObj = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const formattedExpiryDate = expiryDateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const newOrder: UserOrder = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      date: formattedDate,
      purchaseTime: formattedTime,
      title: orderData.title,
      amount: orderData.amount,
      status: "Completed",
      planId: orderData.planId,
      isSubscription: orderData.isSubscription ?? true,
      expiryDate: formattedExpiryDate,
      numericAmount: orderData.numericAmount,
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (user) {
      try {
        await addDoc(collection(db, "orders"), {
          userId: user.uid,
          userEmail: user.email,
          title: orderData.title,
          amount: orderData.amount,
          numericAmount: orderData.numericAmount,
          planId: orderData.planId || "custom",
          isSubscription: newOrder.isSubscription,
          purchaseTime: formattedTime,
          date: formattedDate,
          expiryDate: formattedExpiryDate,
          status: "Completed",
          createdAt: now.toISOString(),
        });
      } catch (e) {
        console.warn("Firestore record order notice:", e);
      }
    }

    return newOrder;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        cart,
        orders,
        isAuthModalOpen,
        isProfileModalOpen,
        isCartOpen,
        isOrdersOpen,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        openCart,
        closeCart,
        openOrders,
        closeOrders,
        loginWithGoogle,
        sendEmailLinkLogin,
        logout,
        updateProfile,
        addToCart,
        removeFromCart,
        clearCart,
        requireAuthForAction,
        recordNewOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
