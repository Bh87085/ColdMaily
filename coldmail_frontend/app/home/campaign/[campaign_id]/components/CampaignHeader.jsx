import ActionButtons from "./ActionButtons";

export default function CampaignHeader({
  name,
  state,
  permissions,
  meta,
  campaign,
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-start justify-between">
        
        {/* Left */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {name}
          </h1>

          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="capitalize">{campaign.category}</span>
            <span>•</span>
            <span>{campaign.recipients_count} recipients</span>
            <span>•</span>
            <span>{campaign.no_of_follow_up} follow-ups</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <StatusPill state={state} />
          <ActionButtons permissions={permissions} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ state }) {
  const styles = {
    draft: "bg-gray-100 text-gray-700",
    running: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[state]}`}>
      {state}
    </span>
  );
}
