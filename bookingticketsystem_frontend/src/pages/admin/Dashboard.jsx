import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, message } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  BankOutlined,
  HomeOutlined,
  OrderedListOutlined,
  CreditCardOutlined,
  MessageOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  userService,
  movieService,
  showService,
  cinemaService,
  cinemaHallService,
  bookingService,
  paymentService,
  commentService,
  voteService,
} from "../../services";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    movies: 0,
    shows: 0,
    cinemas: 0,
    cinemaHalls: 0,
    bookings: 0,
    payments: 0,
    comments: 0,
    votes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [
        usersResponse,
        moviesResponse,
        showsResponse,
        cinemasResponse,
        cinemaHallsResponse,
        bookingsResponse,
        paymentsResponse,
        commentsResponse,
        votesResponse,
      ] = await Promise.allSettled([
        userService.getAllUsers(),
        movieService.getAllMovies(),
        showService.getAllShows(),
        cinemaService.getAllCinemas(),
        cinemaHallService.getAllCinemaHalls(),
        bookingService.getAllBookings(),
        paymentService.getAllPayments(),
        commentService.getAllComments(),
        voteService.getAllVotes(),
      ]);

      setStats({
        users: usersResponse.status === 'fulfilled' ? (usersResponse.value.data?.length || 0) : 0,
        movies: moviesResponse.status === 'fulfilled' ? (moviesResponse.value.data?.length || 0) : 0,
        shows: showsResponse.status === 'fulfilled' ? (showsResponse.value.data?.length || 0) : 0,
        cinemas: cinemasResponse.status === 'fulfilled' ? (cinemasResponse.value.data?.length || 0) : 0,
        cinemaHalls: cinemaHallsResponse.status === 'fulfilled' ? (cinemaHallsResponse.value.data?.length || 0) : 0,
        bookings: bookingsResponse.status === 'fulfilled' ? (bookingsResponse.value.data?.length || 0) : 0,
        payments: paymentsResponse.status === 'fulfilled' ? (paymentsResponse.value.data?.length || 0) : 0,
        comments: commentsResponse.status === 'fulfilled' ? (commentsResponse.value.data?.length || 0) : 0,
        votes: votesResponse.status === 'fulfilled' ? (votesResponse.value.data?.length || 0) : 0,
      });
    } catch (error) {
      message.error("Lỗi khi tải thống kê dashboard");
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thống kê...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2>Admin Dashboard</h2>
        <p>Tổng quan hệ thống quản lý rạp chiếu phim</p>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng người dùng" 
              value={stats.users} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng phim" 
              value={stats.movies} 
              prefix={<VideoCameraOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng suất chiếu" 
              value={stats.shows} 
              prefix={<CalendarOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng rạp chiếu" 
              value={stats.cinemas} 
              prefix={<BankOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng phòng chiếu" 
              value={stats.cinemaHalls} 
              prefix={<HomeOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng đặt vé" 
              value={stats.bookings} 
              prefix={<OrderedListOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng thanh toán" 
              value={stats.payments} 
              prefix={<CreditCardOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng bình luận" 
              value={stats.comments} 
              prefix={<MessageOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="Tổng đánh giá" 
              value={stats.votes} 
              prefix={<StarOutlined />} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 