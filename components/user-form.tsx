"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react"
import { encryptPassword } from "@/lib/password-utils"
import { User } from '@/types/user'

interface UserFormProps {
  user?: User | null;
  onClose: (success: boolean, user?: User) => void;
  isAdminForm?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  enrolled_courses: number;
  join_date: string;
  bio: string;
  last_login_at: string;
}

export default function UserForm({ user, onClose, isAdminForm = false }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || "",
    email: user?.email || "",
    password: user?.password || "",
    role: isAdminForm ? "admin" : user?.role || "user",
    enrolled_courses: user?.enrolled_courses || 0,
    join_date: user?.join_date || new Date().toISOString().split("T")[0],
    bio: user?.bio || "",
    last_login_at: user?.last_login_at || new Date().toISOString(),
  })

  const [enrolledCoursesList, setEnrolledCoursesList] = useState<any[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Fetch enrolled courses when user data is loaded
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (user?.id) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/users/${user.id}/courses`)
          const data = await response.json()
          if (response.ok) {
            setEnrolledCoursesList(data.courses || [])
          }
        } catch (error) {
          console.error("Error fetching enrolled courses:", error)
        }
      }
    }

    fetchEnrolledCourses()
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare data based on role
      const dataToSubmit = { ...formData }

      // If admin, only include necessary fields
      if (formData.role === "admin") {
        dataToSubmit.enrolled_courses = 0
        dataToSubmit.bio = ""
        dataToSubmit.join_date = new Date().toISOString().split("T")[0]
      }

      // Encrypt password if it's provided (for new users or password change)
      if (dataToSubmit.password) {
        dataToSubmit.password = encryptPassword(dataToSubmit.password)
      }

      let updatedUserData: User | undefined;
      if (user && user.id) {
        // Update existing user
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to update user")
        }

        updatedUserData = data.user;
      } else {
        // Create new user
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create user")
        }
        updatedUserData = data.user;
      }

      onClose(true, updatedUserData)
    } catch (error: any) {
      console.error("Error saving user:", error)
      setError(error.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If this is an admin form, we'll show a simplified version
  if (isAdminForm) {
    return (
      <Dialog open={true} onOpenChange={() => onClose(false)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <DialogTitle>Add Administrator</DialogTitle>
            </div>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Administrator Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter administrator name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 mt-4">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>This user will have full administrative privileges.</span>
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Administrator"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Regular form for users or editing admins
  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user && user.id ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Always visible fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={user && user.id ? "Leave blank to keep current password" : "Enter password"}
                required={!(user && user.id)}
              />
            </div>

            {/* Only show role selection when editing an existing user */}
            {user && user.id && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Conditional fields for regular users */}
            {formData.role === "user" && (
              <>
                <div className="space-y-2">
                  <Label>Enrolled Courses</Label>
                  {enrolledCoursesList.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Enrolled in {enrolledCoursesList.length} course(s):
                      </div>
                      <div className="space-y-1">
                        {enrolledCoursesList.map((course) => (
                          <div
                            key={course.id}
                            className="bg-secondary/20 p-2 rounded-md text-sm flex justify-between items-center"
                          >
                            <span>{course.title}</span>
                            <span className="text-xs text-muted-foreground">{course.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No courses enrolled
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="join_date">Join Date</Label>
                  <Input
                    id="join_date"
                    name="join_date"
                    type="date"
                    value={formData.join_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_login_at">Last Login</Label>
                  <Input
                    id="last_login_at"
                    name="last_login_at"
                    type="datetime-local"
                    value={formData.last_login_at ? new Date(formData.last_login_at).toISOString().slice(0, 16) : ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="min-h-[100px]"
                    placeholder="User biography or notes"
                  />
                </div>
              </>
            )}

            {/* Admin message */}
            {formData.role === "admin" && (
              <div className="bg-gray-50 p-3 rounded-md text-sm text-muted-foreground">
                <p>Admin users only require name, email, and password information.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
