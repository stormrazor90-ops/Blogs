import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import RichTextEditor from "../components/RichTextEditor";
import FlowArt, { FlowSection } from "../components/StoryScroll";

/* ─────────────────────────────────────────────────────────────────────────────
   THEME — matches the rest of the site
───────────────────────────────────────────────────────────────────────────── */
const ACCENT  = "#D4A853";
const ACCENT2 = "#C0392B";
const BG_DARK = "#0C0C0A";
const BG_CARD = "#141410";

/* ─────────────────────────────────────────────────────────────────────────────
   PICSUM image helper
───────────────────────────────────────────────────────────────────────────── */
const PICSUM_IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200];
function getPostImage(post, offset = 0, w = 1200, h = 700) {
  if (post.images?.length > 0 && offset === 0) return post.images[0].url;
  const id = PICSUM_IDS[(post.id + offset) % PICSUM_IDS.length];
  return `https://picsum.photos/id/${id}/${w}/${h}`;
}

const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

/* ─────────────────────────────────────────────────────────────────────────────
   CONTENT GENERATOR
   Produces 4 rich FlowSection panels based on the post's title/content/author.
   Each panel has a distinct colour, large headline, and ~400 words of body text.
───────────────────────────────────────────────────────────────────────────── */
function generateSections(post) {
  const title   = post.title   || "Untitled";
  const rawText = stripHtml(post.content || "");
  const excerpt = rawText.slice(0, 200) || "An exploration of ideas worth sharing.";
  const topic   = title.toLowerCase();

  /* derive a "field" from the title for contextual copy */
  const isTech    = /react|js|javascript|typescript|css|tailwind|code|dev|web|api|node|next|vue|angular|software|programming|frontend|backend/i.test(topic);
  const isDesign  = /design|ui|ux|figma|color|typography|layout|visual|brand|creative/i.test(topic);
  const isWriting = /write|writing|blog|content|story|narrative|journal|essay|word/i.test(topic);
  const isCareer  = /career|job|work|freelance|remote|salary|hire|team|startup|product/i.test(topic);

  const field = isTech ? "technology" : isDesign ? "design" : isWriting ? "writing" : isCareer ? "career" : "ideas";

  /* ── Section colour palettes ── */
  const palettes = [
    { bg: BG_DARK,   color: "#fff",     hr: "rgba(212,168,83,0.3)",  num: "01" },
    { bg: "#1A1A16", color: "#fff",     hr: "rgba(255,255,255,0.12)", num: "02" },
    { bg: "#141410", color: "#fff",     hr: "rgba(212,168,83,0.2)",  num: "03" },
    { bg: "#0A0A08", color: "#fff",     hr: "rgba(255,255,255,0.1)", num: "04" },
    { bg: "#1A1208", color: "#fff",     hr: `rgba(212,168,83,0.25)`, num: "05" },
  ];

  /* ── Contextual copy blocks ── */
  const blocks = {
    technology: {
      s1: {
        label: "The Context",
        headline: ["The Stack", "Behind", "The Story"],
        intro: `${excerpt} In the world of modern ${field}, every decision carries weight. The tools we choose, the patterns we adopt, and the principles we uphold shape not just our code — but the experiences of every person who interacts with what we build.`,
        cols: [
          { head: "Why It Matters", body: `Technology is no longer a back-office concern. It sits at the heart of every business, every interaction, every moment of friction or delight. Understanding the fundamentals behind ${title} gives you leverage — the ability to make better decisions faster, with more confidence and less guesswork.` },
          { head: "The Landscape", body: `The ecosystem around ${field} moves fast. Frameworks rise and fall. Best practices evolve. What worked two years ago may be an anti-pattern today. Staying current isn't about chasing trends — it's about understanding the underlying forces that drive change and positioning yourself ahead of them.` },
          { head: "First Principles", body: `Before diving into implementation details, it's worth stepping back and asking: what problem are we actually solving? The best engineers aren't the ones who know the most APIs — they're the ones who can reason from first principles and arrive at elegant solutions that others miss entirely.` },
        ],
      },
      s2: {
        label: "Deep Dive",
        headline: ["Build", "Better.", "Ship Faster."],
        intro: `Every line of code is a decision. Every abstraction is a trade-off. The craft of software development is learning to make those trade-offs consciously — understanding what you're gaining and what you're giving up with every architectural choice.`,
        cols: [
          { head: "Performance", body: `Speed is a feature. Users notice when things are slow, even if they can't articulate why. Optimising for performance isn't premature — it's professional. From bundle sizes to render cycles, every millisecond you save is a millisecond of trust you earn.` },
          { head: "Maintainability", body: `Code is read far more often than it's written. The developer who comes after you — often yourself six months later — will thank you for clear naming, consistent patterns, and honest comments. Write code for humans first, machines second.` },
          { head: "Scalability", body: `What works for ten users rarely works for ten thousand. Designing for scale doesn't mean over-engineering from day one — it means making decisions that don't paint you into a corner. Leave the doors open. Build for the next order of magnitude.` },
        ],
      },
      s3: {
        label: "Practical Application",
        headline: ["From Theory", "To", "Production"],
        intro: `The gap between understanding a concept and shipping it to production is where most developers spend their careers. Bridging that gap requires more than technical knowledge — it requires judgment, experience, and the willingness to make decisions under uncertainty.`,
        cols: [
          { head: "Testing Strategy", body: `Tests are documentation that runs. A well-tested codebase is a codebase you can change with confidence. Start with the tests that give you the most signal for the least effort — integration tests over unit tests, critical paths over edge cases.` },
          { head: "Deployment", body: `Shipping is a skill. The ability to get code from your laptop to production reliably, repeatably, and safely is one of the most valuable things a developer can master. CI/CD pipelines, feature flags, and rollback strategies aren't DevOps concerns — they're engineering fundamentals.` },
          { head: "Monitoring", body: `You can't improve what you can't measure. Instrumentation, logging, and alerting should be first-class concerns, not afterthoughts. Know when your system is struggling before your users do. Build observability in from the start.` },
        ],
      },
      s4: {
        label: "Looking Forward",
        headline: ["What", "Comes", "Next"],
        intro: `The best time to think about the future is before it arrives. The trends shaping ${field} today will define the constraints and opportunities of tomorrow. Understanding where things are heading gives you the ability to make investments now that pay dividends later.`,
        cols: [
          { head: "Emerging Patterns", body: `Every generation of developers inherits a set of patterns from the previous one and invents new ones to solve problems the old patterns couldn't handle. The patterns emerging today around AI-assisted development, edge computing, and reactive architectures will define the next decade.` },
          { head: "The Human Element", body: `For all the talk of automation and AI, software is still fundamentally a human endeavour. The ability to communicate clearly, collaborate effectively, and understand user needs will remain the most valuable skills a developer can have — regardless of how the tools evolve.` },
          { head: "Your Next Step", body: `Reading about ${title} is the beginning, not the end. The real learning happens when you apply these ideas to real problems, make mistakes, iterate, and gradually build the intuition that separates good engineers from great ones. Start small. Ship something. Learn from it.` },
        ],
      },
    },
    design: {
      s1: {
        label: "The Vision",
        headline: ["Design", "With", "Intent"],
        intro: `${excerpt} Great design is invisible. When it works, users don't notice the craft — they simply feel at ease, guided effortlessly toward their goals. The discipline behind ${title} is the art of making complexity feel simple, and simplicity feel inevitable.`,
        cols: [
          { head: "Visual Hierarchy", body: `Every element on a screen competes for attention. The designer's job is to orchestrate that competition — to ensure the most important things are seen first, the secondary things support them, and nothing distracts from the core message. Hierarchy is the grammar of visual communication.` },
          { head: "Colour & Emotion", body: `Colour is never neutral. Every hue carries cultural weight, psychological associations, and contextual meaning. The colours you choose don't just make things look good — they shape how users feel, what they trust, and what actions they take. Choose with intention.` },
          { head: "Typography", body: `Type is the voice of your design. The typeface you choose, the size you set, the line height you specify — all of these communicate personality, establish hierarchy, and affect readability. Good typography is invisible. Bad typography is all you see.` },
        ],
      },
      s2: {
        label: "The Process",
        headline: ["Research.", "Iterate.", "Refine."],
        intro: `Design without research is decoration. The best designers are the ones who spend the most time understanding the problem before they pick up a pencil. Every assumption you validate before you design is a revision you avoid after you ship.`,
        cols: [
          { head: "User Research", body: `Talk to your users. Not once, not at the end of the project — continuously. The insights that come from watching a real person struggle with your interface are worth more than any amount of internal debate. Build empathy into your process, not just your deliverables.` },
          { head: "Prototyping", body: `The fastest way to test an idea is to make it tangible. Prototypes don't need to be perfect — they need to be good enough to generate feedback. Low-fidelity sketches, clickable wireframes, coded prototypes: use the right tool for the right question.` },
          { head: "Iteration", body: `The first version is never the best version. Design is a process of progressive refinement — each iteration informed by feedback, each version closer to the ideal. The willingness to throw away work that isn't serving the user is what separates good designers from great ones.` },
        ],
      },
      s3: {
        label: "Systems Thinking",
        headline: ["Design", "At", "Scale"],
        intro: `Individual screens are easy. Systems are hard. As products grow, the challenge shifts from designing individual components to maintaining consistency across hundreds of screens, dozens of designers, and thousands of edge cases. Design systems are the answer.`,
        cols: [
          { head: "Component Libraries", body: `A well-built component library is a force multiplier. It lets designers and developers speak the same language, move faster, and maintain consistency without constant coordination. The investment in building it pays back every time someone doesn't have to reinvent a button.` },
          { head: "Design Tokens", body: `Tokens are the atoms of a design system — the named values for colours, spacing, typography, and motion that flow through every component. Get your tokens right and you can retheme an entire product by changing a handful of values.` },
          { head: "Documentation", body: `A design system without documentation is a design system that won't be used. The best systems are the ones that make the right thing the easy thing — where the documentation is so clear and the components so well-named that using them correctly requires no effort at all.` },
        ],
      },
      s4: {
        label: "The Future",
        headline: ["Design", "Tomorrow,", "Today"],
        intro: `The tools of design are changing faster than at any point in history. AI is automating the mechanical parts of the craft, freeing designers to focus on the parts that require genuine human judgment: empathy, taste, and the ability to ask the right questions.`,
        cols: [
          { head: "AI & Design", body: `AI won't replace designers — it will replace designers who don't use AI. The tools emerging today can generate layouts, suggest colour palettes, and write copy. The designers who thrive will be the ones who use these tools to amplify their judgment, not replace it.` },
          { head: "Accessibility", body: `Accessible design is good design. When you design for users with disabilities, you almost always improve the experience for everyone. Contrast ratios, keyboard navigation, screen reader support — these aren't compliance checkboxes, they're quality indicators.` },
          { head: "Your Practice", body: `Design is a practice, not a destination. The best designers never stop learning, never stop questioning their assumptions, and never stop looking at the world with fresh eyes. Cultivate curiosity. Study things outside your field. The best design insights often come from unexpected places.` },
        ],
      },
    },
  };

  /* fallback generic blocks */
  const generic = {
    s1: {
      label: "The Opening",
      headline: ["Ideas", "Worth", "Sharing"],
      intro: `${excerpt} Every great piece of writing begins with a question worth asking. The ideas explored in ${title} sit at the intersection of curiosity and craft — the kind of thinking that changes how you see the world long after you've finished reading.`,
      cols: [
        { head: "The Core Idea", body: `At the heart of ${title} is a deceptively simple premise: that the way we think about ${field} shapes the way we act, and the way we act shapes the world around us. Understanding this feedback loop is the first step toward changing it deliberately rather than accidentally.` },
        { head: "Why Now", body: `The timing of an idea matters as much as the idea itself. The questions raised in ${title} are particularly urgent right now, when the pace of change is accelerating and the old frameworks for making sense of the world are struggling to keep up with new realities.` },
        { head: "The Stakes", body: `This isn't abstract philosophy. The ideas in ${title} have real consequences — for how we work, how we communicate, and how we build things that last. Getting them right matters. Getting them wrong has costs that compound over time.` },
      ],
    },
    s2: {
      label: "The Argument",
      headline: ["The Case", "For", "Clarity"],
      intro: `Good writing doesn't just inform — it changes minds. The most powerful essays are the ones that take you from one place to another, that leave you seeing something you couldn't see before. That's the ambition behind ${title}.`,
      cols: [
        { head: "Evidence", body: `The argument in ${title} isn't built on assertion — it's built on evidence. The patterns observed, the examples studied, and the data examined all point in the same direction. When multiple lines of evidence converge on the same conclusion, that conclusion deserves serious attention.` },
        { head: "Counter-arguments", body: `The strongest arguments are the ones that take the opposing view seriously. The objections to the ideas in ${title} are real, and they deserve honest engagement. Acknowledging what you don't know is a sign of intellectual honesty, not weakness.` },
        { head: "Synthesis", body: `The goal isn't to win an argument — it's to get closer to the truth. The synthesis that emerges from taking multiple perspectives seriously is almost always richer and more useful than any single viewpoint. Complexity is a feature, not a bug.` },
      ],
    },
    s3: {
      label: "The Practice",
      headline: ["From", "Reading", "To Doing"],
      intro: `Ideas without action are just entertainment. The real test of any piece of writing is whether it changes what you do on Monday morning. The practical implications of ${title} are concrete, actionable, and worth taking seriously.`,
      cols: [
        { head: "Start Here", body: `The first step is always the hardest. But the ideas in ${title} suggest a clear entry point — a small, low-risk experiment that lets you test the core thesis without committing to a wholesale change. Start there. See what you learn. Build from what works.` },
        { head: "Common Mistakes", body: `Most people who engage with the ideas in ${title} make the same mistakes. They try to do too much too fast. They apply the ideas in the wrong context. They give up before the results become visible. Knowing these pitfalls in advance is half the battle.` },
        { head: "Measuring Progress", body: `How do you know if the ideas in ${title} are working? The metrics that matter aren't always the ones that are easiest to measure. Define success before you start. Track the leading indicators, not just the lagging ones. Adjust based on what you observe.` },
      ],
    },
    s4: {
      label: "The Horizon",
      headline: ["What", "This", "Changes"],
      intro: `The ideas in ${title} don't exist in isolation. They connect to larger questions about how we live, work, and make sense of the world. Following those connections leads somewhere interesting — to a different way of seeing things that, once seen, can't be unseen.`,
      cols: [
        { head: "The Bigger Picture", body: `Zoom out far enough and ${title} is part of a much larger conversation — one that's been going on for decades and will continue long after this particular piece is forgotten. Understanding where it fits in that conversation gives it more meaning, not less.` },
        { head: "Unexpected Connections", body: `The most interesting insights come from unexpected places. The ideas in ${title} connect to fields that might seem unrelated at first glance — but the connections are real, and following them leads to a richer understanding than staying within the boundaries of any single discipline.` },
        { head: "Your Turn", body: `The best response to ${title} isn't agreement or disagreement — it's engagement. Take the ideas seriously. Test them against your own experience. Push back where they don't hold up. Add your own perspective. That's how good ideas get better.` },
      ],
    },
  };

  const chosen = blocks[field] || generic;

  return [
    { ...palettes[0], ...chosen.s1 },
    { ...palettes[1], ...chosen.s2 },
    { ...palettes[2], ...chosen.s3 },
    { ...palettes[3], ...chosen.s4 },
  ];
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMMENTS SECTION
───────────────────────────────────────────────────────────────────────────── */
function CommentsSection({ post, user, toast }) {
  const { addComment, reviewPost } = usePosts();
  const [comment, setComment] = useState("");
  const [voted,   setVoted]   = useState(null);

  const isContentEmpty = (html) => !html || html.replace(/<[^>]*>/g, "").trim() === "";

  const handleComment = (e) => {
    e.preventDefault();
    if (isContentEmpty(comment)) return;
    addComment(post.id, { user: user?.username || user?.name || "Anonymous", text: comment });
    setComment("");
    toast("Comment posted!", "success");
  };

  const handleVote = (vote) => {
    if (voted) return;
    if (!user) { toast("Please sign in to leave a review.", "info"); return; }
    const reviewer = user.username || user.name || "anonymous";
    if (post.reviews?.some((r) => r.reviewer === reviewer)) {
      toast("You've already reviewed this post.", "info");
      setVoted(post.reviews.find((r) => r.reviewer === reviewer)?.vote || "helpful");
      return;
    }
    reviewPost(post.id, vote, reviewer);
    setVoted(vote);
    toast(vote === "helpful" ? "Thanks for your feedback! 👍" : "Thanks — we'll keep improving!", "success");
  };

  const existingVote   = user ? post.reviews?.find((r) => r.reviewer === (user.username || user.name))?.vote : null;
  const activeVote     = voted || existingVote;
  const helpfulCount   = post.helpful    || 0;
  const notHelpfulCount= post.notHelpful || 0;
  const totalVotes     = helpfulCount + notHelpfulCount;
  const helpfulPct     = totalVotes > 0 ? Math.round((helpfulCount / totalVotes) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">

      {/* ── Was this helpful ── */}
      <div className="rounded-2xl p-8 mb-12 border"
        style={{ background: BG_CARD, borderColor: "rgba(212,168,83,0.15)" }}>
        {activeVote ? (
          <div className="text-center">
            <p className="text-4xl mb-3">{activeVote === "helpful" ? "👍" : "👎"}</p>
            <p className="text-white font-black text-lg mb-1">
              {activeVote === "helpful" ? "Glad it helped!" : "Thanks for the feedback!"}
            </p>
            <p className="text-white/40 text-sm mb-6">Your review has been recorded.</p>
            {totalVotes > 0 && (
              <div className="max-w-sm mx-auto">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>👍 {helpfulCount} helpful</span>
                  <span>{notHelpfulCount} not helpful 👎</span>
                </div>
                <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${helpfulPct}%`, background: ACCENT }} />
                </div>
                <p className="text-xs text-white/30 mt-2 text-center">
                  {helpfulPct}% of {totalVotes} reader{totalVotes !== 1 ? "s" : ""} found this helpful
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="text-white font-black text-lg text-center mb-2">Was this article helpful?</p>
            <p className="text-white/40 text-sm text-center mb-6">
              {user ? "Let the author know what you think." : (
                <><Link to="/login" className="font-bold" style={{ color: ACCENT }}>Sign in</Link> to leave a review.</>
              )}
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => handleVote("helpful")} disabled={!user}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-40 border"
                style={{ color: ACCENT, borderColor: `${ACCENT}40`, background: `${ACCENT}08` }}
                onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${ACCENT}08`; e.currentTarget.style.color = ACCENT; }}>
                👍 Yes, helpful {helpfulCount > 0 && <span className="text-xs opacity-60">({helpfulCount})</span>}
              </button>
              <button onClick={() => handleVote("notHelpful")} disabled={!user}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-40 border"
                style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${ACCENT2}60`; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                👎 Not really {notHelpfulCount > 0 && <span className="text-xs opacity-60">({notHelpfulCount})</span>}
              </button>
            </div>
            {totalVotes > 0 && (
              <div className="max-w-sm mx-auto">
                <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${helpfulPct}%`, background: ACCENT }} />
                </div>
                <p className="text-xs text-white/25 mt-2 text-center">
                  {helpfulPct}% of {totalVotes} reader{totalVotes !== 1 ? "s" : ""} found this helpful
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Comments ── */}
      <h2 className="text-2xl font-black text-white mb-8">
        Comments
        <span className="text-white/30 font-normal text-lg ml-3">({post.comments?.length ?? 0})</span>
      </h2>

      {user ? (
        <form onSubmit={handleComment} className="rounded-2xl p-6 mb-8 border"
          style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: `${ACCENT}20`, color: ACCENT }}>
              {(user.username || user.name || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <RichTextEditor value={comment} onChange={setComment}
                placeholder="Share your thoughts…" minHeight={120} />
              <div className="flex justify-end mt-3">
                <button type="submit" disabled={isContentEmpty(comment)}
                  className="text-sm font-black uppercase tracking-[0.15em] px-6 py-2.5 rounded-full transition-all duration-200 disabled:opacity-40"
                  style={{ background: ACCENT, color: "#000" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#e8b85e"}
                  onMouseLeave={e => e.currentTarget.style.background = ACCENT}>
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl p-6 mb-8 text-center border"
          style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-white/50 text-sm">
            <Link to="/login" className="font-bold" style={{ color: ACCENT }}>Sign in</Link> to leave a comment.
          </p>
        </div>
      )}

      {post.comments?.length === 0 ? (
        <div className="rounded-2xl p-12 text-center border"
          style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.04)" }}>
          <p className="text-3xl mb-3">💬</p>
          <p className="text-white/40 text-sm">No comments yet. Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...post.comments].reverse().map((c) => (
            <div key={c.id} className="rounded-2xl p-5 flex gap-3 border"
              style={{ background: BG_CARD, borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                {c.user[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-white">{c.user}</span>
                  <span className="text-xs text-white/30">{c.date}</span>
                </div>
                <div className="text-sm text-white/60 leading-relaxed prose prose-sm max-w-none
                  [&_a]:text-amber-400 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
                  [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-white/40
                  [&_code]:bg-white/10 [&_code]:text-amber-300 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
                  dangerouslySetInnerHTML={{ __html: c.text }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function PostDetails() {
  const { slug }    = useParams();
  const { posts, deletePost } = usePosts();
  const { user }    = useAuth();
  const { toast }   = useToast();
  const navigate    = useNavigate();

  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    const prev = document.title;
    document.title = post ? `${post.title} — BlogPro` : "Post Not Found — BlogPro";
    return () => { document.title = prev; };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG_DARK }}>
        <div className="text-center px-6">
          <p className="text-6xl mb-5">📭</p>
          <h2 className="text-2xl font-black text-white mb-3">Post not found</h2>
          <p className="text-white/40 mb-8">This post may have been deleted or doesn't exist.</p>
          <Link to="/blog"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full transition-all duration-300"
            style={{ background: ACCENT, color: "#000" }}>
            Back to Blog →
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deletePost(post.id);
    toast("Post deleted.", "info");
    navigate("/blog");
  };

  const isOwner = user && (user.username === post.author || user.name === post.author);
  const sections = generateSections(post);

  return (
    <div style={{ background: BG_DARK, color: "#fff" }}>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — full-bleed cover image with cinematic overlays
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: 500 }}>
        {/* background image */}
        <img
          src={getPostImage(post, 0, 1600, 900)}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scale(1.04)" }}
        />
        {/* overlays */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />

        {/* back link */}
        <div className="absolute top-8 left-6 lg:left-10 z-20">
          <Link to="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.15)" }}
            onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = `${ACCENT}50`; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
            ← Back to Blog
          </Link>
        </div>

        {/* owner actions */}
        {isOwner && (
          <div className="absolute top-8 right-6 lg:right-10 z-20 flex gap-2">
            <Link to="/dashboard"
              className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-all duration-200"
              style={{ color: ACCENT, borderColor: `${ACCENT}40`, background: `${ACCENT}10` }}>
              ✏️ Edit
            </Link>
            <button onClick={handleDelete}
              className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-all duration-200"
              style={{ color: "#C0392B", borderColor: "rgba(192,57,43,0.4)", background: "rgba(192,57,43,0.1)" }}>
              🗑️ Delete
            </button>
          </div>
        )}

        {/* hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-5xl mx-auto px-6 lg:px-10 pb-16">
          {/* category + tags */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {post.category && (
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-sm"
                style={{ background: ACCENT2, color: "#fff" }}>
                {post.category}
              </span>
            )}
            {post.tags?.map((tag) => (
              <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* title */}
          <h1 className="font-black text-white leading-[0.9] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.2rem, 5vw, 5rem)", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}>
            {post.title}
          </h1>

          {/* meta */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border border-white/20"
                style={{ background: `${ACCENT}25`, color: ACCENT }}>
                {post.author[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-none">{post.author}</p>
                <p className="text-white/40 text-xs mt-0.5">{post.date}</p>
              </div>
            </div>
            <div className="flex gap-5 text-white/40 text-xs">
              <span>👁 {post.views ?? 0} views</span>
              <span>♥ {post.likes ?? 0} likes</span>
              <span>💬 {post.comments?.length ?? 0} comments</span>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-6 right-8 z-20 flex flex-col items-center gap-1.5">
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.2)" }}>Scroll</p>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ORIGINAL CONTENT (if any) — shown as a clean reading section
      ══════════════════════════════════════════════════════════════════════ */}
      {post.content && stripHtml(post.content).length > 10 && (
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px" style={{ background: ACCENT }} />
            <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: ACCENT }}>
              The Article
            </p>
          </div>
          <div
            className="text-white/70 text-lg leading-relaxed prose prose-lg max-w-none
              [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-white [&_h1]:mt-8 [&_h1]:mb-3
              [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-2
              [&_h3]:text-xl  [&_h3]:font-bold  [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2
              [&_p]:mb-5 [&_p]:text-white/65
              [&_blockquote]:border-l-4 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-white/40 [&_blockquote]:my-6
              [&_pre]:bg-black/60 [&_pre]:text-amber-300 [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-white/10
              [&_a]:text-amber-400 [&_a]:underline [&_a:hover]:text-amber-300
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:text-white/60
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:text-white/60
              [&_code]:bg-white/10 [&_code]:text-amber-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
              [&_hr]:border-white/10 [&_hr]:my-8
              [&_strong]:text-white [&_strong]:font-bold
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* extra images */}
          {post.images?.length > 1 && (
            <div className="grid grid-cols-2 gap-3 mt-10">
              {post.images.slice(1).map((img, i) => (
                <img key={i} src={img.url} alt={img.name}
                  className="w-full h-48 object-cover rounded-xl border"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FLOW ART SCROLL — 4 pinned sections with generated content
      ══════════════════════════════════════════════════════════════════════ */}
      <FlowArt aria-label={`Deep dive into ${post.title}`}>
        {sections.map((sec, idx) => (
          <FlowSection
            key={idx}
            aria-label={sec.label}
            style={{ backgroundColor: sec.bg, color: sec.color }}
          >
            {/* section number + label */}
            <p className="text-xs font-black uppercase tracking-[0.25em]"
              style={{ color: idx === 0 ? ACCENT : "rgba(255,255,255,0.4)" }}>
              {sec.num} — {sec.label}
            </p>

            {/* divider */}
            <hr className="border-none border-t my-0" style={{ borderTopWidth: 1, borderColor: sec.hr }} />

            {/* big headline */}
            <div>
              <h2 className="font-black leading-[0.85] uppercase tracking-tight"
                style={{ fontSize: "clamp(3rem, 10vw, 11rem)" }}>
                {sec.headline.map((line, li) => (
                  <span key={li} className="block">
                    {li === 1 ? <span style={{ color: ACCENT }}>{line}</span> : line}
                  </span>
                ))}
              </h2>
            </div>

            {/* divider */}
            <hr className="border-none border-t my-0" style={{ borderTopWidth: 1, borderColor: sec.hr }} />

            {/* intro paragraph */}
            <p className="max-w-[55ch] font-light leading-relaxed"
              style={{ fontSize: "clamp(1rem, 2.2vw, 1.6rem)", color: "rgba(255,255,255,0.65)" }}>
              {sec.intro}
            </p>

            {/* divider */}
            <hr className="border-none border-t my-0" style={{ borderTopWidth: 1, borderColor: sec.hr }} />

            {/* three-column content grid */}
            <div className="flex flex-wrap gap-[3vw]">
              {sec.cols.map((col, ci) => (
                <div key={ci} className="min-w-[200px] flex-1">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.2em]"
                    style={{ color: ACCENT }}>
                    {col.head}
                  </p>
                  <p className="leading-relaxed"
                    style={{ fontSize: "clamp(0.85rem, 1.2vw, 1rem)", color: "rgba(255,255,255,0.5)" }}>
                    {col.body}
                  </p>
                </div>
              ))}
            </div>

            {/* section image — only on first and third panels */}
            {(idx === 0 || idx === 2) && (
              <>
                <hr className="border-none border-t my-0" style={{ borderTopWidth: 1, borderColor: sec.hr }} />
                <div className="w-full rounded-2xl overflow-hidden"
                  style={{ height: "clamp(200px, 30vw, 420px)" }}>
                  <img
                    src={getPostImage(post, idx + 1, 1200, 600)}
                    alt={sec.label}
                    className="w-full h-full object-cover"
                    style={{ filter: "brightness(0.85) contrast(1.05)" }}
                  />
                </div>
              </>
            )}

            {/* closing pull-quote on last section */}
            {idx === sections.length - 1 && (
              <>
                <hr className="border-none border-t my-0" style={{ borderTopWidth: 1, borderColor: sec.hr }} />
                <p className="mt-auto ml-auto max-w-[50ch] text-right font-light leading-relaxed"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", color: "rgba(255,255,255,0.5)" }}>
                  "The best time to start was yesterday. The second best time is now."
                </p>
              </>
            )}
          </FlowSection>
        ))}
      </FlowArt>

      {/* ══════════════════════════════════════════════════════════════════════
          COMMENTS + REVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: BG_DARK }}>
        <CommentsSection post={post} user={user} toast={toast} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER NAV
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="border-t px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#080806" }}>
        <Link to="/blog"
          className="flex items-center gap-2 text-sm font-bold transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={e => e.currentTarget.style.color = ACCENT}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
          ← Back to Blog
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-black text-xs"
            style={{ background: ACCENT }}>B</div>
          <span className="text-white font-black text-lg tracking-tight">BlogPro</span>
        </div>
        <Link to="/"
          className="flex items-center gap-2 text-sm font-bold transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={e => e.currentTarget.style.color = ACCENT}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
          Home →
        </Link>
      </div>

    </div>
  );
}
