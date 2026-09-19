import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
};

/* =====================================================
   ADD REVIEW
===================================================== */

export const addReview = createAsyncThunk(
  "/review/addReview",
  async (formdata, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/review/add",
        formdata,
        {
          withCredentials: true,
        }
      );

      console.log(
        "ADD REVIEW RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.log(
        "ADD REVIEW ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Unable to submit review.",
        }
      );
    }
  }
);


/* =====================================================
   GET REVIEWS
===================================================== */

export const getReviews = createAsyncThunk(
  "/review/getReviews",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/shop/review/${id}`
      );

      console.log(
        "GET REVIEWS RESPONSE:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.log(
        "GET REVIEWS ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Unable to fetch reviews.",
        }
      );
    }
  }
);


/* =====================================================
   REVIEW SLICE
===================================================== */

const reviewSlice = createSlice({
  name: "reviewSlice",

  initialState,

  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
    },
  },

  extraReducers: (builder) => {
    builder

      /* ==========================================
         GET REVIEWS
      ========================================== */

      .addCase(
        getReviews.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        getReviews.fulfilled,
        (state, action) => {
          state.isLoading = false;

          state.reviews =
            action.payload?.data || [];
        }
      )

      .addCase(
        getReviews.rejected,
        (state) => {
          state.isLoading = false;
          state.reviews = [];
        }
      )


      /* ==========================================
         ADD REVIEW
      ========================================== */

      .addCase(
        addReview.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        addReview.fulfilled,
        (state, action) => {
          state.isLoading = false;

          if (action.payload?.success) {
            const newReview =
              action.payload?.data;

            if (newReview) {
              state.reviews = [
                newReview,
                ...state.reviews,
              ];
            }
          }
        }
      )

      .addCase(
        addReview.rejected,
        (state) => {
          state.isLoading = false;
        }
      );
  },
});


export const {
  clearReviews,
} = reviewSlice.actions;


export default reviewSlice.reducer;