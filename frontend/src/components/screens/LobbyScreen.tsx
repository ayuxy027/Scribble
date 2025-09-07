import React from "react";
import Lobby from "../game/Lobby"; // Assuming your original Lobby component is here

interface LobbyScreenProps {
  username?: string;
  error: string;
  onSetUsername: (name: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  username,
  error,
  onSetUsername,
  onCreateRoom,
  onJoinRoom,
}) => {
  if (!username) {
    return <Lobby onSetUsername={onSetUsername} />;
  }

  return (
    <Lobby
      username={username}
      onSetUsername={onSetUsername}
      onCreateRoom={onCreateRoom}
      onJoinRoom={onJoinRoom}
      error={error}
    />
  );
};

export default LobbyScreen;