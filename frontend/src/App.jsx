import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import FloatingAI from "./components/FloatingAI.jsx";
import Planner from "./pages/Planner.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
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
import Articles from "./pages/Articles.jsx";

// oddiy protect
function Protected({ children }) {
  const access = localStorage.getItem("access");
  if (!access) return <Navigate to="/login" replace />;
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

export default function App() {
  const isLoggedIn = !!localStorage.getItem("access");

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
        <Route path="/admin-panel" element={<P><AdminPanel /></P>} />
        <Route path="/growth" element={<P><Growth /></P>} />
        <Route path="/ielts" element={<P><IELTS /></P>} />
        <Route path="/articles" element={<P><Articles /></P>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* AI Yordamchi - har sahifada ko'rinadi (faqat login bo'lganda) */}
      {isLoggedIn && <FloatingAI />}
    </>
  );
}
