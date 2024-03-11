import React, { useContext, useMemo } from "react";
import { io } from "socket.io-client";
const SocketContext = React.createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = (props) => {
  const socket = io(
    // "http://localhost:8000",
    "https://635d-2405-201-2024-a1f6-85f9-ef59-1a5e-38a0.ngrok-free.app",
    {
      extraHeaders: {
        "ngrok-skip-browser-warning": "69420",
      },
    }
  );

  socket.on("connect", () => {
    console.log("connefct");
  });

  return (
    <SocketContext.Provider value={{ socket }}>
      {props.children}
    </SocketContext.Provider>
  );
};
