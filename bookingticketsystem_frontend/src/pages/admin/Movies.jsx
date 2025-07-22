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
  Select,
  InputNumber,
  Row,
  Col,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import movieService from '../../services/movieService';
import genreService from '../../services/genreService';
import personService from '../../services/personService';
import { Movie } from '../../models/Movie';
import Toast from '../../components/Toast';
import '../../styles/admin.css';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState(null);
  const [form] = Form.useForm();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailMovie, setDetailMovie] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [moviesData, genresData, personsData] = await Promise.all([
        movieService.getAll(),
        genreService.getAll(),
        personService.getAll(),
      ]);
      
      setMovies(moviesData);
      setGenres(genresData);
      setPersons(personsData);
    } catch (error) {
      Toast.error('Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMovie(null);
    setPosterFile(null);
    setPosterPreviewUrl(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingMovie(record);
    setPosterFile(null);
    setPosterPreviewUrl(record.posterUrl || null);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      duration: record.duration,
      language: record.language,
      releaseDate: record.releaseDate ? dayjs(record.releaseDate) : null,
      trailerUrl: record.trailerUrl,
      rating: record.rating,
      genreIds: (record.Genres?.map(g => g.genreId).filter(id => id !== null && id !== undefined)) || [],
      actorIds: (record.Actors?.map(a => a.personId).filter(id => id !== null && id !== undefined)) || [],
      directorIds: (record.Directors?.map(d => d.personId).filter(id => id !== null && id !== undefined)) || []
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      Toast.error('ID không hợp lệ');
      return;
    }
    try {
      await movieService.delete(id);
      Toast.success('Xóa phim thành công');
      loadData(); // Reload lại danh sách từ backend
    } catch (error) {
      Toast.error('Không thể xóa phim: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const movieData = new Movie({
        ...values,
        releaseDate: values.releaseDate ? values.releaseDate.toISOString().split('T')[0] : null,
        Genres: values.genreIds?.map(id => genres.find(g => g.genreId === id)) || [],
        Actors: values.actorIds?.map(id => persons.find(a => a.personId === id)) || [],
        Directors: values.directorIds?.map(id => persons.find(d => d.personId === id)) || []
      });
      
      if (editingMovie) {
        await movieService.update(editingMovie.movieId, movieData, posterFile);
        Toast.success('Cập nhật phim thành công');
      } else {
        await movieService.create(movieData, posterFile);
        Toast.success('Thêm phim thành công');
      }
      
      setModalVisible(false);
      loadData(); // Reload lại danh sách từ backend
    } catch (error) {
      Toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  const handlePosterChange = (info) => {
    console.log('Poster change info:', info);
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      console.log('Selected file:', file);
      if (file) {
        setPosterFile(file);
        // Tạo URL preview
        const previewUrl = URL.createObjectURL(file);
        console.log('Preview URL:', previewUrl);
        setPosterPreviewUrl(previewUrl);
      }
    }
  };

  // Cleanup URL khi component unmount
  useEffect(() => {
    return () => {
      if (posterPreviewUrl) {
        URL.revokeObjectURL(posterPreviewUrl);
      }
    };
  }, [posterPreviewUrl]);

  const handleViewDetail = (record) => {
    setDetailMovie(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'movieId',
      key: 'movieId',
      width: 80,
    },
    {
      title: 'Poster',
      dataIndex: 'posterUrl',
      key: 'posterUrl',
      width: 100,
      render: (url) => (
        <Image
          width={60}
          height={80}
          src={url || '/placeholder-movie.png'}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Tên phim',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => `${duration} phút`,
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'language',
      key: 'language',
      width: 100,
    },
    {
      title: 'Thể loại',
      dataIndex: 'genres',
      key: 'genres',
      width: 150,
      render: (genres) => (
        <div>
          {genres?.map((genre, idx) => (
            <Tag key={idx} color="blue">{genre.name}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Điểm đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => rating ? `${rating}/10` : '-',
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
            title="Bạn có chắc chắn muốn xóa phim này?"
            onConfirm={() => handleDelete(record.movieId)}
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
          <Title level={3}>Quản lý phim</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm phim
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={movies.map((item, idx) => ({ ...item, key: item.movieId ?? `row-${idx}` }))}
          rowKey="movieId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phim`,
          }}
          scroll={{ x: 'max-content' }}
        />

        <Modal
          title={editingMovie ? 'Sửa phim' : 'Thêm phim mới'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          destroyOnHidden
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Tên phim"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên phim!' },
                    { min: 2, message: 'Tên phim phải có ít nhất 2 ký tự!' }
                  ]}
                >
                  <Input placeholder="Nhập tên phim" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="language"
                  label="Ngôn ngữ"
                  rules={[
                    { required: true, message: 'Vui lòng nhập ngôn ngữ!' }
                  ]}
                >
                  <Input placeholder="Nhập ngôn ngữ" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="duration"
                  label="Thời lượng (phút)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập thời lượng!' },
                    { type: 'number', min: 1, message: 'Thời lượng phải lớn hơn 0!' }
                  ]}
                >
                  <InputNumber 
                    placeholder="Nhập thời lượng" 
                    style={{ width: '100%' }}
                    min={1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="rating"
                  label="Điểm đánh giá"
                  rules={[
                    { type: 'number', min: 0, max: 10, message: 'Điểm từ 0-10!' }
                  ]}
                >
                  <InputNumber 
                    placeholder="Nhập điểm (0-10)" 
                    style={{ width: '100%' }}
                    min={0}
                    max={10}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="releaseDate"
                  label="Ngày phát hành"
                >
                  <DatePicker 
                    placeholder="Chọn ngày phát hành" 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="trailerUrl"
                  label="Link trailer"
                >
                  <Input placeholder="Nhập link trailer (YouTube)" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả!' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Nhập mô tả phim"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="genreIds"
                  label="Thể loại"
                  rules={[
                    { required: true, message: 'Vui lòng chọn thể loại!' }
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn thể loại"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {genres.filter(g => g.genreId !== null && g.genreId !== undefined).map((genre, idx) => (
                      <Option key={genre.genreId} value={genre.genreId}>{genre.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="actorIds"
                  label="Diễn viên"
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn diễn viên"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {persons.filter(a => a.personId !== null && a.personId !== undefined).map((person, idx) => (
                      <Option key={person.personId} value={person.personId}>{person.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="directorIds"
                  label="Đạo diễn"
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn đạo diễn"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {persons.filter(d => d.personId !== null && d.personId !== undefined).map((person, idx) => (
                      <Option key={person.personId} value={person.personId}>{person.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Poster phim"
            >
              <Upload
                name="poster"
                listType="picture-card"
                className="poster-uploader"
                showUploadList={false}
                beforeUpload={(file) => {
                  // Ngăn upload tự động
                  return false;
                }}
                onChange={handlePosterChange}
                accept="image/*"
              >
                {posterPreviewUrl ? (
                  <img 
                    src={posterPreviewUrl} 
                    alt="poster preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : editingMovie?.posterUrl ? (
                  <img 
                    src={editingMovie.posterUrl} 
                    alt="current poster" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải poster</div>
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
                  {editingMovie ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={detailMovie ? `Chi tiết phim: ${detailMovie.title}` : 'Chi tiết phim'}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          destroyOnHidden
          width={700}
        >
          {detailMovie && (
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <Image
                  width={180}
                  height={240}
                  src={detailMovie.posterUrl || '/placeholder-movie.png'}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                  alt={detailMovie.title}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h2>{detailMovie.title}</h2>
                <p><b>Mô tả:</b> {detailMovie.description}</p>
                <p><b>Thời lượng:</b> {detailMovie.duration} phút</p>
                <p><b>Ngôn ngữ:</b> {detailMovie.language}</p>
                <p><b>Ngày phát hành:</b> {detailMovie.releaseDate ? (typeof detailMovie.releaseDate === 'string' ? new Date(detailMovie.releaseDate).toLocaleDateString('vi-VN') : detailMovie.releaseDate.toLocaleDateString('vi-VN')) : '-'}</p>
                <p><b>Điểm đánh giá:</b> {detailMovie.rating ? `${detailMovie.rating}/10` : '-'}</p>
                <p><b>Thể loại:</b> {detailMovie.Genres?.map((g, idx) => <Tag key={idx}>{g.name}</Tag>)}</p>
                <p><b>Diễn viên:</b> {detailMovie.Actors?.map((a, idx) => <Tag key={idx}>{a.name}</Tag>)}</p>
                <p><b>Đạo diễn:</b> {detailMovie.Directors?.map((d, idx) => <Tag key={idx}>{d.name}</Tag>)}</p>
                {detailMovie.trailerUrl && (
                  <p><b>Trailer:</b> <a href={detailMovie.trailerUrl} target="_blank" rel="noopener noreferrer">Xem trailer</a></p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Movies; 