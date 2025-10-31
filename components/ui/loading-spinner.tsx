import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

interface LoadingButtonProps {
  isLoading?: boolean
  children: React.ReactNode
  className?: string
  loadingText?: string
}

export function LoadingButton({ 
  isLoading, 
  children, 
  className,
  loadingText 
}: LoadingButtonProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {isLoading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      <span>
        {isLoading ? (loadingText || "Đang xử lý...") : children}
      </span>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  children: React.ReactNode
}

export function LoadingOverlay({ isLoading, text, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            {text && (
              <p className="mt-4 text-sm text-muted-foreground">{text}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

interface LoadingCardProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton?: React.ReactNode
}

export function LoadingCard({ isLoading, children, skeleton }: LoadingCardProps) {
  if (isLoading) {
    return (
      <>
        {skeleton || (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}

