import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Input, Select, Typography, Spin, Carousel, Tag, Button, Rate, Divider, Empty, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { movieService, genreService, movieFavoriteService } from "../../services";
import Footer from "../../components/Footer";
import MovieCard from "../../components/MovieCard";
import { useAuth } from "../../hooks/useAuth";
import Toast from "../../components/Toast";

const { Option } = Select;
const { Title } = Typography;

function getToday() {
  return new Date().toISOString().split("T")[0];
}

const Home = () => {
  document.title = "Phim hay mỗi ngày";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]); // Đổi thành mảng
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingFavoriteId, setLoadingFavoriteId] = useState(null);

  // Thêm state cho phân trang từng mục
  const [topPage, setTopPage] = useState(1);
  const [nowPage, setNowPage] = useState(1);
  const [soonPage, setSoonPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {

    async function fetchData() {
      setLoading(true);
      try {
        
       
        
        const [movieList, genreList, topList] = await Promise.all([
          movieService.getAll(),
          genreService.getAll(),
          movieFavoriteService.getTopMovies(8)
        ]);
        setMovies(movieList);
        setGenres(genreList);
        setTopMovies(topList);
        
        // Lấy danh sách phim yêu thích nếu đã đăng nhập
        if (user) {
         
          const favs = await movieFavoriteService.getFavoritesByUser();
          setFavoriteIds(favs.map(f => f.movieId));
        } else {
         
          setFavoriteIds([]);
        }
      } catch (error) {
        Toast.error('Không thể tải dữ liệu: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Phân loại phim đang chiếu/sắp chiếu
  const today = getToday();
  const nowShowing = useMemo(() => movies.filter(m => m.releaseDate && m.releaseDate <= today), [movies, today]);
  const comingSoon = useMemo(() => movies.filter(m => m.releaseDate && m.releaseDate > today), [movies, today]);

  // Lọc phim theo tìm kiếm và thể loại
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchTitle = movie.title.toLowerCase().includes(search.toLowerCase());
      const movieGenres = movie.Genres || movie.genres || [];
      const matchGenre = selectedGenres.length === 0 || movieGenres.some(g => selectedGenres.includes(String(g.genreId)) || selectedGenres.includes(Number(g.genreId)));
      return matchTitle && matchGenre;
    });
  }, [movies, search, selectedGenres]);

  // Banner: lấy 4 phim nổi bật (top yêu thích hoặc random)
  const bannerMovies = topMovies.length > 0 ? topMovies.slice(0, 4) : movies.slice(0, 4);

  // Xử lý toggle yêu thích
  const handleToggleFavorite = async (movie) => {
    if (!user) {
      Toast.warning('Vui lòng đăng nhập để yêu thích phim!');
      navigate('/login');
      return;
    }
    
    setLoadingFavoriteId(movie.movieId);
    try {
      if (favoriteIds.includes(movie.movieId)) {
        await movieFavoriteService.removeFavorite(movie.movieId);
        setFavoriteIds(favoriteIds.filter(id => id !== movie.movieId));
        Toast.success('Đã xóa phim khỏi danh sách yêu thích');
      } else {
        await movieFavoriteService.addFavorite(movie.movieId);
        setFavoriteIds([...favoriteIds, movie.movieId]);
        Toast.success('Đã thêm phim vào danh sách yêu thích');
      }
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoadingFavoriteId(null);
    }
  };

  // Xử lý đặt vé
  const handleBook = (movie) => {
    if (!user) {
      Toast.warning('Vui lòng đăng nhập để đặt vé!');
      navigate('/login');
      return;
    }
    navigate(`/booking?movieId=${movie.movieId}`);
  };

  // Xử lý xem chi tiết phim
  const handleViewMovie = (movie) => {
    navigate(`/movies/${movie.movieId}`);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Banner/Slider */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
        <Carousel autoplay dots>
          {bannerMovies.map((movie, idx) => (
            <div key={movie.movieId || idx} style={{ position: 'relative', height: 360, cursor: 'pointer' }} onClick={() => handleViewMovie(movie)}>
              <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 12 }} />
              <div style={{ position: 'absolute', left: 40, bottom: 40, color: '#fff', textShadow: '0 2px 8px #000', maxWidth: 600 }}>
                <Title level={2} style={{ color: '#fff', marginBottom: 0 }}>{movie.title}</Title>
                <div style={{ fontSize: 16 }}>{movie.description?.slice(0, 120)}...</div>
                <div style={{ marginTop: 8 }}>
                  {movie.Genres?.map(g => <Tag key={g.genreId}>{g.name}</Tag>)}
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
                    <Rate allowHalf disabled value={movie.rating} count={5} style={{ marginRight: 8 }} />
                    <span style={{ fontSize: 16, fontWeight: 'bold', color: '#FFD700' }}>
                      {movie.rating > 0 ? `${movie.rating.toFixed(1)}/5` : 'Chưa có đánh giá'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        {/* Top phim yêu thích */}
        <Title level={3} style={{ marginTop: 24 }}>Top phim được yêu thích</Title>
        <div className="movie-list-grid-5">
          {topMovies.length === 0 ? <div style={{gridColumn: 'span 5'}}><Empty description="Không có dữ liệu" /></div> : topMovies.slice((topPage-1)*PAGE_SIZE, topPage*PAGE_SIZE).map(movie => (
            <MovieCard 
              key={movie.movieId}
              movie={movie} 
              isFavorite={favoriteIds.includes(movie.movieId)} 
              loadingFavorite={loadingFavoriteId === movie.movieId} 
              onToggleFavorite={handleToggleFavorite} 
              onBook={handleBook} 
              onViewDetail={handleViewMovie}
            />
          ))}
        </div>
        {topMovies.length > PAGE_SIZE && (
          <div style={{textAlign:'center', marginTop:12}}>
            <Pagination
              current={topPage}
              pageSize={PAGE_SIZE}
              total={topMovies.length}
              onChange={setTopPage}
              showSizeChanger={false}
            />
          </div>
        )}

        {/* Phim đang chiếu */}
        <Divider orientation="left" style={{ marginTop: 40 }}>Phim đang chiếu</Divider>
        <div className="movie-list-grid-5">
          {nowShowing.length === 0 ? <div style={{gridColumn: 'span 5'}}><Empty description="Không có phim đang chiếu" /></div> : nowShowing.slice((nowPage-1)*PAGE_SIZE, nowPage*PAGE_SIZE).map(movie => (
            <MovieCard 
              key={movie.movieId}
              movie={movie} 
              isFavorite={favoriteIds.includes(movie.movieId)} 
              loadingFavorite={loadingFavoriteId === movie.movieId} 
              onToggleFavorite={handleToggleFavorite} 
              onBook={handleBook} 
              onViewDetail={handleViewMovie}
            />
          ))}
        </div>
        {nowShowing.length > PAGE_SIZE && (
          <div style={{textAlign:'center', marginTop:12}}>
            <Pagination
              current={nowPage}
              pageSize={PAGE_SIZE}
              total={nowShowing.length}
              onChange={setNowPage}
              showSizeChanger={false}
            />
          </div>
        )}

        {/* Phim sắp chiếu */}
        <Divider orientation="left" style={{ marginTop: 40 }}>Phim sắp chiếu</Divider>
        <div className="movie-list-grid-5">
          {comingSoon.length === 0 ? <div style={{gridColumn: 'span 5'}}><Empty description="Không có phim sắp chiếu" /></div> : comingSoon.slice((soonPage-1)*PAGE_SIZE, soonPage*PAGE_SIZE).map(movie => (
            <MovieCard 
              key={movie.movieId}
              movie={movie} 
              isFavorite={favoriteIds.includes(movie.movieId)} 
              loadingFavorite={loadingFavoriteId === movie.movieId} 
              onToggleFavorite={handleToggleFavorite} 
              onBook={handleBook} 
              onViewDetail={handleViewMovie}
            />
          ))}
        </div>
        {comingSoon.length > PAGE_SIZE && (
          <div style={{textAlign:'center', marginTop:12}}>
            <Pagination
              current={soonPage}
              pageSize={PAGE_SIZE}
              total={comingSoon.length}
              onChange={setSoonPage}
              showSizeChanger={false}
            />
          </div>
        )}

        {/* Tìm kiếm & filter thể loại */}
        <Divider orientation="left" style={{ marginTop: 40 }}>Tất cả phim</Divider>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Tìm kiếm phim..."
              allowClear
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              mode="multiple"
              value={selectedGenres}
              onChange={setSelectedGenres}
              style={{ width: "100%" }}
              allowClear
              placeholder="Chọn thể loại"
            >
              {genres.map(g => <Option key={g.genreId} value={String(g.genreId)}>{g.name}</Option>)}
            </Select>
          </Col>
        </Row>
        <div className="movie-list-grid-5">
          {loading ? <div style={{gridColumn: 'span 5', textAlign: 'center'}}><Spin size="large" /></div> :
            filteredMovies.length === 0 ? <div style={{gridColumn: 'span 5'}}><Empty description="Không tìm thấy phim phù hợp." /></div> :
              filteredMovies.slice((allPage-1)*PAGE_SIZE, allPage*PAGE_SIZE).map((movie) => (
                <MovieCard 
                  key={movie.movieId}
                  movie={movie} 
                  isFavorite={favoriteIds.includes(movie.movieId)} 
                  loadingFavorite={loadingFavoriteId === movie.movieId} 
                  onToggleFavorite={handleToggleFavorite} 
                  onBook={handleBook} 
                  onViewDetail={handleViewMovie}
                />
              ))}
        </div>
        {filteredMovies.length > PAGE_SIZE && (
          <div style={{textAlign:'center', marginTop:12}}>
            <Pagination
              current={allPage}
              pageSize={PAGE_SIZE}
              total={filteredMovies.length}
              onChange={setAllPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 