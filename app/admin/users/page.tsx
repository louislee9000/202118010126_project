import { fetchUsers } from "@/lib/data"
import UserManagement from "@/components/user-management"

export default async function UsersPage() {
  // Fetch users data
  const users = await fetchUsers()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <UserManagement initialUsers={users} />
    </div>
  )
}

