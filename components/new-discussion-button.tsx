"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NewDiscussionDialog from "@/components/new-discussion-dialog"
import { checkClientSession } from "@/lib/client-auth"

export default function NewDiscussionButton() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleButtonClick = async () => {
    // Prevent multiple clicks
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const session = await checkClientSession();
      console.log("Button click client session check:", session);
      
      if (!session?.user) {
        console.log("Button click: No user found, redirecting to login");
        router.push("/login?callbackUrl=/community");
        return;
      }
      
      // User is logged in, simply open the dialog
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to check session on button click:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Checking..." : "Start New Discussion"}
      </Button>
      <NewDiscussionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}