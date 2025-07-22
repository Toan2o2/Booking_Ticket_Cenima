// Giả lập dữ liệu comment và vote
let comments = [
  {
    id: 1,
    movieId: 1,
    user: "Nguyễn Văn A",
    content: "Phim rất hay!",
    rating: 5,
    createdAt: "2024-06-10 10:00",
  },
  {
    id: 2,
    movieId: 1,
    user: "Trần Thị B",
    content: "Kịch bản hấp dẫn, diễn viên xuất sắc.",
    rating: 4,
    createdAt: "2024-06-10 12:00",
  },
];

export function getCommentsByMovie(movieId) {
  return comments.filter(c => c.movieId === movieId);
}

export function addComment({ movieId, user, content, rating }) {
  const newComment = {
    id: Date.now(),
    movieId,
    user,
    content,
    rating,
    createdAt: new Date().toLocaleString(),
  };
  comments = [newComment, ...comments];
  return newComment;
}

export function getAverageRating(movieId) {
  const movieComments = comments.filter(c => c.movieId === movieId);
  if (movieComments.length === 0) return 0;
  return (
    movieComments.reduce((sum, c) => sum + c.rating, 0) / movieComments.length
  );
}

export default {
  getCommentsByMovie,
  addComment,
  getAverageRating
}; 