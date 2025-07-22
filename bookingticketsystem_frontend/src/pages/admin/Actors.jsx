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
  DatePicker,
  Upload,
  Image,
  Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import personService from '../../services/personService';
import { Person } from '../../models/Person';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Actors = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailPerson, setDetailPerson] = useState(null);
  const [moviesByPerson, setMoviesByPerson] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    setLoading(true);
    try {
      const data = await personService.getAll();
      setPersons(data);
    } catch (error) {
      Toast.error('Không thể tải danh sách diễn viên/đạo diễn: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPerson(null);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPerson(record);
    setPhotoFile(null);
    setPhotoPreviewUrl(record.photoUrl || null);
    form.setFieldsValue({
      name: record.name,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
      biography: record.biography,
      nationality: record.nationality
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      Toast.error('ID không hợp lệ');
      return;
    }
    try {
      await personService.delete(id);
      Toast.success('Xóa diễn viên/đạo diễn thành công');
      loadPersons(); // Reload lại danh sách từ backend
    } catch (error) {
      Toast.error('Không thể xóa diễn viên/đạo diễn: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const personData = new Person({
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : null
      });
      
      if (editingPerson) {
        await personService.update(editingPerson.personId, personData, photoFile);
        Toast.success('Cập nhật diễn viên/đạo diễn thành công');
      } else {
        await personService.create(personData, photoFile);
        Toast.success('Thêm diễn viên/đạo diễn thành công');
      }
      
      setModalVisible(false);
      loadPersons(); // Reload lại danh sách từ backend
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handlePhotoChange = (info) => {
    console.log('Photo change info:', info);
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      console.log('Selected file:', file);
      if (file) {
        setPhotoFile(file);
        // Tạo URL preview
        const previewUrl = URL.createObjectURL(file);
        console.log('Preview URL:', previewUrl);
        setPhotoPreviewUrl(previewUrl);
      }
    }
  };

  // Cleanup URL khi component unmount
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handleViewDetail = async (record) => {
    console.log('Chi tiết person:', record);
    setDetailPerson(record);
    setDetailVisible(true);
    setLoadingDetail(true);
    if (record.personId !== null && record.personId !== undefined) {
      try {
        const movieService = (await import('../../services/movieService')).default;
        const movies = await movieService.getByPerson(record.personId);
        setMoviesByPerson(movies);
      } catch (error) {
        setMoviesByPerson([]);
      }
    } else {
      setMoviesByPerson([]);
    }
    setLoadingDetail(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'personId',
      key: 'personId',
      width: 80,
    },
    {
      title: 'Ảnh',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      width: 100,
      render: (url) => (
        <Image
          width={50}
          height={50}
          src={url || '/placeholder-avatar.png'}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      key: 'nationality',
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'biography',
      key: 'biography',
      ellipsis: true,
      width: 200,
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
            title="Bạn có chắc chắn muốn xóa diễn viên/đạo diễn này?"
            onConfirm={() => handleDelete(record.personId)}
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
          <Title level={3}>Quản lý diễn viên/đạo diễn</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm diễn viên/đạo diễn
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={persons.map((item, idx) => ({ ...item, key: item.personId ?? `row-${idx}` }))}
          rowKey="personId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} diễn viên/đạo diễn`,
          }}
          scroll={{ x: 'max-content' }}
        />

        <Modal
          title={editingPerson ? 'Sửa diễn viên/đạo diễn' : 'Thêm diễn viên/đạo diễn mới'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          destroyOnHidden
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[
                { required: true, message: 'Vui lòng nhập tên!' },
                { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tên diễn viên/đạo diễn" />
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
              name="nationality"
              label="Quốc tịch"
              rules={[
                { required: true, message: 'Vui lòng nhập quốc tịch!' }
              ]}
            >
              <Input placeholder="Nhập quốc tịch" />
            </Form.Item>

            <Form.Item
              name="biography"
              label="Tiểu sử"
            >
              <TextArea 
                rows={4} 
                placeholder="Nhập tiểu sử (không bắt buộc)"
              />
            </Form.Item>

            <Form.Item
              label="Ảnh đại diện"
            >
              <Upload
                name="photo"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={(file) => {
                  // Ngăn upload tự động
                  return false;
                }}
                onChange={handlePhotoChange}
                accept="image/*"
              >
                {photoPreviewUrl ? (
                  <img 
                    src={photoPreviewUrl} 
                    alt="photo preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : editingPerson?.photoUrl ? (
                  <img 
                    src={editingPerson.photoUrl} 
                    alt="current photo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingPerson ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={detailPerson ? `Chi tiết: ${detailPerson.name}` : 'Chi tiết'}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          destroyOnHidden
          width={600}
        >
          {detailPerson && (
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <Image
                  width={120}
                  height={160}
                  src={detailPerson.photoUrl || '/placeholder-avatar.png'}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                  alt={detailPerson.name}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h2>{detailPerson.name}</h2>
                <p><b>Ngày sinh:</b> {detailPerson.dateOfBirth ? (typeof detailPerson.dateOfBirth === 'string' ? new Date(detailPerson.dateOfBirth).toLocaleDateString('vi-VN') : detailPerson.dateOfBirth.toLocaleDateString('vi-VN')) : '-'}</p>
                <p><b>Quốc tịch:</b> {detailPerson.nationality}</p>
                <p><b>Tiểu sử:</b> {detailPerson.biography || '-'}</p>
                <h3 style={{ marginTop: 24 }}>Danh sách phim liên quan:</h3>
                {loadingDetail ? (
                  <p>Đang tải...</p>
                ) : moviesByPerson.length === 0 ? (
                  <p>Không có phim nào liên quan.</p>
                ) : (
                  <ul>
                    {moviesByPerson.map((movie, idx) => (
                      <li key={idx}><b>{movie.title}</b> ({movie.releaseDate ? (typeof movie.releaseDate === 'string' ? new Date(movie.releaseDate).getFullYear() : movie.releaseDate.getFullYear()) : 'N/A'})</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Actors; 