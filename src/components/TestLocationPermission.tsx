import React from "react";
import { Geolocation } from "@capacitor/geolocation";

const TestLocationPermission: React.FC = () => {
  const handleRequest = async () => {
    try {
      const pos = await Geolocation.getCurrentPosition();
      console.log("Posición:", pos);
      alert("Permiso concedido y posición obtenida.");
    } catch (e: any) {
      console.error("Error obteniendo posición:", e);
      alert("Error: " + (e.message || e));
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <button
        style={{
          background: "#9f7aea",
          color: "white",
          padding: "16px 32px",
          borderRadius: 8,
          fontSize: 18,
        }}
        onClick={handleRequest}
      >
        Probar permiso de localización
      </button>
    </div>
  );
};

export default TestLocationPermission; 