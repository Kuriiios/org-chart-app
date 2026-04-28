<!--
  Deployment plan skeleton required by the `azure-prepare` skill.
  Fill this out and set `status` to `Approved` to allow execution/validation.
  Do NOT change the filename: .azure/deployment-plan.md
-->
# CD Platform: Terraform + GitHub Actions on Azure

status: Approved
approved_on: 2026-04-28
approved_by: user
created: 2026-04-28
owner: TBD

summary: |
  This plan describes a continuous-delivery platform for the `org-chart-app` repository
  using Terraform to provision Azure infrastructure and GitHub Actions to run continuous
  infrastructure (Terraform) and application deployments. The chosen recipe uses an
  Azure Storage Account as the Terraform remote state backend and a second Storage Account
  hosting the built frontend as a static website. GitHub Actions will perform bootsrap
  of the backend (if necessary), run `terraform plan` for PRs, and `terraform apply`
  automatically on the `main` branch. Application builds are performed on `main` and
  uploaded to the static website `$web` container.

---

## 1) Analyze Workspace

- Repo type: Vite + React + TypeScript frontend (static single-page app)
- Build output: `npm run build` → `dist/` (default Vite output)
- Current CI/test: vitest/cypress present; app is frontend-only

## 2) Requirements

- Host the frontend on Azure with automatic deployments from `main`.
- Manage infrastructure with Terraform and store state in Azure Blob Storage.
- Use GitHub Actions to run Terraform and app deployment.
- Keep `terraform plan` visible for PRs; run `terraform apply` only on `main` (auto-approve).
- Use a Service Principal stored in `secrets.AZURE_CREDENTIALS` for CI authentication.

## 3) Constraints / Security

- Service Principal must have enough permissions to create Resource Groups and Storage Accounts.
- For uploading static website content the SP must have `Storage Blob Data Contributor` on the app storage account.
- Avoid committing any credentials to the repo.

## 4) Recipe Selection

- Recipe: Terraform (azurerm provider) + GitHub Actions.
- Remote state backend: `azurerm` backend stored in a dedicated backend storage account.
- App hosting: Azure Storage Account static website (content uploaded to `$web` container).

## 5) Architecture (high level)

- GitHub Actions workflows:
  - `terraform-infra.yml` — triggered on changes to `terraform/**` and on PRs:
    - `bootstrap` job: uses `az cli` to create the TF backend resource group + storage account + container (idempotent)
    - `terraform` job: init (with backend-config from secrets), plan (PRs), apply (only on `main`)
  - `deploy-app.yml` — triggered on push to `main` for frontend paths:
    - Build the app (`npm ci` → `npm run build`)
    - Login to Azure (service principal)
    - Upload `dist/` to the app storage account `$web` container via `az storage blob upload-batch --auth-mode login`

- Terraform code (scaffolded under `terraform/`):
  - `versions.tf`, `provider.tf`, `backend.tf` (placeholders), `variables.tf`, `main.tf`, `outputs.tf`
  - Resources: `azurerm_resource_group`, `azurerm_storage_account` (static website)

## 6) Bootstrapping remote state

- The backend storage account must exist before `terraform init` configures the azurerm backend.
- The GitHub Actions `bootstrap` job will ensure the backend RG + storage account + container exist using `az group create` and `az storage account create`.
- `terraform init` will be invoked with `-backend-config` flags populated from repository secrets:
  - `TF_BACKEND_RG`, `TF_BACKEND_STORAGE_ACCOUNT`, `TF_BACKEND_CONTAINER` (names set in GitHub Secrets)

## 7) Validation steps (what `azure-validate` should run)

- `terraform validate` in `terraform/`.
- `terraform plan -out=tfplan` and verify exit code 0.
- Build verification: `npm ci && npm run build` (check `dist/` exists).
- Smoke test: fetch the static website endpoint returned by Terraform outputs and verify HTTP 200 (if endpoint exists).

## 8) Required repository secrets (GitHub Actions)

- `AZURE_CREDENTIALS` — JSON from `az ad sp create-for-rbac --sdk-auth` for a Service Principal.
- `TF_BACKEND_RG` — resource group name used for backend (e.g., `orgchart-tfstate-rg`).
- `TF_BACKEND_STORAGE_ACCOUNT` — storage account name used for backend state (global unique name).
- `TF_BACKEND_CONTAINER` — container name for tfstate (recommended: `tfstate`).
- `AZURE_LOCATION` — Azure region for resources (e.g., `westeurope`).
- `APP_STORAGE_ACCOUNT` — storage account name used for the static website (must match Terraform variable or be set as input).

## 9) Steps to execute (after approval)

1. Confirm/adjust variable values in this plan (resource names, locations).
2. Approve this plan by changing `status` to `Approved` (reply in the thread or we can update on your confirmation).
3. After approval I will scaffold `terraform/` and `.github/workflows/*` and open a PR with the changes.
4. Run `azure-validate` (we will execute validation steps and record proof in Section 7).
5. After validation passes, `azure-deploy` will perform the final apply and deployment steps (or GitHub Actions will auto-apply on `main`).

## 10) Decisions (confirmed)

- Target Azure region: `westeurope`
- Automatic `terraform apply` on `main`: enabled
- Cost preference: cheapest possible setup — single `Storage Account` for both remote state and static website; `Standard_LRS` replication.

---

Sign-off: |
  Reply with `Approved` to allow scaffolding and CI workflow creation.
