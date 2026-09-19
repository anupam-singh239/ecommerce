import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  wishlist: [],
};

// =====================================
// GET WISHLIST
// =====================================

export const fetchWishlist = createAsyncThunk(
  "/wishlist/fetchWishlist",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/shop/wishlist/get",
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// =====================================
// GET WISHLIST - ALIAS
// =====================================
// Home page me getWishlist naam use ho raha hai.
// Isliye fetchWishlist ko getWishlist naam se bhi export kar rahe hain.

export const getWishlist = fetchWishlist;

// =====================================
// ADD TO WISHLIST
// =====================================

export const addToWishlist = createAsyncThunk(
  "/wishlist/addToWishlist",
  async (productId) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/wishlist/add",
      {
        productId,
      },
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// =====================================
// REMOVE FROM WISHLIST
// =====================================

export const removeFromWishlist = createAsyncThunk(
  "/wishlist/removeFromWishlist",
  async (productId) => {
    const response = await axios.delete(
      `http://localhost:5000/api/shop/wishlist/remove/${productId}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// =====================================
// WISHLIST SLICE
// =====================================

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    clearWishlist: (state) => {
      state.wishlist = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // ===============================
      // GET WISHLIST
      // ===============================

      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.success) {
          state.wishlist = action.payload.wishlist || [];
        }
      })

      .addCase(fetchWishlist.rejected, (state) => {
        state.isLoading = false;
        state.wishlist = [];
      })

      // ===============================
      // ADD WISHLIST
      // ===============================

      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.success) {
          state.wishlist = action.payload.wishlist || [];
        }
      })

      .addCase(addToWishlist.rejected, (state) => {
        state.isLoading = false;
      })

      // ===============================
      // REMOVE WISHLIST
      // ===============================

      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.success) {
          state.wishlist = action.payload.wishlist || [];
        }
      })

      .addCase(removeFromWishlist.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;