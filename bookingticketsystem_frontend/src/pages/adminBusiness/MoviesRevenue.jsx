import React, { useState, useEffect } from "react";
import numeral from "numeral";
import { Card, Typography, Row, DatePicker, Col, Select } from "antd";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import Toast from "../../components/Toast";
import revenueService from "../../services/revenueService";

const { Title, Text } = Typography;
const { Option } = Select;

const MoviesRevenue = () => {
    const [numberMovies, setNumberMovies] = useState(0);
    const [name, setName] = useState("");
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [movieChartData, setMovieChartData] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [topN, setTopN] = useState(5);
    const [first, setFirst] = useState("All");

    useEffect(() => {
        fetchNumberOfMovies();
    }, []);

    useEffect(() => {
        loadRevenue();
    }, [startDate, endDate, topN, first]);

    const fetchNumberOfMovies = async () => {
        try {
            const data = await revenueService.getMovies();
            setNumberMovies(data.totalMovies);

            const topMovie = await revenueService.GetMovieTop();
            setName(topMovie.movieTitle);
            setTotalRevenue(topMovie.totalRevenue);
        } catch (error) {
            Toast.error("Không thể tải dữ liệu: " + error.message);
        }
    };

    const loadRevenue = async () => {
        try {
            let data = [];

            if (first !== "All") {
                data = await revenueService.RevenueFirstWeek_Month_YearByMovie(first);
            }
            
            else if (startDate && endDate) {
                if (startDate.isAfter(endDate)) {
                    Toast.error("StartDate không được lớn hơn EndDate.");
                    return;
                }
                const start = startDate.format("YYYY-MM-DD");
                const end = endDate.format("YYYY-MM-DD");
                data = await revenueService.RevenueByMoviesFromStartToEnd(start, end);
            }
       
            else {
                data = await revenueService.RevenueByMovies();
            }

            const topData = data
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, topN);

            setMovieChartData(
                topData.map(item => ({
                    time: item.movieTitle,
                    amount: item.totalRevenue
                }))
            );
        } catch (error) {
            Toast.error("Không thể tải dữ liệu doanh thu: " + error.message);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={3} style={{
                color: "#fff",
                backgroundColor: "#3f51b5",
                padding: "12px 24px",
                borderRadius: 4,
                marginBottom: 24,
            }}>
                Movies Statistics
            </Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={6}>
                    <Card bordered>
                        <Title level={4}>Total Movies</Title>
                        <Title level={2} style={{ color: "#3f51b5" }}>{numberMovies}</Title>
                    </Card>
                </Col>

                <Col xs={24} md={12} lg={8}>
                    <Card bordered>
                        <Title level={4}>Top Movie</Title>
                        <Text strong>{name}</Text>
                        <br />
                        <Text style={{ fontSize: 16, color: "#3f51b5", fontWeight: 600 }}>
                            Revenue: {numeral(totalRevenue).format("0.0a").toUpperCase()}
                        </Text>
                    </Card>
                </Col>
            </Row>

            <Row style={{ marginTop: 16 }} gutter={16}>
                <Col span={6}>
                    <Select
                        defaultValue={5}
                        value={topN}
                        style={{ width: "100%" }}
                        onChange={(value) => setTopN(value)}
                    >
                        <Option value={5}>Top 5</Option>
                        <Option value={10}>Top 10</Option>
                        <Option value={15}>Top 15</Option>
                        <Option value={1000}>All</Option>
                    </Select>
                </Col>

                <Col span={6}>
                    <Select
                        defaultValue="All"
                        value={first}
                        style={{ width: "100%" }}
                        onChange={(value) => {
                            setFirst(value);
                            if (value !== "All") {
                                setStartDate(null);
                                setEndDate(null);
                            }
                        }}
                    >
                        <Option value="All">All</Option>
                        <Option value={0}>Week</Option>
                        <Option value={1}>Month</Option>
                        <Option value={2}>Quarter</Option>
                        <Option value={3}>Year</Option>
                    </Select>
                </Col>

                <Col span={6}>
                    <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Start Date"
                        disabled={first !== "All"}
                        onChange={(date) => setStartDate(date)}
                        value={startDate}
                    />
                </Col>

                <Col span={6}>
                    <DatePicker
                        style={{ width: "100%" }}
                        placeholder="End Date"
                        disabled={first !== "All"}
                        onChange={(date) => setEndDate(date)}
                        value={endDate}
                    />
                </Col>
            </Row>

            <Card style={{ marginTop: 24 }} title="Movies Revenue (Bar Chart)">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={movieChartData} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid stroke="#eee" />
                        <XAxis type="number" tickFormatter={(value) => numeral(value).format("0.0a").toUpperCase()} />
                        <YAxis type="category" dataKey="time" />
                        <Tooltip formatter={(value) => numeral(value).format("0,0")} />
                        <Bar dataKey="amount" fill="#3f51b5" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default MoviesRevenue;
