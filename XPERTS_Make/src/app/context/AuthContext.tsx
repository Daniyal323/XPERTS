import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { subscribeUser } from "../services/data/users";
import type { UserAccount, UserRole } from "../types/models";

interface AuthContextType {
  /** Full typed account document (with embedded expert/sme profile), or null. */
  user: UserAccount | null;
  /** Firebase auth uid, available before the Firestore doc resolves. */
  uid: string | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const profileUnsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Tear down any previous profile subscription on auth change.
      profileUnsub.current?.();
      profileUnsub.current = null;

      if (firebaseUser) {
        setUid(firebaseUser.uid);
        // Realtime: profile edits (onboarding completion, rating updates)
        // propagate without a manual refetch.
        profileUnsub.current = subscribeUser(
          firebaseUser.uid,
          (account) => {
            setUser(account);
            setLoading(false);
          },
          () => {
            // Profile read failed (offline / rules) — don't hang the app.
            setUser(null);
            setLoading(false);
          },
        );
      } else {
        setUid(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      profileUnsub.current?.();
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        uid,
        role: user?.role ?? null,
        loading,
        isAuthenticated: !!uid,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
