"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  user: any;
  isLoading: boolean;
  setUser: (user: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage first
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      try {
        const userData = JSON.parse(userFromStorage);
        setUser(userData);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
