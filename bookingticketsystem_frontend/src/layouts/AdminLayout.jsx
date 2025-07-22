import React, { useState, useRef, useEffect } from "react";
import { Layout, Menu, Avatar, Button } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  VideoCameraOutlined,
  TagsOutlined,
  TeamOutlined,
  CalendarOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  EnvironmentOutlined,
  BankOutlined,
  HomeOutlined,
  CreditCardOutlined,
  MessageOutlined,
  OrderedListOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/admin.css";

const { Sider, Content, Header } = Layout;

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 60;

const menuItems = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard", link: "/admin" },
  { key: "users", icon: <UserOutlined />, label: "Quản lý người dùng", link: "/admin/users" },
  { key: "movies", icon: <VideoCameraOutlined />, label: "Quản lý phim", link: "/admin/movies" },
  { key: "genres", icon: <TagsOutlined />, label: "Quản lý thể loại", link: "/admin/genres" },
  { key: "cities", icon: <EnvironmentOutlined />, label: "Quản lý thành phố", link: "/admin/cities" },
  { key: "actors", icon: <TeamOutlined />, label: "Quản lý diễn viên", link: "/admin/actors" },
  { key: "cinemas", icon: <BankOutlined />, label: "Quản lý rạp chiếu", link: "/admin/cinemas" },
  { key: "cinemahalls", icon: <HomeOutlined />, label: "Quản lý phòng chiếu", link: "/admin/cinemahalls" },
  { key: "showtimes", icon: <CalendarOutlined />, label: "Quản lý suất chiếu", link: "/admin/showtimes" },
  { key: "bookings", icon: <OrderedListOutlined />, label: "Quản lý đặt vé", link: "/admin/bookings" },
  { key: "payments", icon: <CreditCardOutlined />, label: "Quản lý thanh toán", link: "/admin/payments" },
  // { key: "comments", icon: <MessageOutlined />, label: "Quản lý bình luận", link: "/admin/comments" },
  { key: "seats", icon: <OrderedListOutlined />, label: "Quản lý ghế ngồi", link: "/admin/seats" },
  // { key: "votes", icon: <StarOutlined />, label: "Quản lý đánh giá", link: "/admin/votes" },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const selectedKey = location.pathname.split("/")[2] || "dashboard";
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };
  const toggleSidebar = () => setCollapsed((prev) => !prev);

  // Tính toán margin-left động cho header và content
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  // Ref và log chiều rộng
  const contentRef = useRef();
  useEffect(() => {
    if (contentRef.current) {
      console.log("Chiều rộng sidebar:", sidebarWidth, "px");
      console.log("Chiều rộng body (content):", contentRef.current.offsetWidth, "px");
      console.log("Chiều rộng màn hình (viewport):", window.innerWidth, "px");
    }
  }, [sidebarWidth, collapsed]);

  return (
    <Layout>
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="admin-sidebar"
        style={{ background: "#001529", left: 0, top: 0, bottom: 0, height: "100vh", overflowY: 'auto' }}
        trigger={null}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0 0 0' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: 22, color: '#fff' }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            height: 48,
            marginBottom: 8,
            fontSize: 28,
            color: '#fff',
            width: '100%',
            paddingLeft: collapsed ? 0 : 18,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontSize: 28, marginRight: collapsed ? 0 : 12 }}>🎬</span>
          {!collapsed && <span style={{ fontSize: 22 }}>Admin Panel</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ fontSize: 16 }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.link}>
                {!collapsed && item.label}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Header
          className="admin-header"
          style={{
            background: "#fff",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            boxShadow: "0 2px 8px #eee",
            height: 64,
            position: "fixed",
            top: 0,
            left: sidebarWidth,
            right: 0,
            zIndex: 1001,
            width: `calc(100% - ${sidebarWidth}px)`
          }}
        >
          <Avatar style={{ backgroundColor: "#faad14", marginRight: 12 }} icon={<UserOutlined />} />
          <span style={{ fontWeight: 600, marginRight: 24 }}>{user?.name || "Admin"}</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>Đăng xuất</Button>
        </Header>
        <Content
          className="admin-content"
          style={{
            marginTop: 64,
            marginLeft: sidebarWidth,
            background: "#f5f6fa",
            minHeight: "100vh",
            width: `calc(100vw - ${sidebarWidth}px)`,
            padding: "32px 32px 0 32px",
            transition: "margin-left 0.2s"
          }}
          ref={contentRef}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 