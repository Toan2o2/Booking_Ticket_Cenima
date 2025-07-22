import React from "react";
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import './MovieCardHoathinh.css';

const POSTER_HEIGHT = 280;
const CARD_WIDTH = 210;
const POSTER_PLACEHOLDER = '/default-poster.png';

export default function MovieCard({ movie, isFavorite, loadingFavorite, onToggleFavorite, onViewDetail }) {
  return (
    <div
      className="movie-card-hoathinh"
      style={{ width: CARD_WIDTH }}
      onClick={() => onViewDetail && onViewDetail(movie)}
    >
      <div className="movie-card-poster-wrap" style={{height: POSTER_HEIGHT}}>
        <img
          src={movie.posterUrl || POSTER_PLACEHOLDER}
          alt={movie.title}
          className="movie-card-poster"
          onError={e => { e.target.onerror = null; e.target.src = POSTER_PLACEHOLDER; }}
        />
        <button
          className="movie-card-fav-btn"
          onClick={e => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(movie); }}
          disabled={loadingFavorite}
        >
          {isFavorite ? <HeartFilled style={{ color: '#eb2f96', fontSize: 20 }} /> : <HeartOutlined style={{ color: '#888', fontSize: 20 }} />}
        </button>
        {/* Hiển thị rating số ở góc dưới phải poster */}
        {typeof movie.rating === 'number' && (
          <div className="movie-card-rating-number">
            {movie.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="movie-card-info">
        <div className="movie-card-title">{movie.title}</div>
        <div className="movie-card-desc">{movie.description?.slice(0, 48) || ''}</div>
      </div>
    </div>
  );
} 