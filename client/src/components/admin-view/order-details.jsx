import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Tag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";

import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const { toast } = useToast();

  const subtotalAmount = Number(
    orderDetails?.subtotalAmount || 0
  );

  const discountAmount = Number(
    orderDetails?.discountAmount || 0
  );

  const totalAmount = Number(
    orderDetails?.totalAmount || 0
  );

  function handleUpdateStatus(event) {
    event.preventDefault();

    const { status } = formData;

    if (!status) {
      toast({
        title: "Please select an order status",
        variant: "destructive",
      });

      return;
    }

    dispatch(
      updateOrderStatus({
        id: orderDetails?._id,
        orderStatus: status,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(
          getOrderDetailsForAdmin(orderDetails?._id)
        );

        dispatch(getAllOrdersForAdmin());

        setFormData(initialFormData);

        toast({
          title: "Order status updated successfully",
        });
      } else {
        toast({
          title: "Failed to update order status",
          description:
            data?.payload?.message ||
            "Something went wrong",
          variant: "destructive",
        });
      }
    });
  }

  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-500";

      case "confirmed":
        return "bg-blue-500 hover:bg-blue-500";

      case "processing":
        return "bg-purple-500 hover:bg-purple-500";

      case "shipped":
        return "bg-indigo-500 hover:bg-indigo-500";

      case "delivered":
        return "bg-green-500 hover:bg-green-500";

      case "cancelled":
        return "bg-red-600 hover:bg-red-600";

      default:
        return "bg-gray-500 hover:bg-gray-500";
    }
  }

  return (
    <DialogContent
      className="
        w-[95vw]
        max-w-[700px]
        max-h-[90vh]
        overflow-hidden
        p-0
      "
    >
      <div
        className="
          max-h-[90vh]
          overflow-y-auto
          overscroll-contain
          p-6
          pr-4
        "
      >
        <div className="grid gap-6">

          {/* ========================= */}
          {/* ORDER BASIC INFORMATION */}
          {/* ========================= */}

          <div className="grid gap-3">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-medium">
                Order ID
              </p>

              <Label className="break-all text-sm sm:text-right">
                {orderDetails?._id}
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-medium">
                Order Date
              </p>

              <Label>
                {orderDetails?.orderDate
                  ? new Date(
                      orderDetails.orderDate
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-medium">
                Order Price
              </p>

              <Label className="font-bold text-primary">
                ₹{totalAmount.toFixed(2)}
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-medium">
                Payment Method
              </p>

              <Label className="uppercase">
                {orderDetails?.paymentMethod || "COD"}
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-medium">
                Payment Status
              </p>

              <Label className="capitalize">
                {orderDetails?.paymentStatus || "pending"}
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-medium">
                Order Status
              </p>

              <Badge
                className={`py-1 px-3 w-fit capitalize ${getStatusClass(
                  orderDetails?.orderStatus
                )}`}
              >
                {orderDetails?.orderStatus || "pending"}
              </Badge>
            </div>

          </div>

          <Separator />

          {/* ========================= */}
          {/* ORDERED PRODUCTS */}
          {/* ========================= */}

          <div className="grid gap-4">

            <div className="font-bold text-lg">
              Order Details
            </div>

            <div className="grid gap-3">

              {orderDetails?.cartItems &&
              orderDetails.cartItems.length > 0 ? (

                orderDetails.cartItems.map(
                  (item, index) => (

                    <div
                      key={`${item?.productId}-${index}`}
                      className="
                        border
                        rounded-lg
                        p-4
                        flex
                        flex-col
                        sm:flex-row
                        gap-4
                        sm:items-center
                        sm:justify-between
                      "
                    >

                      {/* Product */}
                      <div className="flex items-center gap-3">

                        <img
                          src={item?.image}
                          alt={item?.title}
                          className="
                            w-16
                            h-16
                            rounded-md
                            object-cover
                            bg-gray-100
                          "
                        />

                        <div>
                          <p className="font-semibold">
                            {item?.title}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            Product ID:{" "}
                            {item?.productId}
                          </p>
                        </div>

                      </div>

                      {/* Quantity + Price */}
                      <div className="flex justify-between sm:flex-col sm:items-end gap-1">

                        <span className="text-sm">
                          Quantity:{" "}
                          <strong>
                            {item?.quantity}
                          </strong>
                        </span>

                        <span className="font-bold">
                          ₹
                          {Number(
                            item?.price || 0
                          ).toFixed(2)}
                        </span>

                      </div>

                    </div>

                  )
                )

              ) : (

                <p className="text-muted-foreground">
                  No products found.
                </p>

              )}

            </div>

          </div>

          <Separator />

          {/* ========================= */}
          {/* PRICE SUMMARY */}
          {/* ========================= */}

          <div className="grid gap-3">

            <div className="font-bold text-lg">
              Price Summary
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span>
                Subtotal
              </span>

              <span className="font-medium">
                ₹{subtotalAmount.toFixed(2)}
              </span>
            </div>

            {/* Coupon */}
            {orderDetails?.couponCode ? (

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-lg
                  border
                  border-green-200
                  bg-green-50
                  p-3
                "
              >

                <div className="flex items-center gap-2">

                  <Tag
                    size={18}
                    className="text-green-600"
                  />

                  <div>
                    <p className="font-semibold text-green-700">
                      Coupon:{" "}
                      {orderDetails.couponCode}
                    </p>

                    <p className="text-sm text-green-600">
                      Discount applied
                    </p>
                  </div>

                </div>

                <span className="font-bold text-green-600 whitespace-nowrap">
                  -₹{discountAmount.toFixed(2)}
                </span>

              </div>

            ) : (

              <div className="flex items-center justify-between">
                <span>
                  Coupon
                </span>

                <span className="text-muted-foreground">
                  No coupon
                </span>
              </div>

            )}

            {/* Shipping */}
            <div className="flex items-center justify-between">
              <span>
                Shipping
              </span>

              <span className="font-semibold text-green-600">
                FREE
              </span>
            </div>

            <Separator />

            {/* Final Total */}
            <div className="flex items-center justify-between text-xl">
              <span className="font-bold">
                Total
              </span>

              <span className="font-bold text-primary">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Savings */}
            {discountAmount > 0 && (
              <div className="text-right">
                <span className="text-sm font-medium text-green-600">
                  Customer saved ₹
                  {discountAmount.toFixed(2)}
                </span>
              </div>
            )}

          </div>

          <Separator />

          {/* ========================= */}
          {/* SHIPPING INFORMATION */}
          {/* ========================= */}

          <div className="grid gap-4">

            <div className="font-bold text-lg">
              Shipping Information
            </div>

            <div
              className="
                border
                rounded-lg
                p-4
                grid
                gap-2
                text-muted-foreground
              "
            >

              <p>
                <span className="font-semibold text-foreground">
                  Customer:
                </span>{" "}
                {user?.userName ||
                  orderDetails?.userId ||
                  "Customer"}
              </p>

              <p>
                <span className="font-semibold text-foreground">
                  Address:
                </span>{" "}
                {orderDetails?.addressInfo?.address ||
                  "N/A"}
              </p>

              <p>
                <span className="font-semibold text-foreground">
                  City:
                </span>{" "}
                {orderDetails?.addressInfo?.city ||
                  "N/A"}
              </p>

              <p>
                <span className="font-semibold text-foreground">
                  Pincode:
                </span>{" "}
                {orderDetails?.addressInfo?.pincode ||
                  "N/A"}
              </p>

              <p>
                <span className="font-semibold text-foreground">
                  Phone:
                </span>{" "}
                {orderDetails?.addressInfo?.phone ||
                  "N/A"}
              </p>

              {orderDetails?.addressInfo?.notes ? (
                <p>
                  <span className="font-semibold text-foreground">
                    Notes:
                  </span>{" "}
                  {orderDetails.addressInfo.notes}
                </p>
              ) : null}

            </div>

          </div>

          <Separator />

          {/* ========================= */}
          {/* UPDATE ORDER STATUS */}
          {/* ========================= */}

          <div className="grid gap-4">

            <div className="font-bold text-lg">
              Update Order Status
            </div>

            <CommonForm
              formControls={[
                {
                  label: "Order Status",
                  name: "status",
                  componentType: "select",

                  options: [
                    {
                      id: "pending",
                      label: "Pending",
                    },
                    {
                      id: "confirmed",
                      label: "Confirmed",
                    },
                    {
                      id: "processing",
                      label: "Processing",
                    },
                    {
                      id: "shipped",
                      label: "Shipped",
                    },
                    {
                      id: "delivered",
                      label: "Delivered",
                    },
                    {
                      id: "cancelled",
                      label: "Cancelled",
                    },
                  ],
                },
              ]}

              formData={formData}
              setFormData={setFormData}

              buttonText="Update Order Status"

              onSubmit={handleUpdateStatus}
            />

          </div>

        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
