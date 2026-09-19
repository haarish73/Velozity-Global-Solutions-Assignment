import { createContext, useState, useContext } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);

  const login = (data: any) => {
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ THIS LINE IS VERY IMPORTANT
export const useAuth = () => useContext(AuthContext);