import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import FloatingAI from "./components/FloatingAI.jsx";
import Planner from "./pages/Planner.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GPA from "./pages/GPA.jsx";
import Profile from "./pages/Profile.jsx";
import Chat from "./pages/Chat.jsx";
import Timetable from "./pages/Timetable.jsx";
import Resources from "./pages/Resources.jsx";
import Goals from "./pages/Goals.jsx";
import Focus from "./pages/Focus.jsx";
import Board from "./pages/Board.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Notifications from "./pages/Notifications.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Growth from "./pages/Growth.jsx";
import IELTS from "./pages/IELTS.jsx";
import German from "./pages/German.jsx";
import Articles from "./pages/Articles.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import CreateCourse from "./pages/CreateCourse.jsx";
import { useAuth } from "./hooks/useAuth.jsx";

// Login talab qiluvchi sahifalar uchun guard
function Protected({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

// Admin sahifalar uchun guard (is_staff tekshiruvi)
function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user?.is_staff && !user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Har bir himoyalangan sahifa uchun qisqartma
function P({ children }) {
  return (
    <Protected>
      <Layout>{children}</Layout>
    </Protected>
  );
}

// Admin sahifalar uchun
function AP({ children }) {
  return (
    <Protected>
      <AdminGuard>
        <Layout>{children}</Layout>
      </AdminGuard>
    </Protected>
  );
}

export default function App() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Auth sahifalarida AI yordamchi ko'rinmasin
  const authPages = ["/login", "/register", "/password-reset", "/"];
  const showAI = isLoggedIn && !authPages.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-reset" element={<PasswordReset />} />

        <Route path="/dashboard" element={<P><Dashboard /></P>} />
        <Route path="/planner" element={<P><Planner /></P>} />
        <Route path="/gpa" element={<P><GPA /></P>} />
        <Route path="/profile" element={<P><Profile /></P>} />
        <Route path="/chat" element={<P><Chat /></P>} />
        <Route path="/timetable" element={<P><Timetable /></P>} />
        <Route path="/resources" element={<P><Resources /></P>} />
        <Route path="/goals" element={<P><Goals /></P>} />
        <Route path="/focus" element={<P><Focus /></P>} />
        <Route path="/board" element={<P><Board /></P>} />
        <Route path="/leaderboard" element={<P><Leaderboard /></P>} />
        <Route path="/notifications" element={<P><Notifications /></P>} />
        <Route path="/admin-panel" element={<AP><AdminPanel /></AP>} />
        <Route path="/growth" element={<P><Growth /></P>} />
        <Route path="/ielts" element={<P><IELTS /></P>} />
        <Route path="/german" element={<P><German /></P>} />
        <Route path="/articles" element={<P><Articles /></P>} />
        <Route path="/courses" element={<P><Courses /></P>} />
        <Route path="/courses/:id" element={<P><CourseDetail /></P>} />
        <Route path="/create-course" element={<P><CreateCourse /></P>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* AI Yordamchi - faqat login bo'lganda va auth sahifalardan tashqarida */}
      {showAI && <FloatingAI />}
    </>
  );
}
