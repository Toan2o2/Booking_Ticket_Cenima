import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "../pages/common/Home";
import MovieDetail from "../pages/common/MovieDetail";
import Login from "../pages/common/Login";
import Register from "../pages/common/Register";
import Booking from "../pages/user/Booking";
import Profile from "../pages/user/Profile";
import FavoriteMovies from "../pages/user/FavoriteMovies";
import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Movies from "../pages/admin/Movies";
import Genres from "../pages/admin/Genres";
import Actors from "../pages/admin/Actors";
import Showtimes from "../pages/admin/Showtimes";
import Cities from "../pages/admin/Cities";
import Cinemas from "../pages/admin/Cinemas";
import CinemaHalls from "../pages/admin/CinemaHalls";
import Bookings from "../pages/admin/Bookings";
import Payments from "../pages/admin/Payments";
import Comments from "../pages/admin/Comments";
import Seats from "../pages/admin/Seats";
import Votes from "../pages/admin/Votes";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import ForgotPassword from "../pages/common/ForgotPassword";
import BookingHistory from "../pages/user/BookingHistory";
import AllMovies from "../pages/common/AllMovies";
// Các page khác sẽ thêm sau

const getUser = () => {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
};

const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!user || user.role?.toLowerCase() !== "admin") return <Navigate to="/login" />;
  return children;
};

const PrivateRoute = ({ children }) => {
  const user = getUser();
  const location = useLocation();
  if (!user || user.role?.toLowerCase() !== "customer") {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Common/guest routes dùng UserLayout */}
    <Route element={<UserLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/movies/:id" element={<MovieDetail />} />
      {/* Redirect từ /movie/ sang /movies/ để tương thích ngược */}
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="/movies" element={<AllMovies />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* User routes */}
      <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/favorites" element={<PrivateRoute><FavoriteMovies /></PrivateRoute>} />
      <Route path="/booking-history" element={<PrivateRoute><BookingHistory /></PrivateRoute>} />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
    {/* Admin routes dùng AdminLayout riêng */}
    <Route path="/admin" element={<AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>} />
    <Route path="/admin/users" element={<AdminRoute><AdminLayout><Users /></AdminLayout></AdminRoute>} />
    <Route path="/admin/movies" element={<AdminRoute><AdminLayout><Movies /></AdminLayout></AdminRoute>} />
    <Route path="/admin/genres" element={<AdminRoute><AdminLayout><Genres /></AdminLayout></AdminRoute>} />
    <Route path="/admin/actors" element={<AdminRoute><AdminLayout><Actors /></AdminLayout></AdminRoute>} />
    <Route path="/admin/cities" element={<AdminRoute><AdminLayout><Cities /></AdminLayout></AdminRoute>} />
    <Route path="/admin/cinemas" element={<AdminRoute><AdminLayout><Cinemas /></AdminLayout></AdminRoute>} />
    <Route path="/admin/cinemahalls" element={<AdminRoute><AdminLayout><CinemaHalls /></AdminLayout></AdminRoute>} />
    <Route path="/admin/showtimes" element={<AdminRoute><AdminLayout><Showtimes /></AdminLayout></AdminRoute>} />
    <Route path="/admin/bookings" element={<AdminRoute><AdminLayout><Bookings /></AdminLayout></AdminRoute>} />
    <Route path="/admin/payments" element={<AdminRoute><AdminLayout><Payments /></AdminLayout></AdminRoute>} />
    <Route path="/admin/comments" element={<AdminRoute><AdminLayout><Comments /></AdminLayout></AdminRoute>} />
    <Route path="/admin/seats" element={<AdminRoute><AdminLayout><Seats /></AdminLayout></AdminRoute>} />
    <Route path="/admin/votes" element={<AdminRoute><AdminLayout><Votes /></AdminLayout></AdminRoute>} />
  </Routes>
);

export default AppRoutes; 