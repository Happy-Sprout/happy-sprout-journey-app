import { useState } from "react";

const Dashboard = () => {
  const [simpleData] = useState({
    message: "Dashboard is loading...",
    timestamp: new Date().toISOString()
  });

  console.log("[Dashboard-DEBUG] Simple Dashboard rendering");
  console.log("[Dashboard-DEBUG] Timestamp:", simpleData.timestamp);

  // Bypass all complex logic for now
  return (
    <div style={{ 
      backgroundColor: 'orange', 
      minHeight: '100vh', 
      padding: '20px',
      color: 'white',
      fontSize: '18px'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>DASHBOARD DEBUG - Simple Version</h1>
      <p>Message: {simpleData.message}</p>
      <p>Timestamp: {simpleData.timestamp}</p>
      <p>If you can see this orange screen, the Dashboard component is working!</p>
      <button 
        onClick={() => window.history.back()}
        style={{ 
          backgroundColor: 'white', 
          color: 'black', 
          padding: '10px 20px', 
          border: 'none',
          borderRadius: '5px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default Dashboard;
