import Address from "@/components/shopping-view/address";
import PayPalButton from "@/components/shopping-view/paypal-button";
import img from "../../assets/account.jpg";

import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";

import { useState } from "react";

import {
  createNewOrder,
  resetOrderState,
} from "@/store/shop/order-slice";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import {
  Tag,
  X,
  MapPin,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Wallet,
  Smartphone,
  ArrowRight,
} from "lucide-react";

import axios from "axios";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // =====================================
  // REDUX
  // =====================================

  const { cartItems } = useSelector(
    (state) => state.shopCart
  );

  const { user } = useSelector(
    (state) => state.auth
  );

  const { isLoading } = useSelector(
    (state) => state.shopOrder
  );

  // =====================================
  // STATE
  // =====================================

  const [
    currentSelectedAddress,
    setCurrentSelectedAddress,
  ] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(null);

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [razorpayLoading, setRazorpayLoading] =
    useState(false);

  // =====================================
  // CART ITEMS
  // =====================================

  const items = cartItems?.items || [];

  // =====================================
  // TOTALS
  // =====================================

  const totalCartAmount = items.reduce(
    (sum, item) => {
      const price =
        Number(item?.salePrice) > 0
          ? Number(item.salePrice)
          : Number(item?.price || 0);

      return (
        sum +
        price * Number(item?.quantity || 0)
      );
    },
    0
  );

  const originalCartAmount = items.reduce(
    (sum, item) => {
      return (
        sum +
        Number(item?.price || 0) *
          Number(item?.quantity || 0)
      );
    },
    0
  );

  const productSavings = Math.max(
    originalCartAmount - totalCartAmount,
    0
  );

  const discountAmount = appliedCoupon
    ? Number(
        appliedCoupon?.discountAmount || 0
      )
    : 0;

  const finalAmount = Math.max(
    totalCartAmount - discountAmount,
    0
  );

  const totalItems = items.reduce(
    (sum, item) =>
      sum + Number(item?.quantity || 0),
    0
  );

  // =====================================
  // PRICE FORMAT
  // =====================================

  const formatPrice = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // =====================================
  // APPLY COUPON
  // =====================================

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      toast({
        title: "Enter coupon code",
        description:
          "Please enter a coupon code first.",
        variant: "destructive",
      });

      return;
    }

    if (totalCartAmount <= 0) {
      toast({
        title: "Cart is empty",
        description:
          "Add products before applying a coupon.",
        variant: "destructive",
      });

      return;
    }

    try {
      setCouponLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/shop/coupon/apply",
        {
          code: couponCode.trim(),
          orderAmount: totalCartAmount,
        },
        {
          withCredentials: true,
        }
      );

      if (response?.data?.success) {
        setAppliedCoupon(
          response.data.data
        );

        toast({
          title: "Coupon applied 🎉",
          description: `You saved ₹${Number(
            response.data.data.discountAmount
          ).toFixed(2)}`,
        });
      }
    } catch (error) {
      setAppliedCoupon(null);

      toast({
        title: "Coupon not applied",
        description:
          error?.response?.data?.message ||
          "Invalid or expired coupon code.",
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  }

  // =====================================
  // REMOVE COUPON
  // =====================================

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");

    toast({
      title: "Coupon removed",
      description:
        "The coupon has been removed from your order.",
    });
  }

  // =====================================
  // PAYMENT METHOD
  // =====================================

  function handlePaymentMethodChange(method) {
    setPaymentMethod(method);
  }

  // =====================================
  // BUILD ORDER DATA
  // =====================================

  function getOrderData() {
    // -------------------------------------
    // IMPORTANT ADDRESS NORMALIZATION
    // -------------------------------------

    const selectedAddress =
      currentSelectedAddress || {};

    const address =
      selectedAddress?.address ||
      selectedAddress?.fullAddress ||
      selectedAddress?.street ||
      selectedAddress?.addressLine ||
      "";

    const city =
      selectedAddress?.city ||
      selectedAddress?.town ||
      selectedAddress?.district ||
      "";

    const pincode =
      selectedAddress?.pincode ||
      selectedAddress?.pinCode ||
      selectedAddress?.postalCode ||
      "";

    const phone =
      selectedAddress?.phone ||
      selectedAddress?.mobile ||
      selectedAddress?.phoneNumber ||
      user?.phone ||
      "";

    const notes =
      selectedAddress?.notes ||
      selectedAddress?.note ||
      "";

    const addressInfo = {
      addressId:
        selectedAddress?._id ||
        selectedAddress?.id ||
        "",

      address: String(address).trim(),

      city: String(city).trim(),

      pincode: String(pincode).trim(),

      phone: String(phone).trim(),

      notes: String(notes).trim(),
    };

    // -------------------------------------
    // DEBUG
    // -------------------------------------

    console.log(
      "SELECTED ADDRESS:",
      selectedAddress
    );

    console.log(
      "FINAL ADDRESS INFO:",
      addressInfo
    );

    return {
      userId: user?.id,

      cartId: cartItems?._id || "",

      cartItems: items.map(
        (singleCartItem) => ({
          productId:
            singleCartItem?.productId,

          title:
            singleCartItem?.title,

          image:
            singleCartItem?.image,

          price:
            Number(
              singleCartItem?.salePrice
            ) > 0
              ? Number(
                  singleCartItem.salePrice
                )
              : Number(
                  singleCartItem?.price || 0
                ),

          quantity:
            Number(
              singleCartItem?.quantity || 0
            ),
        })
      ),

      addressInfo,

      couponCode:
        appliedCoupon?.code || "",

      discountAmount:
        Number(discountAmount),

      totalAmount:
        Number(finalAmount),

      paymentMethod,
    };
  }

  // =====================================
  // ADDRESS VALIDATION
  // =====================================

  function validateAddress() {
    if (!currentSelectedAddress) {
      toast({
        title: "Please select an address",
        description:
          "Select your delivery address to continue.",
        variant: "destructive",
      });

      return false;
    }

    const orderData = getOrderData();

    const addressInfo =
      orderData.addressInfo;

    if (!addressInfo.address) {
      toast({
        title: "Address is missing",
        description:
          "Please select a complete delivery address.",
        variant: "destructive",
      });

      return false;
    }

    if (!addressInfo.city) {
      toast({
        title: "City is missing",
        description:
          "Please select an address containing city.",
        variant: "destructive",
      });

      return false;
    }

    if (!addressInfo.pincode) {
      toast({
        title: "Pincode is missing",
        description:
          "Please select an address containing pincode.",
        variant: "destructive",
      });

      return false;
    }

    if (!addressInfo.phone) {
      toast({
        title: "Phone number is missing",
        description:
          "Please add a phone number to your delivery address.",
        variant: "destructive",
      });

      return false;
    }

    return true;
  }

  // =====================================
  // LOAD RAZORPAY SCRIPT
  // =====================================

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  // =====================================
  // RAZORPAY PAYMENT
  // =====================================

  async function handleRazorpayPayment() {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description:
          "Please add products before placing an order.",
        variant: "destructive",
      });

      return;
    }

    if (!validateAddress()) {
      return;
    }

    try {
      setRazorpayLoading(true);

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        toast({
          title:
            "Razorpay could not load",
          description:
            "Please check your internet connection and try again.",
          variant: "destructive",
        });

        setRazorpayLoading(false);
        return;
      }

      const orderData =
        getOrderData();

      console.log(
        "RAZORPAY ORDER DATA:",
        orderData
      );

      const response =
        await axios.post(
          "http://localhost:5000/api/shop/order/razorpay/create",
          orderData,
          {
            withCredentials: true,
          }
        );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            "Failed to create Razorpay order"
        );
      }

      const {
        razorpayOrderId,
        amount,
        currency,
        keyId,
        localOrderId,
      } = response.data;

      const options = {
        key: keyId,

        amount,

        currency,

        name: "Anupam Ecommerce",

        description:
          "Secure Online Payment",

        order_id: razorpayOrderId,

        prefill: {
          name:
            user?.userName || "",

          email:
            user?.email || "",

          contact:
            currentSelectedAddress?.phone ||
            currentSelectedAddress?.mobile ||
            user?.phone ||
            "",
        },

        notes: {
          localOrderId,
        },

        theme: {
          color: "#111827",
        },

        handler:
          async function (
            paymentResponse
          ) {
            try {
              console.log(
                "RAZORPAY PAYMENT RESPONSE:",
                paymentResponse
              );

              const verifyResponse =
                await axios.post(
                  "http://localhost:5000/api/shop/order/razorpay/verify",
                  {
                    razorpay_order_id:
                      paymentResponse.razorpay_order_id,

                    razorpay_payment_id:
                      paymentResponse.razorpay_payment_id,

                    razorpay_signature:
                      paymentResponse.razorpay_signature,

                    localOrderId,
                  },
                  {
                    withCredentials: true,
                  }
                );

              if (
                !verifyResponse?.data
                  ?.success
              ) {
                throw new Error(
                  verifyResponse?.data
                    ?.message ||
                    "Payment verification failed"
                );
              }

              toast({
                title:
                  "Payment successful 🎉",
                description:
                  "Your order has been confirmed successfully.",
              });

              sessionStorage.setItem(
                "currentOrderId",
                JSON.stringify(
                  verifyResponse.data.orderId
                )
              );

              dispatch(
                resetOrderState()
              );

              navigate(
                "/shop/orders"
              );
            } catch (error) {
              console.error(
                "PAYMENT VERIFY ERROR:",
                error
              );

              toast({
                title:
                  "Payment verification failed",
                description:
                  error?.response
                    ?.data?.message ||
                  error?.message ||
                  "Please contact support if money was deducted.",
                variant:
                  "destructive",
              });
            } finally {
              setRazorpayLoading(false);
            }
          },

        modal: {
          ondismiss: function () {
            setRazorpayLoading(false);

            toast({
              title:
                "Payment cancelled",
              description:
                "You cancelled the Razorpay payment.",
            });
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response
          );

          setRazorpayLoading(false);

          toast({
            title:
              "Payment failed",
            description:
              response?.error
                ?.description ||
              "Razorpay payment failed. Please try again.",
            variant:
              "destructive",
          });
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "RAZORPAY ERROR:",
        error
      );

      toast({
        title:
          "Unable to start payment",
        description:
          error?.response
            ?.data?.message ||
          error?.message ||
          "Something went wrong while starting Razorpay payment.",
        variant:
          "destructive",
      });

      setRazorpayLoading(false);
    }
  }

  // =====================================
  // PAYPAL SUCCESS
  // =====================================

  function handlePayPalSuccess(response) {
    console.log(
      "PAYPAL SUCCESS:",
      response
    );

    sessionStorage.removeItem(
      "paypalLocalOrderId"
    );

    sessionStorage.setItem(
      "currentOrderId",
      JSON.stringify(
        response?.orderId
      )
    );

    toast({
      title:
        "Payment successful 🎉",
      description:
        "Your PayPal order has been confirmed successfully.",
    });

    dispatch(
      resetOrderState()
    );

    navigate(
      "/shop/orders"
    );
  }

  // =====================================
  // PLACE ORDER
  // =====================================

  function handlePlaceOrder() {
    if (
      paymentMethod ===
      "razorpay"
    ) {
      handleRazorpayPayment();
      return;
    }

    if (items.length === 0) {
      toast({
        title:
          "Your cart is empty",
        description:
          "Please add products before placing an order.",
        variant:
          "destructive",
      });

      return;
    }

    if (!validateAddress()) {
      return;
    }

    if (
      paymentMethod ===
      "paypal"
    ) {
      toast({
        title:
          "Use PayPal button",
        description:
          "Click the PayPal button above to continue with payment.",
      });

      return;
    }

    // ===================================
    // COD
    // ===================================

    const orderData =
      getOrderData();

    console.log(
      "COD ORDER DATA:",
      orderData
    );

    dispatch(
      createNewOrder(orderData)
    ).then((data) => {
      console.log(
        "CREATE ORDER RESPONSE:",
        data
      );

      if (
        data?.payload?.success
      ) {
        toast({
          title:
            "Order placed successfully 🎉",
          description:
            "Your order has been confirmed.",
        });

        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(
            data.payload.orderId
          )
        );

        dispatch(
          resetOrderState()
        );

        navigate(
          "/shop/orders"
        );
      } else {
        toast({
          title:
            "Order failed",
          description:
            data?.payload?.message ||
            "Something went wrong while placing your order.",
          variant:
            "destructive",
        });
      }
    });
  }

  // =====================================
  // PAYMENT OPTION
  // =====================================

  const PaymentOption = ({
    value,
    title,
    description,
    icon,
    disabled = false,
    badge,
  }) => {
    const selected =
      paymentMethod === value;

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          !disabled &&
          handlePaymentMethodChange(
            value
          )
        }
        className={`relative flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
          selected
            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
            : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
        } ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer"
        }`}
      >
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-primary"
              : "border-muted-foreground/40"
          }`}
        >
          {selected && (
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold">
              {title}
            </p>

            {badge && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {badge}
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        {selected && (
          <CheckCircle2
            size={19}
            className="shrink-0 text-primary"
          />
        )}
      </button>
    );
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-muted/20">

      {/* HERO */}

      <div className="relative h-[220px] w-full overflow-hidden sm:h-[280px]">
        <img
          src={img}
          alt="Checkout"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <ShoppingBag size={24} />
          </div>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-white/80 sm:text-base">
            Complete your order securely
          </p>
        </div>
      </div>

      {/* CHECKOUT STEPS */}

      <div className="mx-auto w-full max-w-7xl px-5 pt-7">
        <div className="flex items-center justify-center gap-2 text-xs sm:gap-5 sm:text-sm">

          <div className="flex items-center gap-2 font-bold text-primary">
            <CheckCircle2 size={18} />
            Checkout
          </div>

          <div className="h-px w-5 bg-border sm:w-12" />

          <div className="flex items-center gap-2 font-bold text-primary">
            <ShoppingBag size={18} />
            Your Items
          </div>

          <div className="h-px w-5 bg-border sm:w-12" />

          <div className="flex items-center gap-2 font-bold text-primary">
            <MapPin size={18} />
            Delivery Address
          </div>

          <div className="h-px w-5 bg-border sm:w-12" />

          <div className="flex items-center gap-2 font-bold text-primary">
            <CreditCard size={18} />
            Payment
          </div>

        </div>
      </div>

      {/* MAIN */}

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-5 py-8 lg:grid-cols-[1fr_460px]">

        {/* LEFT */}

        <div className="space-y-6">

          {/* ITEMS */}

          <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <ShoppingBag
                    size={22}
                    className="text-primary"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Your Items
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "item"
                      : "items"}{" "}
                    in your order
                  </p>
                </div>

              </div>

            </div>

            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <UserCartItemsContent
                    key={
                      item?.productId
                    }
                    cartItem={item}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-muted/50 py-12 text-center">

                <ShoppingBag
                  size={40}
                  className="mx-auto text-muted-foreground"
                />

                <p className="mt-3 font-semibold">
                  Your cart is empty
                </p>

                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    navigate(
                      "/shop/home"
                    )
                  }
                >
                  Continue Shopping
                </Button>

              </div>
            )}

          </div>

          {/* ADDRESS */}

          <div className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <MapPin
                  size={22}
                  className="text-primary"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Delivery Address
                </h2>

                <p className="text-sm text-muted-foreground">
                  Select where you want your order delivered
                </p>
              </div>

            </div>

            <Address
              selectedId={
                currentSelectedAddress
              }
              setCurrentSelectedAddress={
                setCurrentSelectedAddress
              }
            />

          </div>

        </div>

        {/* RIGHT */}

        <div className="lg:sticky lg:top-5 lg:self-start">

          <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">

            {/* HEADER */}

            <div className="border-b bg-muted/30 p-5">

              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Review your order before placing it
              </p>

            </div>

            <div className="p-5">

              {/* SAVINGS */}

              {productSavings > 0 && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">

                  <Tag size={17} />

                  You save ₹
                  {formatPrice(
                    productSavings
                  )}{" "}
                  on products

                </div>
              )}

              {/* COUPON */}

              <div className="rounded-xl border p-4">

                <div className="mb-3 flex items-center gap-2">

                  <Tag
                    size={18}
                    className="text-primary"
                  />

                  <h3 className="font-bold">
                    Coupon & Offers
                  </h3>

                </div>

                {!appliedCoupon ? (
                  <div className="flex gap-2">

                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(
                          e.target.value.toUpperCase()
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="Enter coupon code"
                      className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2.5 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    <Button
                      type="button"
                      onClick={
                        handleApplyCoupon
                      }
                      disabled={
                        couponLoading
                      }
                    >
                      {couponLoading
                        ? "Applying..."
                        : "Apply"}
                    </Button>

                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">

                    <div>

                      <div className="flex items-center gap-2">

                        <CheckCircle2
                          size={17}
                          className="text-green-600"
                        />

                        <p className="font-extrabold text-green-700">
                          {
                            appliedCoupon.code
                          }
                        </p>

                      </div>

                      <p className="mt-1 text-sm font-medium text-green-600">
                        You saved ₹
                        {formatPrice(
                          appliedCoupon.discountAmount
                        )}
                      </p>

                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={
                        handleRemoveCoupon
                      }
                      className="text-green-700 hover:bg-green-100"
                    >
                      <X size={18} />
                    </Button>

                  </div>
                )}

              </div>

              {/* PRICE DETAILS */}

              <div className="mt-5 border-t pt-5">

                <h3 className="mb-4 font-bold">
                  Price Details
                </h3>

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between">

                    <span className="text-muted-foreground">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹
                      {formatPrice(
                        totalCartAmount
                      )}
                    </span>

                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">

                      <span>
                        Coupon Discount
                        {appliedCoupon?.code
                          ? ` (${appliedCoupon.code})`
                          : ""}
                      </span>

                      <span className="font-bold">
                        -₹
                        {formatPrice(
                          discountAmount
                        )}
                      </span>

                    </div>
                  )}

                  <div className="flex justify-between">

                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Truck size={16} />
                      Shipping
                    </span>

                    <span className="font-bold text-green-600">
                      FREE
                    </span>

                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-5">

                  <div>
                    <p className="text-lg font-extrabold">
                      Total
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Final payable amount
                    </p>
                  </div>

                  <p className="text-2xl font-extrabold text-primary">
                    ₹
                    {formatPrice(
                      finalAmount
                    )}
                  </p>

                </div>

              </div>

              {/* PAYMENT METHODS */}

              <div className="mt-5 rounded-xl border p-4">

                <div className="mb-4 flex items-center gap-2">

                  <CreditCard
                    size={18}
                    className="text-primary"
                  />

                  <div>

                    <h3 className="font-bold">
                      Payment Method
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Choose your preferred payment option
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  <PaymentOption
                    value="cod"
                    title="Cash on Delivery"
                    description="Pay when your order arrives"
                    icon={
                      <Wallet size={20} />
                    }
                    badge="Available"
                  />

                  <PaymentOption
                    value="razorpay"
                    title="Razorpay"
                    description="UPI, Cards, Net Banking & more"
                    icon={
                      <Smartphone size={20} />
                    }
                    badge="Online"
                  />

                  <PaymentOption
                    value="paypal"
                    title="PayPal"
                    description="Pay securely using PayPal"
                    icon={
                      <CreditCard size={20} />
                    }
                    badge="Online"
                  />

                </div>

                {paymentMethod ===
                  "razorpay" && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-800">
                    You will be redirected to the secure Razorpay payment window.
                  </div>
                )}

                {paymentMethod ===
                  "paypal" && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-800">
                    Pay securely with your PayPal Sandbox account.
                  </div>
                )}

              </div>

              {/* PAYPAL BUTTON */}

              {paymentMethod ===
                "paypal" && (
                <div className="mt-5 rounded-xl border bg-muted/20 p-4">

                  <div className="mb-3">

                    <h3 className="font-bold">
                      Pay with PayPal
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Click the PayPal button to continue securely.
                    </p>

                  </div>

                  <PayPalButton
                    orderData={
                      getOrderData()
                    }
                    onSuccess={
                      handlePayPalSuccess
                    }
                  />

                </div>
              )}

              {/* NORMAL PLACE ORDER BUTTON */}

              {paymentMethod !==
                "paypal" && (
                <Button
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    isLoading ||
                    razorpayLoading ||
                    items.length ===
                      0
                  }
                  className="mt-5 h-13 w-full text-base font-extrabold shadow-md"
                >

                  {razorpayLoading ? (
                    "Opening Secure Payment..."
                  ) : isLoading ? (
                    "Placing Order..."
                  ) : paymentMethod ===
                    "cod" ? (
                    <>
                      Place Order
                      <span className="ml-2">
                        • ₹
                        {formatPrice(
                          finalAmount
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      Pay ₹
                      {formatPrice(
                        finalAmount
                      )}

                      <ArrowRight
                        size={18}
                        className="ml-2"
                      />
                    </>
                  )}

                </Button>
              )}

              {/* PAYPAL TOTAL */}

              {paymentMethod ===
                "paypal" && (
                <div className="mt-4 rounded-lg border bg-muted/30 px-4 py-3 text-center">

                  <p className="text-xs text-muted-foreground">
                    Order Total
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-primary">
                    ₹
                    {formatPrice(
                      finalAmount
                    )}
                  </p>

                </div>
              )}

              {/* SECURITY */}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">

                <ShieldCheck size={15} />

                <span>
                  Secure checkout • Your information is protected
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ShoppingCheckout;