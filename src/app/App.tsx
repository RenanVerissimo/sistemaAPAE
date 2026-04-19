import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { User } from "@/types";
import { initializeLocalStorage } from "@/utils/mockData";
import { Toaster } from "@/app/components/ui/sonner";
import { AppRoutes } from "./routes";


export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initializeLocalStorage();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <AppRoutes
        currentUser={currentUser}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
      <Toaster />
    </BrowserRouter>
  );
}