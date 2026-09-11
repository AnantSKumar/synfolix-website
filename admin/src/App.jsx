import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";
import ProductsList from "./pages/ProductsList";
import ProductForm from "./pages/ProductForm";
import IndustriesList from "./pages/IndustriesList";
import IndustryForm from "./pages/IndustryForm";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/products"
        element={
          <RequireAuth>
            <ProductsList />
          </RequireAuth>
        }
      />
      <Route
        path="/products/new"
        element={
          <RequireAuth>
            <ProductForm />
          </RequireAuth>
        }
      />
      <Route
        path="/products/:id/edit"
        element={
          <RequireAuth>
            <ProductForm />
          </RequireAuth>
        }
      />
      <Route
        path="/industries"
        element={
          <RequireAuth>
            <IndustriesList />
          </RequireAuth>
        }
      />
      <Route
        path="/industries/new"
        element={
          <RequireAuth>
            <IndustryForm />
          </RequireAuth>
        }
      />
      <Route
        path="/industries/:id/edit"
        element={
          <RequireAuth>
            <IndustryForm />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
