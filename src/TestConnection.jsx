import { useState, useEffect } from 'react';

function TestConnection() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/health');
        
        if (response.ok) {
          const data = await response.json();
          setStatus(`Backend is reachable! Status: ${data.status}`);
        } else {
          setStatus(`Backend returned error: ${response.status}`);
        }
      } catch (error) {
        setError(error.message);
        setStatus('Failed to reach backend');
      }
    }
    
    checkHealth();
  }, []);

  return (
    <div className="fixed top-2 left-2 p-2 bg-white border rounded-md text-sm">
      <span className={error ? "text-red-500" : "text-green-500"}>{status}</span>
    </div>
  );
}

export default TestConnection;