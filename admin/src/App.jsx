import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";

function ProductsPlaceholder() {
  return <div className="p-8">Products page coming in the next task.</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/products"
        element={
          <RequireAuth>
            <ProductsPlaceholder />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
