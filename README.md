# GitHub Action: Azure-PlayFab Function Sync

This action syncs azure function app urls with playfab.

## Inputs

### `playfab-developer-secret-key`

**`Required`** The secret key required for register functions. You can obtain from PlayFab title.

### `playfab-title-id`

**`Required`** PlayFab title id that will be updated with function app urls.

### `azure-subscription-id`

**`Required`** Subscription id which is includes function app.

### `azure-resource-group`

**`Required`** Resource group name which is includes function app.

### `azure-function-app-name`

**`Required`** The function app that will be uploaded.

### `playfab-clean-unused-functions`

**`Optional`** Playfab functions which are does not contains at Azure function app will be unregistered. The input must be **true** or **false**. Default value is **false**.

## Example Usage

Action needs access token acquired from Azure for Azure ARM api requests. Access token will be denied that is obtained with Azure account login. Sign in with Service Principal required to get valid access token.  

```
- uses: actions/checkout@v3
      
- name: Azure Login and Get Access Token
  run: |
      az login --service-principal -u ${{ secrets.AZURE_LOGIN_APP_ID }} -p ${{ secrets.AZURE_LOGIN_SECRET_VALUE }} --tenant ${{ secrets.AZURE_LOGIN_TENANT_ID }}
      az account get-access-token --output json > "accessToken.json"
          
- uses: rudyatkinson/azure-playfab-function-sync@v1.0.0
  with:
    playfab-developer-secret-key: ${{ secrets.DEVELOPER_SECRET_KEY }}
    playfab-title-id: ${{ secrets.TITLE_ID }}
    azure-subscription-id: ${{ secrets.SUBSCRIPTION_ID}}
    azure-resource-group: ${{ secrets.RESOURCE_GROUP }}
    azure-function-app-name: ${{ secrets.APP_NAME }}
    playfab-clean-unused-functions: true
```

## Azure Service Principal Documents

* [Create an Azure service principal with the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli)
* [Create an Azure service principal in the portal](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal)

## The action generally supports 

* `ubuntu-18.04`
* `ubuntu-20.04`
* `ubuntu-22.04`
* `macOS-10.15`
* `macOS-11`
* `macOS-12`
* `windows-2019`
* `windows-2022`
