import React from "react";
import { Layout } from "antd";
import AppHeader from "../components/Header";
import AppFooter from "../components/Footer";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const UserLayout = () => (
  <Layout style={{ minHeight: "100vh" }}>
    <AppHeader />
    <Content style={{ padding: "24px 8px", background: "#fff", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <Outlet />
    </Content>
    <AppFooter />
  </Layout>
);

export default UserLayout; 