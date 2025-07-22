import React from "react";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth";
import { useAuth } from "../../hooks/useAuth";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const { Title } = Typography;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const onFinish = async (values) => {
    try {
      const res = await authService.signIn({ email: values.email, password: values.password });
      // Nếu có message và không có token => lỗi nghiệp vụ
      if (res && res.message && !res.data) {
        message.error(res.message);
        return;
      }
      // Nếu có token (res.data) => thành công
      if (res && res.data) {
        const decoded = jwtDecode(res.data);
        console.log('Decoded JWT:', decoded);
        
        const userInfo = {
          ...decoded,
          // Map user ID từ các claim có thể có
          userId: decoded.nameid || decoded.sub || decoded.NameIdentifier || decoded.userId,
          token: res.data
        };
        
        console.log('User info after mapping:', userInfo);
        login(userInfo);
        message.success("Đăng nhập thành công!");
        setTimeout(() => {
          if (userInfo.role?.toLowerCase() === "admin") navigate("/admin");
          else if (redirect) navigate(redirect);
          else navigate("/");
        }, 1000);
        return;
      }
      // Trường hợp khác (không xác định)
      message.error("Email hoặc mật khẩu không đúng!");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Email hoặc mật khẩu không đúng!";
      message.error(msg);
    }
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await authService.loginWithGoogle(idToken);
      if (res && res.data) {
        const decoded = jwtDecode(res.data);
        console.log('Decoded Google JWT:', decoded);
        
        const userInfo = {
          ...decoded,
          // Map user ID từ các claim có thể có
          userId: decoded.nameid || decoded.sub || decoded.NameIdentifier || decoded.userId,
          token: res.data
        };
        
        console.log('Google user info after mapping:', userInfo);
        login(userInfo);
        message.success("Đăng nhập Google thành công!");
        setTimeout(() => {
          if (userInfo.role?.toLowerCase() === "admin") navigate("/admin");
          else if (redirect) navigate(redirect);
          else navigate("/");
        }, 1000);
      } else {
        message.error(res.message || "Đăng nhập Google thất bại!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Đăng nhập Google thất bại!";
      message.error(msg);
    }
  };

  // Xử lý đăng nhập Google thất bại
  const handleGoogleError = () => {
    message.error("Đăng nhập Google thất bại!");
  };

  return (
    <Card style={{ maxWidth: 400, margin: "40px auto" }}>
      <Title level={3} style={{ textAlign: "center" }}>Đăng nhập</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Đăng nhập</Button>
        </Form.Item>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <div style={{ textAlign: "center" }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </Form>
      <Divider>Hoặc</Divider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="100%"
            locale="vi"
            text="signin_with"
            shape="rectangular"
            theme="outline"
          />
        </div>
      </GoogleOAuthProvider>
      <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
        <b>Tài khoản demo:</b><br/>
        User: user@gmail.com / 123456<br/>
        Admin: admin@gmail.com / 123456
      </div>
    </Card>
  );
};

export default Login; 