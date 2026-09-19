import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Package,
  Filter,
  X,
  ArrowUpDown,
} from "lucide-react";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);

  const [formData, setFormData] =
    useState(initialFormData);

  const [imageFile, setImageFile] =
    useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] =
    useState("");

  const [imageLoadingState, setImageLoadingState] =
    useState(false);

  const [currentEditedId, setCurrentEditedId] =
    useState(null);

  // ==========================================
  // SEARCH, FILTER & SORT
  // ==========================================

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [sortOption, setSortOption] =
    useState("default");

  const { productList } = useSelector(
    (state) => state.adminProducts
  );

  const dispatch = useDispatch();

  const { toast } = useToast();

  // ==========================================
  // GET UNIQUE CATEGORIES
  // ==========================================

  const categories = useMemo(() => {
    const categoryList = productList
      ?.map((product) => product.category)
      .filter(Boolean);

    return [...new Set(categoryList)];
  }, [productList]);

  // ==========================================
  // FILTER + SORT PRODUCTS
  // ==========================================

  const filteredProducts = useMemo(() => {
    let products = productList || [];

    // ========================================
    // SEARCH
    // ========================================

    const searchText = search
      .toLowerCase()
      .trim();

    if (searchText) {
      products = products.filter((product) => {
        return (
          product?.title
            ?.toLowerCase()
            .includes(searchText) ||
          product?.brand
            ?.toLowerCase()
            .includes(searchText) ||
          product?.category
            ?.toLowerCase()
            .includes(searchText)
        );
      });
    }

    // ========================================
    // CATEGORY FILTER
    // ========================================

    if (categoryFilter !== "all") {
      products = products.filter(
        (product) =>
          product?.category === categoryFilter
      );
    }

    // ========================================
    // SORT
    // ========================================

    products = [...products];

    switch (sortOption) {
      // --------------------------------------
      // PRICE LOW TO HIGH
      // --------------------------------------

      case "price-low-high":
        products.sort(
          (a, b) =>
            Number(a?.salePrice || a?.price || 0) -
            Number(b?.salePrice || b?.price || 0)
        );
        break;

      // --------------------------------------
      // PRICE HIGH TO LOW
      // --------------------------------------

      case "price-high-low":
        products.sort(
          (a, b) =>
            Number(b?.salePrice || b?.price || 0) -
            Number(a?.salePrice || a?.price || 0)
        );
        break;

      // --------------------------------------
      // STOCK LOW TO HIGH
      // --------------------------------------

      case "stock-low-high":
        products.sort(
          (a, b) =>
            Number(a?.totalStock || 0) -
            Number(b?.totalStock || 0)
        );
        break;

      // --------------------------------------
      // STOCK HIGH TO LOW
      // --------------------------------------

      case "stock-high-low":
        products.sort(
          (a, b) =>
            Number(b?.totalStock || 0) -
            Number(a?.totalStock || 0)
        );
        break;

      // --------------------------------------
      // NEWEST
      // --------------------------------------

      case "newest":
        products.sort(
          (a, b) =>
            new Date(b?.createdAt || 0) -
            new Date(a?.createdAt || 0)
        );
        break;

      // --------------------------------------
      // OLDEST
      // --------------------------------------

      case "oldest":
        products.sort(
          (a, b) =>
            new Date(a?.createdAt || 0) -
            new Date(b?.createdAt || 0)
        );
        break;

      default:
        break;
    }

    return products;
  }, [
    productList,
    search,
    categoryFilter,
    sortOption,
  ]);

  // ==========================================
  // SUBMIT PRODUCT
  // ==========================================

  function onSubmit(event) {
    event.preventDefault();

    // EDIT PRODUCT
    if (currentEditedId !== null) {
      dispatch(
        editProduct({
          id: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());

          setFormData(initialFormData);
          setImageFile(null);
          setUploadedImageUrl("");

          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);

          toast({
            title: "Product updated successfully",
          });
        }
      });

      return;
    }

    // ADD PRODUCT
    dispatch(
      addNewProduct({
        ...formData,
        image: uploadedImageUrl,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());

        setOpenCreateProductsDialog(false);
        setImageFile(null);
        setUploadedImageUrl("");
        setFormData(initialFormData);

        toast({
          title: "Product added successfully",
        });
      }
    });
  }

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  function handleDelete(getCurrentProductId) {
    dispatch(
      deleteProduct(getCurrentProductId)
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());

        toast({
          title: "Product deleted successfully",
        });
      }
    });
  }

  // ==========================================
  // FORM VALIDATION
  // ==========================================

  function isFormValid() {
    return Object.keys(formData)
      .filter(
        (currentKey) =>
          currentKey !== "averageReview"
      )
      .map(
        (key) =>
          formData[key] !== ""
      )
      .every((item) => item);
  }

  // ==========================================
  // CANCEL EDIT / CLOSE FORM
  // ==========================================

  function handleCancel() {
    setOpenCreateProductsDialog(false);

    setCurrentEditedId(null);

    setFormData(initialFormData);

    setImageFile(null);

    setUploadedImageUrl("");
  }

  // ==========================================
  // CLEAR ALL FILTERS
  // ==========================================

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setSortOption("default");
  }

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const isFilterActive =
    search ||
    categoryFilter !== "all" ||
    sortOption !== "default";

  return (
    <Fragment>

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Management
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your store products, prices and stock.
          </p>
        </div>

        <Button
          onClick={() => {
            setCurrentEditedId(null);
            setFormData(initialFormData);
            setImageFile(null);
            setUploadedImageUrl("");
            setOpenCreateProductsDialog(true);
          }}
        >
          Add New Product
        </Button>

      </div>

      {/* ======================================
          PRODUCT COUNT
      ====================================== */}

      <div className="mb-5">

        <div className="inline-flex items-center gap-3 rounded-xl border bg-background px-5 py-4 shadow-sm">

          <div className="rounded-full bg-primary/10 p-3">
            <Package className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Total Products
            </p>

            <p className="text-2xl font-bold">
              {productList?.length || 0}
            </p>
          </div>

        </div>

      </div>

      {/* ======================================
          SEARCH / FILTER / SORT
      ====================================== */}

      <div className="mb-6 rounded-xl border bg-background p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search product, brand or category..."
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 outline-none focus:ring-2 focus:ring-primary"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            )}

          </div>

          {/* CATEGORY */}

          <div className="relative">

            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-4 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}

            </select>

          </div>

          {/* SORT */}

          <div className="relative">

            <ArrowUpDown
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(
                  e.target.value
                )
              }
              className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-4 outline-none focus:ring-2 focus:ring-primary"
            >

              <option value="default">
                Sort Products
              </option>

              <option value="price-low-high">
                Price: Low to High
              </option>

              <option value="price-high-low">
                Price: High to Low
              </option>

              <option value="stock-low-high">
                Stock: Low to High
              </option>

              <option value="stock-high-low">
                Stock: High to Low
              </option>

              <option value="newest">
                Newest Products
              </option>

              <option value="oldest">
                Oldest Products
              </option>

            </select>

          </div>

        </div>

        {/* ====================================
            FILTER RESULT
        ==================================== */}

        {isFilterActive && (
          <div className="mt-4 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-muted-foreground">

              Showing{" "}

              <span className="font-semibold text-foreground">
                {filteredProducts.length}
              </span>{" "}

              of{" "}

              <span className="font-semibold text-foreground">
                {productList?.length || 0}
              </span>{" "}

              products

            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-fit"
            >
              <X className="mr-1 h-4 w-4" />
              Clear Filters
            </Button>

          </div>
        )}

      </div>

      {/* ======================================
          PRODUCT LIST
      ====================================== */}

      {filteredProducts.length > 0 ? (

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">

          {filteredProducts.map(
            (productItem) => (
              <AdminProductTile
                key={productItem._id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={
                  setOpenCreateProductsDialog
                }
                setCurrentEditedId={
                  setCurrentEditedId
                }
                product={productItem}
                handleDelete={handleDelete}
              />
            )
          )}

        </div>

      ) : (

        <div className="rounded-xl border bg-background p-12 text-center shadow-sm">

          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

          <h2 className="text-xl font-semibold">
            No Products Found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Try another product name, category or filter.
          </p>

        </div>

      )}

      {/* ======================================
          ADD / EDIT PRODUCT SHEET
      ====================================== */}

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          } else {
            setOpenCreateProductsDialog(true);
          }
        }}
      >

        <SheetContent
          side="right"
          className="overflow-auto sm:max-w-lg"
        >

          <SheetHeader>

            <SheetTitle>
              {currentEditedId !== null
                ? "Edit Product"
                : "Add New Product"}
            </SheetTitle>

          </SheetHeader>

          {/* IMAGE UPLOAD */}

          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={
              setUploadedImageUrl
            }
            setImageLoadingState={
              setImageLoadingState
            }
            imageLoadingState={
              imageLoadingState
            }
            isEditMode={
              currentEditedId !== null
            }
          />

          {/* PRODUCT FORM */}

          <div className="py-6">

            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={
                currentEditedId !== null
                  ? "Save Changes"
                  : "Add Product"
              }
              formControls={
                addProductFormElements
              }
              isBtnDisabled={
                !isFormValid() ||
                imageLoadingState
              }
            />

            {/* CANCEL BUTTON */}

            {currentEditedId !== null && (
              <div className="mt-3">

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>

              </div>
            )}

          </div>

        </SheetContent>

      </Sheet>

    </Fragment>
  );
}

export default AdminProducts;