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
import cinemaHallService from '../../services/cinemaHallService';
import cinemaService from '../../services/cinemaService';
import { CinemaHall } from '../../models/CinemaHall';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;
const { Option } = Select;

const CinemaHalls = () => {
  const [cinemaHalls, setCinemaHalls] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailHall, setDetailHall] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hallsData, cinemasData] = await Promise.all([
        cinemaHallService.getAll(),
        cinemaService.getAll(),
      ]);
      setCinemaHalls(hallsData.map(CinemaHall.fromApi));
      setCinemas(cinemasData);
    } catch (error) {
      Toast.error('Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHall(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingHall(record);
    form.setFieldsValue({
      name: record.name,
      cinemaId: record.cinemaId,
      totalSeats: record.totalSeats
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      Toast.error('ID không hợp lệ');
      return;
    }
    try {
      await cinemaHallService.delete(id);
      Toast.success('Xóa phòng chiếu thành công');
      loadData();
    } catch (error) {
      Toast.error('Không thể xóa phòng chiếu: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const hallData = new CinemaHall(values);
      
      if (editingHall) {
        await cinemaHallService.update(editingHall.cinemaHallId, hallData.toUpdateDto());
        Toast.success('Cập nhật phòng chiếu thành công');
      } else {
        await cinemaHallService.create(hallData.toCreateDto());
        Toast.success('Thêm phòng chiếu thành công');
      }
      
      setModalVisible(false);
      loadData();
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleViewDetail = (record) => {
    setDetailHall(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'cinemaHallId',
      key: 'cinemaHallId',
      width: 80,
    },
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Rạp chiếu',
      dataIndex: 'cinemaName',
      key: 'cinemaName',
      width: 200,
      render: (_, record) => record.cinemaName || '-',
    },
    {
      title: 'Sức chứa',
      dataIndex: 'totalSeats',
      key: 'totalSeats',
      width: 100,
      render: (totalSeats) => `${totalSeats} ghế`,
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
            title="Bạn có chắc chắn muốn xóa phòng chiếu này?"
            onConfirm={() => handleDelete(record.cinemaHallId)}
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
          <Title level={3}>Quản lý phòng chiếu</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm phòng chiếu
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={cinemaHalls.map((item, idx) => ({ ...item, key: item.cinemaHallId ?? `row-${idx}` }))}
          rowKey="cinemaHallId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phòng chiếu`,
          }}
          scroll={{ x: 1000 }}
        />

        {/* Modal thêm/sửa phòng chiếu */}
        <Modal
          title={editingHall ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu mới'}
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
              name="name"
              label="Tên phòng chiếu"
              rules={[
                { required: true, message: 'Vui lòng nhập tên phòng chiếu!' },
                { min: 2, message: 'Tên phòng chiếu phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tên phòng chiếu" />
            </Form.Item>
            <Form.Item
              name="cinemaId"
              label="Rạp chiếu"
              rules={[
                { required: true, message: 'Vui lòng chọn rạp chiếu!' }
              ]}
            >
              <Select placeholder="Chọn rạp chiếu">
                {cinemas.map(cinema => (
                  <Option key={cinema.cinemaId} value={cinema.cinemaId}>
                    {cinema.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="totalSeats"
              label="Sức chứa"
              rules={[
                { required: true, message: 'Vui lòng nhập sức chứa!' },
                { type: 'number', min: 1, message: 'Sức chứa phải lớn hơn 0!' }
              ]}
            >
              <InputNumber min={1} placeholder="Nhập sức chứa" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingHall ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chi tiết phòng chiếu */}
        <Modal
          title="Chi tiết phòng chiếu"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              Đóng
            </Button>
          ]}
          width={500}
        >
          {detailHall && (
            <div>
              <p><strong>Tên phòng:</strong> {detailHall.name}</p>
              <p><strong>Rạp chiếu:</strong> {detailHall.cinemaName || '-'}</p>
              <p><strong>Sức chứa:</strong> {detailHall.totalSeats} ghế</p>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default CinemaHalls; 