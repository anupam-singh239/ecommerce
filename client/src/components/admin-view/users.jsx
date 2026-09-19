import { useEffect, useMemo, useState } from "react";

import {
  Users,
  ShieldCheck,
  UserRound,
  Search,
  Eye,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  UserCog,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  getAllUsersForAdmin,
  updateUserRoleForAdmin,
  deleteUserForAdmin,
} from "@/store/admin/users-slice";

import { Button } from "../ui/button";

function AdminUsersView() {
  const dispatch = useDispatch();

  const {
    userList,
    isLoading,
  } = useSelector(
    (state) => state.adminUsers
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("all");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [deleteUser, setDeleteUser] =
    useState(null);

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    dispatch(getAllUsersForAdmin());
  }, [dispatch]);

  // ==========================================
  // COUNTS
  // ==========================================

  const totalUsers = userList.length;

  const regularUsers = userList.filter(
    (user) => user.role === "user"
  ).length;

  const adminUsers = userList.filter(
    (user) => user.role === "admin"
  ).length;

  // ==========================================
  // FILTER USERS
  // ==========================================

  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        user.userName
          ?.toLowerCase()
          .includes(searchText) ||
        user.email
          ?.toLowerCase()
          .includes(searchText) ||
        user.phone
          ?.toLowerCase()
          .includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [userList, search, roleFilter]);

  // ==========================================
  // ROLE CHANGE
  // ==========================================

  const handleRoleChange = async (
    user,
    newRole
  ) => {
    if (user.role === newRole) {
      return;
    }

    await dispatch(
      updateUserRoleForAdmin({
        id: user._id,
        role: newRole,
      })
    );

    setSelectedUser(null);
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async () => {
    if (!deleteUser) {
      return;
    }

    const result = await dispatch(
      deleteUserForAdmin(deleteUser._id)
    );

    if (
      deleteUserForAdmin.fulfilled.match(
        result
      )
    ) {
      setDeleteUser(null);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          User Management
        </h1>

        <p className="text-muted-foreground mt-1">
          Manage customers and admin accounts.
        </p>
      </div>


      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted-foreground">
                Total Users
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {totalUsers}
              </h2>
            </div>

            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>

          </div>

          <p className="text-xs text-muted-foreground mt-4">
            All registered accounts
          </p>

        </div>


        {/* CUSTOMERS */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted-foreground">
                Customers
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {regularUsers}
              </h2>
            </div>

            <div className="rounded-full bg-primary/10 p-3">
              <UserRound className="h-6 w-6 text-primary" />
            </div>

          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Regular customer accounts
          </p>

        </div>


        {/* ADMINS */}

        <div className="rounded-xl border bg-background p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted-foreground">
                Admins
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {adminUsers}
              </h2>
            </div>

            <div className="rounded-full bg-primary/10 p-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>

          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Administrator accounts
          </p>

        </div>

      </div>


      {/* ======================================
          SEARCH + FILTER
      ====================================== */}

      <div className="rounded-xl border bg-background p-4 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
            />

          </div>


          {/* ROLE FILTER */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="rounded-lg border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
          >

            <option value="all">
              All Roles
            </option>

            <option value="user">
              Customers
            </option>

            <option value="admin">
              Admins
            </option>

          </select>

        </div>

      </div>


      {/* ======================================
          USERS TABLE
      ====================================== */}

      <div className="rounded-xl border bg-background shadow-sm overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-semibold">
            All Users
          </h2>

          <p className="text-sm text-muted-foreground mt-1">
            {filteredUsers.length} user(s) found
          </p>

        </div>


        {isLoading ? (

          <div className="p-10 text-center">
            <p className="text-muted-foreground">
              Loading users...
            </p>
          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="p-10 text-center">

            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />

            <p className="font-medium">
              No users found
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Try another search or filter.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b bg-muted/40">

                <tr>

                  <th className="text-left p-4 text-sm font-semibold">
                    User
                  </th>

                  <th className="text-left p-4 text-sm font-semibold">
                    Contact
                  </th>

                  <th className="text-left p-4 text-sm font-semibold">
                    Role
                  </th>

                  <th className="text-left p-4 text-sm font-semibold">
                    Joined
                  </th>

                  <th className="text-right p-4 text-sm font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredUsers.map((user) => (

                  <tr
                    key={user._id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >

                    {/* USER */}

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        {user.profileImage ? (

                          <img
                            src={user.profileImage}
                            alt={user.userName}
                            className="h-10 w-10 rounded-full object-cover"
                          />

                        ) : (

                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">

                            <UserRound className="h-5 w-5 text-primary" />

                          </div>

                        )}

                        <div>

                          <p className="font-semibold">
                            {user.userName}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            ID: {user._id.slice(-8)}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* CONTACT */}

                    <td className="p-4">

                      <p className="text-sm">
                        {user.email || "-"}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {user.phone || "No phone"}
                      </p>

                    </td>


                    {/* ROLE */}

                    <td className="p-4">

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >

                        {user.role === "admin" ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <UserRound size={14} />
                        )}

                        {user.role === "admin"
                          ? "Admin"
                          : "Customer"}

                      </span>

                    </td>


                    {/* JOINED */}

                    <td className="p-4">

                      <p className="text-sm">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </p>

                    </td>


                    {/* ACTIONS */}

                    <td className="p-4">

                      <div className="flex justify-end gap-2">

                        {/* VIEW */}

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setSelectedUser(
                              user
                            )
                          }
                          title="View details"
                        >
                          <Eye size={18} />
                        </Button>


                        {/* DELETE */}

                        {user.role !== "admin" && (

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              setDeleteUser(
                                user
                              )
                            }
                            title="Delete user"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </Button>

                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ======================================
          USER DETAILS MODAL
      ====================================== */}

      {selectedUser && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-xl bg-background shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b p-5">

              <div>

                <h2 className="text-xl font-bold">
                  User Details
                </h2>

                <p className="text-sm text-muted-foreground">
                  Account information
                </p>

              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                <X />
              </Button>

            </div>


            {/* BODY */}

            <div className="p-5 space-y-5">

              <div className="flex items-center gap-4">

                {selectedUser.profileImage ? (

                  <img
                    src={
                      selectedUser.profileImage
                    }
                    alt={
                      selectedUser.userName
                    }
                    className="h-20 w-20 rounded-full object-cover"
                  />

                ) : (

                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">

                    <UserRound className="h-9 w-9 text-primary" />

                  </div>

                )}

                <div>

                  <h3 className="text-xl font-bold">
                    {selectedUser.userName}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {selectedUser.role ===
                    "admin"
                      ? "Administrator"
                      : "Customer"}
                  </p>

                </div>

              </div>


              {/* INFO */}

              <div className="space-y-3">

                <div className="flex items-center gap-3">

                  <Mail
                    size={18}
                    className="text-muted-foreground"
                  />

                  <span className="text-sm">
                    {selectedUser.email ||
                      "No email"}
                  </span>

                </div>


                <div className="flex items-center gap-3">

                  <Phone
                    size={18}
                    className="text-muted-foreground"
                  />

                  <span className="text-sm">
                    {selectedUser.phone ||
                      "No phone"}
                  </span>

                </div>


                <div className="flex items-center gap-3">

                  <Calendar
                    size={18}
                    className="text-muted-foreground"
                  />

                  <span className="text-sm">
                    Joined{" "}
                    {selectedUser.createdAt
                      ? new Date(
                          selectedUser.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </span>

                </div>

              </div>


              {/* ROLE */}

              <div className="rounded-lg border p-4">

                <div className="flex items-center gap-2 mb-3">

                  <UserCog size={18} />

                  <p className="font-semibold">
                    Account Role
                  </p>

                </div>

                <div className="flex gap-2">

                  <Button
                    variant={
                      selectedUser.role ===
                      "user"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handleRoleChange(
                        selectedUser,
                        "user"
                      )
                    }
                  >
                    Customer
                  </Button>

                  <Button
                    variant={
                      selectedUser.role ===
                      "admin"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handleRoleChange(
                        selectedUser,
                        "admin"
                      )
                    }
                  >
                    Admin
                  </Button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          DELETE CONFIRMATION
      ====================================== */}

      {deleteUser && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-xl bg-background shadow-xl">

            <div className="p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-full bg-red-100 p-3">

                  <Trash2 className="h-6 w-6 text-red-600" />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Delete User?
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>

                </div>

              </div>


              <div className="mt-5 rounded-lg border bg-muted/30 p-4">

                <p className="font-semibold">
                  {deleteUser.userName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {deleteUser.email}
                </p>

              </div>


              <div className="flex justify-end gap-3 mt-6">

                <Button
                  variant="outline"
                  onClick={() =>
                    setDeleteUser(null)
                  }
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  onClick={
                    handleDeleteUser
                  }
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Deleting..."
                    : "Delete User"}
                </Button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminUsersView;