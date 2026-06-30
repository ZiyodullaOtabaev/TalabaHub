import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Planner from "./pages/Planner.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GPA from "./pages/GPA.jsx";
import Profile from "./pages/Profile.jsx";
import Chat from "./pages/Chat.jsx";
// oddiy protect
function Protected({ children }) {
  const access = localStorage.getItem("access");
  if (!access) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/planner"
        element={
          <Protected>
            <Layout>
              <Planner />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/gpa"
        element={
          <Protected>
            <Layout>
              <GPA />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <Layout>
              <Profile />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/chat"
        element={
          <Protected>
            <Layout>
              <Chat />
            </Layout>
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}