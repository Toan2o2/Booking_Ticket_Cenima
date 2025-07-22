import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  InputNumber,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  StarFilled,
} from "@ant-design/icons";
import { voteService } from "../../services";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Votes = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVote, setEditingVote] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchVotes();
    fetchStats();
  }, []);

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const response = await voteService.getAllVotes();
      setVotes(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách đánh giá");
      console.error("Error fetching votes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await voteService.getVoteStats();
      setStats(response.data || {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        averageRating: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreate = () => {
    setEditingVote(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingVote(record);
    form.setFieldsValue({
      userId: record.userId,
      movieId: record.movieId,
      rating: record.rating,
      comment: record.comment,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await voteService.deleteVote(id);
      message.success("Xóa đánh giá thành công");
      fetchVotes();
      fetchStats();
    } catch (error) {
      message.error("Lỗi khi xóa đánh giá");
      console.error("Error deleting vote:", error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingVote) {
        await voteService.updateVote(editingVote.id, values);
        message.success("Cập nhật đánh giá thành công");
      } else {
        await voteService.createVote(values);
        message.success("Tạo đánh giá thành công");
      }
      setModalVisible(false);
      fetchVotes();
      fetchStats();
    } catch (error) {
      message.error("Lỗi khi lưu đánh giá");
      console.error("Error saving vote:", error);
    }
  };

  const handleModerate = async (id, status) => {
    try {
      await voteService.moderateVote(id, { status });
      message.success("Cập nhật trạng thái thành công");
      fetchVotes();
      fetchStats();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
      console.error("Error moderating vote:", error);
    }
  };

  const getFilteredVotes = () => {
    let filtered = votes;

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      filtered = filtered.filter(
        (vote) =>
          vote.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          vote.movie?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          vote.comment?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (filterStatus !== "all") {
      filtered = filtered.filter((vote) => vote.status === filterStatus);
    }

    // Lọc theo rating
    if (filterRating !== "all") {
      const rating = parseInt(filterRating);
      filtered = filtered.filter((vote) => vote.rating === rating);
    }

    // Lọc theo ngày
    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");
      filtered = filtered.filter((vote) => {
        const voteDate = new Date(vote.createdAt);
        return voteDate >= startDate && voteDate <= endDate;
      });
    }

    return filtered;
  };

  const renderStars = (rating) => {
    return (
      <Space>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarFilled
            key={star}
            style={{
              color: star <= rating ? "#faad14" : "#d9d9d9",
              fontSize: "14px",
            }}
          />
        ))}
        <span>({rating}/5)</span>
      </Space>
    );
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "orange", text: "Chờ duyệt" },
      approved: { color: "green", text: "Đã duyệt" },
      rejected: { color: "red", text: "Từ chối" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Người dùng",
      dataIndex: ["user", "name"],
      key: "userName",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: "#666" }}>{record.user?.email}</small>
        </div>
      ),
    },
    {
      title: "Phim",
      dataIndex: ["movie", "title"],
      key: "movieTitle",
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => renderStars(rating),
    },
    {
      title: "Bình luận",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => handleModerate(record.id, "approved")}
                  style={{ backgroundColor: "#52c41a" }}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleModerate(record.id, "rejected")}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đánh giá này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2>Quản lý đánh giá</h2>
        <p>Quản lý các đánh giá và bình luận của người dùng về phim</p>
      </div>

      {/* Thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Tổng đánh giá"
              value={stats.total}
              prefix={<StarFilled />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Điểm TB"
              value={stats.averageRating}
              precision={1}
              prefix={<StarFilled />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc và tìm kiếm */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm theo tên, phim, bình luận..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Đánh giá"
              value={filterRating}
              onChange={setFilterRating}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="1">1 sao</Option>
              <Option value="2">2 sao</Option>
              <Option value="3">3 sao</Option>
              <Option value="4">4 sao</Option>
              <Option value="5">5 sao</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange}
              onChange={setDateRange}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ width: "100%" }}
            >
              Thêm đánh giá
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={getFilteredVotes()}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đánh giá`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingVote ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="userId"
            label="Người dùng"
            rules={[{ required: true, message: "Vui lòng chọn người dùng" }]}
          >
            <Select placeholder="Chọn người dùng">
              {/* Cần load danh sách user từ API */}
              <Option value={1}>User 1</Option>
              <Option value={2}>User 2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="movieId"
            label="Phim"
            rules={[{ required: true, message: "Vui lòng chọn phim" }]}
          >
            <Select placeholder="Chọn phim">
              {/* Cần load danh sách movie từ API */}
              <Option value={1}>Movie 1</Option>
              <Option value={2}>Movie 2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: "Vui lòng nhập đánh giá" }]}
          >
            <InputNumber
              min={1}
              max={5}
              placeholder="Nhập đánh giá (1-5)"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Bình luận"
            rules={[{ required: true, message: "Vui lòng nhập bình luận" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập bình luận"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVote ? "Cập nhật" : "Thêm mới"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Votes; 