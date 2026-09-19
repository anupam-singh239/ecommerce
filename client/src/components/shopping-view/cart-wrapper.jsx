import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

function UserCartWrapper({
  cartItems,
  setOpenCartSheet,
}) {
  const navigate = useNavigate();

  const items = Array.isArray(cartItems)
    ? cartItems
    : [];

  // ==========================================
  // CALCULATE TOTALS
  // ==========================================

  const subtotalAmount = items.reduce(
    (sum, item) => {
      const price =
        Number(item?.salePrice) > 0
          ? Number(item.salePrice)
          : Number(item?.price || 0);

      return (
        sum +
        price *
          Number(item?.quantity || 0)
      );
    },
    0
  );

  const originalAmount = items.reduce(
    (sum, item) => {
      const price = Number(
        item?.price || 0
      );

      return (
        sum +
        price *
          Number(item?.quantity || 0)
      );
    },
    0
  );

  const totalSavings =
    Math.max(
      originalAmount -
        subtotalAmount,
      0
    );

  const totalItems = items.reduce(
    (sum, item) =>
      sum +
      Number(item?.quantity || 0),
    0
  );

  const shippingAmount =
    subtotalAmount > 0 ? 0 : 0;

  const finalAmount =
    subtotalAmount +
    shippingAmount;

  // ==========================================
  // FORMAT PRICE
  // ==========================================

  const formatPrice = (amount) =>
    Number(amount).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  // ==========================================
  // CHECKOUT
  // ==========================================

  function handleCheckout() {
    navigate("/shop/checkout");
    setOpenCartSheet(false);
  }

  // ==========================================
  // CONTINUE SHOPPING
  // ==========================================

  function handleContinueShopping() {
    navigate("/shop/home");
    setOpenCartSheet(false);
  }

  return (
    <SheetContent className="flex w-full flex-col sm:max-w-lg">
      {/* ======================================
          HEADER
      ====================================== */}

      <SheetHeader className="border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag
              size={20}
              className="text-primary"
            />
          </div>

          <div>
            <SheetTitle className="text-xl">
              Your Cart
            </SheetTitle>

            <p className="text-sm text-muted-foreground">
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>
          </div>
        </div>
      </SheetHeader>

      {/* ======================================
          CART ITEMS
      ====================================== */}

      <div className="flex-1 overflow-y-auto py-2 pr-1">
        {items.length > 0 ? (
          <div>
            {items.map((item) => (
              <UserCartItemsContent
                key={item?.productId}
                cartItem={item}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[350px] flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag
                size={36}
                className="text-muted-foreground"
              />
            </div>

            <h3 className="text-lg font-bold">
              Your cart is empty
            </h3>

            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Looks like you haven't added
              anything to your cart yet.
            </p>

            <Button
              className="mt-6"
              onClick={
                handleContinueShopping
              }
            >
              Start Shopping
              <ArrowRight
                size={16}
                className="ml-2"
              />
            </Button>
          </div>
        )}
      </div>

      {/* ======================================
          SUMMARY
      ====================================== */}

      {items.length > 0 && (
        <div className="border-t pt-5">
          {/* SAVINGS */}

          {totalSavings > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              <Tag size={16} />
              You're saving ₹
              {formatPrice(
                totalSavings
              )}
            </div>
          )}

          {/* SUBTOTAL */}

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal
              </span>

              <span className="font-medium">
                ₹
                {formatPrice(
                  subtotalAmount
                )}
              </span>
            </div>

            {/* SHIPPING */}

            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck size={16} />
                <span>Shipping</span>
              </div>

              <span className="font-semibold text-green-600">
                FREE
              </span>
            </div>

            {/* TOTAL */}

            <div className="flex items-end justify-between border-t pt-4">
              <div>
                <p className="text-base font-bold">
                  Total
                </p>

                <p className="text-xs text-muted-foreground">
                  Inclusive of all applicable
                  charges
                </p>
              </div>

              <span className="text-2xl font-extrabold">
                ₹
                {formatPrice(
                  finalAmount
                )}
              </span>
            </div>
          </div>

          {/* ==================================
              CHECKOUT BUTTON
          ================================== */}

          <Button
            className="mt-5 h-12 w-full text-base font-bold"
            onClick={handleCheckout}
          >
            Proceed to Checkout
            <ArrowRight
              size={18}
              className="ml-2"
            />
          </Button>

          {/* ==================================
              CONTINUE SHOPPING
          ================================== */}

          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={
              handleContinueShopping
            }
          >
            Continue Shopping
          </Button>

          {/* ==================================
              TRUST
          ================================== */}

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={15} />
            <span>
              Secure & trusted checkout
            </span>
          </div>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;