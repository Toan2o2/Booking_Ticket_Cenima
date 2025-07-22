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
  DatePicker,
  Tag,
  InputNumber
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import userService from '../../services/userService';
import { User } from '../../models/User';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      Toast.error('Không thể tải danh sách người dùng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      address: record.address,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
      gender: record.gender,
      role: record.role
    });
    setModalVisible(true);
  };

  const handleDelete = async (email) => {
    if (!email) {
      Toast.error('Email không hợp lệ');
      return;
    }
    try {
      await userService.delete(email);
      Toast.success('Xóa người dùng thành công');
      loadUsers();
    } catch (error) {
      Toast.error('Không thể xóa người dùng: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const userData = new User({
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : null
      });
      
      if (editingUser) {
        await userService.update(editingUser.email, userData.toUpdateDto());
        Toast.success('Cập nhật người dùng thành công');
      } else {
        await userService.create(userData.toCreateDto());
        Toast.success('Thêm người dùng thành công');
      }
      
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleViewDetail = (record) => {
    setDetailUser(record);
    setDetailVisible(true);
  };

  const handleSearch = () => {
    if (!searchText.trim()) {
      loadUsers();
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchText.toLowerCase()) || 
      user.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setUsers(filtered);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'user': return 'blue';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'user': return 'Người dùng';
      default: return role;
    }
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return gender;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: 'Tên',
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
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (gender) => getGenderText(gender),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
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
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.email)}
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
          <Title level={3}>Quản lý người dùng</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm người dùng
          </Button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Input.Search
              placeholder="Tìm kiếm theo tên hoặc email..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
            {searchText && (
              <Button onClick={() => { setSearchText(''); loadUsers(); }}>
                Xóa tìm kiếm
              </Button>
            )}
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users.map((item, idx) => ({ ...item, key: item.userId ?? `row-${idx}` }))}
          rowKey="userId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          scroll={{ x: 1200 }}
        />

        {/* Modal thêm/sửa người dùng */}
        <Modal
          title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên!' },
                { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ!' }
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
            >
              <DatePicker 
                placeholder="Chọn ngày sinh"
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Giới tính"
            >
              <Select placeholder="Chọn giới tính">
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="role"
              label="Vai trò"
              rules={[
                { required: true, message: 'Vui lòng chọn vai trò!' }
              ]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="user">Người dùng</Option>
                <Option value="admin">Quản trị viên</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingUser ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chi tiết người dùng */}
        <Modal
          title="Chi tiết người dùng"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              Đóng
            </Button>
          ]}
          width={600}
        >
          {detailUser && (
            <div>
              <p><strong>Họ và tên:</strong> {detailUser.name}</p>
              <p><strong>Email:</strong> {detailUser.email}</p>
              <p><strong>Số điện thoại:</strong> {detailUser.phone || 'Không có'}</p>
              <p><strong>Địa chỉ:</strong> {detailUser.address || 'Không có'}</p>
              <p><strong>Ngày sinh:</strong> {detailUser.dateOfBirth ? new Date(detailUser.dateOfBirth).toLocaleDateString('vi-VN') : 'Không có'}</p>
              <p><strong>Giới tính:</strong> {getGenderText(detailUser.gender)}</p>
              <p><strong>Vai trò:</strong> <Tag color={getRoleColor(detailUser.role)}>{getRoleText(detailUser.role)}</Tag></p>
              <p><strong>Trạng thái:</strong> <Tag color={detailUser.isActive ? 'green' : 'red'}>{detailUser.isActive ? 'Hoạt động' : 'Không hoạt động'}</Tag></p>
              <p><strong>Ngày tạo:</strong> {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString('vi-VN') : '-'}</p>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Users; 