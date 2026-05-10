import { createContext, useContext, useState } from "react";

const PostContext = createContext();

// ── slug helper ──────────────────────────────────────────────────────────────
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // strip special chars
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse multiple hyphens
    .slice(0, 80);                   // max length
}

// ensure slug is unique among existing posts
function uniqueSlug(base, existingPosts) {
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-loop-func
  while (existingPosts.some((p) => p.slug === slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      slug: "first-blog-post",
      title: "First Blog Post",
      content: "This is the content of your first blog post. Share your thoughts here.",
      author: "alice",
      views: 142,
      likes: 18,
      comments: [
        { id: 1, user: "bob", text: "Great post! Really enjoyed reading this.", date: "2026-04-28" },
        { id: 2, user: "carol", text: "Very insightful, thanks for sharing!", date: "2026-04-29" },
      ],
      date: "2026-04-27",
    },
    {
      id: 2,
      slug: "getting-started-with-react",
      title: "Getting Started with React",
      content: "React is a powerful library for building user interfaces.",
      author: "alice",
      views: 89,
      likes: 11,
      comments: [
        { id: 1, user: "dave", text: "This helped me a lot, thank you!", date: "2026-05-01" },
      ],
      date: "2026-04-30",
    },
    {
      id: 3,
      slug: "tailwind-css-tips",
      title: "Tailwind CSS Tips",
      content: "Tailwind makes styling fast and consistent.",
      author: "bob",
      views: 55,
      likes: 7,
      comments: [],
      date: "2026-05-02",
    },
  ]);

  const addPost = (post, author) => {
    const base = slugify(post.title);
    const slug = uniqueSlug(base, posts);
    setPosts((prev) => [
      ...prev,
      {
        ...post,
        id: Date.now(),
        slug,
        author: author || "anonymous",
        views: 0,
        likes: 0,
        comments: [],
        date: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const deletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePost = (id, updates) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        // re-slug if title changed
        const newSlug =
          updates.title && updates.title !== p.title
            ? uniqueSlug(slugify(updates.title), prev.filter((x) => x.id !== id))
            : p.slug;
        return { ...p, ...updates, slug: newSlug };
      })
    );
  };

  const addComment = (postId, comment) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: Date.now(), ...comment, date: new Date().toISOString().split("T")[0] },
              ],
            }
          : p
      )
    );
  };

  const reviewPost = (postId, vote, reviewer) => {
    // vote: "helpful" | "notHelpful"
    // reviewer: username string — prevents the same user voting twice
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const reviews = p.reviews || [];
        // block duplicate votes from same reviewer
        if (reviews.some((r) => r.reviewer === reviewer)) return p;
        return {
          ...p,
          [vote]: (p[vote] || 0) + 1,
          reviews: [...reviews, { reviewer, vote, date: new Date().toISOString().split("T")[0] }],
        };
      })
    );
  };

  return (
    <PostContext.Provider value={{ posts, addPost, deletePost, updatePost, addComment, reviewPost }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePosts = () => useContext(PostContext);