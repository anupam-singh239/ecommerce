import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Tag } from "lucide-react";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  const subtotalAmount = Number(
    orderDetails?.subtotalAmount || 0
  );

  const discountAmount = Number(
    orderDetails?.discountAmount || 0
  );

  const totalAmount = Number(
    orderDetails?.totalAmount || 0
  );

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <div className="grid gap-6">

        {/* =====================================
            ORDER INFORMATION
        ===================================== */}

        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>
              {orderDetails?.orderDate
                ? new Date(
                    orderDetails.orderDate
                  ).toLocaleDateString("en-IN")
                : "-"}
            </Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label className="uppercase">
              {orderDetails?.paymentMethod || "-"}
            </Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label className="capitalize">
              {orderDetails?.paymentStatus || "-"}
            </Label>
          </div>

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>

            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "processing"
                    ? "bg-blue-500"
                    : orderDetails?.orderStatus === "shipped"
                    ? "bg-purple-500"
                    : orderDetails?.orderStatus === "delivered"
                    ? "bg-green-600"
                    : orderDetails?.orderStatus === "cancelled"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>

        <Separator />

        {/* =====================================
            ORDER ITEMS
        ===================================== */}

        <div className="grid gap-4">
          <div className="font-medium">
            Order Details
          </div>

          <ul className="grid gap-3">
            {orderDetails?.cartItems &&
            orderDetails.cartItems.length > 0 ? (
              orderDetails.cartItems.map(
                (item, index) => (
                  <li
                    key={
                      item?.productId ||
                      index
                    }
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {item?.title}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Quantity: {item?.quantity}
                        </p>
                      </div>

                      <span className="font-semibold whitespace-nowrap">
                        ₹
                        {Number(
                          item?.price || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </li>
                )
              )
            ) : (
              <li className="text-muted-foreground">
                No items found.
              </li>
            )}
          </ul>
        </div>

        <Separator />

        {/* =====================================
            PRICE SUMMARY
        ===================================== */}

        <div className="grid gap-3">

          <div className="font-medium">
            Price Summary
          </div>

          <div className="flex items-center justify-between">
            <span>Subtotal</span>

            <span>
              ₹
              {subtotalAmount.toFixed(2)}
            </span>
          </div>

          {/* =====================================
              COUPON
          ===================================== */}

          {orderDetails?.couponCode ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 p-3">
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

              <span className="font-semibold text-green-600">
                -₹
                {discountAmount.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span>Coupon</span>

              <span className="text-muted-foreground">
                No coupon
              </span>
            </div>
          )}

          {/* =====================================
              SHIPPING
          ===================================== */}

          <div className="flex items-center justify-between">
            <span>Shipping</span>

            <span className="font-semibold text-green-600">
              FREE
            </span>
          </div>

          <Separator />

          {/* =====================================
              FINAL TOTAL
          ===================================== */}

          <div className="flex items-center justify-between text-xl">
            <span className="font-bold">
              Total
            </span>

            <span className="font-bold text-primary">
              ₹
              {totalAmount.toFixed(2)}
            </span>
          </div>

          {discountAmount > 0 && (
            <p className="text-sm text-green-600 text-right font-medium">
              You saved ₹
              {discountAmount.toFixed(2)} on this order
            </p>
          )}
        </div>

        <Separator />

        {/* =====================================
            SHIPPING INFO
        ===================================== */}

        <div className="grid gap-4">
          <div className="font-medium">
            Shipping Info
          </div>

          <div className="grid gap-0.5 text-muted-foreground">
            <span>
              {user?.userName || "-"}
            </span>

            <span>
              {orderDetails?.addressInfo?.address}
            </span>

            <span>
              {orderDetails?.addressInfo?.city}
            </span>

            <span>
              {orderDetails?.addressInfo?.pincode}
            </span>

            <span>
              {orderDetails?.addressInfo?.phone}
            </span>

            {orderDetails?.addressInfo?.notes && (
              <span>
                Note:{" "}
                {orderDetails.addressInfo.notes}
              </span>
            )}
          </div>
        </div>

      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;