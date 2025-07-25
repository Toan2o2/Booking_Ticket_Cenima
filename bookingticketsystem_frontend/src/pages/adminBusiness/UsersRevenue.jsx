import React, { useState, useEffect } from "react";
import { Card, Table, Typography, Row, Col, Button, Tag, Select } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Toast from '../../components/Toast';
import revenueService from "../../services/revenueService";
const { Option } = Select;
const { Title, Text } = Typography;

const UsersRevenue = () => {
    const [users, setUsers] = useState([]);
    const [numberUsers, setNumberUsers] = useState(0);
    const [filterYears, setFilterYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [userChartData, setUserChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
        fetchNumberOfUsers();
        fetchFilterYears();
    }, []);

    useEffect(() => {
        if (selectedYear) {
            fetchUsersByMonth(selectedYear);
        }
    }, [selectedYear]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await revenueService.GetTop5Users();
            setUsers(data);
        } catch (error) {
            Toast.error('Không thể tải danh sách người dùng: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNumberOfUsers = async () => {
        setLoading(true);
        try {
            const data = await revenueService.getUsers();
            setNumberUsers(data.totalUsers);
        } catch (error) {
            Toast.error('Không thể tải số lượng người dùng: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    const fetchFilterYears = async () => {
        try {
            const years = await revenueService.GetFillterUsers();
            setFilterYears(years);
            setSelectedYear(years[0]);
            fetchUsersByMonth(years[0]);
        } catch (error) {
            Toast.error("Không thể tải danh sách năm: " + error.message);
        }
    };

    const fetchUsersByMonth = async (year) => {
        try {
            const data = await revenueService.GetUserByMonths(year);
            const completeData = Array.from({ length: 12 }, (_, index) => {
                const found = data.find(item => item.month === index + 1);
                return {
                    time: `Tháng ${index + 1}`,
                    amount: found ? found.userCount : 0
                };
            });

            setUserChartData(completeData);
        } catch (error) {
            Toast.error('Lỗi tải dữ liệu thống kê người dùng theo tháng');
        }
    };
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
        },
        {
            title: 'Phone number',
            dataIndex: 'phone',
            key: 'phone',
            width: 120,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'InActive'}
                </Tag>
            ),
        },
        {
            title: 'ModifiedAt',
            dataIndex: 'modifiedAt',
            key: 'modifiedAt',
            width: 120,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={3} style={{ color: "#fff", backgroundColor: "#3f51b5", padding: "12px 24px", borderRadius: 4 }}>
                User Statistics
            </Title>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={16}>
                    <Card>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={userChartData}>
                                <CartesianGrid stroke="#eee" />
                                <XAxis dataKey="time" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="amount" stroke="#3f51b5" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>

                    </Card>

                </Col>

                <Col xs={24} lg={8}>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Choose a year: </Text>
                        <Select
                            value={selectedYear}
                            onChange={(value) => setSelectedYear(value)}
                            style={{ width: 120, marginLeft: 8 }}
                        >
                            {filterYears.map((year) => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <Card title="Number Of Users">
                        <Title level={2}>{numberUsers}</Title>
                    </Card>
                </Col>
            </Row>

            <Card title="Recent Users" style={{ marginTop: 16 }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};

export default UsersRevenue;
