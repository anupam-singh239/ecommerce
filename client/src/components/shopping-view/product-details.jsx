import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { useDispatch, useSelector } from "react-redux";

import {
  addToCart,
  fetchCartItems,
} from "@/store/shop/cart-slice";

import { useToast } from "../ui/use-toast";

import {
  setProductDetails,
} from "@/store/shop/products-slice";

import StarRatingComponent from "../common/star-rating";

import {
  useEffect,
  useState,
} from "react";

import {
  addReview,
  getReviews,
} from "@/store/shop/review-slice";


/* =====================================================
   PRODUCT DETAILS DIALOG
===================================================== */

function ProductDetailsDialog({
  open,
  setOpen,
  productDetails,
}) {
  /* =====================================================
     STATE
  ===================================================== */

  const [
    reviewMsg,
    setReviewMsg,
  ] = useState("");

  const [
    rating,
    setRating,
  ] = useState(0);


  /* =====================================================
     REDUX
  ===================================================== */

  const dispatch = useDispatch();

  const {
    user,
  } = useSelector(
    (state) => state.auth
  );

  const {
    cartItems,
  } = useSelector(
    (state) => state.shopCart
  );

  const {
    reviews,
  } = useSelector(
    (state) => state.shopReview
  );

  const {
    toast,
  } = useToast();


  /* =====================================================
     PRODUCT VALUES
  ===================================================== */

  const productId =
    productDetails?._id;

  const productTitle =
    productDetails?.title || "Product";

  const productDescription =
    productDetails?.description ||
    "No description available.";

  const productImage =
    productDetails?.image || "";

  const originalPrice =
    Number(
      productDetails?.price || 0
    );

  const salePrice =
    Number(
      productDetails?.salePrice || 0
    );

  const totalStock =
    Number(
      productDetails?.totalStock || 0
    );


  /* =====================================================
     FINAL PRICE
  ===================================================== */

  const hasSale =
    salePrice > 0 &&
    salePrice < originalPrice;

  const finalPrice =
    hasSale
      ? salePrice
      : originalPrice;


  /* =====================================================
     DISCOUNT
  ===================================================== */

  const discount =
    hasSale && originalPrice > 0
      ? Math.round(
          ((originalPrice -
            salePrice) /
            originalPrice) *
            100
        )
      : 0;


  /* =====================================================
     RATING CHANGE
  ===================================================== */

  function handleRatingChange(
    getRating
  ) {
    setRating(getRating);
  }


  /* =====================================================
     ADD TO CART
  ===================================================== */

  function handleAddToCart(
    getCurrentProductId,
    getTotalStock
  ) {
    /* ======================================
       LOGIN CHECK
    ====================================== */

    if (!user?.id) {
      toast({
        title:
          "Please login first",
        variant:
          "destructive",
      });

      return;
    }


    /* ======================================
       STOCK CHECK
    ====================================== */

    const getCartItems =
      cartItems?.items || [];

    if (
      getCartItems.length
    ) {
      const indexOfCurrentItem =
        getCartItems.findIndex(
          (item) =>
            item.productId ===
            getCurrentProductId
        );

      if (
        indexOfCurrentItem >
        -1
      ) {
        const getQuantity =
          Number(
            getCartItems[
              indexOfCurrentItem
            ]?.quantity || 0
          );

        if (
          getQuantity + 1 >
          Number(getTotalStock || 0)
        ) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant:
              "destructive",
          });

          return;
        }
      }
    }


    /* ======================================
       ADD PRODUCT
    ====================================== */

    dispatch(
      addToCart({
        userId:
          user.id,

        productId:
          getCurrentProductId,

        quantity: 1,
      })
    ).then((data) => {
      if (
        data?.payload?.success
      ) {
        dispatch(
          fetchCartItems(
            user.id
          )
        );

        toast({
          title:
            "Product is added to cart",
        });
      }
    });
  }


  /* =====================================================
     CLOSE DIALOG
  ===================================================== */

  function handleDialogClose(
    value
  ) {
    setOpen(value);

    if (!value) {
      dispatch(
        setProductDetails()
      );

      setRating(0);
      setReviewMsg("");
    }
  }


  /* =====================================================
     ADD REVIEW
  ===================================================== */

  function handleAddReview() {
    if (
      !reviewMsg.trim()
    ) {
      toast({
        title:
          "Please write a review",
        variant:
          "destructive",
      });

      return;
    }


    if (!rating) {
      toast({
        title:
          "Please select a rating",
        variant:
          "destructive",
      });

      return;
    }


    if (!productId) {
      return;
    }


    if (!user?.id) {
      toast({
        title:
          "Please login first",
        variant:
          "destructive",
      });

      return;
    }


    dispatch(
      addReview({
        productId:
          productId,

        userId:
          user.id,

        userName:
          user.userName,

        reviewMessage:
          reviewMsg.trim(),

        reviewValue:
          rating,
      })
    ).then((data) => {
      if (
        data?.payload?.success
      ) {
        setRating(0);
        setReviewMsg("");

        dispatch(
          getReviews(
            productId
          )
        );

        toast({
          title:
            "Review added successfully!",
        });
      }
    });
  }


  /* =====================================================
     GET REVIEWS
  ===================================================== */

  useEffect(() => {
    if (productId) {
      dispatch(
        getReviews(productId)
      );
    }
  }, [
    dispatch,
    productId,
  ]);


  /* =====================================================
     AVERAGE REVIEW
  ===================================================== */

  const averageReview =
    reviews &&
    reviews.length > 0
      ? reviews.reduce(
          (
            sum,
            reviewItem
          ) =>
            sum +
            Number(
              reviewItem?.reviewValue ||
                0
            ),
          0
        ) /
        reviews.length
      : 0;


  /* =====================================================
     UI
  ===================================================== */

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleDialogClose
      }
    >

      <DialogContent
        className="
          w-[95vw]
          max-w-[1100px]
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          bg-white
          p-0
        "
      >

        {/* =================================================
            ACCESSIBILITY
        ================================================= */}

        <DialogTitle
          className="sr-only"
        >
          {productTitle}
        </DialogTitle>

        <DialogDescription
          className="sr-only"
        >
          View product details,
          price, reviews and add
          the product to your cart.
        </DialogDescription>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-0
          "
        >

          {/* =================================================
              LEFT - PRODUCT IMAGE
          ================================================= */}

          <div
            className="
              bg-gray-50
              p-5
              md:p-8
              flex
              items-center
              justify-center
              min-h-[350px]
              md:min-h-[600px]
            "
          >

            {productImage ? (

              <div
                className="
                  w-full
                  h-full
                  flex
                  items-center
                  justify-center
                "
              >

                <img
                  src={productImage}
                  alt={productTitle}
                  className="
                    w-full
                    max-w-[520px]
                    h-[350px]
                    md:h-[520px]
                    object-contain
                    rounded-xl
                  "
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>

            ) : (

              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  text-muted-foreground
                "
              >

                <div
                  className="
                    w-20
                    h-20
                    rounded-full
                    bg-gray-200
                    flex
                    items-center
                    justify-center
                    mb-4
                  "
                >
                  📦
                </div>

                <p className="font-medium">
                  Product image unavailable
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              RIGHT - PRODUCT INFORMATION
          ================================================= */}

          <div
            className="
              p-6
              md:p-8
              flex
              flex-col
            "
          >

            {/* =================================================
                CATEGORY + BRAND
            ================================================= */}

            <div
              className="
                flex
                flex-wrap
                gap-2
                mb-3
              "
            >

              {productDetails?.category && (
                <span
                  className="
                    rounded-full
                    bg-blue-50
                    text-blue-700
                    px-3
                    py-1
                    text-xs
                    font-semibold
                  "
                >
                  {
                    productDetails.category
                  }
                </span>
              )}

              {productDetails?.brand && (
                <span
                  className="
                    rounded-full
                    bg-gray-100
                    text-gray-700
                    px-3
                    py-1
                    text-xs
                    font-semibold
                  "
                >
                  {
                    productDetails.brand
                  }
                </span>
              )}

            </div>


            {/* =================================================
                TITLE
            ================================================= */}

            <h1
              className="
                text-2xl
                md:text-3xl
                font-extrabold
                text-gray-900
                leading-tight
              "
            >
              {productTitle}
            </h1>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p
              className="
                mt-4
                text-sm
                md:text-base
                leading-7
                text-gray-600
              "
            >
              {productDescription}
            </p>


            {/* =================================================
                PRICE
            ================================================= */}

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-3
              "
            >

              <span
                className="
                  text-3xl
                  font-extrabold
                  text-gray-900
                "
              >
                ₹
                {finalPrice.toLocaleString(
                  "en-IN"
                )}
              </span>


              {hasSale && (
                <>
                  <span
                    className="
                      text-lg
                      text-gray-400
                      line-through
                    "
                  >
                    ₹
                    {originalPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  {discount > 0 && (
                    <span
                      className="
                        rounded-full
                        bg-green-100
                        text-green-700
                        px-3
                        py-1
                        text-xs
                        font-bold
                      "
                    >
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}

            </div>


            {/* =================================================
                RATING
            ================================================= */}

            <div
              className="
                mt-4
                flex
                items-center
                gap-2
              "
            >

              <StarRatingComponent
                rating={
                  averageReview
                }
              />

              <span
                className="
                  text-sm
                  font-medium
                  text-gray-500
                "
              >
                {averageReview > 0
                  ? averageReview.toFixed(
                      1
                    )
                  : "0.0"}
              </span>

              <span
                className="
                  text-sm
                  text-gray-400
                "
              >
                (
                {reviews?.length || 0}{" "}
                reviews)
              </span>

            </div>


            {/* =================================================
                STOCK
            ================================================= */}

            <div className="mt-5">

              {totalStock > 0 ? (

                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-green-100
                    text-green-700
                    px-3
                    py-1
                    text-sm
                    font-semibold
                  "
                >
                  ✓ In Stock
                  {" "}
                  ({totalStock} available)
                </span>

              ) : (

                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-red-100
                    text-red-700
                    px-3
                    py-1
                    text-sm
                    font-semibold
                  "
                >
                  Out of Stock
                </span>

              )}

            </div>


            {/* =================================================
                ADD TO CART
            ================================================= */}

            <div
              className="
                mt-6
                mb-6
              "
            >

              {totalStock === 0 ? (

                <Button
                  disabled
                  className="
                    w-full
                    h-12
                    text-base
                  "
                >
                  Out of Stock
                </Button>

              ) : (

                <Button
                  className="
                    w-full
                    h-12
                    text-base
                    font-bold
                  "
                  onClick={() =>
                    handleAddToCart(
                      productId,
                      totalStock
                    )
                  }
                >
                  Add to Cart
                </Button>

              )}

            </div>


            <Separator />


            {/* =================================================
                REVIEWS
            ================================================= */}

            <div
              className="
                mt-6
                max-h-[300px]
                overflow-y-auto
                pr-2
              "
            >

              <h2
                className="
                  text-xl
                  font-bold
                  mb-5
                "
              >
                Reviews
              </h2>


              {/* REVIEW LIST */}

              <div
                className="
                  grid
                  gap-5
                "
              >

                {reviews &&
                reviews.length > 0 ? (

                  reviews.map(
                    (
                      reviewItem,
                      index
                    ) => (

                      <div
                        key={
                          reviewItem?._id ||
                          index
                        }
                        className="
                          flex
                          gap-3
                        "
                      >

                        {/* AVATAR */}

                        <Avatar
                          className="
                            w-10
                            h-10
                            border
                            shrink-0
                          "
                        >

                          <AvatarFallback>
                            {reviewItem?.userName
                              ? reviewItem.userName
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()
                              : "U"}
                          </AvatarFallback>

                        </Avatar>


                        {/* REVIEW CONTENT */}

                        <div
                          className="
                            flex
                            flex-col
                            gap-1
                          "
                        >

                          <h3
                            className="
                              font-bold
                              text-sm
                            "
                          >
                            {
                              reviewItem?.userName ||
                              "User"
                            }
                          </h3>


                          <StarRatingComponent
                            rating={
                              Number(
                                reviewItem?.reviewValue ||
                                  0
                              )
                            }
                          />


                          <p
                            className="
                              text-sm
                              text-gray-600
                              leading-6
                            "
                          >
                            {
                              reviewItem?.reviewMessage
                            }
                          </p>

                        </div>

                      </div>

                    )

                  )

                ) : (

                  <p
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    No Reviews
                  </p>

                )}

              </div>


              {/* =================================================
                  WRITE REVIEW
              ================================================= */}

              <div
                className="
                  mt-8
                  pt-5
                  border-t
                "
              >

                <Label
                  className="
                    text-base
                    font-semibold
                  "
                >
                  Write a review
                </Label>


                {/* STAR RATING */}

                <div
                  className="
                    mt-3
                    flex
                  "
                >
                  <StarRatingComponent
                    rating={rating}
                    handleRatingChange={
                      handleRatingChange
                    }
                  />
                </div>


                {/* REVIEW INPUT */}

                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(
                    event
                  ) =>
                    setReviewMsg(
                      event.target.value
                    )
                  }
                  placeholder="Write a review..."
                  className="mt-3"
                />


                {/* SUBMIT */}

                <Button
                  onClick={
                    handleAddReview
                  }
                  disabled={
                    reviewMsg.trim() ===
                      "" ||
                    rating === 0
                  }
                  className="
                    w-full
                    mt-3
                  "
                >
                  Submit Review
                </Button>

              </div>

            </div>

          </div>

        </div>

      </DialogContent>

    </Dialog>
  );
}

export default ProductDetailsDialog;