import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function PostDetails() {
  const { id }                                        = useParams();
  const { posts, deletePost, addComment, reviewPost } = usePosts();
  const { user }                                      = useAuth();
  const { toast }                                     = useToast();
  const navigate                                      = useNavigate();

  const [comment,  setComment]  = useState("");
  const [voted,    setVoted]    = useState(null); // "helpful" | "notHelpful" | null

  const post = posts.find((p) => p.id === Number(id) || p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">📭</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-500 mb-6">This post may have been deleted or doesn't exist.</p>
          <Link to="/blog" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
            Back to Blog
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

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment(post.id, {
      user: user?.username || user?.name || "Anonymous",
      text: comment.trim(),
    });
    setComment("");
    toast("Comment posted!", "success");
  };

  const handleVote = (vote) => {
    if (voted) return;
    reviewPost(post.id, vote);
    setVoted(vote);
    toast(
      vote === "helpful" ? "Thanks for your feedback! 👍" : "Thanks — we'll keep improving!",
      "success"
    );
  };

  const isOwner = user && (user.username === post.author || user.name === post.author);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── cover image / gradient ── */}
      <div className="w-full h-72 md:h-96 overflow-hidden relative">
        {post.images?.length > 0 ? (
          <img src={post.images[0].url} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* ── article ── */}
      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-10 pb-20">

        {/* card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            {/* back link */}
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-5">
              {post.title}
            </h1>

            {/* meta row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {post.author[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{post.author}</p>
                  <p className="text-xs text-gray-400">{post.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">👁 {post.views ?? 0} views</span>
                <span className="flex items-center gap-1">❤️ {post.likes ?? 0} likes</span>
                <span className="flex items-center gap-1">💬 {post.comments?.length ?? 0} comments</span>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="px-8 py-8">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* extra images */}
            {post.images?.length > 1 && (
              <div className="grid grid-cols-2 gap-3 mt-8">
                {post.images.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={img.name}
                    className="w-full h-48 object-cover rounded-xl border border-gray-100"
                  />
                ))}
              </div>
            )}
          </div>

          {/* owner actions */}
          {isOwner && (
            <div className="px-8 pb-6 flex gap-3">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-lg transition"
              >
                ✏️ Edit in Dashboard
              </Link>
              <button
                onClick={handleDelete}
                className="text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition"
              >
                🗑️ Delete Post
              </button>
            </div>
          )}
        </div>

        {/* ── was this helpful ── */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 px-8 py-7 text-center">
          {voted ? (
            <div className="space-y-1">
              <p className="text-2xl">{voted === "helpful" ? "👍" : "👎"}</p>
              <p className="text-sm font-semibold text-gray-800">
                {voted === "helpful" ? "Glad it helped!" : "Thanks for the feedback!"}
              </p>
              <p className="text-xs text-gray-400">Your review has been recorded.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800 mb-1">Was this article helpful?</p>
              <p className="text-xs text-gray-400 mb-5">Let the author know what you think.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleVote("helpful")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 text-sm font-medium text-gray-700 hover:text-green-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Yes, helpful
                  {post.helpful > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {post.helpful}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleVote("notHelpful")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 text-sm font-medium text-gray-700 hover:text-red-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  Not really
                  {post.notHelpful > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {post.notHelpful}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── comments ── */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Comments <span className="text-gray-400 font-normal text-base">({post.comments?.length ?? 0})</span>
          </h2>

          {/* comment form */}
          {user ? (
            <form onSubmit={handleComment} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                  {(user.username || user.name || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts…"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!comment.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
                    >
                      Post comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 text-center">
              <p className="text-sm text-gray-500">
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">Sign in</Link>
                {" "}to leave a comment.
              </p>
            </div>
          )}

          {/* comment list */}
          {post.comments?.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No comments yet. Be the first to share your thoughts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...post.comments].reverse().map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                    {c.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{c.user}</span>
                      <span className="text-xs text-gray-400">{c.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
