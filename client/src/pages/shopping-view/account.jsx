import {
  User,
  Mail,
  Phone,
  Package,
  Heart,
  MapPin,
  ShieldCheck,
  Settings,
  ChevronRight,
  Pencil,
  LogOut,
  Save,
  X,
  Camera,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Address from "@/components/shopping-view/address";

import {
  logoutUser,
  updateUserProfile,
  uploadProfileImage,
  changePassword,
} from "@/store/auth-slice";

import {
  fetchWishlist,
  removeFromWishlist,
} from "@/store/shop/wishlist-slice";

/* =====================================================
   SECURITY SECTION
===================================================== */

function SecuritySection({
  passwordData,
  handlePasswordChange,
  handleChangePassword,
  message,
  error,
  isChangingPassword,
}) {
  return (
    <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-orange-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">Security</h2>
          <p className="text-sm text-gray-500">
            Keep your account secure
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="mt-6 border border-gray-200 rounded-xl p-5 md:p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Change Password
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Update your password to keep your account secure.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>

            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />

            <p className="mt-2 text-xs text-gray-500">
              Password must be at least 6 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />

              {isChangingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================
   MAIN ACCOUNT PAGE
===================================================== */

function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);

  const wishlist = useSelector(
    (state) => state.shopWishlist?.wishlist || []
  );

  const wishlistLoading = useSelector(
    (state) => state.shopWishlist?.isLoading || false
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState("overview");

  const [isEditing, setIsEditing] =
    useState(false);

  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     PROFILE IMAGE STATES
  ===================================================== */

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(user?.profileImage || "");

  const [isUploadingImage, setIsUploadingImage] =
    useState(false);

  /* =====================================================
     PASSWORD STATES
  ===================================================== */

  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  /* =====================================================
     FETCH WISHLIST
  ===================================================== */

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  /* =====================================================
     UPDATE PROFILE IMAGE WHEN USER CHANGES
  ===================================================== */

  useEffect(() => {
    setImagePreview(user?.profileImage || "");
  }, [user?.profileImage]);

  /* =====================================================
     USER INFORMATION
  ===================================================== */

  const userName = user?.userName || "User";

  const userEmail =
    user?.email || "Email not available";

  const userPhone =
    user?.phone ||
    user?.mobile ||
    user?.mobileNumber ||
    "Mobile number not added";

  /* =====================================================
     PROFILE IMAGE SELECT
  ===================================================== */

  function handleImageSelect(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setSelectedImage(file);

    setImagePreview(URL.createObjectURL(file));

    setMessage("");
    setError("");
  }

  /* =====================================================
     UPLOAD PROFILE IMAGE
  ===================================================== */

  async function handleUploadImage() {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    try {
      setIsUploadingImage(true);

      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append(
        "profileImage",
        selectedImage
      );

      const result = await dispatch(
        uploadProfileImage(formData)
      ).unwrap();

      if (result.success) {
        setImagePreview(
          result.user.profileImage || ""
        );

        setSelectedImage(null);

        setMessage(
          "Profile photo updated successfully."
        );
      } else {
        setError(
          result.message ||
          "Failed to upload profile photo."
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while uploading profile photo."
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  /* =====================================================
     START EDIT PROFILE
  ===================================================== */

  function handleEditProfile() {
    setFormData({
      userName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setMessage("");
    setError("");

    setIsEditing(true);
    setActiveSection("personal");
  }

  /* =====================================================
     PROFILE INPUT CHANGE
  ===================================================== */

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  async function handleSaveProfile(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.userName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      const result = await dispatch(
        updateUserProfile({
          userName: formData.userName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        })
      ).unwrap();

      if (result.success) {
        setMessage(
          "Profile updated successfully."
        );

        setIsEditing(false);
      } else {
        setError(
          result.message ||
          "Failed to update profile."
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while updating profile."
      );
    }
  }

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  function handleCancelEdit() {
    setFormData({
      userName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });

    setMessage("");
    setError("");

    setIsEditing(false);
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {
    dispatch(logoutUser());

    navigate("/", {
      replace: true,
    });
  }

  /* =====================================================
     PASSWORD INPUT CHANGE
  ===================================================== */

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  async function handleChangePassword(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setIsChangingPassword(true);

      const result = await dispatch(
        changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        })
      ).unwrap();

      if (result.success) {
        setMessage(
          "Password changed successfully."
        );

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(
          result.message ||
          "Failed to change password."
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while changing password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  /* =====================================================
     CARD CLICK
  ===================================================== */

  function handleCardClick(type) {
    if (type === "orders") {
      navigate("/shop/orders");
      return;
    }

    if (type === "address") {
      setActiveSection("address");

      window.scrollTo({
        top: 500,
        behavior: "smooth",
      });

      return;
    }

    if (type === "wishlist") {
      setActiveSection("wishlist");

      dispatch(fetchWishlist());

      return;
    }

    if (type === "personal") {
      setActiveSection("personal");
      return;
    }

    if (type === "security") {
      setActiveSection("security");
      return;
    }

    if (type === "settings") {
      setActiveSection("settings");
      return;
    }
  }

  /* =====================================================
     ACCOUNT CARD
  ===================================================== */

  function AccountCard({
    icon: Icon,
    title,
    description,
    type,
    iconBg,
    iconColor,
  }) {
    return (
      <button
        type="button"
        onClick={() =>
          handleCardClick(type)
        }
        className="group w-full text-left bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center
              justify-center ${iconBg}
            `}
          >
            <Icon
              className={`w-6 h-6 ${iconColor}`}
            />
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
        </div>

        <h3 className="mt-6 text-lg font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray-500 leading-6">
          {description}
        </p>
      </button>
    );
  }

  /* =====================================================
     PROFILE HEADER
  ===================================================== */

  function ProfileHeader() {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative w-24 shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-black text-white flex items-center justify-center text-4xl font-bold border-2 border-gray-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                userName
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <label
              htmlFor="profileImage"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center border-2 border-white cursor-pointer hover:bg-gray-800 transition"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </label>

            <input
              id="profileImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {selectedImage && (
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={isUploadingImage}
                className="mt-3 w-24 rounded-lg bg-black px-2 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition cursor-pointer"
              >
                {isUploadingImage
                  ? "Uploading..."
                  : "Upload Photo"}
              </button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {userName}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{userEmail}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{userPhone}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEditProfile}
                className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-black hover:text-white transition-all cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     OVERVIEW
  ===================================================== */

  function Overview() {
    return (
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AccountCard
            icon={Package}
            title="My Orders"
            description="Track and manage all your orders."
            type="orders"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <AccountCard
            icon={Heart}
            title="My Wishlist"
            description="View products you saved for later."
            type="wishlist"
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />

          <AccountCard
            icon={MapPin}
            title="My Addresses"
            description="Manage your delivery addresses."
            type="address"
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />

          <AccountCard
            icon={User}
            title="Personal Information"
            description="View and edit your name, email and phone details."
            type="personal"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />

          <AccountCard
            icon={ShieldCheck}
            title="Security"
            description="Manage your account security."
            type="security"
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />

          <AccountCard
            icon={Settings}
            title="Account Settings"
            description="Manage your account preferences."
            type="settings"
            iconBg="bg-gray-100"
            iconColor="text-gray-700"
          />
        </div>
      </div>
    );
  }

  /* =====================================================
     PERSONAL INFORMATION
  ===================================================== */

  function PersonalInformation() {
    return (
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Personal Information
              </h2>

              <p className="text-sm text-gray-500">
                Manage your account information
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NAME */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* MOBILE NUMBER — FIXED */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    inputMode="numeric"
                    autoComplete="tel"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="border rounded-xl p-5">
                <p className="text-sm text-gray-500">
                  Full Name
                </p>

                <p className="mt-2 font-semibold text-gray-900">
                  {userName}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-sm text-gray-500">
                  Email Address
                </p>

                <p className="mt-2 font-semibold text-gray-900 break-all">
                  {userEmail}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-sm text-gray-500">
                  Mobile Number
                </p>

                <p className="mt-2 font-semibold text-gray-900">
                  {userPhone}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-sm text-gray-500">
                  Account Role
                </p>

                <p className="mt-2 font-semibold text-gray-900 capitalize">
                  {user?.role || "User"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEditProfile}
              className="mt-6 flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        )}
      </div>
    );
  }

  /* =====================================================
     WISHLIST SECTION
  ===================================================== */

  function WishlistSection() {
    return (
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart
                className="w-6 h-6 text-red-500"
                fill="currentColor"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                My Wishlist
              </h2>

              <p className="text-sm text-gray-500">
                {wishlist.length}{" "}
                {wishlist.length === 1
                  ? "product"
                  : "products"}{" "}
                saved
              </p>
            </div>
          </div>
        </div>

        {wishlistLoading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />

            <p className="mt-4 text-gray-500">
              Loading wishlist...
            </p>
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map((product, index) => (
              <div
                key={product?._id || index}
                className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={product?.image}
                    alt={product?.title || "Product"}
                    className="w-full h-56 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (product?._id) {
                        dispatch(
                          removeFromWishlist(
                            product._id
                          )
                        );
                      }
                    }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Heart
                      className="w-5 h-5"
                      fill="currentColor"
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {product?.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                    {product?.description}
                  </p>

                  <div className="mt-4">
                    {product?.salePrice > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">
                          ${product?.price}
                        </span>

                        <span className="text-xl font-bold text-black">
                          ${product?.salePrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-black">
                        ${product?.price}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    {product?.totalStock > 0 ? (
                      <span className="text-xs font-semibold text-green-600">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-500">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/shop/listing")
                    }
                    className="mt-4 w-full rounded-lg bg-black text-white py-2.5 text-sm font-semibold hover:bg-gray-800 transition cursor-pointer"
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="w-10 h-10 text-red-300" />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Your Wishlist is Empty
            </h3>

            <p className="mt-2 text-gray-500">
              Save your favorite products and find them here later.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/shop/listing")
              }
              className="mt-6 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    );
  }

  /* =====================================================
     SETTINGS
  ===================================================== */

  function SettingsSection() {
    return (
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
            <Settings className="w-6 h-6 text-gray-700" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Account Settings
            </h2>

            <p className="text-sm text-gray-500">
              Manage your account preferences
            </p>
          </div>
        </div>

        <div className="mt-6 border rounded-xl p-5">
          <p className="font-semibold">
            Account Status
          </p>

          <p className="text-sm text-green-600 mt-1 font-medium">
            Active
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 border border-red-200 text-red-600 px-5 py-3 rounded-lg font-semibold hover:bg-red-50 transition cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Home / Account
          </p>

          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
            My Account
          </h1>
        </div>

        <ProfileHeader />

        {(message || error) && (
          <div className="mt-4">
            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
          </div>
        )}

        {activeSection !== "overview" && (
          <button
            type="button"
            onClick={() => {
              setActiveSection("overview");
              setIsEditing(false);
              setMessage("");
              setError("");
            }}
            className="mt-6 text-sm font-semibold text-gray-600 hover:text-black cursor-pointer"
          >
            ← Back to Account
          </button>
        )}

        {activeSection === "overview" && <Overview />}

        {activeSection === "personal" && (
          PersonalInformation()
        )}

        {activeSection === "wishlist" && (
          <WishlistSection />
        )}

        {activeSection === "security" && (
          <SecuritySection
            passwordData={passwordData}
            handlePasswordChange={
              handlePasswordChange
            }
            handleChangePassword={
              handleChangePassword
            }
            message={message}
            error={error}
            isChangingPassword={
              isChangingPassword
            }
          />
        )}

        {activeSection === "settings" && (
          <SettingsSection />
        )}

        {activeSection === "address" && (
          <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                My Addresses
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage your delivery addresses.
              </p>
            </div>

            <Address />
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingAccount;