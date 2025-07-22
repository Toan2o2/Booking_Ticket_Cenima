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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import cityService from '../../services/cityService';
import { City } from '../../models/City';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailCity, setDetailCity] = useState(null);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      const data = await cityService.getAll();
      setCities(data);
    } catch (error) {
      Toast.error('Không thể tải danh sách thành phố: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCity(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCity(record);
    form.setFieldsValue({
      name: record.name
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      Toast.error('ID không hợp lệ');
      return;
    }
    try {
      await cityService.delete(id);
      Toast.success('Xóa thành phố thành công');
      loadCities();
    } catch (error) {
      Toast.error('Không thể xóa thành phố: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const cityData = new City(values);
      if (editingCity) {
        await cityService.update(editingCity.cityId, cityData);
        Toast.success('Cập nhật thành phố thành công');
      } else {
        await cityService.create(cityData);
        Toast.success('Thêm thành phố thành công');
      }
      setModalVisible(false);
      loadCities();
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleViewDetail = (record) => {
    setDetailCity(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'cityId',
      key: 'cityId',
      width: 80,
    },
    {
      title: 'Tên thành phố',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng rạp',
      dataIndex: 'cinemaCount',
      key: 'cinemaCount',
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
          
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
          
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thành phố này?"
            onConfirm={() => handleDelete(record.cityId)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
            
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
          <Title level={3}>Quản lý thành phố</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm thành phố
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={cities.map((item, idx) => ({ ...item, key: item.cityId ?? `row-${idx}` }))}
          rowKey="cityId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thành phố`,
          }}
          scroll={{ x: 'max-content' }}
        />

        <Modal
          title={editingCity ? 'Sửa thành phố' : 'Thêm thành phố mới'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          destroyOnHidden
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Tên thành phố"
              rules={[
                { required: true, message: 'Vui lòng nhập tên thành phố!' },
                { min: 2, message: 'Tên thành phố phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tên thành phố" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingCity ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={detailCity ? `Chi tiết thành phố: ${detailCity.name}` : 'Chi tiết thành phố'}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          destroyOnHidden
          width={600}
        >
          {detailCity && (
            <div>
              <h2>{detailCity.name}</h2>
              <p><b>Số lượng rạp:</b> {detailCity.cinemaCount}</p>
              {detailCity.cinemas && detailCity.cinemas.length > 0 && (
                <div>
                  <b>Danh sách rạp:</b>
                  <ul>
                    {detailCity.cinemas.map((cinema, idx) => (
                      <li key={cinema.cinemaId || idx}>
                        <b>{cinema.name}</b> - {cinema.address} <br />
                        <span>Liên hệ: {cinema.contactInfo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Cities; 