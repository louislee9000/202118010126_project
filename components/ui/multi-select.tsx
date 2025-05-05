"use client"

import * as React from "react"
import { X } from "lucide-react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Badge } from "./badge"
import { Button } from "./button"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  createTag?: boolean
}

export function MultiSelect({
  value = [],
  onChange,
  placeholder = "Select tags...",
  className,
  createTag = true,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [availableTags, setAvailableTags] = React.useState<string[]>([])
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue && createTag) {
      e.preventDefault()
      if (!value.includes(inputValue.trim())) {
        const newValue = [...value, inputValue.trim()]
        onChange(newValue)
        setInputValue("")
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      const newValue = value.slice(0, -1)
      onChange(newValue)
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newValue = value.filter((tag) => tag !== tagToRemove)
    onChange(newValue)
  }

  React.useEffect(() => {
    // Here you could fetch available tags from your API
    // For now, we'll use a static list with more common tags
    setAvailableTags([
      "javascript", "react", "typescript", "node", "python", "java", 
      "html", "css", "vue", "angular", "svelte", "php", "ruby", "go", 
      "c#", "c++", "rust", "swift", "kotlin", "dart", "flutter", 
      "mongodb", "mysql", "postgresql", "sql", "graphql", "rest", 
      "docker", "kubernetes", "aws", "azure", "gcp", "firebase",
      "beginners", "help", "question", "tutorial", "learning"
    ])
  }, [])

  const filteredTags = availableTags.filter(
    (tag) =>
      !value.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div 
        className={cn(
          "flex flex-wrap gap-2 rounded-md border border-input bg-background p-2 min-h-10",
          isFocused && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={handleContainerClick}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            // Add the current tag if there's text and we're leaving the field
            if (inputValue && createTag && !value.includes(inputValue.trim())) {
              onChange([...value, inputValue.trim()])
              setInputValue("")
            }
          }}
          className="flex-1 border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={value.length === 0 ? placeholder : ""}
        />
      </div>
      {inputValue && filteredTags.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover shadow-md">
          <div className="p-2 text-xs text-muted-foreground">
            {filteredTags.length === 1 ? "1 tag found" : `${filteredTags.length} tags found`}
          </div>
          {filteredTags.map((tag) => (
            <div
              key={tag}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
              onClick={() => {
                onChange([...value, tag])
                setInputValue("")
                if (inputRef.current) {
                  inputRef.current.focus()
                }
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
      {inputValue && filteredTags.length === 0 && (
        <div className="absolute z-10 mt-1 p-2 rounded-md border bg-popover shadow-md">
          <div className="text-sm">
            Press Enter to create a new tag: 
            <span className="ml-1">
              <Badge>{inputValue}</Badge>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}