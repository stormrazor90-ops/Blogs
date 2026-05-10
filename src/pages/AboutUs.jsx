import { Link } from "react-router-dom";

const team = [
  {
    name: "Sarah Mitchell",
    role: "Founder & Editor-in-Chief",
    bio: "Former tech journalist with 12 years at leading publications. Sarah started BlogPro to give independent voices a world-class platform.",
    emoji: "👩‍💼",
    gradient: "from-violet-400 to-purple-600",
  },
  {
    name: "James Okafor",
    role: "Head of Engineering",
    bio: "Full-stack engineer who has shipped products used by millions. James keeps BlogPro fast, reliable, and always improving.",
    emoji: "👨‍💻",
    gradient: "from-sky-400 to-blue-600",
  },
  {
    name: "Priya Sharma",
    role: "Community Manager",
    bio: "Passionate about connecting writers with readers. Priya curates the weekly digest and nurtures our growing author community.",
    emoji: "👩‍🎨",
    gradient: "from-rose-400 to-pink-600",
  },
  {
    name: "Carlos Rivera",
    role: "Lead Designer",
    bio: "Believes great design is invisible. Carlos crafts every pixel of BlogPro to make reading and writing feel effortless.",
    emoji: "🎨",
    gradient: "from-amber-400 to-orange-600",
  },
];

const milestones = [
  { year: "2020", event: "BlogPro founded in a small apartment with a big idea." },
  { year: "2021", event: "Reached 1,000 published articles and 50,000 monthly readers." },
  { year: "2022", event: "Launched the Weekly Digest, now read by 120,000+ subscribers." },
  { year: "2023", event: "Opened the platform to independent writers worldwide." },
  { year: "2024", event: "Surpassed 500,000 monthly active readers across 80 countries." },
  { year: "2025", event: "Introduced AI-assisted editing tools and rich media support." },
];

const values = [
  {
    icon: "✍️",
    title: "Writer First",
    desc: "Every decision we make starts with one question: does this make life better for our writers? Great content begins with empowered creators.",
  },
  {
    icon: "🔍",
    title: "Radical Honesty",
    desc: "We publish facts, not noise. Our editorial standards are non-negotiable — accuracy and integrity are the foundation of everything we do.",
  },
  {
    icon: "🌍",
    title: "Open to All",
    desc: "Brilliant ideas come from everywhere. We actively work to amplify diverse voices and make publishing accessible regardless of background.",
  },
  {
    icon: "⚡",
    title: "Always Improving",
    desc: "We ship fast, listen to feedback, and iterate constantly. BlogPro today is better than yesterday, and tomorrow will be better still.",
  },
];

export default function AboutUs() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-8 bg-red-600 rounded-full" />
              <span className="text-red-400 text-xs font-black uppercase tracking-widest">
                Our Story
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              We believe every<br />
              <span className="text-red-400">idea deserves</span><br />
              an audience.
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              BlogPro was built for writers who have something real to say and readers who are hungry for substance. We cut through the noise and make quality writing the star of the show.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500K+", label: "Monthly Readers" },
              { value: "12K+",  label: "Published Articles" },
              { value: "3,200+", label: "Active Writers" },
              { value: "80+",   label: "Countries Reached" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-black mb-1">{stat.value}</p>
                <p className="text-red-200 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-1 h-6 bg-red-600 rounded-full" />
                <span className="text-red-600 text-xs font-black uppercase tracking-widest">Our Mission</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 leading-tight mb-6">
                Making great writing<br />impossible to ignore.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                The internet is full of content, but starved of genuine insight. BlogPro exists to change that. We provide writers with professional-grade tools and give readers a curated space where every article is worth their time.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                We're not a social media platform chasing engagement metrics. We're a publishing platform that respects both the craft of writing and the intelligence of readers.
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                Explore our articles
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-red-200 hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                    {v.icon}
                  </div>
                  <h3 className="font-black text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-1 h-6 bg-red-600 rounded-full" />
              <span className="text-red-600 text-xs font-black uppercase tracking-widest">The People</span>
              <span className="w-1 h-6 bg-red-600 rounded-full" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Meet the team</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A small, passionate group of writers, engineers, and designers who believe the web deserves better content.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`h-32 bg-gradient-to-br ${member.gradient} flex items-center justify-center text-5xl`}>
                  {member.emoji}
                </div>
                <div className="p-5">
                  <h3 className="font-black text-gray-900 text-base mb-0.5 group-hover:text-red-600 transition">
                    {member.name}
                  </h3>
                  <p className="text-red-600 text-xs font-bold uppercase tracking-wide mb-3">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-1 h-6 bg-red-600 rounded-full" />
              <span className="text-red-600 text-xs font-black uppercase tracking-widest">Our Journey</span>
              <span className="w-1 h-6 bg-red-600 rounded-full" />
            </div>
            <h2 className="text-4xl font-black text-gray-900">How we got here</h2>
          </div>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div className="shrink-0 w-[72px] text-right">
                    <span className="inline-block bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md">
                      {m.year}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="absolute -left-[25px] top-2 w-3 h-3 rounded-full bg-white border-2 border-red-600" />
                    <p className="text-gray-700 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-4">
            Ready to be part of the story?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Join thousands of writers sharing ideas that matter — or just sit back and enjoy the read.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-red-600/25"
            >
              Start writing free →
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl transition"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
