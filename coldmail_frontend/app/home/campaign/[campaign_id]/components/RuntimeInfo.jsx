export default function RuntimeInfo({ runtime }) {
  if (!runtime) return null;

  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
        Runtime
      </p>

      <div className="space-y-2 text-sm text-gray-700">
        <p>Started: {runtime.started_at}</p>
        <p>
          Sent: <span className="font-medium">{runtime.sent}</span> / {runtime.total}
        </p>
        <p>ETA: {runtime.eta}</p>
      </div>
    </div>
  );
}
