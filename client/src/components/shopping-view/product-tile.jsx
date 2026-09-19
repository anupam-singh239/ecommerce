import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import {
  brandOptionsMap,
  categoryOptionsMap,
} from "@/config";

import { Badge } from "../ui/badge";
import { Heart } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/shop/wishlist-slice";


function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const dispatch = useDispatch();


  /* =====================================================
     WISHLIST
  ===================================================== */

  const wishlist = useSelector(
    (state) =>
      state.shopWishlist?.wishlist || []
  );


  /* =====================================================
     PRODUCT ID
  ===================================================== */

  const productId =
    product?._id;


  /* =====================================================
     CHECK WISHLIST
  ===================================================== */

  const isInWishlist =
    wishlist.some(
      (item) =>
        item?._id === productId ||
        item === productId
    );


  /* =====================================================
     OPEN PRODUCT DETAILS
  ===================================================== */

  function handleProductClick() {
    if (!productId) {
      console.error(
        "Product ID is missing:",
        product
      );

      return;
    }

    console.log(
      "OPEN PRODUCT DETAILS:",
      productId
    );

    if (
      typeof handleGetProductDetails ===
      "function"
    ) {
      handleGetProductDetails(
        productId
      );
    } else {
      console.error(
        "handleGetProductDetails is not a function"
      );
    }
  }


  /* =====================================================
     WISHLIST HANDLER
  ===================================================== */

  function handleWishlist(event) {
    event.stopPropagation();

    if (!productId) {
      return;
    }


    if (isInWishlist) {
      dispatch(
        removeFromWishlist(
          productId
        )
      );
    } else {
      dispatch(
        addToWishlist(
          productId
        )
      );
    }
  }


  /* =====================================================
     PRICE
  ===================================================== */

  const price =
    Number(
      product?.price || 0
    );

  const salePrice =
    Number(
      product?.salePrice || 0
    );

  const hasSale =
    salePrice > 0 &&
    salePrice < price;

  const finalPrice =
    hasSale
      ? salePrice
      : price;


  /* =====================================================
     DISCOUNT
  ===================================================== */

  const discount =
    hasSale && price > 0
      ? Math.round(
          ((price - salePrice) /
            price) *
            100
        )
      : 0;


  /* =====================================================
     STOCK
  ===================================================== */

  const totalStock =
    Number(
      product?.totalStock || 0
    );


  /* =====================================================
     UI
  ===================================================== */

  return (
    <Card
      className="
        w-full
        max-w-sm
        mx-auto
        overflow-hidden
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >

      {/* =================================================
          CLICKABLE PRODUCT AREA
      ================================================= */}

      <div
        onClick={handleProductClick}
        className="
          cursor-pointer
          select-none
        "
      >

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <div
          className="
            relative
            bg-gray-50
          "
        >

          {product?.image ? (

            <img
              src={product.image}
              alt={
                product?.title ||
                "Product"
              }
              className="
                w-full
                h-[300px]
                object-cover
                rounded-t-lg
              "
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

          ) : (

            <div
              className="
                w-full
                h-[300px]
                flex
                items-center
                justify-center
                bg-gray-100
                text-gray-400
              "
            >
              Product image unavailable
            </div>

          )}


          {/* =================================================
              WISHLIST BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleWishlist}
            className={`
              absolute
              top-3
              right-3
              h-10
              w-10
              rounded-full
              flex
              items-center
              justify-center
              shadow-md
              transition-all
              duration-200
              ${
                isInWishlist
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }
            `}
            title={
              isInWishlist
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >

            <Heart
              className="h-5 w-5"
              fill={
                isInWishlist
                  ? "currentColor"
                  : "none"
              }
            />

          </button>


          {/* =================================================
              DISCOUNT BADGE
          ================================================= */}

          {discount > 0 && (

            <Badge
              className="
                absolute
                top-3
                left-3
                bg-red-500
                hover:bg-red-600
                font-bold
              "
            >
              {discount}% OFF
            </Badge>

          )}


          {/* =================================================
              STOCK BADGE
          ================================================= */}

          {discount === 0 &&
            totalStock === 0 && (

              <Badge
                className="
                  absolute
                  top-3
                  left-3
                  bg-red-500
                  hover:bg-red-600
                "
              >
                Out Of Stock
              </Badge>

            )}


          {discount === 0 &&
            totalStock > 0 &&
            totalStock < 10 && (

              <Badge
                className="
                  absolute
                  top-3
                  left-3
                  bg-orange-500
                  hover:bg-orange-600
                "
              >
                Only {totalStock} left
              </Badge>

            )}

        </div>


        {/* =================================================
            PRODUCT CONTENT
        ================================================= */}

        <CardContent
          className="p-4"
        >

          {/* TITLE */}

          <h2
            className="
              text-xl
              font-bold
              mb-2
              line-clamp-1
            "
          >
            {product?.title ||
              "Product"}
          </h2>


          {/* CATEGORY + BRAND */}

          <div
            className="
              flex
              justify-between
              items-center
              gap-2
              mb-3
            "
          >

            <span
              className="
                text-sm
                text-muted-foreground
                truncate
              "
            >
              {
                categoryOptionsMap[
                  product?.category
                ] ||
                product?.category ||
                "Category"
              }
            </span>


            <span
              className="
                text-sm
                text-muted-foreground
                truncate
              "
            >
              {
                brandOptionsMap[
                  product?.brand
                ] ||
                product?.brand ||
                "Brand"
              }
            </span>

          </div>


          {/* PRICE */}

          <div
            className="
              flex
              items-center
              gap-2
              flex-wrap
            "
          >

            {hasSale && (

              <span
                className="
                  text-base
                  text-muted-foreground
                  line-through
                "
              >
                ₹
                {price.toLocaleString(
                  "en-IN"
                )}
              </span>

            )}


            <span
              className="
                text-xl
                font-bold
                text-primary
              "
            >
              ₹
              {finalPrice.toLocaleString(
                "en-IN"
              )}
            </span>

          </div>

        </CardContent>

      </div>


      {/* =================================================
          ADD TO CART
      ================================================= */}

      <CardFooter
        className="p-4 pt-0"
      >

        {totalStock === 0 ? (

          <Button
            type="button"
            disabled
            className="
              w-full
              opacity-60
              cursor-not-allowed
            "
          >
            Out Of Stock
          </Button>

        ) : (

          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              if (
                typeof handleAddtoCart ===
                "function"
              ) {
                handleAddtoCart(
                  productId,
                  totalStock
                );
              }
            }}
            className="w-full"
          >
            Add to Cart
          </Button>

        )}

      </CardFooter>

    </Card>
  );
}


export default ShoppingProductTile;