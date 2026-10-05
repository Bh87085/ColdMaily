export default function CampaignOverview({ campaign }) {
  const metrics = [
    { label: "Recipients", value: campaign.recipients_count },
    { label: "Follow-ups", value: campaign.no_of_follow_up },
    { label: "Strategy", value: campaign.follow_up_strategy },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-xl border bg-white p-5"
        >
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {m.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {m.value}
          </p>
        </div>
      ))}
    </div>
  );
}
