"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function QuestionView({ question, onClose, courseName }) {
  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{question.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{courseName}</Badge>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <div className="p-4 bg-gray-50 rounded-md text-sm">{question.description}</div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Starter Code</h3>
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-md text-sm font-mono overflow-x-auto">
                {question.code}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Solution</h3>
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-md text-sm font-mono overflow-x-auto">
                {question.solution}
              </pre>
            </div>

            <div className="text-sm text-muted-foreground">Created: {question.createdAt}</div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

