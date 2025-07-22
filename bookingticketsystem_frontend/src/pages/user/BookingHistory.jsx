import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Modal, 
  Descriptions,
  message,
  Empty
} from 'antd';
import { EyeOutlined, CloseCircleOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import bookingService from '../../services/bookingService';
import Toast from '../../components/Toast';
import { QRCodeCanvas } from 'qrcode.react';

const { Title } = Typography;

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrBooking, setQrBooking] = useState(null);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const bookingsData = await bookingService.getByUser(user.userId);
      setBookings(bookingsData);
    } catch (error) {
      Toast.error('Không thể tải lịch sử đặt vé: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setDetailBooking(record);
    setDetailVisible(true);
  };

  const handleCancel = async (bookingId) => {
    try {
      await bookingService.cancel(bookingId);
      Toast.success('Hủy đặt vé thành công');
      loadBookings();
    } catch (error) {
      Toast.error('Không thể hủy đặt vé: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'green';
      case 'cancelled': return 'red';
      case 'pending': return 'orange';
      case 'completed': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'pending': return 'Chờ xác nhận';
      case 'completed': return 'Hoàn thành';
      default: return status || 'Không xác định';
    }
  };

  const columns = [
    {
      title: 'Mã đặt vé',
      dataIndex: 'bookingId',
      key: 'bookingId',
      width: 120,
    },
    {
      title: 'Phim',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      ellipsis: true,
    },
    {
      title: 'Ngày chiếu',
      dataIndex: 'showStartTime',
      key: 'showStartTime',
      width: 120,
      render: (time) => time ? new Date(time).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Giờ chiếu',
      dataIndex: 'showStartTime',
      key: 'showTime',
      width: 100,
      render: (time) => time ? new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      title: 'Số ghế',
      dataIndex: 'numberOfSeats',
      key: 'numberOfSeats',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (price) => price ? `${price.toLocaleString('vi-VN')} VNĐ` : '-',
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
      width: 250,
      render: (_, record) => (
        <Space size={0} style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status?.toLowerCase() !== 'cancelled' && (
            <Button
              type="link"
              icon={<QrcodeOutlined />}
              onClick={() => {
                setQrBooking(record);
                setQrVisible(true);
              }}
            >
              QR-code
            </Button>
          )}
          {record.status?.toLowerCase() === 'confirmed' && (
            <Button 
              type="link" 
              danger 
              icon={<CloseCircleOutlined />} 
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận hủy',
                  content: 'Bạn có chắc chắn muốn hủy đặt vé này?',
                  onOk: () => handleCancel(record.bookingId),
                });
              }}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!user) {
    return (
      <Card style={{ maxWidth: 800, margin: '32px auto' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Title level={4}>Vui lòng đăng nhập để xem lịch sử đặt vé</Title>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 1200, margin: '32px auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Lịch sử đặt vé</Title>
      
      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="bookingId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đặt vé`,
        }}
        locale={{
          emptyText: <Empty description="Chưa có lịch sử đặt vé nào" />
        }}
      />

      {/* Modal QR-code */}
      <Modal
        title="QR-code vé phim"
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={null}
        width={340}
        centered
      >
        {qrBooking && (
          <div style={{ textAlign: 'center' }}>
            <QRCodeCanvas
              id="booking-qrcode"
              value={JSON.stringify({
                bookingId: qrBooking.bookingId,
                movieTitle: qrBooking.movieTitle,
                showStartTime: qrBooking.showStartTime,
                seats: qrBooking.seats?.map(seat => `${seat.rowNumber}${seat.columnNumber}`).join(', ')
              })}
              size={220}
              level="H"
              includeMargin={true}
            />
            <div style={{ marginTop: 12 }}>
              <Button type="primary" onClick={() => {
                const canvas = document.getElementById('booking-qrcode');
                const url = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = url;
                link.download = `ve_phim_${qrBooking.bookingId}.png`;
                link.click();
              }}>Tải QR-code vé</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết đặt vé"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {detailBooking && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã đặt vé">
              {detailBooking.bookingId}
            </Descriptions.Item>
            <Descriptions.Item label="Phim">
              {detailBooking.movieTitle}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày chiếu">
              {detailBooking.showStartTime ? new Date(detailBooking.showStartTime).toLocaleDateString('vi-VN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ chiếu">
              {detailBooking.showStartTime ? new Date(detailBooking.showStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng chiếu">
              {detailBooking.hallName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Rạp">
              {detailBooking.cinemaName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ rạp">
              {detailBooking.cinemaAddress || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Số ghế">
              {detailBooking.numberOfSeats}
            </Descriptions.Item>
            <Descriptions.Item label="Ghế đã đặt">
              {detailBooking.seats?.map(seat => `${seat.rowNumber}${seat.columnNumber}`).join(', ') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {detailBooking.totalPrice ? `${detailBooking.totalPrice.toLocaleString('vi-VN')} VNĐ` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(detailBooking.status)}>
                {getStatusText(detailBooking.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default BookingHistory; 