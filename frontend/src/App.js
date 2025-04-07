import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import HostelDashboard from './pages/HostelDashboard';
import Dashboard from './pages/Dashboard';
import ManageHostels from './pages/ManageHostels';
import ManageRooms from './pages/ManageRooms';
import Bookings from './pages/Bookings';
import Students from './pages/ManageStudents';
import Feedback from './pages/Feedback';
import Index from "./pages/index";
import Navbar from "./components/Navbar";
import Hostels from "./pages/Hostels";
import HostelDetail from "./pages/HostelDetail";
import ManageHostelDetail from './pages/ManageHostelDetail';
import ManageFloorsRoomsDetail from './pages/ManageFloorsRoomsDetail';
import ProfileSettings from './pages/ProfileSettings';
import HostelOwnerChat from './pages/HostelOwnerChat';
import RoomDetail from "./pages/RoomDetail";
import KhaltiVerify from "./pages/KhaltiVerfiy";
import MyBookings from "./pages/MyBookings"; 
import StudentBookingDetail from './pages/StudentBookingDetail';
import StudentProfileSettings from "./pages/StudentProfileSettings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsers from './pages/Admin/ManageUsers';
import AdminMessages from "./pages/Admin/AdminMessages";
import AdminManageHostels from './pages/Admin/AdminHostel';
import AdminFeedback from './pages/Admin/AdminFeedback';
import AdminTransactions from "./pages/Admin/AdminTransactions";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminBlog from "./pages/Admin/AdminBlog";
import AdminAboutUs from "./pages/Admin/AdminAboutUs";

// Inside your App component
<Routes>
  {/* existing routes */}
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
</Routes>

// Protect routes based on user roles
const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem('role');
  return userRole === role ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hostel-dashboard" element={<ProtectedRoute role="HostelOwner"><HostelDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute role="HostelOwner"><Dashboard /></ProtectedRoute>} />
        <Route path="/manage-hostels" element={<ProtectedRoute role="HostelOwner"><ManageHostels /></ProtectedRoute>} />
        <Route path="/manage-rooms" element={<ProtectedRoute role="HostelOwner"><ManageRooms /></ProtectedRoute>}  />
        <Route path="/bookings" element={<ProtectedRoute role="HostelOwner"><Bookings /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute role="HostelOwner"><Students /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute role="HostelOwner"><Feedback /></ProtectedRoute>} />
        <Route path="/hostels" element={<Hostels />} />
        <Route path="/hostel/:id" element={<HostelDetail />} />
        <Route path="/manage-hostels/:id" element={<ManageHostelDetail />} />
        <Route path="/manage-rooms/:id" element={<ProtectedRoute role="HostelOwner"><ManageFloorsRoomsDetail /></ProtectedRoute>} />
        <Route path="/" element={<Index />} />
        <Route path="/profile-settings" element={<ProtectedRoute role="HostelOwner"><ProfileSettings /></ProtectedRoute>} />
        <Route path="/room/:id" element={<RoomDetail />} />
        <Route path="/khalti/verify" element={<KhaltiVerify />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/student/bookings/:id" element={<StudentBookingDetail />} />
        <Route path="/student/profile-settings" element={<StudentProfileSettings />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin/blogs" element={<AdminBlog />} />
        
<Route path="/admin/about-us" element={<AdminAboutUs />} />
        <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute role="Admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route path="/admin/settings" element={<AdminSettings />} />
<Route
  path="/admin/transactions"
  element={
    <ProtectedRoute role="Admin">
      <AdminTransactions />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/messages"
  element={<ProtectedRoute role="Admin"><AdminMessages /></ProtectedRoute>}
/>
<Route
  path="/admin/users"
  element={
    <ProtectedRoute role="Admin">
      <ManageUsers />
    </ProtectedRoute>
  }
/>
<Route path="/admin/hostels" element={<ProtectedRoute role="Admin"><AdminManageHostels /></ProtectedRoute>} />
<Route
  path="/admin/feedback"
  element={
    <ProtectedRoute role="Admin">
      <AdminFeedback />
    </ProtectedRoute>
  }
/>





        <Route
  path="/chat/:hostelId/:receiverId"
  element={
    <ProtectedRoute role="HostelOwner">
      <HostelOwnerChat />
    </ProtectedRoute>
  }
/>


      </Routes>
    </Router>
  );
}

export default App;
