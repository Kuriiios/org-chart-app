terraform {
  backend "azurerm" {}
}

# Note: backend will be configured at `terraform init` time with
# -backend-config flags supplied by CI (see .github/workflows/terraform-infra.yml)
