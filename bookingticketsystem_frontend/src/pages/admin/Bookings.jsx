import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Space, 
  Popconfirm, 
  Card,
  Typography,
  Tag,
  Descriptions,
  Badge
} from 'antd';
import { EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import bookingService from '../../services/bookingService';
import Toast from '../../components/Toast';
import '../../styles/admin.css';
import { Booking } from '../../models/Booking';

const { Title } = Typography;

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const bookingsData = await bookingService.getAll();
      setBookings(bookingsData.map(Booking.fromApi));
    } catch (error) {
      Toast.error('Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!id) {
      Toast.error('ID không hợp lệ');
      return;
    }
    try {
      await bookingService.cancel(id);
      Toast.success('Hủy đặt vé thành công');
      loadData();
    } catch (error) {
      Toast.error('Không thể hủy đặt vé: ' + error.message);
    }
  };

  const handleViewDetail = (record) => {
    setDetailBooking(record);
    setDetailVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'green';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'bookingId',
      key: 'bookingId',
      width: 80,
    },
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (userName) => userName || '-',
    },
    {
      title: 'Phim',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      width: 200,
      render: (movieTitle) => movieTitle || '-',
    },
    {
      title: 'Giờ chiếu',
      dataIndex: 'showStartTime',
      key: 'showStartTime',
      width: 120,
      render: (showStartTime) => showStartTime || '-',
    },
    {
      title: 'Số ghế',
      dataIndex: 'numberOfSeats',
      key: 'numberOfSeats',
      width: 100,
      render: (numberOfSeats) => numberOfSeats || 0,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (totalPrice) => totalPrice ? `${totalPrice.toLocaleString()} VNĐ` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          {record.status === 'pending' && (
            <Popconfirm
              title="Bạn có chắc chắn muốn hủy đặt vé này?"
              onConfirm={() => handleCancel(record.bookingId)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                size="small"
              >
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3}>Quản lý đặt vé</Title>
        </div>

        <Table
          columns={columns}
          dataSource={bookings.map((item, idx) => ({ ...item, key: item.bookingId ?? `row-${idx}` }))}
          rowKey="bookingId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đặt vé`,
          }}
          scroll={{ x: 1400 }}
        />

        {/* Modal chi tiết đặt vé */}
        <Modal
          title="Chi tiết đặt vé"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              Đóng
            </Button>
          ]}
          width={600}
        >
          {detailBooking && (
            <div>
              <p><strong>ID đặt vé:</strong> {detailBooking.bookingId}</p>
              <p><strong>Người dùng:</strong> {detailBooking.userName || '-'}</p>
              <p><strong>Phim:</strong> {detailBooking.movieTitle || '-'}</p>
              <p><strong>Giờ chiếu:</strong> {detailBooking.showStartTime || '-'}</p>
              <p><strong>Số ghế:</strong> {detailBooking.numberOfSeats || 0}</p>
              <p><strong>Tổng tiền:</strong> {detailBooking.totalPrice ? `${detailBooking.totalPrice.toLocaleString()} VNĐ` : '-'}</p>
              <p><strong>Trạng thái:</strong> {getStatusText(detailBooking.status)}</p>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Bookings; 