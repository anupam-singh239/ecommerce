import { useEffect, useState } from "react";
import axios from "axios";

import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
} from "lucide-react";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const getDashboardStats = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "http://localhost:5000/api/admin/dashboard/stats",
          {
            withCredentials: true,
          }
        );

        if (response.data?.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.log(
          "Dashboard Error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    getDashboardStats();
  }, []);

  // ==========================================
  // STATISTICS
  // ==========================================

  const stats = [
    {
      title: "Total Products",
      value: dashboardData.totalProducts,
      icon: Package,
      description: "Products available",
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders,
      icon: ShoppingCart,
      description: "Orders received",
    },
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: Users,
      description: "Registered customers",
    },
    {
      title: "Total Revenue",
      value: `₹${Number(
        dashboardData.totalRevenue || 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      description: "Total sales",
    },
  ];

  // ==========================================
  // ORDER STATUS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "processing":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-purple-100 text-purple-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="text-muted-foreground mt-1">
          Welcome back, Admin. Here's what's happening with your store.
        </p>
      </div>


      {/* ==========================================
          STATISTICS CARDS
      ========================================== */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-background p-5 shadow-sm hover:shadow-md transition-shadow"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>

                  <h2 className="text-3xl font-bold mt-2">

                    {loading ? (
                      <span className="animate-pulse">
                        ...
                      </span>
                    ) : (
                      stat.value
                    )}

                  </h2>

                </div>

                <div className="rounded-full bg-primary/10 p-3">

                  <Icon className="h-6 w-6 text-primary" />

                </div>

              </div>

              <p className="text-xs text-muted-foreground mt-4">
                {stat.description}
              </p>

            </div>
          );
        })}

      </div>


      {/* ==========================================
          SALES + RECENT ORDERS
      ========================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* SALES OVERVIEW */}

        <div className="rounded-xl border bg-background p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <div className="rounded-full bg-primary/10 p-3">

              <TrendingUp className="h-5 w-5 text-primary" />

            </div>

            <div>

              <h2 className="text-xl font-semibold">
                Sales Overview
              </h2>

              <p className="text-sm text-muted-foreground">
                Store performance summary
              </p>

            </div>

          </div>


          <div className="rounded-lg border p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-muted-foreground">
                  Total Revenue
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  ₹
                  {Number(
                    dashboardData.totalRevenue || 0
                  ).toLocaleString("en-IN")}
                </h3>

              </div>

              <IndianRupee className="h-10 w-10 text-primary" />

            </div>


            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="rounded-lg bg-muted/50 p-4">

                <p className="text-sm text-muted-foreground">
                  Orders
                </p>

                <p className="text-2xl font-bold mt-1">
                  {dashboardData.totalOrders}
                </p>

              </div>


              <div className="rounded-lg bg-muted/50 p-4">

                <p className="text-sm text-muted-foreground">
                  Products
                </p>

                <p className="text-2xl font-bold mt-1">
                  {dashboardData.totalProducts}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* RECENT ORDERS */}

        <div className="rounded-xl border bg-background p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-6">

            <div className="rounded-full bg-primary/10 p-3">

              <Clock className="h-5 w-5 text-primary" />

            </div>

            <div>

              <h2 className="text-xl font-semibold">
                Recent Orders
              </h2>

              <p className="text-sm text-muted-foreground">
                Latest customer orders
              </p>

            </div>

          </div>


          {loading ? (

            <div className="h-52 flex items-center justify-center">

              <p className="text-muted-foreground">
                Loading orders...
              </p>

            </div>

          ) : dashboardData.recentOrders?.length > 0 ? (

            <div className="space-y-3">

              {dashboardData.recentOrders.map((order) => (

                <div
                  key={order._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >

                  <div className="flex items-center gap-3">

                    <div className="rounded-full bg-muted p-2">

                      <ShoppingCart className="h-4 w-4" />

                    </div>

                    <div>

                      <p className="font-medium">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {order.cartItems?.length || 0} item(s)
                      </p>

                    </div>

                  </div>


                  <div className="text-right">

                    <p className="font-semibold">
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium mt-1 ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="h-52 flex items-center justify-center rounded-lg border border-dashed">

              <div className="text-center">

                <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />

                <p className="font-medium">
                  No recent orders
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  New orders will appear here.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ==========================================
          QUICK ACTIONS
      ========================================== */}

      <div className="rounded-xl border bg-background p-6 shadow-sm">

        <h2 className="text-xl font-semibold mb-1">
          Quick Actions
        </h2>

        <p className="text-sm text-muted-foreground mb-5">
          Quickly manage your store
        </p>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* PRODUCTS */}

          <a
            href="/admin/products"
            className="rounded-lg border p-4 hover:bg-muted transition-colors"
          >

            <Package className="h-5 w-5 mb-2" />

            <p className="font-medium">
              Manage Products
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Add, edit or delete products
            </p>

          </a>


          {/* ORDERS */}

          <a
            href="/admin/orders"
            className="rounded-lg border p-4 hover:bg-muted transition-colors"
          >

            <ShoppingCart className="h-5 w-5 mb-2" />

            <p className="font-medium">
              Manage Orders
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              View and update orders
            </p>

          </a>


          {/* USERS */}

          <a
            href="/admin/users"
            className="rounded-lg border p-4 hover:bg-muted transition-colors"
          >

            <Users className="h-5 w-5 mb-2" />

            <p className="font-medium">
              Customers
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Manage registered customers
            </p>

          </a>


          {/* ANALYTICS */}

          <div className="rounded-lg border p-4">

            <TrendingUp className="h-5 w-5 mb-2" />

            <p className="font-medium">
              Analytics
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              View store performance
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;