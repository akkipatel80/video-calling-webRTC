import React, { useContext, useMemo } from "react";
import { io } from "socket.io-client";
const SocketContext = React.createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = (props) => {
  const socket = io(
    "http://localhost:8000",
    // "https://22e8-2405-201-2024-a1f6-8de1-d485-e1c6-62e4.ngrok-free.app",
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
