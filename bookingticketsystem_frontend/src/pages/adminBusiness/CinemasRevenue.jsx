import React, { useState, useEffect } from "react";
import numeral from "numeral";
import { Card, Typography, Row, DatePicker, Col, Button } from "antd";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import Toast from "../../components/Toast";
import revenueService from "../../services/revenueService";

const { Title, Text } = Typography;

const CinemasRevenue = () => {
    const [numberCinemas, setNumberCinemas] = useState(0);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [cinemaChartData, setCinemaChartData] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNumberOfCinemas();
        fetchAllRevenue();
    }, []);
    const fetchAllRevenue = async () => {
        try {
            const data = await revenueService.RevenueByCinema();
            setCinemaChartData(data.map(item => ({
                time: item.cinemaName,
                amount: item.totalRevenue
            })));
        } catch (error) {
            Toast.error("Không thể tải dữ liệu doanh thu: " + error.message);
        }
    };

    const fetchNumberOfCinemas = async () => {
        setLoading(true);
        try {
            const data = await revenueService.getCinemas();
            setNumberCinemas(data.totalCinemas);

            const topCinema = await revenueService.GetCinemaTop();
            setName(topCinema.cinemaName);
            setAddress(topCinema.address);
            setTotalRevenue(topCinema.totalRevenue);
        } catch (error) {
            Toast.error("Không thể tải dữ liệu: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    const handleDateChange = async () => {
        if (!startDate || !endDate) {
            Toast.error("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.");
            return;
        }
        if (startDate >= endDate) {
            Toast.error("EndDate phải lớn hơn StartDate");
            return;
        }
        try {
            const start = startDate.format("YYYY-MM-DD");
            const end = endDate.format("YYYY-MM-DD");

            const filteredData = await revenueService.RevenueByCinemaFromStartToEnd(start, end);
            console.log("Filtered Revenue Data:", filteredData)
            setCinemaChartData(filteredData.map(item => ({
                time: item.cinemaName,
                amount: item.totalRevenue
            })));
        } catch (error) {
            Toast.error("Không thể tải dữ liệu theo ngày: " + error.message);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title
                level={3}
                style={{
                    color: "#fff",
                    backgroundColor: "#3f51b5",
                    padding: "12px 24px",
                    borderRadius: 4,
                    marginBottom: 24,
                }}
            >
                Cinemas Statistics
            </Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={6}>
                    <Card bordered style={{ height: "100%" }}>
                        <Title level={4}>Total Cinemas</Title>
                        <Title level={2} style={{ color: "#3f51b5" }}>{numberCinemas}</Title>
                    </Card>
                </Col>

                <Col xs={24} md={12} lg={8}>
                    <Card bordered style={{ height: "100%" }}>
                        <Title level={4}>Top Cinema</Title>
                        <Text strong>{name}</Text>
                        <br />
                        <Text type="secondary">{address}</Text>
                        <br />
                        <Text style={{ fontSize: 16, color: "#3f51b5", fontWeight: 600 }}>
                            Revenue: {numeral(totalRevenue).format("0.0a").toUpperCase()}
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={4} style={{ display: "flex", alignItems: "flex-end" }}>
                    <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Start Date"
                        onChange={(date) => setStartDate(date)}
                    />
                </Col>
              
                <Col xs={24} md={12} lg={4} style={{ display: "flex", alignItems: "flex-end" }}>
                    <DatePicker
                        style={{ width: "100%" }}
                        placeholder="End Date"
                        onChange={(date) => setEndDate(date)}
                    />
                </Col>
                <Col xs={24} md={12} lg={2} style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                        onClick={handleDateChange}
                        style={{
                            width: "100%",
                            backgroundColor: "#3f51b5",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 4,
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        Fillter
                    </button>
                </Col>
            </Row>

            <Card style={{ marginTop: 24 }} title="Cinemas Revenue">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={cinemaChartData}>
                        <CartesianGrid stroke="#eee" />
                        <XAxis dataKey="time" />
                        <YAxis
                            allowDecimals={false}
                        />
                        <Tooltip/>
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#3f51b5"
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};
export default CinemasRevenue;
