import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Space, 
  Card,
  Typography,
  Tag,
  Descriptions,
  Select,
  message
} from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import paymentService from '../../services/paymentService';
import Toast from '../../components/Toast';
import '../../styles/admin.css';
import { Payment } from '../../models/Payment';

const { Title } = Typography;
const { Option } = Select;

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailPayment, setDetailPayment] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const paymentsData = await paymentService.getAll();
      setPayments(paymentsData.map(Payment.fromApi));
    } catch (error) {
      Toast.error('Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setDetailPayment(record);
    setDetailVisible(true);
  };

  const handleUpdateStatus = (record) => {
    setSelectedPayment(record);
    setNewStatus(record.status);
    setStatusModalVisible(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedPayment || !newStatus) {
      Toast.error('Vui lòng chọn trạng thái mới');
      return;
    }

    try {
      await paymentService.updateStatus(selectedPayment.id, { status: newStatus });
      Toast.success('Cập nhật trạng thái thanh toán thành công');
      setStatusModalVisible(false);
      loadPayments();
    } catch (error) {
      Toast.error('Không thể cập nhật trạng thái: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'completed': return 'Thành công';
      case 'failed': return 'Thất bại';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'Tiền mặt';
      case 'card': return 'Thẻ tín dụng';
      case 'bank_transfer': return 'Chuyển khoản';
      case 'momo': return 'Ví MoMo';
      case 'vnpay': return 'VNPay';
      default: return method;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'paymentId',
      key: 'paymentId',
      width: 80,
    },
    {
      title: 'ID đặt vé',
      dataIndex: 'bookingId',
      key: 'bookingId',
      width: 100,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => amount ? `${amount.toLocaleString()} VNĐ` : '-',
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method) => getPaymentMethodText(method),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 150,
      render: (id) => id || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3}>Quản lý thanh toán</Title>
        </div>

        <Table
          columns={columns}
          dataSource={payments.map((item, idx) => ({ ...item, key: item.paymentId ?? `row-${idx}` }))}
          rowKey="paymentId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thanh toán`,
          }}
          scroll={{ x: 1200 }}
        />

        {/* Modal chi tiết thanh toán */}
        <Modal
          title="Chi tiết thanh toán"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              Đóng
            </Button>
          ]}
          width={600}
        >
          {detailPayment && (
            <div>
              <p><strong>ID thanh toán:</strong> {detailPayment.paymentId}</p>
              <p><strong>ID đặt vé:</strong> {detailPayment.bookingId}</p>
              <p><strong>Số tiền:</strong> {detailPayment.amount ? `${detailPayment.amount.toLocaleString()} VNĐ` : '-'}</p>
              <p><strong>Phương thức:</strong> {getPaymentMethodText(detailPayment.paymentMethod)}</p>
              <p><strong>Trạng thái:</strong> {getStatusText(detailPayment.paymentStatus)}</p>
              <p><strong>Mã giao dịch:</strong> {detailPayment.transactionId || '-'}</p>
              <p><strong>Ngày tạo:</strong> {detailPayment.createdAt ? new Date(detailPayment.createdAt).toLocaleDateString('vi-VN') : '-'}</p>
            </div>
          )}
        </Modal>

        {/* Modal cập nhật trạng thái */}
        <Modal
          title="Cập nhật trạng thái thanh toán"
          open={statusModalVisible}
          onOk={handleStatusSubmit}
          onCancel={() => setStatusModalVisible(false)}
          okText="Cập nhật"
          cancelText="Hủy"
        >
          {selectedPayment && (
            <div>
              <p><strong>ID thanh toán:</strong> {selectedPayment.id}</p>
              <p><strong>Số tiền:</strong> {selectedPayment.amount ? `${selectedPayment.amount.toLocaleString()} VNĐ` : '-'}</p>
              <p><strong>Trạng thái hiện tại:</strong> <Tag color={getStatusColor(selectedPayment.status)}>{getStatusText(selectedPayment.status)}</Tag></p>
              
              <div style={{ marginTop: '16px' }}>
                <label><strong>Trạng thái mới:</strong></label>
                <Select
                  value={newStatus}
                  onChange={setNewStatus}
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Chọn trạng thái mới"
                >
                  <Option value="pending">Chờ xử lý</Option>
                  <Option value="completed">Thành công</Option>
                  <Option value="failed">Thất bại</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Payments; 