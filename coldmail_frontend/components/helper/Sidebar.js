// components/Sidebar.js

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-6">
      <h2 className="text-xl text-blue-700 font-semibold mb-8">ColdMaily</h2>
      <nav className="space-y-4">
        <Link href="/home" className="text-blue-600 hover:underline">Home</Link>
        <Link href="/home/schedule" className="text-blue-600 hover:underline">Schedule</Link>
        <Link href="/home/history" className="text-blue-600 hover:underline">History</Link>
        <Link href="/home/settings" className="text-blue-600 hover:underline">Settings</Link>
      </nav>
    </aside>
  );
}
