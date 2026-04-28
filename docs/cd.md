# Continuous Delivery (Terraform + GitHub Actions) — Minimal cost

This document explains the minimal-cost CD setup scaffolded for this repo.

Key decisions:
- Host the app as a static website on a single Azure Storage Account (cheapest option).
- Use the same Storage Account to hold Terraform remote state (one resource lowers cost).
- Use `Standard_LRS` replication and minimal resources.

Required GitHub Secrets (create these in your repository settings):
- `AZURE_CREDENTIALS` — JSON output from `az ad sp create-for-rbac --sdk-auth` (Service Principal JSON). Used by `azure/login`.
- `TF_BACKEND_RG` — Resource group name for backend (e.g. `orgchart-tfstate-rg`).
- `TF_BACKEND_STORAGE_ACCOUNT` — Storage account name used for backend/state (global unique name).
- `TF_BACKEND_CONTAINER` — Container name to store tfstate (default: `tfstate`).
- `AZURE_LOCATION` — Azure region (we will use `westeurope`).
- `APP_STORAGE_ACCOUNT` — Storage account name used for the static website. For the cheapest setup you can set this equal to `TF_BACKEND_STORAGE_ACCOUNT` (same account created by Terraform).

Bootstrap notes (first run):
1. Create a Service Principal locally and copy the JSON to the `AZURE_CREDENTIALS` secret:

```bash
az ad sp create-for-rbac --name "orgchart-app-cd" --role "Contributor" --scopes /subscriptions/<SUBSCRIPTION_ID> --sdk-auth
```

2. Choose a globally-unique storage account name and set `TF_BACKEND_STORAGE_ACCOUNT` and `APP_STORAGE_ACCOUNT` to that value. Example: `orgchartappwesteu123`.

3. Set `TF_BACKEND_RG` (e.g., `orgchart-tfstate-rg`) and `AZURE_LOCATION` (e.g., `westeurope`).

4. Push the `terraform/` files (or let this PR merge). The `terraform-infra` workflow will:
   - Bootstrap the backend resource group and storage account (idempotent via `az` commands).
   - Run `terraform init` with backend-config from secrets.
   - Run `terraform validate`.
   - Run `terraform apply` automatically on `main`.

Cost-saving tips:
- Use a single Storage Account for both tfstate and static website.
- Keep replication to `LRS` (locally-redundant storage) which is cheapest.
- Do not add Azure CDN / Front Door unless you need performance or global caching (they add cost).

Security notes:
- The Service Principal stored in `AZURE_CREDENTIALS` should have least privilege for CI: Contributor on the target resource group(s) or scoped RBAC. If you prefer, create a smaller scoped SP with `Storage Blob Data Contributor` and `Resource Group Contributor` limited to the backend and app RGs.
