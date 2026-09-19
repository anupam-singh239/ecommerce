import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";
import { Tag } from "lucide-react";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] =
    useState(false);

  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  const {
    orderList,
    orderDetails,
  } = useSelector(
    (state) => state.shopOrder
  );

  // =====================================
  // FETCH ORDER DETAILS
  // =====================================

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  // =====================================
  // FETCH ALL ORDERS
  // =====================================

  useEffect(() => {
    if (user?.id) {
      dispatch(
        getAllOrdersByUserId(user.id)
      );
    }
  }, [dispatch, user?.id]);

  // =====================================
  // OPEN DETAILS DIALOG
  // =====================================

  useEffect(() => {
    if (orderDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  // =====================================
  // CLOSE DETAILS
  // =====================================

  function handleCloseDetails() {
    setOpenDetailsDialog(false);
    dispatch(resetOrderDetails());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Order History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Order ID
              </TableHead>

              <TableHead>
                Order Date
              </TableHead>

              <TableHead>
                Order Status
              </TableHead>

              <TableHead>
                Coupon
              </TableHead>

              <TableHead>
                Order Price
              </TableHead>

              <TableHead>
                <span className="sr-only">
                  Details
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orderList &&
            orderList.length > 0 ? (
              orderList.map(
                (orderItem) => (
                  <TableRow
                    key={orderItem?._id}
                  >
                    {/* ==========================
                        ORDER ID
                    ========================== */}

                    <TableCell className="font-medium">
                      #{orderItem?._id}
                    </TableCell>

                    {/* ==========================
                        ORDER DATE
                    ========================== */}

                    <TableCell>
                      {orderItem?.orderDate
                        ? new Date(
                            orderItem.orderDate
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </TableCell>

                    {/* ==========================
                        ORDER STATUS
                    ========================== */}

                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          orderItem?.orderStatus ===
                          "confirmed"
                            ? "bg-green-500"
                            : orderItem?.orderStatus ===
                              "processing"
                            ? "bg-blue-500"
                            : orderItem?.orderStatus ===
                              "shipped"
                            ? "bg-purple-500"
                            : orderItem?.orderStatus ===
                              "delivered"
                            ? "bg-green-600"
                            : orderItem?.orderStatus ===
                              "cancelled"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>

                    {/* ==========================
                        COUPON
                    ========================== */}

                    <TableCell>
                      {orderItem?.couponCode ? (
                        <div className="flex items-center gap-2">
                          <Tag
                            size={16}
                            className="text-green-600"
                          />

                          <div>
                            <p className="font-semibold text-green-600">
                              {
                                orderItem.couponCode
                              }
                            </p>

                            {Number(
                              orderItem?.discountAmount ||
                                0
                            ) > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Saved ₹
                                {Number(
                                  orderItem.discountAmount
                                ).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          No coupon
                        </span>
                      )}
                    </TableCell>

                    {/* ==========================
                        ORDER PRICE
                    ========================== */}

                    <TableCell>
                      <div>
                        <p className="font-bold">
                          ₹
                          {Number(
                            orderItem?.totalAmount ||
                              0
                          ).toFixed(2)}
                        </p>

                        {Number(
                          orderItem?.discountAmount ||
                            0
                        ) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Original ₹
                            {Number(
                              orderItem?.subtotalAmount ||
                                0
                            ).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* ==========================
                        VIEW DETAILS
                    ========================== */}

                    <TableCell>
                      <Dialog
                        open={
                          openDetailsDialog
                        }
                        onOpenChange={
                          handleCloseDetails
                        }
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(
                              orderItem?._id
                            )
                          }
                        >
                          View Details
                        </Button>

                        <ShoppingOrderDetailsView
                          orderDetails={
                            orderDetails
                          }
                        />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;