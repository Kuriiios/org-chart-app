variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "resource_group_name" {
  description = "Resource group name for app resources"
  type        = string
  default     = "orgchart-app-rg"
}

variable "storage_account_name_prefix" {
  description = "Prefix for the storage account name (will append random suffix to ensure uniqueness). Lowercase letters and numbers only."
  type        = string
  default     = "orgchartapp"
}

variable "storage_account_name" {
  description = "Full storage account name (optional). If empty, Terraform will generate one using the prefix + random suffix. Must be globally unique if provided."
  type        = string
  default     = ""
}

variable "tfstate_container_name" {
  description = "Container name to hold terraform state"
  type        = string
  default     = "tfstate"
}
