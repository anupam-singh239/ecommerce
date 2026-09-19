import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/components/ui/use-toast";

import { sortOptions } from "@/config";

import {
  addToCart,
  fetchCartItems,
} from "@/store/shop/cart-slice";

import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";

import {
  ArrowUpDownIcon,
  SlidersHorizontal,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useSearchParams,
} from "react-router-dom";


/* =====================================================
   SHOPPING LISTING
===================================================== */

function ShoppingListing() {
  const dispatch = useDispatch();

  /* =====================================================
     REDUX
  ===================================================== */

  const {
    productList,
    productDetails,
  } = useSelector(
    (state) => state.shopProducts
  );

  const {
    cartItems,
  } = useSelector(
    (state) => state.shopCart
  );

  const {
    user,
  } = useSelector(
    (state) => state.auth
  );


  /* =====================================================
     STATE
  ===================================================== */

  const [
    filters,
    setFilters,
  ] = useState({});

  const [
    sort,
    setSort,
  ] = useState("price-lowtohigh");

  const [
    searchParams,
  ] = useSearchParams();

  const [
    openDetailsDialog,
    setOpenDetailsDialog,
  ] = useState(false);


  const { toast } = useToast();


  /* =====================================================
     CATEGORY FROM URL
  ===================================================== */

  const categorySearchParam =
    searchParams.get("category");


  /* =====================================================
     SORT
  ===================================================== */

  function handleSort(value) {
    setSort(value);
  }


  /* =====================================================
     FILTER
  ===================================================== */

  function handleFilter(
    getSectionId,
    getCurrentOption
  ) {
    setFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
      };

      const currentSection = [
        ...(updatedFilters[getSectionId] || []),
      ];

      const optionIndex =
        currentSection.indexOf(
          getCurrentOption
        );

      if (optionIndex === -1) {
        currentSection.push(
          getCurrentOption
        );
      } else {
        currentSection.splice(
          optionIndex,
          1
        );
      }

      if (
        currentSection.length > 0
      ) {
        updatedFilters[
          getSectionId
        ] = currentSection;
      } else {
        delete updatedFilters[
          getSectionId
        ];
      }

      /* ======================================
         SAVE FILTER
      ====================================== */

      sessionStorage.setItem(
        "filters",
        JSON.stringify(
          updatedFilters
        )
      );

      return updatedFilters;
    });
  }


  /* =====================================================
     PRODUCT DETAILS
  ===================================================== */

  function handleGetProductDetails(
    productId
  ) {
    dispatch(
      fetchProductDetails(
        productId
      )
    );
  }


  /* =====================================================
     ADD TO CART
  ===================================================== */

  function handleAddtoCart(
    productId,
    totalStock
  ) {
    const items =
      cartItems?.items || [];

    /* ======================================
       CHECK EXISTING QUANTITY
    ====================================== */

    if (items.length > 0) {
      const existingIndex =
        items.findIndex(
          (item) =>
            item.productId ===
            productId
        );

      if (existingIndex > -1) {
        const quantity =
          items[
            existingIndex
          ].quantity;

        if (
          quantity + 1 >
          totalStock
        ) {
          toast({
            title: `Only ${quantity} quantity can be added for this item`,
            variant:
              "destructive",
          });

          return;
        }
      }
    }


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
       ADD PRODUCT
    ====================================== */

    dispatch(
      addToCart({
        userId: user.id,
        productId,
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
     LOAD FILTERS
  ===================================================== */

  useEffect(() => {
    let savedFilters = {};

    try {
      savedFilters =
        JSON.parse(
          sessionStorage.getItem(
            "filters"
          )
        ) || {};
    } catch {
      savedFilters = {};
    }


    /* ======================================
       URL CATEGORY HAS PRIORITY
    ====================================== */

    if (
      categorySearchParam
    ) {
      savedFilters.category = [
        categorySearchParam,
      ];
    } else {
      delete savedFilters.category;
    }


    setFilters(
      savedFilters
    );
  }, [
    categorySearchParam,
  ]);


  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams:
          filters || {},
        sortParams: sort,
      })
    );
  }, [
    dispatch,
    filters,
    sort,
  ]);


  /* =====================================================
     PRODUCT DETAILS DIALOG
  ===================================================== */

  useEffect(() => {
    if (
      productDetails !== null
    ) {
      setOpenDetailsDialog(
        true
      );
    }
  }, [
    productDetails,
  ]);


  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      className="
        w-full
        min-h-screen
        bg-gray-50/50
        pt-24
        pb-10
        px-4
        md:px-6
        lg:px-8
      "
    >

      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div
        className="
          max-w-[1600px]
          mx-auto
          mb-5
        "
      >
        <h1
          className="
            text-2xl
            md:text-3xl
            font-extrabold
            text-gray-900
          "
        >
          {categorySearchParam
            ? `${categorySearchParam} Collection`
            : "Shop All Products"}
        </h1>

        <p
          className="
            mt-1
            text-sm
            md:text-base
            text-muted-foreground
          "
        >
          {categorySearchParam
            ? `Explore our latest ${categorySearchParam.toLowerCase()} products`
            : "Find the perfect products for you"}
        </p>
      </div>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className="
          max-w-[1600px]
          mx-auto
          grid
          grid-cols-1
          md:grid-cols-[240px_1fr]
          gap-6
          items-start
        "
      >

        {/* =================================================
            FILTER SIDEBAR
        ================================================= */}

        <aside
          className="
            w-full
            md:sticky
            md:top-24
            self-start
          "
        >

          <div
            className="
              bg-white
              rounded-xl
              border
              shadow-sm
              overflow-hidden
            "
          >

            {/* FILTER HEADER */}

            <div
              className="
                flex
                items-center
                gap-2
                px-4
                py-4
                border-b
                bg-white
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-center
                  h-9
                  w-9
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                "
              >
                <SlidersHorizontal
                  className="h-5 w-5"
                />
              </div>

              <div>
                <h2
                  className="
                    font-bold
                    text-base
                    text-gray-900
                  "
                >
                  Filters
                </h2>

                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  Refine your products
                </p>
              </div>
            </div>


            {/* FILTER OPTIONS */}

            <div className="p-3">
              <ProductFilter
                filters={filters}
                handleFilter={
                  handleFilter
                }
              />
            </div>

          </div>

        </aside>


        {/* =================================================
            PRODUCTS SECTION
        ================================================= */}

        <section
          className="
            bg-white
            w-full
            rounded-xl
            border
            shadow-sm
            overflow-hidden
          "
        >

          {/* =================================================
              PRODUCTS HEADER
          ================================================= */}

          <div
            className="
              p-4
              md:p-5
              border-b
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
              bg-white
            "
          >

            {/* LEFT */}

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <h2
                  className="
                    text-lg
                    md:text-xl
                    font-extrabold
                    text-gray-900
                  "
                >
                  {categorySearchParam
                    ? `${categorySearchParam} Products`
                    : "All Products"}
                </h2>

                <span
                  className="
                    rounded-full
                    bg-blue-50
                    text-blue-700
                    px-3
                    py-1
                    text-xs
                    font-bold
                  "
                >
                  {productList?.length ||
                    0}
                </span>

              </div>


              {categorySearchParam && (
                <p
                  className="
                    text-sm
                    text-muted-foreground
                    mt-1
                  "
                >
                  Showing{" "}
                  {categorySearchParam}{" "}
                  products
                </p>
              )}

            </div>


            {/* RIGHT */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              {/* PRODUCT COUNT */}

              <span
                className="
                  hidden
                  sm:block
                  text-sm
                  font-medium
                  text-muted-foreground
                "
              >
                {productList?.length ||
                  0}{" "}
                Products
              </span>


              {/* =================================================
                  SORT
              ================================================= */}

              <DropdownMenu>

                <DropdownMenuTrigger
                  asChild
                >

                  <Button
                    variant="outline"
                    className="
                      h-10
                      flex
                      items-center
                      gap-2
                      border-gray-300
                      bg-white
                      font-semibold
                    "
                  >

                    <ArrowUpDownIcon
                      className="
                        h-4
                        w-4
                      "
                    />

                    <span>
                      Sort by
                    </span>

                  </Button>

                </DropdownMenuTrigger>


                <DropdownMenuContent
                  align="end"
                  className="
                    w-[220px]
                    bg-white
                    z-[200]
                  "
                >

                  <DropdownMenuRadioGroup
                    value={sort}
                    onValueChange={
                      handleSort
                    }
                  >

                    {sortOptions.map(
                      (sortItem) => (
                        <DropdownMenuRadioItem
                          value={
                            sortItem.id
                          }
                          key={
                            sortItem.id
                          }
                          className="
                            cursor-pointer
                          "
                        >
                          {
                            sortItem.label
                          }
                        </DropdownMenuRadioItem>
                      )
                    )}

                  </DropdownMenuRadioGroup>

                </DropdownMenuContent>

              </DropdownMenu>

            </div>

          </div>


          {/* =================================================
              PRODUCT GRID
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-4
              p-4
              md:p-5
            "
          >

            {productList &&
            productList.length > 0 ? (

              productList.map(
                (productItem) => (
                  <ShoppingProductTile
                    key={
                      productItem?._id
                    }
                    handleGetProductDetails={
                      handleGetProductDetails
                    }
                    product={
                      productItem
                    }
                    handleAddtoCart={
                      handleAddtoCart
                    }
                  />
                )
              )

            ) : (

              /* =================================================
                  EMPTY STATE
              ================================================= */

              <div
                className="
                  col-span-full
                  min-h-[350px]
                  flex
                  items-center
                  justify-center
                "
              >

                <div
                  className="
                    text-center
                    px-4
                  "
                >

                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-100
                    "
                  >
                    <SlidersHorizontal
                      className="
                        h-7
                        w-7
                        text-gray-400
                      "
                    />
                  </div>

                  <h3
                    className="
                      text-xl
                      md:text-2xl
                      font-bold
                      text-gray-900
                    "
                  >
                    No products found
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-muted-foreground
                    "
                  >
                    {categorySearchParam
                      ? `No products available in ${categorySearchParam} category.`
                      : "No products available."}
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

      </div>


      {/* =================================================
          PRODUCT DETAILS
      ================================================= */}

      <ProductDetailsDialog
        open={
          openDetailsDialog
        }
        setOpen={
          setOpenDetailsDialog
        }
        productDetails={
          productDetails
        }
      />

    </div>
  );
}

export default ShoppingListing;