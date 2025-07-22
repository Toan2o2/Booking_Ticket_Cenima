import React from "react";
import { Layout, Row, Col } from "antd";

const { Footer } = Layout;

const AppFooter = () => (
  <Footer style={{ background: "#001529", color: "#fff", padding: "32px 0" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>🎬 MovieTicket</div>
          <div>Đặt vé xem phim online nhanh chóng, tiện lợi, an toàn.</div>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ fontWeight: 600 }}>Liên hệ</div>
          <div>Email: support@movieticket.vn</div>
          <div>Hotline: 0123 456 789</div>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ fontWeight: 600 }}>Kết nối với chúng tôi</div>
          <div>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", marginRight: 12 }}>Facebook</a>
            <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", marginRight: 12 }}>Zalo</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}>YouTube</a>
          </div>
        </Col>
      </Row>
      <div style={{ textAlign: "center", marginTop: 24, color: "#aaa" }}>
        © {new Date().getFullYear()} MovieTicket. All rights reserved.
      </div>
    </div>
  </Footer>
);

export default AppFooter; 