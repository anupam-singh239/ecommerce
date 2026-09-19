import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
  Image,
  Users,
  Tag,
} from "lucide-react";

import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

// ==========================================
// ADMIN SIDEBAR MENU ITEMS
// ==========================================

const adminSidebarMenuItems = [

  // ========================================
  // DASHBOARD
  // ========================================

  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },

  // ========================================
  // PRODUCTS
  // ========================================

  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },

  // ========================================
  // ORDERS
  // ========================================

  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },

  // ========================================
  // USERS
  // ========================================

  {
    id: "users",
    label: "Users",
    path: "/admin/users",
    icon: <Users />,
  },

  // ========================================
  // OFFERS & COUPONS
  // ========================================

  {
    id: "offers",
    label: "Offers & Coupons",
    path: "/admin/offers",
    icon: <Tag />,
  },

  // ========================================
  // HOME BANNERS
  // ========================================

  {
    id: "features",
    label: "Home Banners",
    path: "/admin/features",
    icon: <Image />,
  },

];

// ==========================================
// MENU ITEMS
// ==========================================

function MenuItems({ setOpen }) {

  const navigate = useNavigate();

  return (
    <nav className="mt-8 flex-col flex gap-2">

      {adminSidebarMenuItems.map(
        (menuItem) => (

          <div
            key={menuItem.id}

            onClick={() => {

              navigate(menuItem.path);

              if (setOpen) {
                setOpen(false);
              }

            }}

            className="flex cursor-pointer text-xl items-center gap-3 rounded-md px-3 py-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >

            {menuItem.icon}

            <span>
              {menuItem.label}
            </span>

          </div>

        )
      )}

    </nav>
  );
}

// ==========================================
// ADMIN SIDEBAR
// ==========================================

function AdminSideBar({
  open,
  setOpen,
}) {

  const navigate = useNavigate();

  return (
    <Fragment>

      {/* ====================================
          MOBILE SIDEBAR
      ==================================== */}

      <Sheet
        open={open}
        onOpenChange={setOpen}
      >

        <SheetContent
          side="left"
          className="w-64"
        >

          <div className="flex flex-col h-full">

            <SheetHeader className="border-b">

              <SheetTitle className="flex gap-2 mt-5 mb-5 items-center">

                <ChartNoAxesCombined
                  size={30}
                />

                <h1 className="text-2xl font-extrabold">
                  Admin Panel
                </h1>

              </SheetTitle>

            </SheetHeader>

            <MenuItems
              setOpen={setOpen}
            />

          </div>

        </SheetContent>

      </Sheet>


      {/* ====================================
          DESKTOP SIDEBAR
      ==================================== */}

      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">

        {/* ADMIN LOGO */}

        <div
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="flex cursor-pointer items-center gap-2"
        >

          <ChartNoAxesCombined
            size={30}
          />

          <h1 className="text-2xl font-extrabold">
            Admin Panel
          </h1>

        </div>


        {/* MENU */}

        <MenuItems />

      </aside>

    </Fragment>
  );
}

export default AdminSideBar;