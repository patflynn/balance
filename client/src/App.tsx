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
    <main className="mx-auto mt-16 max-w-xl p-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Measure</h1>
      <p className="text-gray-700">A web-based tracking app.</p>
      <p className="text-gray-700">
        Server:{" "}
        <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">
          {status}
        </code>
      </p>
    </main>
  );
}
