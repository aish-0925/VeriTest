import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TestRuns from "./pages/TestRuns";
import Requirements from "./pages/Requirements";
import Generate from "./pages/Generate";
import Compliance from "./pages/Compliance";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider, ToastProvider } from "./components/Shared";
import "./styles/global.css";
import "./styles/components.css";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>

            {/*  Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/*  Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/runs" element={<TestRuns />} />
                      <Route path="/requirements" element={<Requirements />} />
                      <Route path="/generate" element={<Generate />} />
                      <Route path="/compliance" element={<Compliance />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}