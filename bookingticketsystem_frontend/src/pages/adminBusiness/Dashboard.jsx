import React, { useState, useEffect, use } from "react";
import numeral from "numeral";
import { Card, Row, Col, Statistic, Spin, message } from "antd";
import {
    UserOutlined,
    VideoCameraOutlined,
    CalendarOutlined,
    BankOutlined,
    HomeOutlined,
    OrderedListOutlined,
    CreditCardOutlined,
    DashboardOutlined,
} from "@ant-design/icons";
import {
    revenueService
} from "../../services";
import "../../styles/flip_card.css";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMovies: 0,
        totalShows: 0,
        totalCinemas: 0,
        totalBookings: 0,
        totalCancels: 0,
        bookingsToday: 0,
        bookingsMonth: 0,
        totalRevenue: 0,
        utilizationRate: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const [
                revenue,
                users,
                movies,
                shows,
                cinemas,
                bookings,
                rate,
                tickets,
            ] = await Promise.all([
                revenueService.getAll(),
                revenueService.getUsers(),
                revenueService.getMovies(),
                revenueService.getShows(),
                revenueService.getCinemas(),
                revenueService.getBookings(),
                revenueService.getUtilizationRate(),
                revenueService.getTicketsToday(),
            ]);

            setStats(prev => ({
                ...prev,
                totalRevenue: revenue.totalRevenue ?? 0,
                totalUsers: users.totalUsers ?? 0,
                totalMovies: movies.totalMovies ?? 0,
                totalShows: shows.totalScreening ?? 0,
                totalCinemas: cinemas.totalCinemas ?? 0,
                totalBookings: bookings.totalBookings ?? 0,
                totalCancels: bookings.totalCancels ?? 0,
                utilizationRate: rate.utilizationRate ?? 0,
                bookingsToday: tickets.bookingsToday ?? 0,
                bookingsMonth: tickets.bookingsMonth ?? 0,


            }));

            setLoading(false);
        } catch (error) {
            message.error("Không thể tải thống kê dashboard.");
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
                            title="Total Revenue"
                            value={stats.totalRevenue}
                            prefix="₫"
                            precision={0}
                            valueStyle={{ color: "#3f8600" }}
                            formatter={value => numeral(value).format("0.0a").toUpperCase()}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic title="Users" value={stats.totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic title="Movies" value={stats.totalMovies} prefix={<VideoCameraOutlined />} />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic title="Screening today" value={stats.totalShows} prefix={<CalendarOutlined />} />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic title="Cinemas" value={stats.totalCinemas} prefix={<BankOutlined />} />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div className="flip-card">
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <Card>
                                    <Statistic
                                        title="Bookings"
                                        value={stats.totalBookings}
                                        prefix={<OrderedListOutlined />}
                                    />
                                </Card>
                            </div>

                            <div className="flip-card-back">
                                <Card>
                                    <Statistic
                                        title="Cancels"
                                        value={stats.totalCancels}
                                        prefix={<OrderedListOutlined />}
                                    />
                                </Card>
                            </div>
                        </div>
                    </div>
                </Col>



                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Utilization Rate"
                            value={stats.utilizationRate}
                            suffix="%"
                            prefix={<DashboardOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Ticket (Today/ Month)"
                            value={`${stats.bookingsToday} / ${stats.bookingsMonth}`}
                            prefix={<CreditCardOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
