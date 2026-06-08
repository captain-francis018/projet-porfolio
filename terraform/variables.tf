variable "backend_image" {
    description = "Image docker backend"
    type        = string
    default     = "rimka03/portfolio-backend:latest"
}

variable "frontend_image" {
    description = "Image docker frontend"
    type        = string
    default     = "rimka03/portfolio-frontend:latest"
}

variable "mongodb_password" {
    description = "Password for MongoDB"
    type        = string
    sensitive   = true
}