"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus, Search, X, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UserForm from "./user-form"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { fetchUsers, deleteUserClient } from "@/lib/data"

export default function UserManagement({ initialUsers = [] }) {
  const [users, setUsers] = useState(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState(initialUsers)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Format login time function
  const formatLoginTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "-"

    try {
      // 直接截取日期和时间部分，不使用 Date 对象
      // 假设输入格式为 "2025-03-31T16:00:00.000Z"
      const datePart = dateString.split('T')[0]  // 获取 "2025-03-31"
      const timePart = dateString.split('T')[1].substring(0, 5)  // 获取 "16:00"
      
      return `${datePart} ${timePart}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "-"
    }
  }

  // Format date function (for join_date)
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-"

    try {
      // 直接返回日期部分，不包含时间
      return dateString.split('T')[0] || dateString
    } catch (error) {
      console.error("Error formatting date:", error)
      return "-"
    }
  }

  // Fetch users if no initial users provided
  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsersData()
    } else {
      applyFilters(initialUsers, searchTerm, roleFilter)
    }
  }, [initialUsers])

  // Fetch users
  const fetchUsersData = async () => {
    setIsLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/users?t=${Date.now()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      const fetchedUsers = data.users
      setUsers(fetchedUsers)
      applyFilters(fetchedUsers, searchTerm, roleFilter)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters and pagination
  const applyFilters = (userList, search, role) => {
    let filtered = [...userList]

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply role filter
    if (role !== "all") {
      filtered = filtered.filter((user) => user.role === role)
    }

    setFilteredUsers(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }

  useEffect(() => {
    applyFilters(users, searchTerm, roleFilter)
  }, [searchTerm, roleFilter])

  // Handle edit user
  const handleEdit = (user) => {
    setCurrentUser(user)
    setIsFormOpen(true)
  }

  // Handle delete user
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserClient(id)
        // Force refresh with a small delay
        setTimeout(() => {
          fetchUsersData()
        }, 500)
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Failed to delete user. Please try again.")
      }
    }
  }

  // Handle add new user
  const handleAddNew = () => {
    // Create a new user with role explicitly set to "user"
    setCurrentUser({
      name: "",
      email: "",
      password: "",
      role: "user",
      enrolled_courses: 0,
      join_date: new Date().toISOString().split("T")[0],
      bio: "",
    })
    setIsFormOpen(true)
  }

  // Add a new handler function for adding admin users after the handleAddNew function
  const handleAddAdmin = () => {
    // Create a new admin user with default values and a flag to indicate admin-specific form
    setCurrentUser({
      name: "",
      email: "",
      password: "",
      role: "admin",
      isAdminForm: true, // Special flag to indicate this is from the admin button
    })
    setIsFormOpen(true)
  }

  // Handle form close
  const handleFormClose = (shouldRefresh = false, updatedUser = null) => {
    setIsFormOpen(false)
    setCurrentUser(null)
    if (shouldRefresh) {
      // Force refresh with a small delay to ensure server has processed the changes
      setTimeout(() => {
        fetchUsersData()
      }, 500)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle role filter
  const handleRoleFilter = (value) => {
    setRoleFilter(value)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
  }

  // Handle pagination
  const goToPage = (page) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Users</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Filter by Role</label>
            <Select value={roleFilter} onValueChange={handleRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || roleFilter !== "all") && (
            <Button variant="outline" onClick={clearFilters} className="h-10">
              Clear Filters
            </Button>
          )}

          <div className="flex gap-2 md:ml-auto">
            <Button onClick={handleAddNew} className="h-10">
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
            <Button onClick={handleAddAdmin} className="h-10" variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Add Admin
            </Button>
          </div>
        </div>
      </Card>

      {isFormOpen && <UserForm user={currentUser} onClose={handleFormClose} isAdminForm={currentUser?.isAdminForm} />}

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Enrolled Courses</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageItems().length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No users found</p>
                    {(searchTerm || roleFilter !== "all") && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              getCurrentPageItems().map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.role === "admin" ? "-" : user.enrolled_courses}</TableCell>
                  <TableCell>{user.role === "admin" ? "-" : formatDate(user.join_date)}</TableCell>
                  <TableCell>{user.last_login_at ? formatLoginTime(user.last_login_at) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredUsers.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => goToPage(page)}
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

