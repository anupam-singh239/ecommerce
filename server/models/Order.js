const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    // =====================================
    // USER
    // =====================================

    userId: {
      type: String,
      required: true,
    },

    // =====================================
    // CART
    // =====================================

    cartId: {
      type: String,
      default: "",
    },

    // =====================================
    // ORDER ITEMS
    // =====================================

    cartItems: [
      {
        productId: {
          type: String,
          required: true,
        },

        title: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          default: "",
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    // =====================================
    // DELIVERY ADDRESS
    // =====================================

    addressInfo: {
      addressId: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      notes: {
        type: String,
        default: "",
      },
    },

    // =====================================
    // ORDER STATUS
    // =====================================

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // =====================================
    // PAYMENT
    // =====================================

    paymentMethod: {
      type: String,
      enum: ["cod", "paypal", "razorpay", "online"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // =====================================
    // PRICE / COUPON
    // =====================================

    // Coupon se pehle ka total
    subtotalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Applied coupon code
    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    // Coupon se mila discount
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Final payable amount
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================
    // DATES
    // =====================================

    orderDate: {
      type: Date,
      default: Date.now,
    },

    orderUpdateDate: {
      type: Date,
      default: Date.now,
    },

    // =====================================
    // PAYMENT DETAILS
    // =====================================

    paymentId: {
      type: String,
      default: "",
    },

    payerId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;