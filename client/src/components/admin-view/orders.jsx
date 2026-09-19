import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Badge } from "../ui/badge";

import { useDispatch, useSelector } from "react-redux";

import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  updateOrderStatus,
} from "@/store/admin/order-slice";

import AdminOrderDetailsView from "./order-details";

import { useToast } from "../ui/use-toast";

function AdminOrdersView() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { orderList, orderDetails, isLoading } = useSelector(
    (state) => state.adminOrder
  );

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  function handleFetchOrderDetails(id) {
    dispatch(getOrderDetailsForAdmin(id));
  }

  function handleStatusChange(id, orderStatus) {
    dispatch(updateOrderStatus({ id, orderStatus })).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Order status updated",
          description: `Order status changed to ${orderStatus}.`,
        });
      } else {
        toast({
          title: "Update failed",
          description:
            data?.payload?.message || "Unable to update order status.",
          variant: "destructive",
        });
      }
    });
  }

  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "confirmed":
        return "bg-blue-100 text-blue-800";

      case "processing":
        return "bg-purple-100 text-purple-800";

      case "shipped":
        return "bg-indigo-100 text-indigo-800";

      case "delivered":
        return "bg-green-100 text-green-800";

      case "cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          All Orders
        </CardTitle>
      </CardHeader>

      <CardContent>

        {isLoading && orderList.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              Loading orders...
            </p>
          </div>
        ) : orderList && orderList.length > 0 ? (

          <div className="overflow-x-auto">

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
                    Customer
                  </TableHead>

                  <TableHead>
                    Total
                  </TableHead>

                  <TableHead>
                    Payment
                  </TableHead>

                  <TableHead>
                    Order Status
                  </TableHead>

                  <TableHead className="text-right">
                    Details
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>

                {orderList.map((orderItem) => (

                  <TableRow key={orderItem?._id}>

                    {/* ORDER ID */}
                    <TableCell>
                      <span className="font-medium text-xs">
                        #{orderItem?._id}
                      </span>
                    </TableCell>

                    {/* DATE */}
                    <TableCell>
                      {formatDate(
                        orderItem?.orderDate ||
                        orderItem?.createdAt
                      )}
                    </TableCell>

                    {/* CUSTOMER */}
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          {orderItem?.addressInfo?.phone ||
                            "Customer"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {orderItem?.addressInfo?.city ||
                            "N/A"}
                        </p>
                      </div>
                    </TableCell>

                    {/* TOTAL */}
                    <TableCell>
                      <span className="font-bold">
                        ₹
                        {Number(
                          orderItem?.totalAmount || 0
                        ).toFixed(2)}
                      </span>
                    </TableCell>

                    {/* PAYMENT */}
                    <TableCell>
                      <div>
                        <p className="font-semibold uppercase text-xs">
                          {orderItem?.paymentMethod || "COD"}
                        </p>

                        <p
                          className={`text-xs capitalize ${
                            orderItem?.paymentStatus === "paid"
                              ? "text-green-600"
                              : orderItem?.paymentStatus ===
                                "failed"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {orderItem?.paymentStatus ||
                            "pending"}
                        </p>
                      </div>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>

                      <select
                        value={
                          orderItem?.orderStatus || "pending"
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            orderItem?._id,
                            e.target.value
                          )
                        }
                        className={`border rounded-md px-3 py-2 text-sm font-semibold capitalize outline-none cursor-pointer ${getStatusClass(
                          orderItem?.orderStatus
                        )}`}
                      >

                        <option value="pending">
                          Pending
                        </option>

                        <option value="confirmed">
                          Confirmed
                        </option>

                        <option value="processing">
                          Processing
                        </option>

                        <option value="shipped">
                          Shipped
                        </option>

                        <option value="delivered">
                          Delivered
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>

                      </select>

                    </TableCell>

                    {/* DETAILS */}
                    <TableCell className="text-right">

                      <Button
                        size="sm"
                        onClick={() =>
                          handleFetchOrderDetails(
                            orderItem?._id
                          )
                        }
                      >
                        View Details
                      </Button>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </div>

        ) : (

          <div className="py-12 text-center">

            <p className="text-xl font-semibold">
              No Orders Found
            </p>

            <p className="text-muted-foreground mt-2">
              Customer orders will appear here.
            </p>

          </div>

        )}

      </CardContent>

      {/* ORDER DETAILS DIALOG */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={(open) => {
          setOpenDetailsDialog(open);

          if (!open) {
            dispatch(resetOrderDetails());
          }
        }}
      >

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>
              Order Details
            </DialogTitle>
          </DialogHeader>

          {orderDetails ? (
            <AdminOrderDetailsView
              orderDetails={orderDetails}
            />
          ) : (
            <p className="text-center py-8">
              Loading order details...
            </p>
          )}

        </DialogContent>

      </Dialog>

    </Card>
  );
}

export default AdminOrdersView;