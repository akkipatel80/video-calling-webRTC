import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/socket";
import { usePeer } from "../providers/peer";
import ReactPlayer from "react-player";

export default function Room() {
  const { socket } = useSocket();
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState();
  const { peer, createOffer, createAnswer, setRemoteAns } = usePeer();

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("new user joined", emailId);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      setRemoteEmailId(from);
      const constraints = { audio: true, video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMyStream(stream);
      console.log("incoming call from", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
    },
    [createAnswer, socket]
  );

  const sendStream = useCallback(async () => {
    console.log(myStream);
    for (const track of myStream.getTracks()) {
      peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("call accepted", ans);
      await setRemoteAns(ans);
      // sendStream();
    },
    [sendStream]
  );
  const getUserMediaStream = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Browser supports getUserMedia

      const constraints = { audio: true, video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const offer = await createOffer();
      socket.emit("call-user", { emailId: remoteEmailId, offer });
      setMyStream(stream);
    } else {
      // Handle lack of support
      console.error("getUserMedia is not supported in this browser");
    }
  }, [remoteEmailId]);

  const handleNagotiation = useCallback(async () => {
    const offer = await createOffer();
    console.log("nagotiation  called");
    socket.emit("nego:needed", { emailId: remoteEmailId, offer: offer });
  }, []);

  const handleNagotiationIncoming = useCallback(
    ({ from, offer }) => {
      const ans = createAnswer(offer);
      socket.emit("nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNagotiationFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", async (e) => {
      console.log("track event");
      setRemoteStream(e.streams[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("nego:needed", handleNagotiationIncoming);
    socket.on("nego:final", handleNagotiationFinal);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("nego:needed", handleNagotiationIncoming);
      socket.off("nego:final", handleNagotiationFinal);
    };
  }, [
    handleNewUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNagotiationIncoming,
    handleNagotiationFinal,
    socket,
  ]);

  useEffect(() => {
    peer.addEventListener("nagotiationneeded", handleNagotiation);
    return () => {
      peer.removeEventListener("nagotiationneeded", handleNagotiation);
    };
  }, [handleNagotiation]);

  return (
    <div className="room-container">
      <h1>Room</h1>
      <h4>You are connected to {remoteEmailId}</h4>
      <button onClick={(e) => sendStream(myStream)}>Send My Video</button>
      {remoteEmailId && <button onClick={getUserMediaStream}>Call</button>}
      {myStream && <ReactPlayer url={myStream} playing muted />}
      {remoteStream && <ReactPlayer url={remoteStream} playing />}
    </div>
  );
}
