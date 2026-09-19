import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";

import {
  getAllOffersForAdmin,
  createOfferForAdmin,
  updateOfferForAdmin,
  deleteOfferForAdmin,
  toggleOfferStatusForAdmin,
  clearOfferMessages,
} from "@/store/admin/offers-slice";

const initialFormData = {
  code: "",
  title: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: "",
  usageLimit: "0",
  startDate: "",
  expiryDate: "",
  status: "active",
};

function AdminOffers() {
  const dispatch = useDispatch();

  const {
    offers,
    isLoading,
    error,
  } = useSelector((state) => state.adminOffers);

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] =
    useState(initialFormData);

  // ==========================================
  // LOAD OFFERS
  // ==========================================

  useEffect(() => {
    dispatch(getAllOffersForAdmin());

    return () => {
      dispatch(clearOfferMessages());
    };
  }, [dispatch]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================
  // DATE FORMAT FOR INPUT
  // ==========================================

  function formatDateForInput(date) {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // DISPLAY DATE
  // ==========================================

  function formatDisplayDate(date) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ==========================================
  // AUTOMATIC OFFER STATUS
  // ==========================================

  function getOfferStatus(offer) {
    if (offer?.status === "inactive") {
      return "inactive";
    }

    const now = new Date();

    const startDate = new Date(
      offer?.startDate
    );

    const expiryDate = new Date(
      offer?.expiryDate
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(expiryDate.getTime())
    ) {
      return "inactive";
    }

    if (now < startDate) {
      return "upcoming";
    }

    if (now > expiryDate) {
      return "expired";
    }

    return "active";
  }

  // ==========================================
  // STATUS LABEL
  // ==========================================

  function getStatusLabel(status) {
    switch (status) {
      case "active":
        return "Active";

      case "upcoming":
        return "Upcoming";

      case "expired":
        return "Expired";

      case "inactive":
        return "Inactive";

      default:
        return "Unknown";
    }
  }

  // ==========================================
  // STATUS CLASS
  // ==========================================

  function getStatusClass(status) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";

      case "upcoming":
        return "bg-yellow-100 text-yellow-700";

      case "expired":
        return "bg-red-100 text-red-700";

      case "inactive":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  // ==========================================
  // STATUS ICON
  // ==========================================

  function StatusIcon({ status }) {
    if (status === "active") {
      return (
        <CheckCircle2 className="h-4 w-4" />
      );
    }

    if (status === "upcoming") {
      return (
        <Clock className="h-4 w-4" />
      );
    }

    if (status === "expired") {
      return (
        <AlertCircle className="h-4 w-4" />
      );
    }

    return (
      <Power className="h-4 w-4" />
    );
  }

  // ==========================================
  // ADD / UPDATE OFFER
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !formData.code.trim() ||
      !formData.title.trim() ||
      formData.discountValue === "" ||
      !formData.startDate ||
      !formData.expiryDate
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const discountValue = Number(
      formData.discountValue
    );

    const minimumOrderAmount = Number(
      formData.minimumOrderAmount || 0
    );

    const usageLimit = Number(
      formData.usageLimit || 0
    );

    if (discountValue < 0) {
      alert(
        "Discount value cannot be negative."
      );
      return;
    }

    if (
      formData.discountType === "percentage" &&
      discountValue > 100
    ) {
      alert(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    if (minimumOrderAmount < 0) {
      alert(
        "Minimum order amount cannot be negative."
      );
      return;
    }

    if (usageLimit < 0) {
      alert(
        "Usage limit cannot be negative."
      );
      return;
    }

    const startDate = new Date(
      `${formData.startDate}T00:00:00`
    );

    const expiryDate = new Date(
      `${formData.expiryDate}T23:59:59`
    );

    if (expiryDate < startDate) {
      alert(
        "Expiry date cannot be before start date."
      );
      return;
    }

    const currentOffer = editingId
      ? offers.find(
          (offer) =>
            offer?._id === editingId
        )
      : null;

    const usedCount = Number(
      currentOffer?.usedCount || 0
    );

    if (
      editingId &&
      usageLimit > 0 &&
      usageLimit < usedCount
    ) {
      alert(
        `Usage limit cannot be less than used count (${usedCount}).`
      );
      return;
    }

    const payload = {
      code: formData.code
        .trim()
        .toUpperCase(),

      title: formData.title.trim(),

      discountType:
        formData.discountType,

      discountValue,

      minimumOrderAmount,

      usageLimit,

      startDate:
        formData.startDate,

      expiryDate:
        formData.expiryDate,

      status:
        formData.status,
    };

    try {
      if (editingId) {
        const result = await dispatch(
          updateOfferForAdmin({
            id: editingId,
            formData: payload,
          })
        );

        if (
          updateOfferForAdmin.fulfilled.match(
            result
          )
        ) {
          alert(
            "Offer updated successfully."
          );

          dispatch(
            getAllOffersForAdmin()
          );

          handleCancel();
        } else {
          alert(
            result.payload ||
              "Failed to update offer."
          );
        }
      } else {
        const result = await dispatch(
          createOfferForAdmin(payload)
        );

        if (
          createOfferForAdmin.fulfilled.match(
            result
          )
        ) {
          alert(
            "Offer created successfully."
          );

          dispatch(
            getAllOffersForAdmin()
          );

          handleCancel();
        } else {
          alert(
            result.payload ||
              "Failed to create offer."
          );
        }
      }
    } catch (err) {
      console.log(
        "Offer Submit Error:",
        err
      );

      alert(
        "Something went wrong."
      );
    }
  }

  // ==========================================
  // EDIT
  // ==========================================

  function handleEdit(offer) {
    setFormData({
      code: offer?.code || "",

      title: offer?.title || "",

      discountType:
        offer?.discountType ||
        "percentage",

      discountValue:
        offer?.discountValue ?? "",

      minimumOrderAmount:
        offer?.minimumOrderAmount ?? "",

      usageLimit:
        offer?.usageLimit ?? 0,

      startDate:
        formatDateForInput(
          offer?.startDate
        ),

      expiryDate:
        formatDateForInput(
          offer?.expiryDate
        ),

      status:
        offer?.status || "active",
    });

    setEditingId(
      offer?._id
    );

    setOpenForm(true);
  }

  // ==========================================
  // DELETE
  // ==========================================

  async function handleDelete(id) {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this offer?"
      );

    if (!confirmDelete) return;

    const result = await dispatch(
      deleteOfferForAdmin(id)
    );

    if (
      deleteOfferForAdmin.fulfilled.match(
        result
      )
    ) {
      alert(
        "Offer deleted successfully."
      );
    } else {
      alert(
        result.payload ||
          "Failed to delete offer."
      );
    }
  }

  // ==========================================
  // TOGGLE STATUS
  // ==========================================

  async function toggleStatus(id) {
    const result = await dispatch(
      toggleOfferStatusForAdmin(id)
    );

    if (
      !toggleOfferStatusForAdmin.fulfilled.match(
        result
      )
    ) {
      alert(
        result.payload ||
          "Failed to update offer status."
      );
    }
  }

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  const filteredOffers =
    offers.filter((offer) => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      const status =
        getOfferStatus(offer);

      return (
        offer?.code
          ?.toLowerCase()
          .includes(searchText) ||

        offer?.title
          ?.toLowerCase()
          .includes(searchText) ||

        status
          .toLowerCase()
          .includes(searchText)
      );
    });

  // ==========================================
  // RESET FORM
  // ==========================================

  function handleCancel() {
    setFormData(
      initialFormData
    );

    setEditingId(null);

    setOpenForm(false);
  }

  // ==========================================
  // STATS
  // ==========================================

  const totalOffers =
    offers.length;

  const activeOffers =
    offers.filter(
      (offer) =>
        getOfferStatus(offer) ===
        "active"
    ).length;

  const upcomingOffers =
    offers.filter(
      (offer) =>
        getOfferStatus(offer) ===
        "upcoming"
    ).length;

  const expiredOffers =
    offers.filter(
      (offer) =>
        getOfferStatus(offer) ===
        "expired"
    ).length;

  const inactiveOffers =
    offers.filter(
      (offer) =>
        getOfferStatus(offer) ===
        "inactive"
    ).length;

  return (
    <div className="space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Offers & Coupons
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage discount offers and coupon codes.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData(
              initialFormData
            );

            setEditingId(null);

            setOpenForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Offer
        </Button>

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================
          STATS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {/* TOTAL */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Tag className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Offers
              </p>

              <p className="text-2xl font-bold">
                {totalOffers}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Active
              </p>

              <p className="text-2xl font-bold">
                {activeOffers}
              </p>
            </div>
          </div>
        </div>

        {/* UPCOMING */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Upcoming
              </p>

              <p className="text-2xl font-bold">
                {upcomingOffers}
              </p>
            </div>
          </div>
        </div>

        {/* EXPIRED */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Expired
              </p>

              <p className="text-2xl font-bold">
                {expiredOffers}
              </p>
            </div>
          </div>
        </div>

        {/* INACTIVE */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gray-100 p-3">
              <Power className="h-5 w-5 text-gray-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Inactive
              </p>

              <p className="text-2xl font-bold">
                {inactiveOffers}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search coupon, title or status..."
          className="
            w-full
            rounded-lg
            border
            bg-background
            py-3
            pl-10
            pr-10
            outline-none
            focus:ring-2
            focus:ring-primary
          "
        />

        {search && (
          <button
            type="button"
            onClick={() =>
              setSearch("")
            }
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-muted-foreground
              hover:text-foreground
            "
          >
            <X size={18} />
          </button>
        )}

      </div>

      {/* ======================================
          RESULT COUNT
      ====================================== */}

      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredOffers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {totalOffers}
          </span>{" "}
          offers
        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {isLoading && (
        <div className="rounded-xl border bg-background p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Loading offers...
          </p>
        </div>
      )}

      {/* ======================================
          OFFER LIST
      ====================================== */}

      {!isLoading &&
        filteredOffers.length > 0 && (

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {filteredOffers.map(
              (offer) => {

                const offerStatus =
                  getOfferStatus(
                    offer
                  );

                const usageLimit =
                  Number(
                    offer?.usageLimit || 0
                  );

                const usedCount =
                  Number(
                    offer?.usedCount || 0
                  );

                const remainingUses =
                  usageLimit > 0
                    ? Math.max(
                        usageLimit -
                          usedCount,
                        0
                      )
                    : null;

                return (
                  <div
                    key={offer?._id}
                    className="
                      rounded-xl
                      border
                      bg-background
                      p-5
                      shadow-sm
                      transition
                      hover:shadow-md
                    "
                  >

                    {/* TOP */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-md bg-primary/10 px-3 py-1">

                          <Tag className="h-4 w-4 shrink-0 text-primary" />

                          <span className="truncate font-bold text-primary">
                            {offer?.code}
                          </span>

                        </div>

                        <h2 className="text-lg font-bold break-words">
                          {offer?.title}
                        </h2>

                      </div>

                      {/* STATUS */}

                      <span
                        className={`
                          inline-flex
                          shrink-0
                          items-center
                          gap-1.5
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${getStatusClass(
                            offerStatus
                          )}
                        `}
                      >
                        <StatusIcon
                          status={
                            offerStatus
                          }
                        />

                        {getStatusLabel(
                          offerStatus
                        )}
                      </span>

                    </div>

                    {/* DISCOUNT */}

                    <div className="my-4 rounded-lg bg-muted p-4">

                      <p className="text-sm text-muted-foreground">
                        Discount
                      </p>

                      <p className="text-2xl font-bold">

                        {offer?.discountType ===
                        "percentage"
                          ? `${offer?.discountValue}% OFF`
                          : `₹${Number(
                              offer?.discountValue ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )} OFF`}

                      </p>

                    </div>

                    {/* USAGE */}

                    <div className="mb-4 rounded-lg border bg-background p-4">

                      <div className="mb-3 flex items-center gap-2">

                        <Users className="h-4 w-4 text-primary" />

                        <p className="text-sm font-semibold">
                          Coupon Usage
                        </p>

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <div className="rounded-md bg-muted p-3">

                          <p className="text-xs text-muted-foreground">
                            Used
                          </p>

                          <p className="text-lg font-bold">
                            {usedCount}
                          </p>

                        </div>

                        <div className="rounded-md bg-muted p-3">

                          <p className="text-xs text-muted-foreground">
                            Remaining
                          </p>

                          <p
                            className={`text-lg font-bold ${
                              remainingUses === 0
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {remainingUses === null
                              ? "Unlimited"
                              : remainingUses}
                          </p>

                        </div>

                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">

                        {usageLimit === 0
                          ? "Unlimited coupon usage"
                          : `Maximum ${usageLimit} successful order${
                              usageLimit === 1
                                ? ""
                                : "s"
                            }`}

                      </p>

                    </div>

                    {/* DETAILS */}

                    <div className="space-y-2 text-sm">

                      <div className="flex justify-between gap-4">

                        <span className="text-muted-foreground">
                          Minimum Order
                        </span>

                        <span className="font-medium">
                          ₹
                          {Number(
                            offer?.minimumOrderAmount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-muted-foreground">
                          Start Date
                        </span>

                        <span className="font-medium text-right">
                          {formatDisplayDate(
                            offer?.startDate
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-muted-foreground">
                          Expiry Date
                        </span>

                        <span
                          className={`font-medium text-right ${
                            offerStatus ===
                            "expired"
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          {formatDisplayDate(
                            offer?.expiryDate
                          )}
                        </span>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-2">

                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          handleEdit(
                            offer
                          )
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          toggleStatus(
                            offer?._id
                          )
                        }
                        title={
                          offer?.status ===
                          "active"
                            ? "Deactivate"
                            : "Activate"
                        }
                      >
                        <Power className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleDelete(
                            offer?._id
                          )
                        }
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      {/* ======================================
          NO OFFERS
      ====================================== */}

      {!isLoading &&
        filteredOffers.length === 0 && (

          <div className="rounded-xl border bg-background p-12 text-center shadow-sm">

            <Tag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

            <h2 className="text-xl font-semibold">
              No Offers Found
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "No offer matches your search."
                : "Create your first offer or coupon."}
            </p>

          </div>
        )}

      {/* ======================================
          CREATE / EDIT FORM
      ====================================== */}

      {openForm && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/50
          p-4
        ">

          <div className="
            max-h-[90vh]
            w-full
            max-w-2xl
            overflow-y-auto
            rounded-xl
            bg-background
            p-6
            shadow-xl
          ">

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  {editingId
                    ? "Edit Offer"
                    : "Create Offer"}
                </h2>

                <p className="text-sm text-muted-foreground">
                  Configure your discount coupon.
                </p>

              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={
                  handleCancel
                }
              >
                <X />
              </Button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* CODE + TITLE */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Coupon Code
                  </label>

                  <input
                    name="code"
                    value={
                      formData.code
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="SAVE20"
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      uppercase
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Offer Title
                  </label>

                  <input
                    name="title"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Summer Sale"
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  />

                </div>

              </div>

              {/* DISCOUNT */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Discount Type
                  </label>

                  <select
                    name="discountType"
                    value={
                      formData.discountType
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  >

                    <option value="percentage">
                      Percentage (%)
                    </option>

                    <option value="fixed">
                      Fixed Amount (₹)
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Discount Value
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={
                      formData.discountType ===
                      "percentage"
                        ? "100"
                        : undefined
                    }
                    name="discountValue"
                    value={
                      formData.discountValue
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      formData.discountType ===
                      "percentage"
                        ? "20"
                        : "500"
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  />

                </div>

              </div>

              {/* MINIMUM ORDER + USAGE LIMIT */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Minimum Order Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="minimumOrderAmount"
                    value={
                      formData.minimumOrderAmount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="1000"
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="usageLimit"
                    value={
                      formData.usageLimit
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="1"
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    0 = Unlimited usage
                  </p>

                </div>

              </div>

              {/* DATES */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      formData.startDate
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={
                      formData.expiryDate
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      bg-background
                      px-3
                      py-2.5
                      outline-none
                      focus:ring-2
                      focus:ring-primary
                    "
                  />

                </div>

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    bg-background
                    px-3
                    py-2.5
                    outline-none
                    focus:ring-2
                    focus:ring-primary
                  "
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <Button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="flex-1"
                >
                  {isLoading
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Create Offer"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    isLoading
                  }
                >
                  Cancel
                </Button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminOffers;