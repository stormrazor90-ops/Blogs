import { Link } from "react-router-dom";

export default function PostCard({ post, onDelete }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      
      <h2 className="text-xl font-bold">
        <Link to={`/post/${post.id}`} className="text-blue-600">
          {post.title}
        </Link>
      </h2>

      <p className="text-gray-600">{post.content}</p>

      <button
        onClick={() => onDelete(post.id)}
        className="bg-red-500 text-white px-3 py-1 mt-2 rounded"
      >
        Delete
      </button>
    </div>
  );
}