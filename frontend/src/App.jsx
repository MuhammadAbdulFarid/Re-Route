// Main App Component
// Re-Route - Reverse Logistics SaaS Platform

import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReturnPortal from "./components/ReturnPortal";
import WhiteLabelPortal from "./components/WhiteLabelPortal";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import AIAnalysis from "./components/AIAnalysis";
import MarketplaceConnect from "./components/MarketplaceConnect";
import ManualOrderEntry from "./components/ManualOrderEntry";
import BulkUpload from "./components/BulkUpload";
import ResolutionCenter from "./components/ResolutionCenter";
import RevenueDashboard from "./components/RevenueDashboard";
import FraudDashboard from "./components/FraudDashboard";

function App() {
  const [currentStore, setCurrentStore] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentStore={currentStore} onStoreChange={setCurrentStore} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<ReturnPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* White-Label Portal - Dynamic store slug */}
        <Route path="/returns/:storeSlug" element={<WhiteLabelPortal />} />

        {/* User/Customer Routes */}
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* Admin/Merchant Routes */}
        <Route
          path="/admin"
          element={<AdminDashboard currentStore={currentStore} />}
        />
        <Route
          path="/admin/ai-analysis"
          element={<AIAnalysis currentStore={currentStore} />}
        />
        <Route
          path="/admin/marketplace"
          element={
            <MarketplaceConnect
              currentStore={currentStore}
              onStoreChange={setCurrentStore}
            />
          }
        />
        <Route
          path="/admin/orders/manual"
          element={<ManualOrderEntry currentStore={currentStore} />}
        />
        <Route
          path="/admin/orders/bulk"
          element={<BulkUpload currentStore={currentStore} />}
        />
        <Route
          path="/admin/chat"
          element={<ResolutionCenter currentStore={currentStore} />}
        />

        {/* Platform Owner Routes */}
        <Route path="/owner/revenue" element={<RevenueDashboard />} />
        <Route path="/owner/fraud" element={<FraudDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
