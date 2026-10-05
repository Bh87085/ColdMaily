"use client";

export default function MailTab({ currentTab, setCurrentTab }) {
  return (
    <div className="w-full border-b-2">
      <div className="flex flex-wrap gap-2 pb-2 px-4 pt-3">
        {["mails", "upcoming", "recent"].map((tab) => (
          <button
            key={tab}
            className={`capitalize px-4 py-2 rounded-md cursor-pointer transition-all duration-200 ${
              currentTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm"
            }`}
            onClick={() => setCurrentTab(tab)}
          >
            {tab === "mails" && "Mails"}
            {tab === "upcoming" && "Scheduled Mails"}
            {tab === "recent" && "Recent Mails"}
          </button>
        ))}
      </div>
    </div>
  );
}