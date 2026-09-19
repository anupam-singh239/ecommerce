
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";

import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";

import { Search, X } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();

  const { searchResults } = useSelector(
    (state) => state.shopSearch
  );

  const { productDetails } = useSelector(
    (state) => state.shopProducts
  );

  const { user } = useSelector(
    (state) => state.auth
  );

  const { cartItems } = useSelector(
    (state) => state.shopCart
  );

  const { toast } = useToast();

  // ==========================================
  // GET KEYWORD FROM URL
  // ==========================================

  useEffect(() => {
    const urlKeyword = searchParams.get("keyword");

    if (urlKeyword) {
      setKeyword(urlKeyword);
    }
  }, []);

  // ==========================================
  // SEARCH PRODUCTS
  // ==========================================

  useEffect(() => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      dispatch(resetSearchResults());

      return;
    }

    const timer = setTimeout(() => {
      setSearchParams({
        keyword: trimmedKeyword,
      });

      dispatch(
        getSearchResults(trimmedKeyword)
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, dispatch, setSearchParams]);

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  function handleClearSearch() {
    setKeyword("");

    setSearchParams({});

    dispatch(resetSearchResults());
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  function handleAddtoCart(
    getCurrentProductId,
    getTotalStock
  ) {
    const getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem =
        getCartItems.findIndex(
          (item) =>
            item.productId ===
            getCurrentProductId
        );

      if (indexOfCurrentItem > -1) {
        const getQuantity =
          getCartItems[indexOfCurrentItem]
            .quantity;

        if (
          getQuantity + 1 >
          getTotalStock
        ) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    if (!user?.id) {
      toast({
        title: "Please login first",
        description:
          "Login to add products to your cart.",
        variant: "destructive",
      });

      return;
    }

    dispatch(
      addToCart({
        userId: user.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user.id));

        toast({
          title: "Product added to cart",
        });
      } else {
        toast({
          title: "Unable to add product",
          description:
            data?.payload?.message ||
            "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  }

  // ==========================================
  // PRODUCT DETAILS
  // ==========================================

  function handleGetProductDetails(
    getCurrentProductId
  ) {
    dispatch(
      fetchProductDetails(
        getCurrentProductId
      )
    );
  }

  // ==========================================
  // OPEN PRODUCT DETAILS
  // ==========================================

  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      
      {/* ======================================
          SEARCH HERO
      ====================================== */}

      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">

          <div className="mx-auto max-w-3xl text-center">

            {/* Icon */}

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
              <Search size={30} />
            </div>

            {/* Heading */}

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Search Products
            </h1>

            {/* Subtitle */}

            <p className="mt-3 text-base text-slate-500 md:text-lg">
              Find your favourite products quickly
            </p>

            {/* Search Box */}

            <div className="relative mt-8">

              <Search
                size={21}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                value={keyword}
                name="keyword"
                onChange={(event) =>
                  setKeyword(event.target.value)
                }
                className="h-14 rounded-2xl border-slate-200 bg-white pl-14 pr-14 text-base shadow-lg focus-visible:ring-2"
                placeholder="Search products, brands or categories..."
              />

              {keyword && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl p-0"
                >
                  <X size={20} />
                </Button>
              )}

            </div>

            {/* Search Hint */}

            <p className="mt-3 text-sm text-slate-400">
              Type a product name, brand or category
            </p>

          </div>

        </div>
      </section>


      {/* ======================================
          SEARCH RESULTS
      ====================================== */}

      <section className="container mx-auto px-4 py-8 md:px-6">

        {/* Results Header */}

        {keyword.trim() && (
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Search Results
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {searchResults.length} product
                {searchResults.length !== 1
                  ? "s"
                  : ""}{" "}
                found for "
                {keyword.trim()}"
              </p>
            </div>

            {searchResults.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="w-fit rounded-xl"
              >
                Clear Search
              </Button>
            )}

          </div>
        )}


        {/* ====================================
            NO SEARCH YET
        ==================================== */}

        {!keyword.trim() && (
          <div className="rounded-3xl border border-dashed bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search
                size={28}
                className="text-slate-400"
              />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              What are you looking for?
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Search for your favourite products,
              brands and categories using the search
              box above.
            </p>

          </div>
        )}


        {/* ====================================
            NO RESULTS
        ==================================== */}

        {keyword.trim() &&
          searchResults.length === 0 && (
            <div className="rounded-3xl border border-dashed bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <Search
                  size={28}
                  className="text-red-400"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-slate-500">
                We couldn't find any products matching "
                {keyword.trim()}". Try another product,
                brand or category.
              </p>

              <Button
                onClick={handleClearSearch}
                className="mt-6 rounded-xl"
              >
                Clear Search
              </Button>

            </div>
          )}


        {/* ====================================
            PRODUCT GRID
        ==================================== */}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {searchResults.map((item) => (
              <ShoppingProductTile
                key={item?._id}
                handleAddtoCart={
                  handleAddtoCart
                }
                product={item}
                handleGetProductDetails={
                  handleGetProductDetails
                }
              />
            ))}

          </div>
        )}

      </section>


      {/* ======================================
          PRODUCT DETAILS DIALOG
      ====================================== */}

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />

    </div>
  );
}

export default SearchProducts;
