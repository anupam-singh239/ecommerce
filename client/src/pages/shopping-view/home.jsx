import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ShoppingBag,
  Sparkles,
  Star,
  Zap,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingFooter from "@/components/shopping-view/footer";
import AIChatbot from "@/components/ai/ai-chatbot";

import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  setSelectedProduct,
} from "@/store/shop/products-slice";

import {
  addToCart,
  fetchCartItems,
} from "@/store/shop/cart-slice";

import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "@/store/shop/wishlist-slice";

import { getFeatureImages } from "@/store/common-slice";

import { useToast } from "@/components/ui/use-toast";

/* =========================================================
   CLOUDINARY HD IMAGE
========================================================= */

function getHDImage(url, width = 1920) {
  if (!url) return "";

  if (!url.includes("cloudinary.com")) {
    return url;
  }

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto:best,dpr_auto,w_${width}/`
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  const dispatch = useDispatch();

  const { toast } = useToast();

  /* =========================================================
     REDUX
  ========================================================= */

  const {
    productList,
    selectedProduct,
    productDetails,
  } = useSelector(
    (state) => state.shopProducts
  );

  const {
    featureImageList,
  } = useSelector(
    (state) => state.commonFeature
  );

  const wishlist = useSelector(
    (state) => state.shopWishlist?.wishlist || []
  );

  const { user } = useSelector(
    (state) => state.auth
  );

  /* =========================================================
     LOCAL STATES
  ========================================================= */

  const [currentSlide, setCurrentSlide] =
    useState(0);

  const [openDetailsDialog, setOpenDetailsDialog] =
    useState(false);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "default",
      })
    );

    dispatch(getFeatureImages());
  }, [dispatch]);

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  useEffect(() => {
    if (user?.id) {
      dispatch(getWishlist());
    }
  }, [dispatch, user?.id]);

  /* =========================================================
     RESET SLIDE IF LIST CHANGES
  ========================================================= */

  useEffect(() => {
    if (
      featureImageList &&
      currentSlide >= featureImageList.length
    ) {
      setCurrentSlide(0);
    }
  }, [
    featureImageList,
    currentSlide,
  ]);

  /* =========================================================
     AUTO SLIDER
  ========================================================= */

  useEffect(() => {
    if (
      !featureImageList ||
      featureImageList.length <= 1
    ) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === featureImageList.length - 1
          ? 0
          : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  /* =========================================================
     PREVIOUS
  ========================================================= */

  const handlePrevious = () => {
    if (!featureImageList?.length) return;

    setCurrentSlide((prev) =>
      prev === 0
        ? featureImageList.length - 1
        : prev - 1
    );
  };

  /* =========================================================
     NEXT
  ========================================================= */

  const handleNext = () => {
    if (!featureImageList?.length) return;

    setCurrentSlide((prev) =>
      prev === featureImageList.length - 1
        ? 0
        : prev + 1
    );
  };

  /* =========================================================
     PRODUCT DETAILS
  ========================================================= */

  const handleProductClick = (product) => {
    const productId = product?._id;

    console.log(
      "HOME PRODUCT CLICK:",
      product
    );

    console.log(
      "HOME PRODUCT ID:",
      productId
    );

    if (!productId) {
      toast({
        title: "Product details unavailable",
        description: "Product ID was not found.",
        variant: "destructive",
      });

      return;
    }

    /* -----------------------------------------
       Show selected product immediately
    ----------------------------------------- */

    dispatch(
      setSelectedProduct(product)
    );

    /* -----------------------------------------
       Open dialog
    ----------------------------------------- */

    setOpenDetailsDialog(true);

    /* -----------------------------------------
       Fetch complete product details
    ----------------------------------------- */

    dispatch(
      fetchProductDetails(productId)
    );
  };

  /* =========================================================
     WHEN API DETAILS ARRIVE
  ========================================================= */

  useEffect(() => {
    if (
      productDetails &&
      productDetails?._id
    ) {
      console.log(
        "HOME PRODUCT DETAILS LOADED:",
        productDetails
      );

      dispatch(
        setSelectedProduct(productDetails)
      );
    }
  }, [
    productDetails,
    dispatch,
  ]);

  /* =========================================================
     WISHLIST
  ========================================================= */

  const handleWishlist = async (
    event,
    product
  ) => {
    event.stopPropagation();

    const productId = product?._id;

    if (!productId) {
      return;
    }

    /* -----------------------------------------
       LOGIN CHECK
    ----------------------------------------- */

    if (!user?.id) {
      toast({
        title: "Please login first",
        description:
          "Login to add products to your wishlist.",
        variant: "destructive",
      });

      return;
    }

    /* -----------------------------------------
       CHECK CURRENT WISHLIST
    ----------------------------------------- */

    const isInWishlist = wishlist?.some(
      (item) =>
        item?._id === productId ||
        item === productId ||
        item?.productId === productId
    );

    /* -----------------------------------------
       REMOVE
    ----------------------------------------- */

    if (isInWishlist) {
      const result = await dispatch(
        removeFromWishlist(productId)
      );

      if (result?.payload?.success) {
        toast({
          title: "Removed from wishlist",
          description:
            "Product has been removed from your wishlist.",
        });

        dispatch(getWishlist());
      } else {
        toast({
          title: "Unable to remove",
          description:
            result?.payload?.message ||
            "Something went wrong.",
          variant: "destructive",
        });
      }

      return;
    }

    /* -----------------------------------------
       ADD
    ----------------------------------------- */

    const result = await dispatch(
      addToWishlist(productId)
    );

    if (result?.payload?.success) {
      toast({
        title: "Added to wishlist ❤️",
        description:
          "Product has been added to your wishlist.",
      });

      dispatch(getWishlist());
    } else {
      toast({
        title: "Unable to add",
        description:
          result?.payload?.message ||
          "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const handleAddToCart = async (productId) => {
    const result = await dispatch(
      addToCart({
        userId: null,
        productId,
        quantity: 1,
      })
    );

    if (result?.payload?.success) {
      dispatch(fetchCartItems());

      toast({
        title: "Added to cart",
        description:
          "Product has been added to your cart.",
      });
    } else {
      toast({
        title: "Please login",
        description:
          "Login to add products to your cart.",
        variant: "destructive",
      });
    }
  };

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = [
    {
      name: "Men",
      emoji: "👔",
      description: "Latest men's fashion",
    },
    {
      name: "Women",
      emoji: "👗",
      description: "Elegant women's collection",
    },
    {
      name: "Electronics",
      emoji: "📱",
      description: "Smart & modern gadgets",
    },
    {
      name: "Footwear",
      emoji: "👟",
      description: "Step into style",
    },
    {
      name: "Accessories",
      emoji: "⌚",
      description: "Complete your look",
    },
    {
      name: "Beauty",
      emoji: "✨",
      description: "Beauty & personal care",
    },
  ];

  /* =========================================================
     BRANDS
  ========================================================= */

  const brands = useMemo(() => {
    const productBrands = [
      ...new Set(
        (productList || [])
          .map(
            (product) =>
              product?.brand?.trim()
          )
          .filter(Boolean)
      ),
    ];

    const defaultBrands = [
      "Nike",
      "Adidas",
      "Puma",
      "Apple",
      "Samsung",
      "Sony",
      "Levi's",
      "HP",
    ];

    const finalBrands = [
      ...productBrands,
      ...defaultBrands.filter(
        (brand) =>
          !productBrands.includes(brand)
      ),
    ];

    return finalBrands.slice(0, 8);
  }, [productList]);

  /* =========================================================
     TRENDING PRODUCTS
  ========================================================= */

  const trendingProducts = useMemo(() => {
    return [
      ...(productList || []),
    ]
      .sort((a, b) => {
        const aStock = Number(
          a?.totalStock || 0
        );

        const bStock = Number(
          b?.totalStock || 0
        );

        return bStock - aStock;
      })
      .slice(0, 8);
  }, [productList]);

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="min-h-screen bg-background">

      {/* =====================================================
          PREMIUM HERO
      ===================================================== */}

      <section className="relative w-full overflow-hidden bg-slate-950">

        <div className="relative h-[420px] w-full sm:h-[500px] lg:h-[620px]">

          {featureImageList?.length > 0 ? (

            featureImageList.map(
              (slide, index) => (

                <div
                  key={
                    slide?._id ||
                    index
                  }
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                >

                  <img
                    src={getHDImage(
                      slide?.image,
                      1920
                    )}
                    alt={`Premium shopping banner ${
                      index + 1
                    }`}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />

                  <div className="absolute inset-0 z-10 flex items-center">

                    <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">

                      <div className="max-w-xl text-white">

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide backdrop-blur-md">

                          <Sparkles size={15} />

                          PREMIUM COLLECTION

                        </div>

                        <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">

                          Shop Beyond

                          <br />

                          Ordinary.

                        </h1>

                        <p className="mt-5 max-w-lg text-sm leading-6 text-white/80 sm:text-base sm:leading-7">

                          Discover premium products, latest
                          trends and exclusive deals — all in
                          one beautiful place.

                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">

                          <Button
                            className="h-11 bg-white px-6 font-bold text-slate-950 shadow-xl hover:bg-white/90"
                            onClick={() =>
                              (window.location.href =
                                "/shop/listing")
                            }
                          >

                            Start Shopping

                            <ArrowRight
                              className="ml-2"
                              size={17}
                            />

                          </Button>

                          <Button
                            variant="outline"
                            className="h-11 border-white/30 bg-white/10 px-6 font-bold text-white backdrop-blur-md hover:bg-white hover:text-slate-950"
                            onClick={() =>
                              (window.location.href =
                                "/shop/listing")
                            }
                          >

                            Explore Deals

                          </Button>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )
            )

          ) : (

            <div className="flex h-full items-center justify-center bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 px-6">

              <div className="text-center text-white">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">

                  <ShoppingBag size={32} />

                </div>

                <h1 className="text-4xl font-black sm:text-6xl">

                  Premium Shopping

                </h1>

                <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">

                  Discover products, latest trends and
                  exclusive deals.

                </p>

                <Button
                  className="mt-7 bg-white text-slate-950 hover:bg-white/90"
                  onClick={() =>
                    (window.location.href =
                      "/shop/listing")
                  }
                >

                  Start Shopping

                  <ArrowRight
                    className="ml-2"
                    size={17}
                  />

                </Button>

              </div>

            </div>

          )}

          {featureImageList?.length > 1 && (

            <button
              onClick={handlePrevious}
              aria-label="Previous banner"
              className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white shadow-xl backdrop-blur-md transition hover:bg-white hover:text-slate-900"
            >

              <ChevronLeft size={23} />

            </button>

          )}

          {featureImageList?.length > 1 && (

            <button
              onClick={handleNext}
              aria-label="Next banner"
              className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white shadow-xl backdrop-blur-md transition hover:bg-white hover:text-slate-900"
            >

              <ChevronRight size={23} />

            </button>

          )}

          {featureImageList?.length > 1 && (

            <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">

              {featureImageList.map(
                (_, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      setCurrentSlide(index)
                    }
                    aria-label={`Go to banner ${
                      index + 1
                    }`}
                    className={`h-2.5 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-9 bg-white"
                        : "w-2.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          TRUST STRIP
      ===================================================== */}

      <section className="border-b bg-white">

        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">

          <div className="flex items-center gap-3 px-5 py-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

              <Truck size={22} />

            </div>

            <div>

              <p className="font-bold text-slate-900">
                Fast Delivery
              </p>

              <p className="text-xs text-slate-500">
                Quick & safe delivery
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3 px-5 py-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">

              <ShieldCheck size={22} />

            </div>

            <div>

              <p className="font-bold text-slate-900">
                Secure Payment
              </p>

              <p className="text-xs text-slate-500">
                Safe checkout
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3 px-5 py-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

              <RotateCcw size={22} />

            </div>

            <div>

              <p className="font-bold text-slate-900">
                Easy Returns
              </p>

              <p className="text-xs text-slate-500">
                Hassle-free returns
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3 px-5 py-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">

              <Headphones size={22} />

            </div>

            <div>

              <p className="font-bold text-slate-900">
                Premium Support
              </p>

              <p className="text-xs text-slate-500">
                We're here for you
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="mb-9 flex items-end justify-between gap-4">

          <div>

            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Explore
            </span>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-2 text-slate-500">
              Find exactly what you're looking for
            </p>

          </div>

          <Button
            variant="ghost"
            className="hidden sm:flex"
            onClick={() =>
              (window.location.href =
                "/shop/listing")
            }
          >

            View All

            <ArrowRight
              className="ml-2"
              size={17}
            />

          </Button>

        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          {categories.map(
            (category) => (

              <button
                key={category.name}
                onClick={() =>
                  (window.location.href =
                    `/shop/listing?category=${encodeURIComponent(
                      category.name
                    )}`)
                }
                className="group rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-4xl transition-transform duration-300 group-hover:scale-110">

                  {category.emoji}

                </div>

                <h3 className="font-bold text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {category.description}
                </p>

                <div className="mt-4 flex items-center text-xs font-bold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">

                  Shop now

                  <ArrowRight
                    size={14}
                    className="ml-1"
                  />

                </div>

              </button>

            )
          )}

        </div>

      </section>

      {/* =====================================================
          TRENDING PRODUCTS
      ===================================================== */}

      <section className="bg-slate-50 py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-9 flex items-end justify-between gap-4">

            <div>

              <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Popular Now
              </span>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Trending Products
              </h2>

              <p className="mt-2 text-slate-500">
                Handpicked products customers love
              </p>

            </div>

            <Button
              variant="outline"
              className="hidden sm:flex"
              onClick={() =>
                (window.location.href =
                  "/shop/listing")
              }
            >

              View All

              <ArrowRight
                className="ml-2"
                size={17}
              />

            </Button>

          </div>

          {trendingProducts.length > 0 ? (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

              {trendingProducts.map(
                (product) => {

                  const price =
                    Number(
                      product?.price || 0
                    );

                  const salePrice =
                    Number(
                      product?.salePrice || 0
                    );

                  const hasDiscount =
                    salePrice > 0 &&
                    salePrice < price;

                  const discount =
                    hasDiscount
                      ? Math.round(
                          ((price -
                            salePrice) /
                            price) *
                            100
                        )
                      : 0;

                  const isInWishlist =
                    wishlist?.some(
                      (item) =>
                        item?._id ===
                          product?._id ||
                        item ===
                          product?._id ||
                        item?.productId ===
                          product?._id
                    );

                  return (

                    <div
                      key={product?._id}
                      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >

                      {/* IMAGE */}

                      <div
                        className="relative cursor-pointer overflow-hidden bg-slate-100"
                        onClick={() =>
                          handleProductClick(
                            product
                          )
                        }
                      >

                        <img
                          src={getHDImage(
                            product?.image,
                            700
                          )}
                          alt={
                            product?.title ||
                            "Product"
                          }
                          className="h-[230px] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[270px]"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                        {/* DISCOUNT */}

                        {discount > 0 && (

                          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">

                            {discount}%
                            OFF

                          </span>

                        )}

                        {/* HEART */}

                        <button
                          type="button"
                          onClick={(e) =>
                            handleWishlist(
                              e,
                              product
                            )
                          }
                          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow backdrop-blur transition ${
                            isInWishlist
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-white/90 text-slate-700 hover:bg-white hover:text-red-500"
                          }`}
                          title={
                            isInWishlist
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >

                          <Heart
                            size={17}
                            fill={
                              isInWishlist
                                ? "currentColor"
                                : "none"
                            }
                          />

                        </button>

                      </div>

                      {/* PRODUCT INFO */}

                      <div className="p-4">

                        {product?.brand && (

                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">

                            {product.brand}

                          </p>

                        )}

                        <h3
                          className="cursor-pointer line-clamp-1 text-base font-bold text-slate-900"
                          onClick={() =>
                            handleProductClick(
                              product
                            )
                          }
                        >

                          {product?.title}

                        </h3>

                        {/* RATING */}

                        <div className="mt-2 flex items-center gap-2">

                          <div className="flex items-center gap-1 text-xs text-yellow-500">

                            <Star
                              size={13}
                              fill="currentColor"
                            />

                            <span className="font-semibold">
                              4.5
                            </span>

                          </div>

                          <span className="text-xs text-slate-400">
                            • Popular
                          </span>

                        </div>

                        {/* PRICE */}

                        <div className="mt-3 flex items-center justify-between gap-2">

                          <div>

                            <span className="text-lg font-black text-slate-900">

                              ₹
                              {(
                                hasDiscount
                                  ? salePrice
                                  : price
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </span>

                            {hasDiscount && (

                              <span className="ml-2 text-sm text-slate-400 line-through">

                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}

                              </span>

                            )}

                          </div>

                          {/* CART */}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              handleAddToCart(
                                product?._id
                              );
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-blue-700"
                          >

                            <ShoppingBag
                              size={18}
                            />

                          </button>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          ) : (

            <div className="rounded-2xl border bg-white py-16 text-center">

              <ShoppingBag
                size={45}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-xl font-bold text-slate-800">
                Products coming soon
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add products from the Admin Panel.
              </p>

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          PREMIUM OFFER
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 px-7 py-12 text-white shadow-2xl sm:px-12 lg:px-16">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">

                <Sparkles size={15} />

                EXCLUSIVE DEALS

              </div>

              <h2 className="max-w-2xl text-3xl font-black sm:text-5xl">

                Great Products.

                <br />

                Better Prices.

              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">

                Discover special offers and limited-time
                deals selected specially for you.

              </p>

              <Button
                className="mt-7 bg-white text-slate-950 hover:bg-white/90"
                onClick={() =>
                  (window.location.href =
                    "/shop/listing")
                }
              >

                Explore Deals

                <ArrowRight
                  className="ml-2"
                  size={17}
                />

              </Button>

            </div>

            <div className="hidden lg:flex">

              <div className="flex h-40 w-40 rotate-3 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur">

                <div className="text-center">

                  <Zap
                    size={38}
                    className="mx-auto mb-2"
                  />

                  <p className="text-2xl font-black">
                    DEALS
                  </p>

                  <p className="text-xs text-white/60">
                    EVERY DAY
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          BRANDS
      ===================================================== */}

      {brands.length > 0 && (

        <section className="border-y bg-white py-14">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mb-8 text-center">

              <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Trusted Selection
              </span>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Shop Your Favourite Brands
              </h2>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

              {brands.map(
                (brand) => (

                  <button
                    key={brand}
                    onClick={() =>
                      (window.location.href =
                        `/shop/listing?brand=${encodeURIComponent(
                          brand
                        )}`)
                    }
                    className="flex min-h-[70px] items-center justify-center rounded-xl border bg-slate-50 px-4 text-center text-sm font-bold text-slate-700 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-md"
                  >

                    {brand}

                  </button>

                )
              )}

            </div>

          </div>

        </section>

      )}

      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">

          <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Why Us
          </span>

          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Shopping Made Better
          </h2>

          <p className="mt-3 text-slate-500">
            Everything you need for a simple, secure
            and enjoyable shopping experience.
          </p>

        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">

              <ShieldCheck size={27} />

            </div>

            <h3 className="mt-5 text-lg font-bold">
              Secure Shopping
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your information and payments are
              protected with secure technology.
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">

              <Truck size={27} />

            </div>

            <h3 className="mt-5 text-lg font-bold">
              Fast Delivery
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Get your favourite products delivered
              quickly and safely.
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">

              <RotateCcw size={27} />

            </div>

            <h3 className="mt-5 text-lg font-bold">
              Easy Returns
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Hassle-free returns for a comfortable
              shopping experience.
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">

              <Headphones size={27} />

            </div>

            <h3 className="mt-5 text-lg font-bold">
              Premium Support
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Our support team is here whenever
              you need help.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          SHOPPING JOURNEY
      ===================================================== */}

      <section className="bg-slate-50 py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Simple & Easy
              </span>

              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-5xl">

                Your Shopping Journey,

                <br />

                Made Simple.

              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-500">

                Browse products, find your favourites,
                add them to your cart and complete your
                order with just a few simple steps.

              </p>

              <div className="mt-8 space-y-5">

                <div className="flex gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    01
                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Discover Products
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Explore categories and trending
                      products.
                    </p>

                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    02
                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Add to Cart
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose your favourite products
                      and add them to your cart.
                    </p>

                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    03
                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Secure Checkout
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Select your payment method and
                      place your order securely.
                    </p>

                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    04
                  </div>

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Enjoy Your Order
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Track your order and receive it
                      at your doorstep.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div className="relative">

              <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-slate-950 p-8 shadow-2xl sm:p-12">

                <div className="rounded-3xl border border-white/10 bg-white/10 p-7 backdrop-blur-xl">

                  <ShoppingBag
                    size={42}
                    className="text-white"
                  />

                  <h3 className="mt-8 text-3xl font-black text-white">
                    Everything You Need
                  </h3>

                  <p className="mt-3 leading-7 text-white/65">

                    One beautiful place for products,
                    offers, orders and a premium shopping
                    experience.

                  </p>

                  <div className="mt-8 space-y-4">

                    <div className="flex items-center gap-3 text-white">

                      <CheckCircle2
                        size={19}
                        className="text-blue-300"
                      />

                      <span className="text-sm">
                        Premium product collection
                      </span>

                    </div>

                    <div className="flex items-center gap-3 text-white">

                      <CheckCircle2
                        size={19}
                        className="text-blue-300"
                      />

                      <span className="text-sm">
                        Exclusive offers & deals
                      </span>

                    </div>

                    <div className="flex items-center gap-3 text-white">

                      <CheckCircle2
                        size={19}
                        className="text-blue-300"
                      />

                      <span className="text-sm">
                        Secure online payments
                      </span>

                    </div>

                    <div className="flex items-center gap-3 text-white">

                      <CheckCircle2
                        size={19}
                        className="text-blue-300"
                      />

                      <span className="text-sm">
                        Fast & reliable delivery
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-14 text-center text-white sm:px-12">

          <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">

              <Sparkles size={27} />

            </div>

            <h2 className="mt-6 text-3xl font-black sm:text-5xl">

              Ready to Find Your Next Favourite?

            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">

              Explore our latest products and discover
              something you'll love.

            </p>

            <Button
              className="mt-8 bg-white px-7 text-slate-950 hover:bg-white/90"
              onClick={() =>
                (window.location.href =
                  "/shop/listing")
              }
            >

              Start Shopping

              <ArrowRight
                className="ml-2"
                size={18}
              />

            </Button>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT DETAILS
      ===================================================== */}

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={
          selectedProduct || productDetails
        }
      />

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <ShoppingFooter />
      {/* AI CHATBOT */}
<AIChatbot />

    </div>
  );
}

export default Home;