import { History } from "lucide-react";

const HistoryPanel = ({ history }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
      <History /> Business History
    </div>
    {history.length === 0 ? (
      <p className="text-gray-500">No businesses created yet.</p>
    ) : (
      <ul className="space-y-3">
        {history.map((b) => (
          <li key={b.id} className="border rounded-lg p-3 hover:shadow-md transition">
            <p className="font-bold">{b.business_name}</p>
            <p className="text-gray-500 text-sm">
              {new Date(b.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default HistoryPanel;
