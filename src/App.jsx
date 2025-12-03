import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Payment from './pages/Payment';
import MyCourses from './pages/MyCourses';
import Player from './pages/Player';
import Devoir from './pages/Devoir';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminGuard from './pages/admin/AdminGuard';
import AdminCourses from './pages/admin/Courses';
import AdminUsers from './pages/admin/Users';
import Chapters from './pages/admin/Chapters';
import Videos from './pages/admin/Videos';
import Quiz from './pages/Quiz'; 
import Payments from './pages/admin/Payments';
import Enrollments from './pages/admin/Enrollments';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import { useLocation, useNavigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/payment/:id" element={<Payment />} />
      <Route path="/my-courses" element={<MyCourses key={location.key} />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/player/:id" element={<Player />} />
      <Route path="/devoir/:id" element={<Devoir />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="chapters" element={<Chapters />} />
          <Route path="videos" element={<Videos />} />
          <Route path="quiz" element={<Quiz />} /> 
          <Route path="payments" element={<Payments />} />
          <Route path="enrollments" element={<Enrollments />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;