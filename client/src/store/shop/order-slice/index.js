import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

// =====================================
// CREATE NEW ORDER
// =====================================

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/create",
        orderData,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to place order",
        }
      );
    }
  }
);

// =====================================
// GET ALL ORDERS BY USER
// =====================================

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/order/list/${userId}`,
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

// =====================================
// GET ORDER DETAILS
// =====================================

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/order/details/${id}`,
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

// =====================================
// CAPTURE PAYMENT
// =====================================
// Online payment baad me add karenge.

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/capture",
        {
          paymentId,
          payerId,
          orderId,
        },
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Online payment is not enabled yet",
        }
      );
    }
  }
);

// =====================================
// ORDER SLICE
// =====================================

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",

  initialState,

  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },

    resetOrderState: (state) => {
      state.approvalURL = null;
      state.orderId = null;
      state.orderDetails = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================
      // CREATE ORDER
      // =====================================

      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
        state.approvalURL = null;
        state.orderId = null;
      })

      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          state.approvalURL = null;
          state.orderId = action.payload.orderId;

          sessionStorage.setItem(
            "currentOrderId",
            JSON.stringify(action.payload.orderId)
          );
        }
      })

      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })

      // =====================================
      // GET ALL ORDERS
      // =====================================

      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          state.orderList = action.payload.data || [];
        } else {
          state.orderList = [];
        }
      })

      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // =====================================
      // GET ORDER DETAILS
      // =====================================

      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          state.orderDetails = action.payload.data;
        } else {
          state.orderDetails = null;
        }
      })

      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const {
  resetOrderDetails,
  resetOrderState,
} = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;