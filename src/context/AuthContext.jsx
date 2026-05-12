// context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const INITIAL_USERS = [
  { id: 1, username: "admin",  name: "Admin User",  email: "admin@blogpro.com",  role: "admin",  joined: "2026-01-01", status: "active",   avatar: "A" },
  { id: 2, username: "alice",  name: "Alice Smith",  email: "alice@example.com",  role: "author", joined: "2026-02-10", status: "active",   avatar: "A" },
  { id: 3, username: "bob",    name: "Bob Johnson",  email: "bob@example.com",    role: "author", joined: "2026-03-05", status: "active",   avatar: "B" },
  { id: 4, username: "carol",  name: "Carol White",  email: "carol@example.com",  role: "reader", joined: "2026-03-18", status: "active",   avatar: "C" },
  { id: 5, username: "dave",   name: "Dave Brown",   email: "dave@example.com",   role: "reader", joined: "2026-04-02", status: "suspended", avatar: "D" },
];

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);

  const login  = (data) => setUser({ ...data });
  const logout = () => setUser(null);

  /* ── User management (admin only) ── */
  const deleteUser = (id) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  const updateUser = (id, updates) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));

  const suspendUser = (id) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u)));

  const promoteUser = (id, role) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));

  return (
    <AuthContext.Provider value={{ user, login, logout, users, deleteUser, updateUser, suspendUser, promoteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
