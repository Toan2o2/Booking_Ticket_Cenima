import React, { useState, useEffect } from "react";
import { List, Avatar, Button, Card, Typography, Spin, Empty, message, Breadcrumb } from "antd";
import { HeartOutlined, DeleteOutlined, EyeOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { movieFavoriteService, movieService } from "../../services";
import Toast from "../../components/Toast";

const { Title, Text } = Typography;

const FavoriteMovies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const favoriteData = await movieFavoriteService.getFavoritesByUser();
      
      // Lấy thông tin chi tiết của từng phim
      const moviePromises = favoriteData.map(fav => 
        movieService.getById(fav.movieId)
      );
      
      const movies = await Promise.all(moviePromises);
      setFavorites(movies.filter(movie => movie !== null));
    } catch (error) {
      Toast.error('Không thể tải danh sách phim yêu thích: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (movieId) => {
    if (!user) return;
    
    setRemovingId(movieId);
    try {
      await movieFavoriteService.removeFavorite(movieId);
      setFavorites(prev => prev.filter(movie => movie.movieId !== movieId));
      Toast.success('Đã xóa phim khỏi danh sách yêu thích');
    } catch (error) {
      Toast.error('Không thể xóa phim khỏi danh sách yêu thích: ' + error.message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewMovie = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 16px" }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Phim yêu thích</Breadcrumb.Item>
        </Breadcrumb>
        
        <Card>
          <Empty 
            description="Vui lòng đăng nhập để xem danh sách phim yêu thích"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 16px" }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Phim yêu thích</Breadcrumb.Item>
        </Breadcrumb>
        
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải danh sách phim yêu thích...</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 16px" }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Trang chủ
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Phim yêu thích</Breadcrumb.Item>
      </Breadcrumb>
      
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={3}>
            <HeartOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Danh sách phim yêu thích
          </Title>
          <Text type="secondary">
            {favorites.length} phim trong danh sách yêu thích
          </Text>
        </div>

        {favorites.length === 0 ? (
          <Empty 
            description="Bạn chưa có phim nào trong danh sách yêu thích"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/')}>
              Khám phá phim
            </Button>
          </Empty>
        ) : (
    <List
      itemLayout="horizontal"
      dataSource={favorites}
            renderItem={movie => (
        <List.Item
                actions={[
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewMovie(movie.movieId)}
                  >
                    Xem chi tiết
                  </Button>,
                  <Button 
                    danger 
                    size="small" 
                    icon={<DeleteOutlined />}
                    loading={removingId === movie.movieId}
                    onClick={() => handleRemoveFavorite(movie.movieId)}
                  >
                    Bỏ thích
                  </Button>
                ]}
        >
          <List.Item.Meta
                  avatar={
                    <Avatar 
                      shape="square" 
                      size={80} 
                      src={movie.posterUrl} 
                      style={{ objectFit: 'cover' }}
                    />
                  }
                  title={
                    <div>
                      <Text strong style={{ fontSize: 16 }}>{movie.title}</Text>
                      {movie.rating > 0 && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ⭐ {movie.rating.toFixed(1)}
                        </Text>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <Text type="secondary">
                          {movie.duration} phút • {movie.language}
                        </Text>
                      </div>
                      <div>
                        <Text ellipsis={{ tooltip: movie.description }}>
                          {movie.description}
                        </Text>
                      </div>
                      {movie.Genres && movie.Genres.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {movie.Genres.map(genre => (
                            <span 
                              key={genre.genreId}
                              style={{
                                background: '#f0f0f0',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                                marginRight: 4
                              }}
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  }
          />
        </List.Item>
      )}
    />
        )}
      </Card>
  </div>
);
};

export default FavoriteMovies; 