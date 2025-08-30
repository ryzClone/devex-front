// userContex.js
import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [search, setSearch] = useState("");

  return (
    <UserContext.Provider value={{ search, setSearch }}>
      {children}
    </UserContext.Provider>
  );
};
