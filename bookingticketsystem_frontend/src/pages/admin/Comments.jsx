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
  Select,
  DatePicker,
  Input,
  Form
} from 'antd';
import { EyeOutlined, CheckCircleOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import commentService from '../../services/commentService';
import movieService from '../../services/movieService';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailComment, setDetailComment] = useState(null);
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [commentsData, moviesData] = await Promise.all([
        commentService.getAllAdmin(filters),
        movieService.getAll(),
      ]);
      
      setComments(commentsData);
      setMovies(moviesData);
    } catch (error) {
      Toast.error('Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setDetailComment(record);
    setDetailVisible(true);
  };

  const handleApprove = async (commentId) => {
    try {
      await commentService.approve(commentId);
      Toast.success('Duyệt bình luận thành công');
      loadData();
    } catch (error) {
      Toast.error('Không thể duyệt bình luận: ' + error.message);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentService.delete(commentId, null, true);
      Toast.success('Xóa bình luận thành công');
      loadData();
    } catch (error) {
      Toast.error('Không thể xóa bình luận: ' + error.message);
    }
  };

  const handleFilter = (values) => {
    const newFilters = {};
    if (values.movieId) newFilters.movieId = values.movieId;
    if (values.userId) newFilters.userId = values.userId;
    if (values.isApproved !== undefined) newFilters.isApproved = values.isApproved;
    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.fromDate = values.dateRange[0].toISOString();
      newFilters.toDate = values.dateRange[1].toISOString();
    }
    if (values.sort) newFilters.sort = values.sort;
    
    setFilters(newFilters);
    loadData();
  };

  const getStatusColor = (isApproved) => {
    return isApproved ? 'green' : 'orange';
  };

  const getStatusText = (isApproved) => {
    return isApproved ? 'Đã duyệt' : 'Chờ duyệt';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (user) => user ? user.name : '-',
    },
    {
      title: 'Phim',
      dataIndex: 'movie',
      key: 'movie',
      width: 200,
      render: (movie) => movie ? movie.title : '-',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => rating ? `${rating}/5 ⭐` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isApproved',
      key: 'isApproved',
      width: 120,
      render: (isApproved) => (
        <Tag color={getStatusColor(isApproved)}>
          {getStatusText(isApproved)}
        </Tag>
      ),
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
          {!record.isApproved && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record.id)}
              size="small"
            >
              Duyệt
            </Button>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bình luận này?"
            onConfirm={() => handleDelete(record.id)}
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
          <Title level={3}>Quản lý bình luận</Title>
        </div>

        {/* Bộ lọc */}
        <Card style={{ marginBottom: '16px' }}>
          <Form
            form={form}
            layout="inline"
            onFinish={handleFilter}
          >
            <Form.Item name="movieId" label="Phim">
              <Select
                placeholder="Chọn phim"
                style={{ width: 200 }}
                allowClear
              >
                {movies.map(movie => (
                  <Option key={movie.id} value={movie.id}>
                    {movie.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="isApproved" label="Trạng thái">
              <Select
                placeholder="Chọn trạng thái"
                style={{ width: 150 }}
                allowClear
              >
                <Option value={true}>Đã duyệt</Option>
                <Option value={false}>Chờ duyệt</Option>
              </Select>
            </Form.Item>

            <Form.Item name="dateRange" label="Khoảng thời gian">
              <RangePicker format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item name="sort" label="Sắp xếp">
              <Select
                placeholder="Sắp xếp theo"
                style={{ width: 150 }}
                defaultValue="newest"
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="oldest">Cũ nhất</Option>
                <Option value="rating">Đánh giá</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  Lọc
                </Button>
                <Button onClick={() => { form.resetFields(); setFilters({}); loadData(); }}>
                  Xóa lọc
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Table
          columns={columns}
          dataSource={comments.map((item, idx) => ({ ...item, key: item.id ?? `row-${idx}` }))}
          rowKey="key"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bình luận`,
          }}
          scroll={{ x: 1400 }}
        />

        {/* Modal chi tiết bình luận */}
        <Modal
          title="Chi tiết bình luận"
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {detailComment && (
            <div>
              <p><strong>ID bình luận:</strong> {detailComment.id}</p>
              <p><strong>Người dùng:</strong> {detailComment.user?.name || '-'}</p>
              <p><strong>Email:</strong> {detailComment.user?.email || '-'}</p>
              <p><strong>Phim:</strong> {detailComment.movie?.title || '-'}</p>
              <p><strong>Đánh giá:</strong> {detailComment.rating ? `${detailComment.rating}/5 ⭐` : 'Không có'}</p>
              <p><strong>Trạng thái:</strong> <Tag color={getStatusColor(detailComment.isApproved)}>{getStatusText(detailComment.isApproved)}</Tag></p>
              <p><strong>Nội dung:</strong></p>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                marginTop: '8px',
                whiteSpace: 'pre-wrap'
              }}>
                {detailComment.content}
              </div>
              <p style={{ marginTop: '16px' }}><strong>Ngày tạo:</strong> {detailComment.createdAt ? new Date(detailComment.createdAt).toLocaleString('vi-VN') : '-'}</p>
              <p><strong>Cập nhật lần cuối:</strong> {detailComment.updatedAt ? new Date(detailComment.updatedAt).toLocaleString('vi-VN') : '-'}</p>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Comments; 