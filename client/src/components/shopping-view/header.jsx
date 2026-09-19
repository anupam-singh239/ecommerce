import {
  LogOut,
  Menu,
  ShoppingCart,
  LogIn,
  UserPlus,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";

import { Button } from "../ui/button";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";

import {
  logoutUser,
} from "@/store/auth-slice";

import UserCartWrapper from "./cart-wrapper";

import {
  useEffect,
  useState,
} from "react";

import {
  fetchCartItems,
} from "@/store/shop/cart-slice";


/* =====================================================
   NAVIGATION MENU
===================================================== */

function MenuItems({ closeMobileMenu }) {

  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================================
     HANDLE MENU CLICK
  ===================================================== */

  function handleMenuClick(type) {

    // Mobile menu close
    if (closeMobileMenu) {
      closeMobileMenu();
    }

    /* =========================
       HOME
    ========================= */

    if (type === "home") {

      navigate("/");

      return;
    }

    /* =========================
       PRODUCTS
    ========================= */

    if (type === "products") {

      sessionStorage.removeItem("filters");

      navigate("/shop/listing");

      return;
    }

    /* =========================
       MEN
    ========================= */

    if (type === "men") {

      sessionStorage.setItem(
        "filters",
        JSON.stringify({
          category: ["Men"],
        })
      );

      navigate(
        "/shop/listing?category=Men"
      );

      return;
    }

    /* =========================
       WOMEN
    ========================= */

    if (type === "women") {

      sessionStorage.setItem(
        "filters",
        JSON.stringify({
          category: ["Women"],
        })
      );

      navigate(
        "/shop/listing?category=Women"
      );

      return;
    }

    /* =========================
       KIDS
    ========================= */

    if (type === "kids") {

      sessionStorage.setItem(
        "filters",
        JSON.stringify({
          category: ["Kids"],
        })
      );

      navigate(
        "/shop/listing?category=Kids"
      );

      return;
    }

    /* =========================
       ELECTRONICS
    ========================= */

    if (type === "electronics") {

      sessionStorage.setItem(
        "filters",
        JSON.stringify({
          category: ["Electronics"],
        })
      );

      navigate(
        "/shop/listing?category=Electronics"
      );

      return;
    }

    /* =========================
       FOOTWEAR
    ========================= */

    if (type === "footwear") {

      sessionStorage.setItem(
        "filters",
        JSON.stringify({
          category: ["Footwear"],
        })
      );

      navigate(
        "/shop/listing?category=Footwear"
      );

      return;
    }

    /* =========================
       ACCESSORIES
    ========================= */

    if (type === "accessories") {

      sessionStorage.setItem(
        "filters",
        JSON.stringify({
          category: ["Accessories"],
        })
      );

      navigate(
        "/shop/listing?category=Accessories"
      );

      return;
    }

    /* =========================
       SEARCH
    ========================= */

    if (type === "search") {

      navigate("/shop/search");

      return;
    }
  }


  /* =====================================================
     MENU ITEMS
  ===================================================== */

  const menuItems = [
    {
      id: "home",
      label: "Home",
    },
    {
      id: "products",
      label: "Products",
    },
    {
      id: "men",
      label: "Men",
    },
    {
      id: "women",
      label: "Women",
    },
    {
      id: "kids",
      label: "Kids",
    },
    {
      id: "electronics",
      label: "Electronics",
    },
    {
      id: "footwear",
      label: "Footwear",
    },
    {
      id: "accessories",
      label: "Accessories",
    },
    {
      id: "search",
      label: "Search",
    },
  ];


  return (
    <nav
      className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        gap-5
        lg:gap-7
      "
    >

      {menuItems.map((item) => {

        const isActive =
          item.id === "home"
            ? location.pathname === "/"
            : item.id === "products"
            ? location.pathname === "/shop/listing"
            : false;


        return (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              handleMenuClick(item.id)
            }
            className={`
              relative
              text-sm
              font-medium
              cursor-pointer
              transition-all
              duration-200
              hover:text-blue-600
              ${
                isActive
                  ? "text-blue-600"
                  : "text-black"
              }
            `}
          >

            {item.label}

            {/* Active underline */}

            {isActive && (
              <span
                className="
                  absolute
                  left-0
                  right-0
                  -bottom-2
                  h-[2px]
                  bg-blue-600
                  rounded-full
                "
              />
            )}

          </button>
        );

      })}

    </nav>
  );
}


/* =====================================================
   HEADER RIGHT CONTENT
===================================================== */

function HeaderRightContent() {

  const {
    user,
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );


  const {
    cartItems,
  } = useSelector(
    (state) => state.shopCart
  );


  const [
    openCartSheet,
    setOpenCartSheet,
  ] = useState(false);


  const navigate = useNavigate();
  const dispatch = useDispatch();


  /* =====================================================
     FETCH CART
  ===================================================== */

  useEffect(() => {

    if (
      isAuthenticated &&
      user?.id
    ) {

      dispatch(
        fetchCartItems(user.id)
      );

    }

  }, [
    dispatch,
    isAuthenticated,
    user?.id,
  ]);


  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {

    dispatch(
      logoutUser()
    );

    navigate("/", {
      replace: true,
    });
  }


  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!isAuthenticated) {

    return (
      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        {/* LOGIN */}

        <Button
          variant="outline"
          onClick={() =>
            navigate("/auth/login")
          }
          className="
            flex
            items-center
            gap-2
            h-10
          "
        >

          <LogIn className="w-4 h-4" />

          Login

        </Button>


        {/* SIGNUP */}

        <Button
          onClick={() =>
            navigate("/auth/register")
          }
          className="
            flex
            items-center
            gap-2
            h-10
          "
        >

          <UserPlus className="w-4 h-4" />

          Signup

        </Button>

      </div>
    );
  }


  /* =====================================================
     LOGGED IN
  ===================================================== */

  return (
    <div
      className="
        flex
        items-center
        gap-3
      "
    >

      {/* =================================================
          CART
      ================================================= */}

      <Sheet
        open={openCartSheet}
        onOpenChange={
          setOpenCartSheet
        }
      >

        <Button
          onClick={() =>
            setOpenCartSheet(true)
          }
          variant="outline"
          size="icon"
          className="
            relative
            h-10
            w-10
          "
        >

          <ShoppingCart
            className="w-5 h-5"
          />

          <span
            className="
              absolute
              -top-2
              -right-1
              bg-black
              text-white
              rounded-full
              min-w-[20px]
              h-[20px]
              flex
              items-center
              justify-center
              font-bold
              text-xs
            "
          >

            {cartItems?.items?.length || 0}

          </span>

        </Button>


        <UserCartWrapper
          setOpenCartSheet={
            setOpenCartSheet
          }
          cartItems={
            cartItems &&
            cartItems.items &&
            cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />

      </Sheet>


      {/* =================================================
          USER PROFILE
      ================================================= */}

      <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <Button
            variant="ghost"
            className="
              p-0
              rounded-full
              h-10
              w-10
            "
          >

            <Avatar
              className="
                h-10
                w-10
                border-2
                border-black
              "
            >

              {/* PROFILE PHOTO */}

              <AvatarImage
                src={
                  user?.profileImage || ""
                }
                alt={
                  user?.userName || "User"
                }
                className="object-cover"
              />


              {/* FALLBACK LETTER */}

              <AvatarFallback
                className="
                  bg-black
                  text-white
                  font-bold
                "
              >

                {user?.userName
                  ? user.userName
                      .charAt(0)
                      .toUpperCase()
                  : "U"}

              </AvatarFallback>

            </Avatar>

          </Button>

        </DropdownMenuTrigger>


        <DropdownMenuContent
          side="bottom"
          align="end"
          className="w-56"
        >

          <DropdownMenuLabel>
            {user?.userName || "User"}
          </DropdownMenuLabel>


          <DropdownMenuSeparator />


          {/* ACCOUNT */}

          <DropdownMenuItem
            onClick={() =>
              navigate("/shop/account")
            }
            className="cursor-pointer"
          >

            <User
              className="
                mr-2
                h-4
                w-4
              "
            />

            Account

          </DropdownMenuItem>


          {/* MY ORDERS */}

          <DropdownMenuItem
            onClick={() =>
              navigate("/shop/orders")
            }
            className="cursor-pointer"
          >

            <ShoppingBag
              className="
                mr-2
                h-4
                w-4
              "
            />

            My Orders

          </DropdownMenuItem>


          <DropdownMenuSeparator />


          {/* LOGOUT */}

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer"
          >

            <LogOut
              className="
                mr-2
                h-4
                w-4
              "
            />

            Logout

          </DropdownMenuItem>

        </DropdownMenuContent>

      </DropdownMenu>

    </div>
  );
}


/* =====================================================
   MAIN SHOPPING HEADER
===================================================== */

function ShoppingHeader() {

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);


  return (

    <header
      className="
        fixed
        top-0
        left-0
        right-0
        z-[100]
        w-full
        border-b
        bg-white
        shadow-sm
      "
    >

      <div
        className="
          flex
          h-16
          items-center
          justify-between
          px-4
          md:px-6
          lg:px-8
        "
      >

        {/* =================================================
            PROFESSIONAL ECOMMERCE LOGO
        ================================================= */}

        <Link
          to="/"
          className="
            flex
            items-center
            gap-3
            shrink-0
          "
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >

          {/* LOGO ICON */}

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              shadow-sm
            "
          >

            <ShoppingBag
              className="
                h-5
                w-5
                text-white
              "
              strokeWidth={2.5}
            />

          </div>


          {/* ECOMMERCE BRAND */}

          <span
            className="
              text-xl
              md:text-2xl
              font-extrabold
              tracking-tight
              text-gray-900
            "
          >
            ECOMMERCE
          </span>

        </Link>


        {/* =================================================
            DESKTOP MENU
        ================================================= */}

        <div
          className="
            hidden
            lg:block
          "
        >

          <MenuItems />

        </div>


        {/* =================================================
            DESKTOP RIGHT
        ================================================= */}

        <div
          className="
            hidden
            lg:block
          "
        >

          <HeaderRightContent />

        </div>


        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-2
            lg:hidden
          "
        >

          <Sheet
            open={mobileMenuOpen}
            onOpenChange={
              setMobileMenuOpen
            }
          >

            <SheetTrigger asChild>

              <Button
                variant="outline"
                size="icon"
              >

                <Menu
                  className="
                    h-5
                    w-5
                  "
                />

              </Button>

            </SheetTrigger>


            <SheetContent
              side="left"
              className="
                w-[300px]
                sm:w-[350px]
              "
            >

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  gap-8
                "
              >

                <MenuItems
                  closeMobileMenu={() =>
                    setMobileMenuOpen(false)
                  }
                />


                <HeaderRightContent />

              </div>

            </SheetContent>

          </Sheet>

        </div>

      </div>

    </header>
  );
}


export default ShoppingHeader;