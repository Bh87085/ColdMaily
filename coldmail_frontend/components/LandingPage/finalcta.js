export default function FinalCTA() {
  return (
    <section className="relative py-24 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Start sending smarter cold emails today
        </h2>
        <p className="text-lg text-blue-100 max-w-2xl mb-8">
          Automate follow-ups, track replies, and close more deals — without the hassle. Connect your email and start your first campaign in minutes.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="/signup"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition"
          >
            Get started free
          </a>
          <a
            href="/contact"
            className="bg-transparent border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition"
          >
            Talk to us
          </a>
        </div>
        <p className="mt-4 text-sm text-blue-100">No credit card required</p>
      </div>
    </section>
  );
}
