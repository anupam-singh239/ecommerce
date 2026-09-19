import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Package, Tag } from "lucide-react";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const price = Number(product?.price || 0);
  const salePrice = Number(product?.salePrice || 0);
  const stock = Number(product?.totalStock || 0);

  // ==========================================
  // DISCOUNT CALCULATION
  // ==========================================

  const discount =
    salePrice > 0 && price > salePrice
      ? Math.round(((price - salePrice) / price) * 100)
      : 0;

  // ==========================================
  // STOCK STATUS
  // ==========================================

  let stockStatus = "In Stock";
  let stockClass = "bg-green-100 text-green-700";

  if (stock === 0) {
    stockStatus = "Out of Stock";
    stockClass = "bg-red-100 text-red-700";
  } else if (stock <= 5) {
    stockStatus = "Low Stock";
    stockClass = "bg-orange-100 text-orange-700";
  }

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">

      {/* ======================================
          PRODUCT IMAGE
      ====================================== */}

      <div className="relative">

        <img
          src={product?.image}
          alt={product?.title}
          className="w-full h-[280px] object-cover"
        />

        {/* DISCOUNT BADGE */}

        {discount > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
            <Tag size={13} />
            {discount}% OFF
          </div>
        )}

        {/* STOCK BADGE */}

        <div
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow ${stockClass}`}
        >
          {stockStatus}
        </div>

      </div>

      {/* ======================================
          PRODUCT INFORMATION
      ====================================== */}

      <CardContent className="p-4">

        {/* TITLE */}

        <h2 className="text-xl font-bold mb-2 line-clamp-1">
          {product?.title}
        </h2>

        {/* CATEGORY + BRAND */}

        <div className="mb-3 flex flex-wrap gap-2">

          {product?.category && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
              {product.category}
            </span>
          )}

          {product?.brand && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
              {product.brand}
            </span>
          )}

        </div>

        {/* PRICE */}

        <div className="flex items-center gap-2 mb-3">

          {salePrice > 0 && salePrice < price ? (
            <>
              <span className="text-lg font-semibold text-muted-foreground line-through">
                ₹{price.toLocaleString("en-IN")}
              </span>

              <span className="text-xl font-bold text-primary">
                ₹{salePrice.toLocaleString("en-IN")}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">
              ₹{price.toLocaleString("en-IN")}
            </span>
          )}

        </div>

        {/* STOCK */}

        <div className="flex items-center gap-2">

          <Package
            size={18}
            className="text-muted-foreground"
          />

          <span className="text-sm font-medium">
            {stock} {stock === 1 ? "item" : "items"} available
          </span>

        </div>

      </CardContent>

      {/* ======================================
          ACTION BUTTONS
      ====================================== */}

      <CardFooter className="flex gap-2 p-4 pt-0">

        <Button
          className="flex-1"
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product?._id);
            setFormData(product);
          }}
        >
          Edit
        </Button>

        <Button
          variant="destructive"
          className="flex-1"
          onClick={() =>
            handleDelete(product?._id)
          }
        >
          Delete
        </Button>

      </CardFooter>

    </Card>
  );
}

export default AdminProductTile;