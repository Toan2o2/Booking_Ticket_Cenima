import React, { useState, useEffect } from "react";
import { Row, Col, Typography, Button, Card, Tag, Rate, List, Input, message, Avatar, Breadcrumb, Pagination } from "antd";
import { UserOutlined, HeartOutlined, HeartFilled, HomeOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { movieFavoriteService, movieService, commentService, voteService, showService } from "../../services";
import Toast from "../../components/Toast";
import './ShowtimesGrid.css';
import MovieCard from '../../components/MovieCard';

const { Title, Paragraph } = Typography;

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const movieId = Number(id);

  // State cho phim
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // State cho comment và rating
  const [comments, setComments] = useState([]);
  const [votes, setVotes] = useState([]);
  const [voteStats, setVoteStats] = useState(null);
  const [commentValue, setCommentValue] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [commentLoading, setCommentLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPageSize] = useState(10);

  // State cho lịch chiếu
  const [shows, setShows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(false);

  // State cho phim liên quan
  const [allMovies, setAllMovies] = useState([]);
  const [sameDatePage, setSameDatePage] = useState(1);
  const [sameGenrePage, setSameGenrePage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (movieId) {
      loadMovieData();
      loadAllMovies();
    }
  }, [movieId]);

  useEffect(() => {
    if (user && movieId) {
      checkFavoriteStatus();
      loadUserVote();
    }
  }, [user, movieId]);

  const loadUserVote = async () => {
    if (!user || !movieId) return;

    try {
      const userVote = await voteService.getByUserAndMovie(user.userId, movieId);
      if (userVote) {
        setRatingValue(userVote.ratingValue);
      }
    } catch (error) {
      console.error('Không thể tải đánh giá của user:', error);
    }
  };

  const loadMovieData = async () => {
    setLoading(true);
    try {


      const [movieData, showsData, votesData, voteStatsData, commentsData, commentCount] = await Promise.all([
        movieService.getById(movieId),
        showService.getByMovie(movieId),
        voteService.getByMovie(movieId),
        voteService.getMovieStats(movieId),
        commentService.getByMovie(movieId, {
          page: 1,
          pageSize: 10,
          approvedOnly: !user // Chỉ hiển thị comments đã duyệt cho guest, hiển thị tất cả cho user đã đăng nhập
        }),
        commentService.getCountByMovie(movieId)
      ]);



      setMovie(movieData);
      setShows(showsData);
      setVotes(votesData);
      setVoteStats(voteStatsData);
      setComments(commentsData);
      setCommentTotal(commentCount);
    } catch (error) {
      console.error('Error loading movie data:', error);
      Toast.error('Không thể tải thông tin phim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMovies = async () => {
    try {
      const movies = await movieService.getAll();
      setAllMovies(movies);
    } catch { }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !movieId) return;

    try {
      const status = await movieFavoriteService.checkFavorite(movieId);
      setIsFavorite(status);
    } catch (error) {
      console.error('Không thể kiểm tra trạng thái yêu thích:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để yêu thích phim!');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await movieFavoriteService.removeFavorite(movieId);
        setIsFavorite(false);
        Toast.success('Đã xóa phim khỏi danh sách yêu thích');
      } else {
        await movieFavoriteService.addFavorite(movieId);
        setIsFavorite(true);
        Toast.success('Đã thêm phim vào danh sách yêu thích');
      }
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để bình luận!');
      return;
    }

    if (!commentValue.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận!");
      return;
    }

    setCommentLoading(true);
    try {


      const commentData = {
        movieId: movieId,
        userId: user.userId,
        commentText: commentValue
      };


      await commentService.create(commentData);

      // Reload comments
      const [newComments, newCount] = await Promise.all([
        commentService.getByMovie(movieId, {
          page: 1,
          pageSize: commentPageSize,
          approvedOnly: !user // Chỉ hiển thị comments đã duyệt cho guest, hiển thị tất cả cho user đã đăng nhập
        }),
        commentService.getCountByMovie(movieId)
      ]);
      setComments(newComments);
      setCommentTotal(newCount);
      setCommentPage(1);
      setCommentValue("");
      Toast.success("Gửi bình luận thành công!");
    } catch (error) {
      console.error('Comment error details:', error);
      console.error('Error response:', error.response);
      Toast.error('Không thể gửi bình luận: ' + error.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để đánh giá!');
      return;
    }

    setVoteLoading(true);
    try {


      const voteData = {
        movieId: movieId,
        userId: user.userId,
        ratingValue: ratingValue
      };



      await voteService.createOrUpdate(voteData);

      // Reload votes and stats
      const [newVotes, newStats] = await Promise.all([
        voteService.getByMovie(movieId),
        voteService.getMovieStats(movieId)
      ]);
      setVotes(newVotes);
      setVoteStats(newStats);
      Toast.success("Đánh giá thành công!");
    } catch (error) {
      console.error('Vote error details:', error);
      console.error('Error response:', error.response);
      Toast.error('Không thể đánh giá: ' + error.message);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleBookShow = (show) => {
    if (!user) {
      Toast.warning('Vui lòng đăng nhập để đặt vé!');
      navigate('/login');
      return;
    }
    navigate(`/booking?movieId=${movieId}&showtimeId=${show.showId}`);
  };

  const handleSeedSampleData = async () => {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      Toast.error('Bạn không có quyền tạo dữ liệu mẫu.');
      return;
    }

    try {
      await showService.seedSampleData(movieId);
      Toast.success('Đã tạo dữ liệu mẫu cho lịch chiếu phim.');
      // Reload shows to reflect new data
      const newShows = await showService.getByMovie(movieId);
      setShows(newShows);
    } catch (error) {
      Toast.error('Có lỗi khi tạo dữ liệu mẫu: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Chi tiết phim</Breadcrumb.Item>
        </Breadcrumb>

        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div>Đang tải thông tin phim...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Chi tiết phim</Breadcrumb.Item>
        </Breadcrumb>

        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div>Không tìm thấy phim</div>
          </div>
        </Card>
      </div>
    );
  }

  const avgRating = voteStats?.averageRating || 0;

  // Tìm phim cùng ngày phát hành (trừ chính nó)
  const sameDateMovies = movie && allMovies.length > 0 ?
    allMovies.filter(m => m.movieId !== movie.movieId && m.releaseDate === movie.releaseDate) : [];
  // Tìm phim cùng thể loại (trừ chính nó)
  const sameGenreMovies = movie && allMovies.length > 0 ?
    allMovies.filter(m => m.movieId !== movie.movieId && m.Genres && movie.Genres && m.Genres.some(g => movie.Genres.some(g2 => g2.genreId === g.genreId))) : [];

  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px" }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Trang chủ
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{movie.title}</Breadcrumb.Item>
      </Breadcrumb>
      <Row gutter={[32, 24]}>
        <Col xs={24} md={8}>
          <img
            src={movie.posterUrl}
            alt={movie.title}
            style={{ width: "100%", borderRadius: 8, boxShadow: "0 2px 8px #ccc" }}
          />
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Rate allowHalf disabled value={avgRating} style={{ fontSize: 24 }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4, color: avgRating > 0 ? '#faad14' : '#888' }}>
              {avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : "Chưa có đánh giá"}
            </div>
            {voteStats && (
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                {voteStats.totalVotes} lượt đánh giá
              </div>
            )}

            {/* Nút yêu thích */}
            <Button
              type={isFavorite ? "primary" : "default"}
              icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
              loading={favoriteLoading}
              onClick={handleToggleFavorite}
              style={{
                marginTop: 16,
                backgroundColor: isFavorite ? '#ff4d4f' : undefined,
                borderColor: isFavorite ? '#ff4d4f' : undefined
              }}
            >
              {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
            </Button>
          </div>

        </Col>
        <Col xs={24} md={16}>
          <div style={{ width: '100%' }}>
            <Title level={2}>{movie.title}</Title>
            <Paragraph>{movie.description}</Paragraph>
            {/* Thông tin phim */}
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{movie.duration} phút</Tag>
              <Tag color="green">{movie.language}</Tag>
              {movie.releaseDate && (
                <Tag color="orange">Ngày phát hành: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</Tag>
              )}
              {movie.Genres && movie.Genres.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {movie.Genres.map(genre => (
                    <Tag key={genre.genreId} color="purple">{genre.name}</Tag>
                  ))}
                </div>
              )}
            </div>

            {/* Diễn viên và đạo diễn */}
            {movie.Actors && movie.Actors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>Diễn viên</Title>
                <div>
                  {movie.Actors.map(actor => (
                    <Tag key={actor.personId} color="cyan">{actor.name}</Tag>
                  ))}
                </div>
              </div>
            )}

            {movie.Directors && movie.Directors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>Đạo diễn</Title>
                <div>
                  {movie.Directors.map(director => (
                    <Tag key={director.personId} color="magenta">{director.name}</Tag>
                  ))}
                </div>
              </div>
            )}

            {movie.trailerUrl && (
              <div style={{ margin: "16px 0" }}>
                <Title level={4}>Trailer</Title>
                <iframe
                  width="100%"
                  height="250"
                  src={movie.trailerUrl}
                  title="Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: 8 }}
                ></iframe>
              </div>
            )}
          </div>
        </Col>
      </Row>
      {/* Lịch chiếu */}
      <div style={{ marginBottom: 24, width: '100%' }}>
        <Title level={4}>Lịch chiếu</Title>
        {shows.length > 0 ? (
          <>
            <ShowtimesPaginated shows={shows} movieId={movieId} navigate={navigate} />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Chưa có lịch chiếu cho phim này
          </div>
        )}
      </div>


      {/* Vote & Comment */}
      <div style={{ marginTop: 32, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 700 }}>
          <Title level={4}>Đánh giá & Bình luận</Title>
          {/* Thống kê đánh giá */}
          {voteStats && (
            <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                    {voteStats.averageRating ? voteStats.averageRating.toFixed(1) : '0.0'}
                  </div>
                  <Rate allowHalf disabled value={voteStats.averageRating || 0} style={{ fontSize: 16 }} />
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {voteStats.totalVotes} lượt đánh giá
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {voteStats.starCounts && Object.entries(voteStats.starCounts).reverse().map(([star, count]) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ width: 60 }}>{star} sao</span>
                      <div style={{ flex: 1, height: 8, backgroundColor: '#e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            backgroundColor: '#faad14',
                            width: `${voteStats.totalVotes > 0 ? (count / voteStats.totalVotes) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span style={{ width: 40, fontSize: 12 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form đánh giá và bình luận */}
          {user ? (
            <div style={{ marginBottom: 24, padding: 16, border: '1px solid #d9d9d9', borderRadius: 8, width: '100%' }}>
              <Title level={5}>Đánh giá của bạn</Title>
              {/* Đánh giá sao */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span>Đánh giá:</span>
                  <Rate value={ratingValue} onChange={setRatingValue} />
                  <span style={{ color: '#666' }}>({ratingValue}/5)</span>
                </div>
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={handleVote}
                  loading={voteLoading}
                  disabled={ratingValue === 0}
                >
                  Gửi đánh giá
                </Button>
              </div>
              {/* Bình luận */}
              <div>
                <div style={{ marginBottom: 8 }}>
                  <span>Bình luận:</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Input.TextArea
                    value={commentValue}
                    onChange={e => setCommentValue(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về phim này..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    style={{ flex: 1 }}
                    maxLength={500}
                    showCount
                  />
                  <Button 
                    type="primary" 
                    onClick={handleComment}
                    loading={commentLoading}
                    disabled={!commentValue.trim()}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8, width: '100%' }}>
              <div style={{ color: '#d48806', marginBottom: 8 }}>
                <b>Đăng nhập để đánh giá và bình luận về phim này</b>
              </div>
              <Button type="primary" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </Button>
            </div>
          )}

          {/* Danh sách bình luận */}
          <div style={{ width: '100%' }}>
            <Title level={5}>Bình luận ({commentTotal})</Title>
            <List
              dataSource={comments}
              locale={{ emptyText: "Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận!" }}
              pagination={{
                current: commentPage,
                pageSize: commentPageSize,
                total: commentTotal,
                onChange: async (page) => {
                  setCommentPage(page);
                  try {
                    const newComments = await commentService.getByMovie(movieId, { 
                      page, 
                      pageSize: commentPageSize,
                      approvedOnly: !user // Chỉ hiển thị comments đã duyệt cho guest, hiển thị tất cả cho user đã đăng nhập
                    });
                    setComments(newComments);
                  } catch (error) {
                    Toast.error('Không thể tải bình luận: ' + error.message);
                  }
                },
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bình luận`
              }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />}
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><b>{item.userName || 'Người dùng'}</b></span>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>{item.commentText}</div>
                        {item.isApproved === false && (
                          <Tag color="orange">Đang chờ duyệt</Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

// Component con để phân trang lịch chiếu
function ShowtimesPaginated({ shows, movieId, navigate }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4;
  const pagedShows = shows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="showtimes-grid-2">
        {pagedShows.map(show => (
          <div className="showtime-card-mini" key={show.showId}>
            <div className="showtime-info">
              <div className="showtime-datetime">
                <span className="showtime-date">{new Date(show.startTime).toLocaleDateString('vi-VN')}</span>
                <span className="showtime-time">{new Date(show.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="showtime-hall">Phòng: <b>{show.hallName}</b></div>
              <div className="showtime-cinema">Rạp: <b>{show.cinemaName || '---'}</b></div>
              <div className="showtime-price">{show.ticketPrice.toLocaleString('vi-VN')} VNĐ</div>
            </div>
            <button className="showtime-book-btn" onClick={() => navigate(`/booking?movieId=${movieId}&showtimeId=${show.showId}`)}>
              Đặt vé
            </button>
          </div>
        ))}
      </div>
      {shows.length > PAGE_SIZE && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={shows.length}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </>
  );
}

export default MovieDetail; 