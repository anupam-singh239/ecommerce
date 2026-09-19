import { Minus, Plus, Trash2, Package } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCartItem,
  updateCartQuantity,
} from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector(
    (state) => state.shopProducts
  );

  const dispatch = useDispatch();
  const { toast } = useToast();

  const price =
    Number(cartItem?.salePrice) > 0
      ? Number(cartItem.salePrice)
      : Number(cartItem?.price || 0);

  const originalPrice = Number(
    cartItem?.price || 0
  );

  const quantity = Number(
    cartItem?.quantity || 1
  );

  const itemTotal = price * quantity;

  const hasDiscount =
    Number(cartItem?.salePrice) > 0 &&
    Number(cartItem?.salePrice) <
      originalPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((originalPrice -
          Number(cartItem.salePrice)) /
          originalPrice) *
          100
      )
    : 0;

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  function handleUpdateQuantity(
    getCartItem,
    typeOfAction
  ) {
    if (typeOfAction === "plus") {
      const getCartItems =
        cartItems?.items || [];

      const currentIndex =
        getCartItems.findIndex(
          (item) =>
            item.productId ===
            getCartItem?.productId
        );

      const productIndex =
        productList.findIndex(
          (product) =>
            product._id ===
            getCartItem?.productId
        );

      const product =
        productIndex >= 0
          ? productList[productIndex]
          : null;

      const totalStock = Number(
        product?.totalStock || 0
      );

      if (currentIndex > -1) {
        const currentQuantity =
          Number(
            getCartItems[currentIndex]
              ?.quantity || 0
          );

        if (
          currentQuantity + 1 >
          totalStock
        ) {
          toast({
            title: "Stock limit reached",
            description: `Only ${totalStock} item(s) are available.`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    const newQuantity =
      typeOfAction === "plus"
        ? quantity + 1
        : quantity - 1;

    if (newQuantity < 1) return;

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId:
          getCartItem?.productId,
        quantity: newQuantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart updated",
          description:
            "Quantity updated successfully.",
        });
      }
    });
  }

  // ==========================================
  // DELETE CART ITEM
  // ==========================================

  function handleCartItemDelete(
    getCartItem
  ) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId:
          getCartItem?.productId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Item removed",
          description:
            "Product removed from your cart.",
        });
      }
    });
  }

  return (
    <div className="group flex gap-4 border-b py-5 last:border-b-0">
      {/* ======================================
          PRODUCT IMAGE
      ====================================== */}

      <div className="relative shrink-0">
        <img
          src={cartItem?.image}
          alt={cartItem?.title}
          className="h-24 w-24 rounded-xl border object-cover bg-muted"
        />

        {hasDiscount && (
          <span className="absolute -left-2 -top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* ======================================
          PRODUCT INFORMATION
      ====================================== */}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 text-base font-bold">
              {cartItem?.title}
            </h3>

            {cartItem?.brand && (
              <p className="mt-1 text-xs text-muted-foreground">
                {cartItem.brand}
              </p>
            )}

            {cartItem?.category && (
              <span className="mt-2 inline-block rounded-md bg-muted px-2 py-1 text-[11px] font-medium">
                {cartItem.category}
              </span>
            )}
          </div>

          {/* DELETE */}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            onClick={() =>
              handleCartItemDelete(
                cartItem
              )
            }
          >
            <Trash2 size={17} />
            <span className="sr-only">
              Remove item
            </span>
          </Button>
        </div>

        {/* ======================================
            PRICE
        ====================================== */}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            ₹
            {price.toLocaleString(
              "en-IN"
            )}
          </span>

          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹
              {originalPrice.toLocaleString(
                "en-IN"
              )}
            </span>
          )}
        </div>

        {/* ======================================
            QUANTITY + STOCK
        ====================================== */}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              disabled={quantity <= 1}
              onClick={() =>
                handleUpdateQuantity(
                  cartItem,
                  "minus"
                )
              }
            >
              <Minus size={14} />
            </Button>

            <span className="flex h-8 min-w-9 items-center justify-center border-x px-2 text-sm font-bold">
              {quantity}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() =>
                handleUpdateQuantity(
                  cartItem,
                  "plus"
                )
              }
            >
              <Plus size={14} />
            </Button>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package size={14} />

            <span>
              {quantity}{" "}
              {quantity === 1
                ? "item"
                : "items"}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================
          TOTAL
      ====================================== */}

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-lg font-bold">
          ₹
          {itemTotal.toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </p>

        {hasDiscount && (
          <p className="mt-1 text-xs font-medium text-green-600">
            You save ₹
            {(
              (originalPrice - price) *
              quantity
            ).toLocaleString(
              "en-IN",
              {
                maximumFractionDigits: 2,
              }
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default UserCartItemsContent;