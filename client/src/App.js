import "./App.css";
import { Routes, Route } from "react-router-dom";

import { SocketProvider } from "./providers/socket";
import { PeerProvider } from "./providers/peer";

import Home from "./pages/Home";
import Room from "./pages/Room";

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
