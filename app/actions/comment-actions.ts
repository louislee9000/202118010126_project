"use server"

// Server action to handle comment likes
export async function likeComment(commentId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to like comment");
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error liking comment:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while liking the comment");
  }
}

// Server action to handle comment unlikes
export async function unlikeComment(commentId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/comments/${commentId}/unlike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to unlike comment");
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error unliking comment:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while unliking the comment");
  }
}
