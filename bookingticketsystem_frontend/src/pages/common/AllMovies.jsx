import React, { useEffect, useState } from "react";
import { Row, Col, Input, Select, Pagination, Spin, Empty, Typography, message } from "antd";
import { movieService, movieFavoriteService } from "../../services";
import genreService from "../../services/genreService";
import MovieCard from "../../components/MovieCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const { Title } = Typography;
const { Option } = Select;

const PAGE_SIZE = 10;

const AllMovies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]); // Đổi thành mảng
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingFavorite, setLoadingFavorite] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadGenres();
    loadMovies(1, search, selectedGenres);
    if (user) loadFavorites();
    // eslint-disable-next-line
  }, [user]);

  const loadGenres = async () => {
    try {
      const data = await genreService.getAll();
      setGenres(data);
    } catch {}
  };

  const loadMovies = async (pageNum = 1, searchText = "", genreIds = []) => {
    setLoading(true);
    try {
      let all = await movieService.getAll();
      if (searchText) {
        all = all.filter(m => m.title.toLowerCase().includes(searchText.toLowerCase()));
      }
      if (genreIds && genreIds.length > 0) {
        all = all.filter(m => {
          const movieGenres = m.genres || m.Genres || [];
          return movieGenres.some(g => genreIds.includes(String(g.genreId)) || genreIds.includes(Number(g.genreId)));
        });
      }
      setTotal(all.length);
      setMovies(all.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE));
      setPage(pageNum);
    } catch {
      setMovies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await movieFavoriteService.getFavoritesByUser();
      setFavoriteIds(favs.map(f => f.movieId));
    } catch {
      setFavoriteIds([]);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadMovies(1, e.target.value, selectedGenres);
  };

  const handleGenre = (values) => {
    setSelectedGenres(values);
    loadMovies(1, search, values);
  };

  const handlePage = (p) => {
    loadMovies(p, search, selectedGenres);
  };

  const handleViewDetail = (movie) => {
    navigate(`/movies/${movie.movieId}`);
  };

  const handleToggleFavorite = async (movie) => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để sử dụng chức năng yêu thích!");
      return;
    }
    setLoadingFavorite(movie.movieId);
    try {
      if (favoriteIds.includes(movie.movieId)) {
        await movieFavoriteService.removeFavorite(movie.movieId);
        setFavoriteIds(favoriteIds.filter(id => id !== movie.movieId));
        message.success("Đã bỏ khỏi yêu thích");
      } else {
        await movieFavoriteService.addFavorite(movie.movieId);
        setFavoriteIds([...favoriteIds, movie.movieId]);
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Không thể cập nhật yêu thích: " + error.message);
    } finally {
      setLoadingFavorite(null);
    }
  };

  const handleBook = (movie) => {
    navigate(`/booking?movieId=${movie.movieId}`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "32px auto", padding: 16 }}>
      <Title level={2} style={{ marginBottom: 24 }}>Tất cả phim</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input.Search
            placeholder="Tìm kiếm phim..."
            value={search}
            onChange={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            mode="multiple"
            placeholder="Chọn thể loại"
            value={selectedGenres}
            onChange={handleGenre}
            allowClear
            style={{ width: '100%' }}
          >
            {genres.map(g => (
              <Option key={g.genreId} value={String(g.genreId)}>{g.name}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
      ) : movies.length === 0 ? (
        <Empty description="Không có phim nào" />
      ) : (
        <>
          <div className="movie-list-grid-5">
            {movies.map(movie => (
              <MovieCard
                key={movie.movieId}
                movie={movie}
                isFavorite={favoriteIds.includes(movie.movieId)}
                loadingFavorite={loadingFavorite === movie.movieId}
                onToggleFavorite={handleToggleFavorite}
                onViewDetail={handleViewDetail}
                onBook={handleBook}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={handlePage}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AllMovies; 