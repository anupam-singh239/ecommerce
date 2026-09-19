
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

// GET ALL FEATURE IMAGES
export const getFeatureImages = createAsyncThunk(
  "/common/getFeatureImages",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/common/feature/get"
    );

    return response.data;
  }
);

// ADD FEATURE IMAGE
export const addFeatureImage = createAsyncThunk(
  "/common/addFeatureImage",
  async (image) => {
    const response = await axios.post(
      "http://localhost:5000/api/common/feature/add",
      { image }
    );

    return response.data;
  }
);

// DELETE FEATURE IMAGE
export const deleteFeatureImage = createAsyncThunk(
  "/common/deleteFeatureImage",
  async (id) => {
    const response = await axios.delete(
      `http://localhost:5000/api/common/feature/delete/${id}`
    );

    return response.data;
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // GET
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data || [];
      })

      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })

      // DELETE
      .addCase(deleteFeatureImage.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(deleteFeatureImage.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteFeatureImage.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default commonSlice.reducer;