import { Link } from "react-router-dom";

export default function PostCard({ post, onDelete }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 space-y-2">
      <h2 className="text-xl font-bold">
        <Link to={`/post/${post.slug}`} className="text-blue-600 hover:underline">
          {post.title}
        </Link>
      </h2>

      <p className="text-gray-600 line-clamp-2">{post.content}</p>

      {/* category */}
      {post.category && (
        <span className="inline-block text-xs font-semibold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
          {post.category}
        </span>
      )}

      {/* tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(post.id)}
          className="bg-red-500 text-white px-3 py-1 mt-1 rounded text-sm"
        >
          Delete
        </button>
      )}
    </div>
  );
}
