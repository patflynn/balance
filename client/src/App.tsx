import { useEffect, useState } from "react";

export function App() {
  const [status, setStatus] = useState<string>("connecting...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <main>
      <h1>Measure</h1>
      <p>A web-based tracking app.</p>
      <p>
        Server: <code>{status}</code>
      </p>
    </main>
  );
}
