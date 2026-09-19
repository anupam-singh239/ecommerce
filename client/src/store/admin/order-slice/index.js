import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orderList: [],
  orderDetails: null,
  isLoading: false,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://ecommerce-h0hd.onrender.com/api/admin/orders/get",
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to get orders",
        }
      );
    }
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://ecommerce-h0hd.onrender.com/api/admin/orders/details/${id}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to get order details",
        }
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://ecommerce-h0hd.onrender.com/api/admin/orders/update/${id}`,
        {
          orderStatus,
        },
        {
          withCredentials: true,
        }
      );

      return {
        ...response.data,
        id,
        orderStatus,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to update order status",
        }
      );
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,

  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // GET ALL ORDERS
      // =========================
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.success) {
          state.orderList = action.payload.data || [];
        } else {
          state.orderList = [];
        }
      })

      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // =========================
      // GET ORDER DETAILS
      // =========================
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.success) {
          state.orderDetails = action.payload.data;
        } else {
          state.orderDetails = null;
        }
      })

      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })

      // =========================
      // UPDATE ORDER STATUS
      // =========================
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.success) {
          const orderIndex = state.orderList.findIndex(
            (order) => order._id === action.payload.id
          );

          if (orderIndex !== -1) {
            state.orderList[orderIndex].orderStatus =
              action.payload.orderStatus;
          }

          if (
            state.orderDetails &&
            state.orderDetails._id === action.payload.id
          ) {
            state.orderDetails.orderStatus = action.payload.orderStatus;
          }
        }
      })

      .addCase(updateOrderStatus.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;