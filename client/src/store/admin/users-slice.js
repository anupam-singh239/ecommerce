import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  userList: [],
  userDetails: null,
  isLoading: false,
};

// ==========================================
// GET ALL USERS
// ==========================================

export const getAllUsersForAdmin = createAsyncThunk(
  "/admin/users/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/users/get",
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to get users",
        }
      );
    }
  }
);

// ==========================================
// GET USER DETAILS
// ==========================================

export const getUserDetailsForAdmin = createAsyncThunk(
  "/admin/users/getUserDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/details/${id}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to get user details",
        }
      );
    }
  }
);

// ==========================================
// UPDATE USER ROLE
// ==========================================

export const updateUserRoleForAdmin = createAsyncThunk(
  "/admin/users/updateRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/update-role/${id}`,
        {
          role,
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
          message: "Failed to update user role",
        }
      );
    }
  }
);

// ==========================================
// DELETE USER
// ==========================================

export const deleteUserForAdmin = createAsyncThunk(
  "/admin/users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/users/delete/${id}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Failed to delete user",
        }
      );
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const adminUsersSlice = createSlice({
  name: "adminUsers",

  initialState,

  reducers: {
    resetUserDetails: (state) => {
      state.userDetails = null;
    },
  },

  extraReducers: (builder) => {
    // ========================================
    // GET ALL USERS
    // ========================================

    builder
      .addCase(
        getAllUsersForAdmin.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        getAllUsersForAdmin.fulfilled,
        (state, action) => {
          state.isLoading = false;

          if (action.payload?.success) {
            state.userList =
              action.payload.data || [];
          } else {
            state.userList = [];
          }
        }
      )

      .addCase(
        getAllUsersForAdmin.rejected,
        (state) => {
          state.isLoading = false;
          state.userList = [];
        }
      );

    // ========================================
    // GET USER DETAILS
    // ========================================

    builder
      .addCase(
        getUserDetailsForAdmin.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        getUserDetailsForAdmin.fulfilled,
        (state, action) => {
          state.isLoading = false;

          if (action.payload?.success) {
            state.userDetails =
              action.payload.data;
          } else {
            state.userDetails = null;
          }
        }
      )

      .addCase(
        getUserDetailsForAdmin.rejected,
        (state) => {
          state.isLoading = false;
          state.userDetails = null;
        }
      );

    // ========================================
    // UPDATE ROLE
    // ========================================

    builder
      .addCase(
        updateUserRoleForAdmin.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        updateUserRoleForAdmin.fulfilled,
        (state, action) => {
          state.isLoading = false;

          if (action.payload?.success) {
            const updatedUser =
              action.payload.data;

            const userIndex =
              state.userList.findIndex(
                (user) =>
                  user._id === updatedUser?._id
              );

            if (userIndex !== -1) {
              state.userList[userIndex] =
                updatedUser;
            }

            if (
              state.userDetails &&
              state.userDetails._id ===
                updatedUser?._id
            ) {
              state.userDetails =
                updatedUser;
            }
          }
        }
      )

      .addCase(
        updateUserRoleForAdmin.rejected,
        (state) => {
          state.isLoading = false;
        }
      );

    // ========================================
    // DELETE USER
    // ========================================

    builder
      .addCase(
        deleteUserForAdmin.pending,
        (state) => {
          state.isLoading = true;
        }
      )

      .addCase(
        deleteUserForAdmin.fulfilled,
        (state, action) => {
          state.isLoading = false;

          if (action.payload?.success) {
            const deletedUserId =
              action.meta.arg;

            state.userList =
              state.userList.filter(
                (user) =>
                  user._id !== deletedUserId
              );

            state.userDetails = null;
          }
        }
      )

      .addCase(
        deleteUserForAdmin.rejected,
        (state) => {
          state.isLoading = false;
        }
      );
  },
});

export const {
  resetUserDetails,
} = adminUsersSlice.actions;

export default adminUsersSlice.reducer;