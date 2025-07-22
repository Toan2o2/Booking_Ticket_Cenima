import React, { useState, useEffect } from "react";
import { Typography, Form, Input, Button, message, Space } from "antd";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";

const { Title } = Typography;

const ProfileInfo = () => {
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({ name: user.name, phone: user.phone, email: user.email });
    }
  }, [user, editing, form]);

  if (!user) return null;

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await userService.update(user.email, {
        Name: values.name,
        Phone: values.phone
      });
      setUser({ ...user, name: values.name, phone: values.phone });
      message.success("Cập nhật thông tin thành công!");
      setEditing(false);
    } catch (error) {
      message.error("Cập nhật thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
    <Title level={3}>Thông tin tài khoản</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        disabled={loading}
      >
        <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}> 
          <Input disabled={!editing} />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone">
          <Input disabled={!editing} />
        </Form.Item>
        {editing ? (
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>Lưu</Button>
            <Button onClick={() => { setEditing(false); form.setFieldsValue({ name: user.name, phone: user.phone }); }}>Hủy</Button>
          </Space>
        ) : (
          <Button
            type="primary"
            onClick={() => setEditing(true)}
          >
            Chỉnh sửa
          </Button>
        )}
      </Form>
  </div>
);
};

export default ProfileInfo; 