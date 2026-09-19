import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Package, Eye, ShoppingBag, Truck, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllOrdersByUserId } from "@/store/shop/order-slice";

function ShoppingOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { orderList, isLoading } = useSelector((state) => state.shopOrder);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;

      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;

      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />;

      case "processing":
        return <Package className="w-5 h-5 text-orange-500" />;

      default:
        return <Package className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "processing":
        return "bg-orange-100 text-orange-700";

      case "confirmed":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingBag className="w-7 h-7 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                My Orders
              </h1>

              <p className="text-muted-foreground">
                Track and manage your orders
              </p>
            </div>
          </div>
        </div>

        {/* No Orders */}
        {!orderList || orderList.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-gray-400" />
            </div>

            <h2 className="text-2xl font-bold mb-2">
              No Orders Yet
            </h2>

            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet.
            </p>

            <Button
              onClick={() => navigate("/shop/home")}
            >
              Start Shopping
            </Button>
          </div>
        ) : (

          /* Orders */
          <div className="space-y-5">

            {orderList.map((order) => (
              <div
                key={order?._id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden"
              >

                {/* Order Header */}
                <div className="p-5 border-b bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order ID
                      </p>

                      <p className="font-bold text-sm break-all">
                        #{order?._id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order Date
                      </p>

                      <p className="font-semibold">
                        {formatDate(order?.orderDate || order?.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment
                      </p>

                      <p className="font-semibold uppercase">
                        {order?.paymentMethod || "COD"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(order?.orderStatus)}

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClass(
                          order?.orderStatus
                        )}`}
                      >
                        {order?.orderStatus || "pending"}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Products */}
                <div className="p-5">

                  <div className="space-y-4">

                    {order?.cartItems?.map((item, index) => (
                      <div
                        key={`${order?._id}-${item?.productId}-${index}`}
                        className="flex items-center gap-4"
                      >

                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={item?.image}
                            alt={item?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">
                            {item?.title}
                          </h3>

                          <p className="text-sm text-muted-foreground mt-1">
                            Quantity: {item?.quantity}
                          </p>

                          <p className="text-sm font-semibold mt-1">
                            ₹{Number(item?.price || 0).toFixed(2)} each
                          </p>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-bold">
                            ₹
                            {(
                              Number(item?.price || 0) *
                              Number(item?.quantity || 0)
                            ).toFixed(2)}
                          </p>
                        </div>

                      </div>
                    ))}

                  </div>

                  {/* Bottom */}
                  <div className="border-t mt-5 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>

                      <p className="text-2xl font-bold text-primary">
                        ₹{Number(order?.totalAmount || 0).toFixed(2)}
                      </p>

                      <p className="text-sm text-muted-foreground mt-1">
                        Payment Status:{" "}
                        <span className="font-semibold capitalize">
                          {order?.paymentStatus || "pending"}
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/shop/order-details/${order?._id}`)
                      }
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default ShoppingOrders;