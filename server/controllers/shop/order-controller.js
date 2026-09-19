const crypto = require("crypto");
const axios = require("axios");
const Razorpay = require("razorpay");

const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Offer = require("../../models/Offer");

// ==========================================
// RAZORPAY INSTANCE
// ==========================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// PAYPAL BASE URL
// ==========================================

const getPayPalBaseUrl = () => {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
};

// ==========================================
// PAYPAL ACCESS TOKEN
// ==========================================

const getPayPalAccessToken = async () => {
  if (
    !process.env.PAYPAL_CLIENT_ID ||
    !process.env.PAYPAL_CLIENT_SECRET
  ) {
    throw new Error("PayPal credentials are missing");
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    `${getPayPalBaseUrl()}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

// ==========================================
// CREATE NORMAL / COD ORDER
// ==========================================

const createOrder = async (req, res) => {
  let reservedCouponId = null;
  let reservedCouponCode = "";

  try {
    const {
      userId,
      cartItems,
      addressInfo,
      couponCode,
      paymentMethod,
      cartId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!addressInfo) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const selectedPaymentMethod = paymentMethod || "cod";

    if (
      selectedPaymentMethod === "razorpay" ||
      selectedPaymentMethod === "paypal" ||
      selectedPaymentMethod === "online"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please use the online payment flow for this payment method",
      });
    }

    // ==========================================
    // VERIFY PRODUCTS
    // ==========================================

    let subtotalAmount = 0;
    const verifiedCartItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.title}`,
        });
      }

      if (Number(product.totalStock) < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.totalStock} item(s) available for ${product.title}`,
        });
      }

      const actualPrice =
        Number(product.salePrice) > 0
          ? Number(product.salePrice)
          : Number(product.price);

      subtotalAmount += actualPrice * quantity;

      verifiedCartItems.push({
        productId: product._id.toString(),
        title: product.title,
        image: product.image || "",
        price: actualPrice,
        quantity,
      });
    }

    subtotalAmount =
      Math.round(subtotalAmount * 100) / 100;

    // ==========================================
    // COUPON
    // ==========================================

    let discountAmount = 0;
    let finalAmount = subtotalAmount;
    let appliedCouponCode = "";

    if (couponCode && couponCode.trim()) {
      const normalizedCode = couponCode.trim().toUpperCase();

      const offer = await Offer.findOne({
        code: normalizedCode,
      });

      if (!offer) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      if (offer.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "This coupon is inactive",
        });
      }

      const now = new Date();

      if (now < new Date(offer.startDate)) {
        return res.status(400).json({
          success: false,
          message: "This coupon is not active yet",
        });
      }

      if (now > new Date(offer.expiryDate)) {
        return res.status(400).json({
          success: false,
          message: "This coupon has expired",
        });
      }

      const usageLimit = Number(offer.usageLimit || 0);

      const actualUsedCount = await Order.countDocuments({
        couponCode: normalizedCode,
        paymentStatus: {
          $in: ["paid", "pending"],
        },
      });

      if (
        usageLimit > 0 &&
        actualUsedCount >= usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message: "This coupon usage limit has been reached",
        });
      }

      const minimumOrderAmount = Number(
        offer.minimumOrderAmount || 0
      );

      if (subtotalAmount < minimumOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is ₹${minimumOrderAmount.toLocaleString(
            "en-IN"
          )}`,
        });
      }

      if (offer.discountType === "percentage") {
        discountAmount =
          (subtotalAmount * Number(offer.discountValue)) / 100;
      } else {
        discountAmount = Number(offer.discountValue);
      }

      discountAmount = Math.min(
        discountAmount,
        subtotalAmount
      );

      discountAmount =
        Math.round(discountAmount * 100) / 100;

      finalAmount =
        Math.round(
          (subtotalAmount - discountAmount) * 100
        ) / 100;

      appliedCouponCode = offer.code;

      // ==========================================
      // RESERVE LIMITED COUPON
      // ==========================================

      if (usageLimit > 0) {
        const reservation =
          await Offer.findOneAndUpdate(
            {
              _id: offer._id,
              $expr: {
                $lt: [
                  {
                    $ifNull: ["$usedCount", 0],
                  },
                  "$usageLimit",
                ],
              },
            },
            {
              $inc: {
                usedCount: 1,
              },
            },
            {
              new: true,
            }
          );

        if (!reservation) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon usage limit has been reached",
          });
        }

        reservedCouponId = offer._id;
        reservedCouponCode = offer.code;
      }
    }

    // ==========================================
    // CREATE COD ORDER
    // ==========================================

    const newlyCreatedOrder = new Order({
      userId,

      cartId: cartId || "",

      cartItems: verifiedCartItems,

      addressInfo: {
        addressId: addressInfo.addressId || "",
        address: addressInfo.address || "",
        city: addressInfo.city || "",
        pincode: addressInfo.pincode || "",
        phone: addressInfo.phone || "",
        notes: addressInfo.notes || "",
      },

      orderStatus: "confirmed",

      paymentMethod: "cod",

      paymentStatus: "pending",

      subtotalAmount,

      couponCode: appliedCouponCode,

      discountAmount,

      totalAmount: finalAmount,

      orderDate: new Date(),

      orderUpdateDate: new Date(),

      paymentId: "",

      payerId: "",
    });

    await newlyCreatedOrder.save();

    // ==========================================
    // REDUCE STOCK
    // ==========================================

    for (const item of verifiedCartItems) {
      const product = await Product.findById(
        item.productId
      );

      if (product) {
        product.totalStock = Math.max(
          Number(product.totalStock) -
            Number(item.quantity),
          0
        );

        await product.save();
      }
    }

    // ==========================================
    // DELETE CART
    // ==========================================

    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newlyCreatedOrder._id,
      data: newlyCreatedOrder,
    });
  } catch (error) {
    console.log("Create Order Error:", error);

    // ==========================================
    // ROLLBACK COUPON
    // ==========================================

    if (reservedCouponId) {
      try {
        await Offer.updateOne(
          {
            _id: reservedCouponId,
            $expr: {
              $gt: [
                {
                  $ifNull: ["$usedCount", 0],
                },
                0,
              ],
            },
          },
          {
            $inc: {
              usedCount: -1,
            },
          }
        );

        console.log(
          "Coupon usage rolled back:",
          reservedCouponCode
        );
      } catch (rollbackError) {
        console.log(
          "Coupon rollback failed:",
          rollbackError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

const createRazorpayOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      couponCode,
      cartId,
    } = req.body;

    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: "Razorpay Key ID is missing",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay Secret is missing",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!addressInfo) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // ==========================================
    // VERIFY PRODUCTS
    // ==========================================

    let subtotalAmount = 0;
    const verifiedCartItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(
        item.productId
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.title}`,
        });
      }

      if (Number(product.totalStock) < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.totalStock} item(s) available for ${product.title}`,
        });
      }

      const actualPrice =
        Number(product.salePrice) > 0
          ? Number(product.salePrice)
          : Number(product.price);

      subtotalAmount += actualPrice * quantity;

      verifiedCartItems.push({
        productId: product._id.toString(),
        title: product.title,
        image: product.image || "",
        price: actualPrice,
        quantity,
      });
    }

    subtotalAmount =
      Math.round(subtotalAmount * 100) / 100;

    // ==========================================
    // COUPON
    // ==========================================

    let discountAmount = 0;
    let finalAmount = subtotalAmount;
    let appliedCouponCode = "";

    if (couponCode && couponCode.trim()) {
      const normalizedCode = couponCode
        .trim()
        .toUpperCase();

      const offer = await Offer.findOne({
        code: normalizedCode,
      });

      if (!offer) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      if (offer.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "This coupon is inactive",
        });
      }

      const now = new Date();

      if (now < new Date(offer.startDate)) {
        return res.status(400).json({
          success: false,
          message: "This coupon is not active yet",
        });
      }

      if (now > new Date(offer.expiryDate)) {
        return res.status(400).json({
          success: false,
          message: "This coupon has expired",
        });
      }

      const usageLimit = Number(
        offer.usageLimit || 0
      );

      const actualUsedCount =
        await Order.countDocuments({
          couponCode: normalizedCode,
          paymentStatus: {
            $in: ["paid", "pending"],
          },
        });

      if (
        usageLimit > 0 &&
        actualUsedCount >= usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon usage limit has been reached",
        });
      }

      const minimumOrderAmount = Number(
        offer.minimumOrderAmount || 0
      );

      if (subtotalAmount < minimumOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is ₹${minimumOrderAmount.toLocaleString(
            "en-IN"
          )}`,
        });
      }

      if (offer.discountType === "percentage") {
        discountAmount =
          (subtotalAmount *
            Number(offer.discountValue)) /
          100;
      } else {
        discountAmount =
          Number(offer.discountValue);
      }

      discountAmount = Math.min(
        discountAmount,
        subtotalAmount
      );

      discountAmount =
        Math.round(discountAmount * 100) / 100;

      finalAmount =
        Math.round(
          (subtotalAmount -
            discountAmount) *
            100
        ) / 100;

      appliedCouponCode = offer.code;
    }

    if (finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount must be greater than zero",
      });
    }

    // ==========================================
    // LOCAL PENDING ORDER
    // ==========================================

    const localOrder = new Order({
      userId,

      cartId: cartId || "",

      cartItems: verifiedCartItems,

      addressInfo: {
        addressId:
          addressInfo.addressId || "",

        address:
          addressInfo.address || "",

        city:
          addressInfo.city || "",

        pincode:
          addressInfo.pincode || "",

        phone:
          addressInfo.phone || "",

        notes:
          addressInfo.notes || "",
      },

      orderStatus: "pending",

      paymentMethod: "razorpay",

      paymentStatus: "pending",

      subtotalAmount,

      couponCode: appliedCouponCode,

      discountAmount,

      totalAmount: finalAmount,

      orderDate: new Date(),

      orderUpdateDate: new Date(),

      paymentId: "",

      payerId: "",
    });

    await localOrder.save();

    // ==========================================
    // RAZORPAY ORDER
    // ==========================================

    const razorpayOrder =
      await razorpay.orders.create({
        amount: Math.round(
          finalAmount * 100
        ),

        currency: "INR",

        receipt:
          localOrder._id.toString(),

        notes: {
          localOrderId:
            localOrder._id.toString(),

          userId:
            userId.toString(),
        },
      });

    return res.status(201).json({
      success: true,

      message:
        "Razorpay order created",

      razorpayOrderId:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,

      localOrderId:
        localOrder._id,

      order:
        localOrder,
    });
  } catch (error) {
    console.log(
      "Create Razorpay Order Error:",
      error?.response?.data || error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create Razorpay order",
    });
  }
};

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

const verifyRazorpayPayment =
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        localOrderId,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !localOrderId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification details are missing",
        });
      }

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      if (
        generatedSignature !==
        razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment signature verification failed",
        });
      }

      const order =
        await Order.findById(
          localOrderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Local order not found",
        });
      }

      if (
        order.paymentStatus ===
        "paid"
      ) {
        return res.status(200).json({
          success: true,
          message:
            "Payment already verified",
          orderId:
            order._id,
        });
      }

      order.paymentStatus =
        "paid";

      order.orderStatus =
        "confirmed";

      order.paymentMethod =
        "razorpay";

      order.paymentId =
        razorpay_payment_id;

      order.orderUpdateDate =
        new Date();

      await order.save();

      // ==========================================
      // STOCK
      // ==========================================

      for (
        const item of
          order.cartItems
      ) {
        const product =
          await Product.findById(
            item.productId
          );

        if (!product) {
          continue;
        }

        product.totalStock =
          Math.max(
            Number(
              product.totalStock
            ) -
              Number(
                item.quantity
              ),
            0
          );

        await product.save();
      }

      // ==========================================
      // DELETE CART
      // ==========================================

      if (order.cartId) {
        await Cart.findByIdAndDelete(
          order.cartId
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Payment verified successfully",

        orderId:
          order._id,

        data:
          order,
      });
    } catch (error) {
      console.log(
        "Verify Razorpay Payment Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to verify Razorpay payment",
      });
    }
  };

// ==========================================
// CREATE PAYPAL ORDER
// ==========================================

const createPayPalOrder =
  async (req, res) => {
    let localOrder = null;

    try {
      const {
        userId,
        cartItems,
        addressInfo,
        couponCode,
        cartId,
      } = req.body;

      // ==========================================
      // PAYPAL CONFIG CHECK
      // ==========================================

      if (!process.env.PAYPAL_CLIENT_ID) {
        return res.status(500).json({
          success: false,
          message:
            "PayPal Client ID is missing",
        });
      }

      if (!process.env.PAYPAL_CLIENT_SECRET) {
        return res.status(500).json({
          success: false,
          message:
            "PayPal Client Secret is missing",
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "User ID is required",
        });
      }

      if (
        !Array.isArray(cartItems) ||
        cartItems.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cart is empty",
        });
      }

      if (!addressInfo) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery address is required",
        });
      }

      // ==========================================
      // ADDRESS VALIDATION
      // ==========================================

      if (
        !addressInfo.address ||
        !addressInfo.city ||
        !addressInfo.pincode ||
        !addressInfo.phone
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Complete delivery address is required",
        });
      }

      // ==========================================
      // VERIFY PRODUCTS
      // ==========================================

      let subtotalAmount = 0;

      const verifiedCartItems = [];

      for (const item of cartItems) {
        const product =
          await Product.findById(
            item.productId
          );

        if (!product) {
          return res.status(404).json({
            success: false,
            message:
              `Product not found: ${item.title}`,
          });
        }

        const quantity =
          Number(item.quantity);

        if (
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid quantity for ${product.title}`,
          });
        }

        if (
          Number(product.totalStock) <
          quantity
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Only ${product.totalStock} item(s) available for ${product.title}`,
          });
        }

        const actualPrice =
          Number(product.salePrice) > 0
            ? Number(product.salePrice)
            : Number(product.price);

        subtotalAmount +=
          actualPrice * quantity;

        verifiedCartItems.push({
          productId:
            product._id.toString(),

          title:
            product.title,

          image:
            product.image || "",

          price:
            actualPrice,

          quantity,
        });
      }

      subtotalAmount =
        Math.round(
          subtotalAmount * 100
        ) / 100;

      // ==========================================
      // COUPON
      // ==========================================

      let discountAmount = 0;

      let finalAmount =
        subtotalAmount;

      let appliedCouponCode = "";

      if (
        couponCode &&
        couponCode.trim()
      ) {
        const normalizedCode =
          couponCode
            .trim()
            .toUpperCase();

        const offer =
          await Offer.findOne({
            code:
              normalizedCode,
        });

        if (!offer) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid coupon code",
          });
        }

        if (
          offer.status !==
          "active"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon is inactive",
          });
        }

        const now =
          new Date();

        if (
          now <
          new Date(
            offer.startDate
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon is not active yet",
          });
        }

        if (
          now >
          new Date(
            offer.expiryDate
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon has expired",
          });
        }

        const usageLimit =
          Number(
            offer.usageLimit || 0
          );

        const actualUsedCount =
          await Order.countDocuments({
            couponCode:
              normalizedCode,

            paymentStatus: {
              $in: [
                "paid",
                "pending",
              ],
            },
          });

        if (
          usageLimit > 0 &&
          actualUsedCount >=
            usageLimit
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon usage limit has been reached",
          });
        }

        const minimumOrderAmount =
          Number(
            offer.minimumOrderAmount ||
              0
          );

        if (
          subtotalAmount <
          minimumOrderAmount
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Minimum order amount is ₹${minimumOrderAmount.toLocaleString(
                "en-IN"
              )}`,
          });
        }

        if (
          offer.discountType ===
          "percentage"
        ) {
          discountAmount =
            (subtotalAmount *
              Number(
                offer.discountValue
              )) /
            100;
        } else {
          discountAmount =
            Number(
              offer.discountValue
            );
        }

        discountAmount =
          Math.min(
            discountAmount,
            subtotalAmount
          );

        discountAmount =
          Math.round(
            discountAmount * 100
          ) / 100;

        finalAmount =
          Math.round(
            (subtotalAmount -
              discountAmount) *
              100
          ) / 100;

        appliedCouponCode =
          offer.code;
      }

      if (finalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "PayPal payment amount must be greater than zero",
        });
      }

      // ==========================================
      // PAYPAL ACCESS TOKEN
      // ==========================================

      const accessToken =
        await getPayPalAccessToken();

      // ==========================================
      // CREATE LOCAL PENDING ORDER
      // ==========================================

      localOrder =
        new Order({
          userId,

          cartId:
            cartId || "",

          cartItems:
            verifiedCartItems,

          addressInfo: {
            addressId:
              addressInfo.addressId ||
              "",

            address:
              addressInfo.address ||
              "",

            city:
              addressInfo.city ||
              "",

            pincode:
              addressInfo.pincode ||
              "",

            phone:
              addressInfo.phone ||
              "",

            notes:
              addressInfo.notes ||
              "",
          },

          orderStatus:
            "pending",

          paymentMethod:
            "paypal",

          paymentStatus:
            "pending",

          subtotalAmount,

          couponCode:
            appliedCouponCode,

          discountAmount,

          totalAmount:
            finalAmount,

          orderDate:
            new Date(),

          orderUpdateDate:
            new Date(),

          paymentId:
            "",

          payerId:
            "",
        });

      await localOrder.save();

      // ==========================================
      // INR -> USD CONVERSION
      // ==========================================

      const conversionRate =
        Number(
          process.env.PAYPAL_INR_TO_USD_RATE ||
            0.011
        );

      const paypalCurrency =
        process.env.PAYPAL_CURRENCY ||
        "USD";

      const paypalAmount =
        Math.round(
          finalAmount *
            conversionRate *
            100
        ) / 100;

      if (paypalAmount <= 0) {
        throw new Error(
          "Calculated PayPal amount is invalid"
        );
      }

      console.log(
        "PayPal INR Amount:",
        finalAmount
      );

      console.log(
        "PayPal USD Amount:",
        paypalAmount
      );

      // ==========================================
      // CREATE PAYPAL GATEWAY ORDER
      // ==========================================

      const paypalResponse =
        await axios.post(
          `${getPayPalBaseUrl()}/v2/checkout/orders`,

          {
            intent:
              "CAPTURE",

            purchase_units: [
              {
                reference_id:
                  localOrder._id.toString(),

                description:
                  "E-Commerce Order",

                amount: {
                  currency_code:
                    paypalCurrency,

                  value:
                    paypalAmount.toFixed(
                      2
                    ),
                },
              },
            ],

            application_context: {
              brand_name:
                "Your Store",

              landing_page:
                "LOGIN",

              user_action:
                "PAY_NOW",

              shipping_preference:
                "NO_SHIPPING",
            },
          },

          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",

              Prefer:
                "return=representation",
            },
          }
        );

      const paypalOrder =
        paypalResponse.data;

      const approvalUrl =
        paypalOrder.links?.find(
          (link) =>
            link.rel ===
            "approve"
        )?.href;

      if (!paypalOrder.id) {
        throw new Error(
          "PayPal did not return an order ID"
        );
      }

      if (!approvalUrl) {
        throw new Error(
          "PayPal approval URL was not returned"
        );
      }

      console.log(
        "PayPal Order Created:",
        paypalOrder.id
      );

      console.log(
        "PayPal Approval URL:",
        approvalUrl
      );

      // ==========================================
      // RETURN
      // ==========================================

      return res.status(201).json({
        success: true,

        message:
          "PayPal order created",

        paypalOrderId:
          paypalOrder.id,

        localOrderId:
          localOrder._id,

        approvalUrl,

        paypalAmount,

        paypalCurrency,

        order:
          localOrder,
      });
    } catch (error) {
      console.log(
        "Create PayPal Order Error:",
        error?.response?.data ||
          error
      );

      // ==========================================
      // DELETE FAILED LOCAL ORDER
      // ==========================================

      if (localOrder?._id) {
        try {
          await Order.findByIdAndDelete(
            localOrder._id
          );

          console.log(
            "Failed PayPal local order deleted:",
            localOrder._id.toString()
          );
        } catch (deleteError) {
          console.log(
            "Failed to delete local PayPal order:",
            deleteError
          );
        }
      }

      return res.status(500).json({
        success: false,

        message:
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.details?.[0]?.description ||
          error?.message ||
          "Failed to create PayPal order",
      });
    }
  };

// ==========================================
// CAPTURE PAYPAL PAYMENT
// ==========================================

const capturePayment =
  async (req, res) => {
    try {
      const {
        paypalOrderId,
        localOrderId,
      } = req.body;

      if (
        !paypalOrderId ||
        !localOrderId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "PayPal order details are missing",
        });
      }

      const accessToken =
        await getPayPalAccessToken();

      // ==========================================
      // CAPTURE PAYPAL ORDER
      // ==========================================

      const captureResponse =
        await axios.post(
          `${getPayPalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,

          {},

          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",

              Prefer:
                "return=representation",
            },
          }
        );

      const paypalOrder =
        captureResponse.data;

      console.log(
        "PayPal Capture Response:",
        paypalOrder
      );

      if (
        paypalOrder.status !==
        "COMPLETED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "PayPal payment was not completed",
        });
      }

      // ==========================================
      // FIND LOCAL ORDER
      // ==========================================

      const order =
        await Order.findById(
          localOrderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Local order not found",
        });
      }

      // ==========================================
      // PREVENT DOUBLE CAPTURE
      // ==========================================

      if (
        order.paymentStatus ===
        "paid"
      ) {
        return res.status(200).json({
          success: true,

          message:
            "Payment already captured",

          orderId:
            order._id,
        });
      }

      // ==========================================
      // PAYPAL PAYMENT DETAILS
      // ==========================================

      const capture =
        paypalOrder
          .purchase_units?.[0]
          ?.payments
          ?.captures?.[0];

      const paymentId =
        capture?.id || "";

      const payerId =
        paypalOrder
          .payer
          ?.payer_id || "";

      // ==========================================
      // UPDATE LOCAL ORDER
      // ==========================================

      order.paymentStatus =
        "paid";

      order.orderStatus =
        "confirmed";

      order.paymentMethod =
        "paypal";

      order.paymentId =
        paymentId;

      order.payerId =
        payerId;

      order.orderUpdateDate =
        new Date();

      await order.save();

      // ==========================================
      // REDUCE STOCK
      // ==========================================

      for (
        const item of
          order.cartItems
      ) {
        const product =
          await Product.findById(
            item.productId
          );

        if (!product) {
          continue;
        }

        product.totalStock =
          Math.max(
            Number(
              product.totalStock
            ) -
              Number(
                item.quantity
              ),
            0
          );

        await product.save();
      }

      // ==========================================
      // DELETE CART
      // ==========================================

      if (order.cartId) {
        await Cart.findByIdAndDelete(
          order.cartId
        );
      }

      // ==========================================
      // COUPON USAGE
      // ==========================================

      if (order.couponCode) {
        const offer =
          await Offer.findOne({
            code:
              order.couponCode,
          });

        if (
          offer &&
          Number(
            offer.usageLimit || 0
          ) > 0
        ) {
          await Offer.findByIdAndUpdate(
            offer._id,
            {
              $inc: {
                usedCount: 1,
              },
            }
          );
        }
      }

      // ==========================================
      // SUCCESS
      // ==========================================

      return res.status(200).json({
        success: true,

        message:
          "PayPal payment captured successfully",

        orderId:
          order._id,

        data:
          order,
      });
    } catch (error) {
      console.log(
        "Capture PayPal Payment Error:",
        error?.response?.data ||
          error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.details?.[0]?.description ||
          error?.message ||
          "Failed to capture PayPal payment",
      });
    }
  };

// ==========================================
// GET ALL ORDERS BY USER
// ==========================================

const getAllOrdersByUser =
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      const orders =
        await Order.find({
          userId,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.log(
        "Get User Orders Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get orders",
      });
    }
  };

// ==========================================
// GET ORDER DETAILS
// ==========================================

const getOrderDetails =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const order =
        await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.log(
        "Get Order Details Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get order details",
      });
    }
  };

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createOrder,

  createRazorpayOrder,

  verifyRazorpayPayment,

  createPayPalOrder,

  capturePayment,

  getAllOrdersByUser,

  getOrderDetails,
};