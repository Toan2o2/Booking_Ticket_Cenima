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
  message,
  Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import genreService from '../../services/genreService';
import movieService from '../../services/movieService';
import { Genre } from '../../models/Genre';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;
const { Option } = Select;

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailGenre, setDetailGenre] = useState(null);
  const [moviesByGenre, setMoviesByGenre] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    setLoading(true);
    try {
      const data = await genreService.getAll();
      setGenres(data);
    } catch (error) {
      Toast.error('Không thể tải danh sách thể loại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGenre(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingGenre(record);
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
      await genreService.delete(id);
      Toast.success('Xóa thể loại thành công');
      loadGenres();
    } catch (error) {
      Toast.error('Không thể xóa thể loại: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const genreData = new Genre(values);
      
      if (editingGenre) {
        await genreService.update(editingGenre.genreId, genreData);
        Toast.success('Cập nhật thể loại thành công');
      } else {
        await genreService.create(genreData);
        Toast.success('Thêm thể loại thành công');
      }
      
      setModalVisible(false);
      loadGenres();
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handleViewDetail = async (record) => {
    console.log('Chi tiết genre:', record);
    setDetailGenre(record);
    setDetailVisible(true);
    setLoadingDetail(true);
    if (record.genreId !== null && record.genreId !== undefined) {
      try {
        const movies = await movieService.getByGenre(record.genreId);
        setMoviesByGenre(movies);
      } catch (error) {
        setMoviesByGenre([]);
      }
    } else {
      setMoviesByGenre([]);
    }
    setLoadingDetail(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'genreId',
      key: 'genreId',
      width: 80,
    },
    {
      title: 'Tên thể loại',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
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
            title="Bạn có chắc chắn muốn xóa thể loại này?"
            onConfirm={() => handleDelete(record.genreId)}
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
          <Title level={3}>Quản lý thể loại phim</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm thể loại
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={genres.map((item, idx) => ({ ...item, key: item.genreId ?? `row-${idx}` }))}
          rowKey="genreId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thể loại`,
          }}
          scroll={{ x: 'max-content' }}
        />

        <Modal
          title={editingGenre ? 'Sửa thể loại' : 'Thêm thể loại mới'}
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
              label="Tên thể loại"
              rules={[
                { required: true, message: 'Vui lòng nhập tên thể loại!' },
                { min: 2, message: 'Tên thể loại phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tên thể loại" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingGenre ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={detailGenre ? `Chi tiết thể loại: ${detailGenre.name}` : 'Chi tiết thể loại'}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          destroyOnHidden
          width={600}
        >
          {detailGenre && (
            <div>
              <h2>{detailGenre.name}</h2>
              <p><b>ID:</b> {detailGenre.genreId}</p>
              <p><b>Ngày tạo:</b> {detailGenre.createdAt ? new Date(detailGenre.createdAt).toLocaleDateString('vi-VN') : '-'}</p>
              <h3 style={{ marginTop: 24 }}>Danh sách phim thuộc thể loại này:</h3>
              {loadingDetail ? (
                <p>Đang tải...</p>
              ) : moviesByGenre.length === 0 ? (
                <p>Không có phim nào thuộc thể loại này.</p>
              ) : (
                <ul>
                  {moviesByGenre.map((movie, idx) => (
                    <li key={idx}><b>{movie.title}</b> ({movie.releaseDate ? (typeof movie.releaseDate === 'string' ? new Date(movie.releaseDate).getFullYear() : movie.releaseDate.getFullYear()) : 'N/A'})</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Genres; 