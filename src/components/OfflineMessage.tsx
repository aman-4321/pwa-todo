// src/components/OfflineMessage.tsx
import React from "react";

const OfflineMessage: React.FC = () => {
  return (
    <div style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
      You are currently offline. Some features may not be available.
    </div>
  );
};

export default OfflineMessage;
