import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "https://ecommerce-h0hd.onrender.com/api/admin/offers";

// ===============================
// Get All Offers
// ===============================

export const getAllOffersForAdmin = createAsyncThunk(
  "adminOffers/getAllOffers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/get`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get offers"
      );
    }
  }
);

// ===============================
// Get Single Offer
// ===============================

export const getOfferDetailsForAdmin = createAsyncThunk(
  "adminOffers/getOfferDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/details/${id}`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get offer details"
      );
    }
  }
);

// ===============================
// Create Offer
// ===============================

export const createOfferForAdmin = createAsyncThunk(
  "adminOffers/createOffer",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/create`, formData, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create offer"
      );
    }
  }
);

// ===============================
// Update Offer
// ===============================

export const updateOfferForAdmin = createAsyncThunk(
  "adminOffers/updateOffer",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/update/${id}`,
        formData,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update offer"
      );
    }
  }
);

// ===============================
// Delete Offer
// ===============================

export const deleteOfferForAdmin = createAsyncThunk(
  "adminOffers/deleteOffer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`, {
        withCredentials: true,
      });

      return {
        ...response.data,
        id,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete offer"
      );
    }
  }
);

// ===============================
// Toggle Offer Status
// ===============================

export const toggleOfferStatusForAdmin = createAsyncThunk(
  "adminOffers/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/toggle-status/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update offer status"
      );
    }
  }
);

// ===============================
// Slice
// ===============================

const initialState = {
  offers: [],
  offerDetails: null,
  isLoading: false,
  error: null,
  success: false,
};

const adminOffersSlice = createSlice({
  name: "adminOffers",

  initialState,

  reducers: {
    clearOfferMessages: (state) => {
      state.error = null;
      state.success = false;
    },

    clearOfferDetails: (state) => {
      state.offerDetails = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // Get All Offers
      // =========================

      .addCase(getAllOffersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(getAllOffersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.offers = action.payload.data || [];
      })

      .addCase(getAllOffersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // =========================
      // Get Offer Details
      // =========================

      .addCase(getOfferDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(getOfferDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.offerDetails = action.payload.data || null;
      })

      .addCase(getOfferDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // =========================
      // Create Offer
      // =========================

      .addCase(createOfferForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createOfferForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        if (action.payload.data) {
          state.offers.unshift(action.payload.data);
        }
      })

      .addCase(createOfferForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // =========================
      // Update Offer
      // =========================

      .addCase(updateOfferForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateOfferForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        const updatedOffer = action.payload.data;

        if (updatedOffer) {
          const index = state.offers.findIndex(
            (offer) => offer._id === updatedOffer._id
          );

          if (index !== -1) {
            state.offers[index] = updatedOffer;
          }
        }
      })

      .addCase(updateOfferForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // =========================
      // Delete Offer
      // =========================

      .addCase(deleteOfferForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(deleteOfferForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        state.offers = state.offers.filter(
          (offer) => offer._id !== action.payload.id
        );
      })

      .addCase(deleteOfferForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // =========================
      // Toggle Status
      // =========================

      .addCase(toggleOfferStatusForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(toggleOfferStatusForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        const updatedOffer = action.payload.data;

        if (updatedOffer) {
          const index = state.offers.findIndex(
            (offer) => offer._id === updatedOffer._id
          );

          if (index !== -1) {
            state.offers[index] = updatedOffer;
          }
        }
      })

      .addCase(toggleOfferStatusForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearOfferMessages,
  clearOfferDetails,
} = adminOffersSlice.actions;

export default adminOffersSlice.reducer;