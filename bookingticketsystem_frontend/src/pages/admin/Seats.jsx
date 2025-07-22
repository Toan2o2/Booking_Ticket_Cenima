import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  Card,
  Typography,
  Select,
  InputNumber,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import seatService from '../../services/seatService';
import cinemaHallService from '../../services/cinemaHallService';
import { Seat } from '../../models/Seat';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;
const { Option } = Select;

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [cinemaHalls, setCinemaHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailSeat, setDetailSeat] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [seatsData, hallsData] = await Promise.all([
        seatService.getAll(),
        cinemaHallService.getAll(),
      ]);
      setSeats(seatsData.map(Seat.fromApi));
      setCinemaHalls(hallsData);
    } catch (error) {
      Toast.error('Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSeat(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSeat(record);
    form.setFieldsValue({
      rowNumber: record.rowNumber,
      columnNumber: record.columnNumber,
      hallId: record.hallId,
      seatType: record.seatType
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      Toast.error('ID không hợp lệ');
      return;
    }
    try {
      await seatService.delete(id);
      Toast.success('Xóa ghế thành công');
      loadData();
    } catch (error) {
      Toast.error('Không thể xóa ghế: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const seatData = new Seat(values);
      
      if (editingSeat) {
        await seatService.update(editingSeat.seatId, seatData.toUpdateDto());
        Toast.success('Cập nhật ghế thành công');
      } else {
        await seatService.create(seatData.toCreateDto());
        Toast.success('Thêm ghế thành công');
      }
      
      setModalVisible(false);
      loadData();
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleViewDetail = (record) => {
    setDetailSeat(record);
    setDetailVisible(true);
  };

  const getSeatTypeColor = (type) => {
    switch (type) {
      case 'standard': return 'blue';
      case 'vip': return 'gold';
      case 'couple': return 'purple';
      case 'disabled': return 'gray';
      default: return 'default';
    }
  };

  const getSeatTypeText = (type) => {
    switch (type) {
      case 'standard': return 'Thường';
      case 'vip': return 'VIP';
      case 'couple': return 'Đôi';
      case 'disabled': return 'Khuyết tật';
      default: return type;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'seatId',
      key: 'seatId',
      width: 80,
    },
    {
      title: 'Hàng',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 80,
    },
    {
      title: 'Số ghế',
      dataIndex: 'columnNumber',
      key: 'columnNumber',
      width: 100,
    },
    {
      title: 'Phòng chiếu',
      dataIndex: 'hallId',
      key: 'hallId',
      width: 150,
      render: (hallId) => {
        const hall = cinemaHalls.find(h => h.cinemaHallId === hallId);
        return hall ? hall.name : '-';
      },
    },
    {
      title: 'Loại ghế',
      dataIndex: 'seatType',
      key: 'seatType',
      width: 120,
      render: (type) => (
        <Tag color={getSeatTypeColor(type)}>
          {getSeatTypeText(type)}
        </Tag>
      ),
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
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa ghế này?"
            onConfirm={() => handleDelete(record.seatId)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={3}>Quản lý ghế ngồi</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm ghế
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={seats.map((item, idx) => ({ ...item, key: item.seatId ?? `row-${idx}` }))}
          rowKey="seatId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ghế`,
          }}
          scroll={{ x: 1000 }}
        />

        {/* Modal thêm/sửa ghế */}
        <Modal
          title={editingSeat ? 'Sửa ghế' : 'Thêm ghế mới'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={500}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="rowNumber"
              label="Hàng"
              rules={[
                { required: true, message: 'Vui lòng nhập hàng!' }
              ]}
            >
              <Input placeholder="Nhập hàng" />
            </Form.Item>
            <Form.Item
              name="columnNumber"
              label="Số ghế"
              rules={[
                { required: true, message: 'Vui lòng nhập số ghế!' },
                { type: 'number', min: 1, message: 'Số ghế phải lớn hơn 0!' }
              ]}
            >
              <InputNumber min={1} placeholder="Nhập số ghế" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="hallId"
              label="Phòng chiếu"
              rules={[
                { required: true, message: 'Vui lòng chọn phòng chiếu!' }
              ]}
            >
              <Select placeholder="Chọn phòng chiếu">
                {cinemaHalls.map(hall => (
                  <Option key={hall.cinemaHallId} value={hall.cinemaHallId}>
                    {hall.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="seatType"
              label="Loại ghế"
              rules={[
                { required: true, message: 'Vui lòng chọn loại ghế!' }
              ]}
            >
              <Select placeholder="Chọn loại ghế">
                <Option value="standard">Thường</Option>
                <Option value="vip">VIP</Option>
                <Option value="couple">Đôi</Option>
                <Option value="disabled">Khuyết tật</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingSeat ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chi tiết ghế */}
        <Modal
          title="Chi tiết ghế"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              Đóng
            </Button>
          ]}
          width={500}
        >
          {detailSeat && (
            <div>
              <p><strong>Hàng:</strong> {detailSeat.rowNumber}</p>
              <p><strong>Số ghế:</strong> {detailSeat.columnNumber}</p>
              <p><strong>Phòng chiếu:</strong> {(() => {
                const hall = cinemaHalls.find(h => h.cinemaHallId === detailSeat.hallId);
                return hall ? hall.name : '-';
              })()}</p>
              <p><strong>Loại ghế:</strong> {getSeatTypeText(detailSeat.seatType)}</p>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Seats; 