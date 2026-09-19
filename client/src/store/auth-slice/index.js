import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

// ===============================
// Register User
// ===============================
export const registerUser = createAsyncThunk(
  "/auth/register",

  async (formData) => {
    const response = await axios.post(
      "https://ecommerce-h0hd.onrender.com/api/auth/register",
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// ===============================
// Login User
// ===============================
export const loginUser = createAsyncThunk(
  "/auth/login",

  async (formData) => {
    const response = await axios.post(
      "https://ecommerce-h0hd.onrender.com/api/auth/login",
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// ===============================
// Update User Profile
// ===============================
export const updateUserProfile = createAsyncThunk(
  "/auth/updateProfile",

  async (formData) => {
    const response = await axios.put(
      "https://ecommerce-h0hd.onrender.com/api/auth/profile",
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// ===============================
// Upload Profile Image
// ===============================
export const uploadProfileImage = createAsyncThunk(
  "/auth/uploadProfileImage",

  async (formData) => {
    const response = await axios.put(
      "https://ecommerce-h0hd.onrender.com/api/auth/profile-image",
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }
);

// ===============================
// CHANGE PASSWORD
// ===============================
export const changePassword = createAsyncThunk(
  "/auth/changePassword",

  async (passwordData) => {
    const response = await axios.put(
      "https://ecommerce-h0hd.onrender.com/api/auth/change-password",
      passwordData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// ===============================
// Logout User
// ===============================
export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async () => {
    const response = await axios.post(
      "https://ecommerce-h0hd.onrender.com/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// ===============================
// Check Authentication
// ===============================
export const checkAuth = createAsyncThunk(
  "/auth/checkauth",

  async () => {
    const response = await axios.get(
      "https://ecommerce-h0hd.onrender.com/api/auth/check-auth",
      {
        withCredentials: true,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );

    return response.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===============================
      // Register
      // ===============================
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // ===============================
      // Login
      // ===============================
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(action);

        state.isLoading = false;

        state.user = action.payload.success
          ? action.payload.user
          : null;

        state.isAuthenticated =
          action.payload.success;
      })

      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // ===============================
      // Update Profile
      // ===============================
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })

      .addCase(updateUserProfile.rejected, (state) => {
        state.isLoading = false;
      })

      // ===============================
      // Upload Profile Image
      // ===============================
      .addCase(uploadProfileImage.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })

      .addCase(uploadProfileImage.rejected, (state) => {
        state.isLoading = false;
      })

      // ===============================
      // Change Password
      // ===============================
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(changePassword.rejected, (state) => {
        state.isLoading = false;
      })

      // ===============================
      // Check Auth
      // ===============================
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;

        state.user = action.payload.success
          ? action.payload.user
          : null;

        state.isAuthenticated =
          action.payload.success;
      })

      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // ===============================
      // Logout
      // ===============================
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser } = authSlice.actions;

export default authSlice.reducer;