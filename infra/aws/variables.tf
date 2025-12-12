variable "aws_region" {
  type        = string
  description = "AWS region to deploy the automation support bot"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g., dev, staging, prod)"
  default     = "dev"
}

variable "allowed_origins" {
  type        = list(string)
  description = "Origins allowed to call the API Gateway via CORS"
  default     = ["http://localhost:5173"]
}

variable "cognito_callback_urls" {
  type        = list(string)
  description = "Authorized redirect URIs after Cognito login"
}

variable "cognito_logout_urls" {
  type        = list(string)
  description = "Authorized logout redirect URIs for Cognito"
}

variable "ses_from_address" {
  type        = string
  description = "Verified SES email address used to send notifications"
}

variable "ses_default_recipient" {
  type        = string
  description = "Fallback recipient for SES notifications when none specified"
}

variable "escalation_email" {
  type        = string
  description = "Email address subscribed to SNS escalations"
}




