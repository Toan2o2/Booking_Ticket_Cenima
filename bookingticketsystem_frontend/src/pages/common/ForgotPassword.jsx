import React, { useState, useRef } from "react";
import { Card, Form, Input, Button, Typography, message, Alert } from "antd";
import authService from "../../services/auth";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const OTP_EXPIRE_SECONDS = 180; // 3 phút

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef();
  const navigate = useNavigate();

  // Gửi OTP
  const handleSendOtp = async (values) => {
    try {
      const res = await authService.sendOtp(values.email);
      setEmail(values.email);
      setStep(2);
      setCountdown(OTP_EXPIRE_SECONDS);
      message.success("Đã gửi mã OTP về email!");
      // Bắt đầu đếm ngược
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Gửi OTP thất bại!";
      message.error(msg);
    }
  };

  // Đổi mật khẩu
  const handleResetPassword = async (values) => {
    if (countdown === 0) {
      message.error("Mã OTP đã hết hạn. Vui lòng gửi lại!");
      return;
    }
    if (values.otp !== otp) {
      message.error("Mã OTP không đúng!");
      return;
    }
    try {
      const res = await authService.resetPassword({
        email,
        password: values.password,
        confirmPassword: values.confirmPassword
      });
      const msg = res?.Message || res?.message || "";
      if (msg.toLowerCase().includes("password updated successfully")) {
        message.success("Đổi mật khẩu thành công! Đăng nhập lại.");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        message.error(msg || "Đổi mật khẩu thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Đổi mật khẩu thất bại!";
      message.error(msg);
    }
  };

  // Nhận OTP từ email gửi về (giả lập, thực tế nên nhập thủ công)
  const handleOtpInput = (e) => {
    setOtp(e.target.value);
  };

  // Hiển thị đếm ngược
  const renderCountdown = () => {
    if (countdown > 0) {
      const m = Math.floor(countdown / 60);
      const s = countdown % 60;
      return (
        <Alert type="info" showIcon message={`Mã OTP sẽ hết hạn sau ${m}:${s.toString().padStart(2, "0")}`} style={{ marginBottom: 16 }} />
      );
    }
    if (step === 2) {
      return <Alert type="error" showIcon message="Mã OTP đã hết hạn. Vui lòng gửi lại!" style={{ marginBottom: 16 }} />;
    }
    return null;
  };

  return (
    <Card style={{ maxWidth: 400, margin: "40px auto" }}>
      <Title level={3} style={{ textAlign: "center" }}>Quên mật khẩu</Title>
      {step === 1 && (
        <Form layout="vertical" onFinish={handleSendOtp}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}
          >
            <Input placeholder="Nhập email đã đăng ký" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Gửi mã OTP</Button>
          </Form.Item>
        </Form>
      )}
      {step === 2 && (
        <Form layout="vertical" onFinish={handleResetPassword}>
          {renderCountdown()}
          <Form.Item
            label="Mã OTP"
            name="otp"
            rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
          >
            <Input placeholder="Nhập mã OTP" onChange={handleOtpInput} />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={countdown === 0}>Đổi mật khẩu</Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
} 