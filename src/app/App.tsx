import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { Toaster } from "@/app/components/ui/sonner";
import { AppRoutes } from "./routes";
import { User } from "./components/interfaces/interfaces";


export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);



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