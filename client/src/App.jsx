import { Route, Routes } from "react-router-dom";

import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";

import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminUsers from "./pages/admin-view/users";
import AdminFeatures from "./pages/admin-view/features";
import AdminOffers from "./pages/admin-view/offers";

import ShoppingLayout from "./components/shopping-view/layout";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import ShoppingOrders from "./components/shopping-view/orders";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";

import NotFound from "./pages/not-found";
import UnauthPage from "./pages/unauth-page";

import CheckAuth from "./components/common/check-auth";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { checkAuth } from "./store/auth-slice";

import { Skeleton } from "@/components/ui/skeleton";

function App() {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  // ==========================================
  // CHECK AUTH
  // ==========================================

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-[800px] h-[600px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white min-h-screen">

      <Routes>

        {/* ====================================
            PUBLIC HOME PAGE
        ==================================== */}

        <Route
          path="/"
          element={<ShoppingLayout />}
        >
          <Route
            index
            element={<ShoppingHome />}
          />
        </Route>


        {/* ====================================
            AUTH
        ==================================== */}

        <Route
          path="/auth"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            >
              <AuthLayout />
            </CheckAuth>
          }
        >

          <Route
            path="login"
            element={<AuthLogin />}
          />

          <Route
            path="register"
            element={<AuthRegister />}
          />

        </Route>


        {/* ====================================
            ADMIN
        ==================================== */}

        <Route
          path="/admin"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            >
              <AdminLayout />
            </CheckAuth>
          }
        >

          {/* DASHBOARD */}

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* PRODUCTS */}

          <Route
            path="products"
            element={<AdminProducts />}
          />

          {/* ORDERS */}

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          {/* USERS */}

          <Route
            path="users"
            element={<AdminUsers />}
          />

          {/* HOME BANNERS */}

          <Route
            path="features"
            element={<AdminFeatures />}
          />

          {/* OFFERS & COUPONS */}

          <Route
            path="offers"
            element={<AdminOffers />}
          />

        </Route>


        {/* ====================================
            SHOP
        ==================================== */}

        <Route
          path="/shop"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            >
              <ShoppingLayout />
            </CheckAuth>
          }
        >

          {/* SHOP HOME */}

          <Route
            path="home"
            element={<ShoppingHome />}
          />

          {/* PRODUCTS */}

          <Route
            path="listing"
            element={<ShoppingListing />}
          />

          {/* CHECKOUT */}

          <Route
            path="checkout"
            element={<ShoppingCheckout />}
          />

          {/* ACCOUNT */}

          <Route
            path="account"
            element={<ShoppingAccount />}
          />

          {/* MY ORDERS */}

          <Route
            path="orders"
            element={<ShoppingOrders />}
          />

          {/* PAYPAL RETURN */}

          <Route
            path="paypal-return"
            element={<PaypalReturnPage />}
          />

          {/* PAYMENT SUCCESS */}

          <Route
            path="payment-success"
            element={<PaymentSuccessPage />}
          />

          {/* SEARCH */}

          <Route
            path="search"
            element={<SearchProducts />}
          />

        </Route>


        {/* ====================================
            UNAUTHORIZED
        ==================================== */}

        <Route
          path="/unauth-page"
          element={<UnauthPage />}
        />


        {/* ====================================
            404
        ==================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </div>
  );
}

export default App;