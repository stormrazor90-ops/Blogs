import { useState } from "react";
import { Link } from "react-router-dom";

const contactMethods = [
  {
    icon: "✉️",
    title: "Email Us",
    detail: "hello@blogpro.com",
    sub: "We reply within 24 hours",
    href: "mailto:hello@blogpro.com",
  },
  {
    icon: "🐦",
    title: "Twitter / X",
    detail: "@BlogProHQ",
    sub: "DMs open for quick questions",
    href: "#",
  },
  {
    icon: "💼",
    title: "LinkedIn",
    detail: "BlogPro Magazine",
    sub: "Connect with our team",
    href: "#",
  },
  {
    icon: "📍",
    title: "Office",
    detail: "San Francisco, CA",
    sub: "Remote-first, globally distributed",
    href: "#",
  },
];

const faqs = [
  {
    q: "How do I become a writer on BlogPro?",
    a: "Simply create a free account and head to your Dashboard. You can start publishing immediately — no approval process required.",
  },
  {
    q: "Can I republish content I've written elsewhere?",
    a: "Yes, as long as you own the rights to the content. We recommend adding a canonical link back to the original source.",
  },
  {
    q: "How does the Weekly Digest work?",
    a: "Every Sunday we curate the best articles from the past week and send them to subscribers. Subscribe from the home page or your dashboard.",
  },
  {
    q: "I found a bug — how do I report it?",
    a: "Use the contact form on this page and select 'Bug Report' as the subject. Include as much detail as possible and we'll get on it fast.",
  },
  {
    q: "Do you offer advertising or sponsorship?",
    a: "We have limited sponsorship slots for brands that align with our editorial values. Reach out via email with your proposal.",
  },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async send
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-8 bg-red-600 rounded-full" />
              <span className="text-red-400 text-xs font-black uppercase tracking-widest">
                Get In Touch
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              We'd love to<br />
              <span className="text-red-400">hear from you.</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Whether you have a question, a story idea, a bug to report, or just want to say hello — our team is here and happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTACT METHODS ── */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="group flex flex-col gap-3 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl">
                  {method.icon}
                </div>
                <div>
                  <p className="font-black text-gray-900 group-hover:text-red-600 transition">{method.title}</p>
                  <p className="text-gray-700 text-sm font-semibold mt-0.5">{method.detail}</p>
                  <p className="text-gray-400 text-xs mt-1">{method.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + FAQ ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Contact form */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-1 h-6 bg-red-600 rounded-full" />
                <h2 className="text-2xl font-black text-gray-900">Send us a message</h2>
              </div>

              {submitted ? (
                <div className="bg-white rounded-2xl border border-green-200 p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
                    ✅
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Message sent!</h3>
                  <p className="text-gray-500 mb-6">
                    Thanks for reaching out, <strong>{form.name}</strong>. We'll get back to you at <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "General Inquiry", message: "" }); }}
                    className="text-sm text-red-600 hover:text-red-800 font-bold transition"
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="name">
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="email">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jane@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="subject">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition bg-white"
                    >
                      <option>General Inquiry</option>
                      <option>Writer Support</option>
                      <option>Bug Report</option>
                      <option>Partnership / Sponsorship</option>
                      <option>Press & Media</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what's on your mind..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      "Send message →"
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    We respect your privacy and will never share your information.
                  </p>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-1 h-6 bg-red-600 rounded-full" />
                <h2 className="text-2xl font-black text-gray-900">Frequently asked questions</h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-red-200 transition"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left"
                      aria-expanded={openFaq === i}
                    >
                      <span className="font-bold text-gray-900 text-sm pr-4">{faq.q}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-red-500" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}
                    >
                      <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* extra help */}
              <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                <h3 className="font-black text-lg mb-2">Still need help?</h3>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                  Can't find what you're looking for? Our support team is standing by.
                </p>
                <a
                  href="mailto:support@blogpro.com"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition"
                >
                  Email support
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-red-600 text-white py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-3">Want to write for BlogPro?</h2>
          <p className="text-red-200 mb-8">
            Join our community of writers and share your ideas with half a million readers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-red-600 hover:bg-red-50 font-bold px-8 py-3.5 rounded-xl transition shadow-lg"
            >
              Create a free account →
            </Link>
            <Link
              to="/about"
              className="bg-red-700 hover:bg-red-800 border border-red-500 text-white font-bold px-8 py-3.5 rounded-xl transition"
            >
              Learn about us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
