output "storage_account_name" {
  description = "Name of the storage account hosting the static website"
  value       = azurerm_storage_account.sa.name
}

output "static_website_endpoint" {
  description = "Public endpoint for the static website"
  value       = azurerm_storage_account.sa.primary_web_endpoint
}
