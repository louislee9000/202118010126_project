// This file now contains only the types and client-side functions

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: string
  join_date: string
  enrolled_courses?: number
  bio?: string
  last_login_at?: string
  created_at?: string
  updated_at?: string
}

// Client-side function to fetch users via API
export async function fetchUsers(): Promise<User[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await response.json();
  return data.users;
}

// Get a single user by ID (client-side)
export async function fetchUserById(id: string): Promise<User | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/users/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

// Create a new user (client-side)
export async function createUserClient(userData: Partial<User>): Promise<User> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  const data = await response.json();
  return data.user;
}

// Update an existing user (client-side)
export async function updateUserClient(id: string, userData: Partial<User>): Promise<User> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  const data = await response.json();
  return data.user;
}

// Delete a user (client-side)
export async function deleteUserClient(id: string): Promise<User> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  const data = await response.json();
  return data.user;
}

// Placeholder for server-side functions that will be called from API routes
export async function getUsersData(): Promise<User[]> {
  return await fetchUsers();
}

export function getUserById(id: string): User | undefined {
  return undefined
}

export function createUser(userData: any): User {
  return {} as User
}

export function updateUser(id: string, userData: any): User | null {
  return null
}

export function deleteUser(id: string): User | null {
  return null
}
