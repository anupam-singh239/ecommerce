import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import axios from "axios";


/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  isLoading: false,

  productList: [],

  productDetails: null,

  selectedProduct: null,
};


/* =========================================================
   FETCH ALL FILTERED PRODUCTS
========================================================= */

export const fetchAllFilteredProducts =
  createAsyncThunk(
    "/products/fetchAllProducts",

    async (
      {
        filterParams = {},
        sortParams = "default",
      },
      { rejectWithValue }
    ) => {
      try {
        const queryParams =
          new URLSearchParams();

        /* ======================================
           FILTER PARAMS
        ====================================== */

        Object.entries(
          filterParams || {}
        ).forEach(
          ([key, value]) => {
            if (
              Array.isArray(value) &&
              value.length > 0
            ) {
              queryParams.set(
                key,
                value.join(",")
              );
            }
          }
        );


        /* ======================================
           SORT
        ====================================== */

        queryParams.set(
          "sortBy",
          sortParams || "default"
        );


        const result =
          await axios.get(
            `http://localhost:5000/api/shop/products/get?${queryParams.toString()}`,
            {
              withCredentials: true,
            }
          );


        console.log(
          "FETCH PRODUCTS RESPONSE:",
          result?.data
        );


        return (
          result?.data || {
            success: false,
            data: [],
          }
        );

      } catch (error) {

        console.error(
          "Fetch products error:",
          error?.response?.data ||
            error?.message ||
            error
        );


        return rejectWithValue({
          success: false,

          data: [],

          message:
            error?.response?.data
              ?.message ||
            "Failed to fetch products",
        });
      }
    }
  );


/* =========================================================
   FETCH PRODUCT DETAILS
========================================================= */

export const fetchProductDetails =
  createAsyncThunk(
    "/products/fetchProductDetails",

    async (
      productId,
      { rejectWithValue }
    ) => {

      try {

        /* ======================================
           ID CHECK
        ====================================== */

        if (!productId) {
          console.error(
            "Product ID is missing"
          );

          return rejectWithValue({
            success: false,

            data: null,

            message:
              "Product ID is missing",
          });
        }


        console.log(
          "FETCHING PRODUCT DETAILS:",
          productId
        );


        /* ======================================
           API REQUEST
        ====================================== */

        const result =
          await axios.get(
            `http://localhost:5000/api/shop/products/get/${productId}`,
            {
              withCredentials: true,
            }
          );


        console.log(
          "PRODUCT DETAILS RESPONSE:",
          result?.data
        );


        /* ======================================
           RESPONSE CHECK
        ====================================== */

        if (
          result?.data?.success &&
          result?.data?.data
        ) {

          return {
            success: true,

            data: result.data.data,
          };

        }


        /* ======================================
           FALLBACK RESPONSE
        ====================================== */

        return {
          success:
            result?.data?.success ||
            false,

          data:
            result?.data?.data ||
            null,

          message:
            result?.data?.message ||
            "Product details not found",
        };

      } catch (error) {

        console.error(
          "Fetch product details error:",
          error?.response?.data ||
            error?.message ||
            error
        );


        return rejectWithValue({
          success: false,

          data: null,

          message:
            error?.response?.data
              ?.message ||
            "Failed to fetch product details",
        });
      }
    }
  );


/* =========================================================
   SHOPPING PRODUCT SLICE
========================================================= */

const shoppingProductSlice =
  createSlice({

    name:
      "shoppingProducts",

    initialState,


    /* =====================================================
       REDUCERS
    ===================================================== */

    reducers: {

      /* ======================================
         CLEAR PRODUCT DETAILS
      ====================================== */

      setProductDetails: (
        state
      ) => {

        state.productDetails =
          null;
      },


      /* ======================================
         SELECT PRODUCT
      ====================================== */

      setSelectedProduct: (
        state,
        action
      ) => {

        state.selectedProduct =
          action.payload;
      },


      /* ======================================
         CLEAR SELECTED PRODUCT
      ====================================== */

      clearSelectedProduct: (
        state
      ) => {

        state.selectedProduct =
          null;
      },
    },


    /* =====================================================
       EXTRA REDUCERS
    ===================================================== */

    extraReducers: (
      builder
    ) => {

      builder


        /* ================================================
           FETCH ALL PRODUCTS - PENDING
        ================================================ */

        .addCase(
          fetchAllFilteredProducts.pending,
          (state) => {

            state.isLoading =
              true;
          }
        )


        /* ================================================
           FETCH ALL PRODUCTS - SUCCESS
        ================================================ */

        .addCase(
          fetchAllFilteredProducts.fulfilled,
          (
            state,
            action
          ) => {

            state.isLoading =
              false;

            state.productList =
              action.payload
                ?.data || [];
          }
        )


        /* ================================================
           FETCH ALL PRODUCTS - FAILED
        ================================================ */

        .addCase(
          fetchAllFilteredProducts.rejected,
          (state) => {

            state.isLoading =
              false;

            state.productList =
              [];
          }
        )


        /* ================================================
           FETCH PRODUCT DETAILS - PENDING
        ================================================ */

        .addCase(
          fetchProductDetails.pending,
          (state) => {

            state.isLoading =
              true;
          }
        )


        /* ================================================
           FETCH PRODUCT DETAILS - SUCCESS
        ================================================ */

        .addCase(
          fetchProductDetails.fulfilled,
          (
            state,
            action
          ) => {

            state.isLoading =
              false;


            const product =
              action.payload
                ?.data || null;


            console.log(
              "REDUX PRODUCT DETAILS:",
              product
            );


            state.productDetails =
              product;
          }
        )


        /* ================================================
           FETCH PRODUCT DETAILS - FAILED
        ================================================ */

        .addCase(
          fetchProductDetails.rejected,
          (
            state,
            action
          ) => {

            state.isLoading =
              false;

            state.productDetails =
              null;


            console.error(
              "PRODUCT DETAILS FAILED:",
              action.payload
            );
          }
        );

    },
  });


/* =========================================================
   EXPORT ACTIONS
========================================================= */

export const {
  setProductDetails,

  setSelectedProduct,

  clearSelectedProduct,

} =
  shoppingProductSlice.actions;


/* =========================================================
   EXPORT REDUCER
========================================================= */

export default
  shoppingProductSlice.reducer;