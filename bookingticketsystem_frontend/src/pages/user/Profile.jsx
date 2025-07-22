import React from "react";
import { Card, Row, Col, Avatar, Typography, Tag, Button, Tabs, Space } from "antd";
import { UserOutlined, HistoryOutlined, HeartOutlined, LockOutlined, EditOutlined, CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import ProfileInfo from "./ProfileInfo";
import BookingHistory from "./BookingHistory";
import FavoriteMovies from "./FavoriteMovies";
import ChangePassword from "./ChangePassword";

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card style={{ maxWidth: 1000, margin: "32px auto", borderRadius: 16, boxShadow: "0 2px 16px #f0f1f2" }}>
      <Row gutter={[32, 16]}>
        {/* Cột trái: Avatar + Info */}
        <Col xs={24} md={8} style={{ textAlign: "center", borderRight: '1px solid #f0f0f0', minHeight: 320 }}>
          <Avatar 
            size={100} 
            style={{ backgroundColor: '#1890ff', fontSize: 40, marginBottom: 16 }} 
            icon={<UserOutlined />} 
          >
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Title level={3} style={{ marginBottom: 0 }}>{user.name}</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>{user.email}</Text>
          <div style={{ margin: '16px 0' }}>
            <Tag color="blue" style={{ fontSize: 14 }}>{user.role || 'Khách hàng'}</Tag>
            {user.loyaltyPoints !== undefined && (
              <Tag color="gold" style={{ fontSize: 14 }}>Điểm: {user.loyaltyPoints}</Tag>
            )}
            {/* Bỏ tag trạng thái hoạt động */}
          </div>
          <div style={{ margin: '16px 0' }}>
            <Text strong>Số điện thoại:</Text> <Text>{user.phone || <i>Chưa cập nhật</i>}</Text>
          </div>
          <div style={{ margin: '16px 0' }}>
            <Text type="secondary">Ngày tạo: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</Text>
          </div>
        </Col>
        {/* Cột phải: Tabs chức năng */}
        <Col xs={24} md={16}>
          <Tabs
            defaultActiveKey="info"
            tabPosition="top"
            items={[
              {
                key: "info",
                label: (
                  <span><EditOutlined /> Thông tin cá nhân</span>
                ),
                children: <ProfileInfo />,
              },
              {
                key: "changepass",
                label: (
                  <span><LockOutlined /> Đổi mật khẩu</span>
                ),
                children: <ChangePassword />,
              },
              
            ]}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default Profile; 