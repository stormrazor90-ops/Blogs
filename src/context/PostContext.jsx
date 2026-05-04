import { createContext, useContext, useState } from "react";

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
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
    setPosts([
      ...posts,
      {
        ...post,
        id: Date.now(),
        author: author || "anonymous",
        views: 0,
        likes: 0,
        comments: [],
        date: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const deletePost = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const updatePost = (id, updates) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addComment = (postId, comment) => {
    setPosts(
      posts.map((p) =>
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

  const reviewPost = (postId, vote) => {
    // vote: "helpful" | "notHelpful"
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? { ...p, [vote]: (p[vote] || 0) + 1 }
          : p
      )
    );
  };

  return (
    <PostContext.Provider value={{ posts, addPost, deletePost, updatePost, addComment, reviewPost }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePosts = () => useContext(PostContext);