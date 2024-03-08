import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PeerContext = createContext(null);

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      }),
    []
  );
  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  };
  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(new RTCSessionDescription(answer));
    return answer;
  };
  const setRemoteAns = async (ans) => {
    await peer.setRemoteDescription(new RTCSessionDescription(ans));
  };

  const sendStream = async (stream) => {
    const tracks = await stream.getTracks();
    console.log(tracks, "======");
    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
    peer.ontrack = function (e) {
      console.log("first");
      console.log(e.stream[0]);
      setRemoteStream(e.stream[0]);
    };
  };
  // const handleTrackEvent = useCallback((event) => {
  //   console.log(event, "11111");
  //   const streams = event.streams;
  //   setRemoteStream(streams[0]);
  // }, []);

  // useEffect(() => {
  //   peer.addEventListener("track", handleTrackEvent);
  //   return () => {
  //     peer.removeEventListener("track", handleTrackEvent);
  //   };
  // }, [peer]);
  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        remoteStream,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
