# GitHub Action: Azure-PlayFab Function Sync
[![Actions Status](https://github.com/rudyatkinson/azure-playfab-function-sync-test/workflows/azure-playfab-function-sync-test/badge.svg)](https://github.com/rudyatkinson/azure-playfab-function-sync-test/actions)

Action syncs Azure Function App URLs with PlayFab.

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

### `playfab-unregister-unused-functions`

**`Optional`** Playfab functions which are does not contains at Azure function app will be unregistered. The input must be **true** or **false**. Default value is **false**.

## Requirements

**`AzureWebJobsSecretStorageType`**  
The Azure ARM API doesn't return functions for function apps with 'Blob' storage type. Set storage type to 'Files' to use the action.

Follow the steps below to make changes;

* Move to FunctionApp > Configuration.
* Create 'AzureWebJobsSecretStorageType' in the application settings, if it doesn't exist.
* Set its value to 'Files'.

*AzureWebJobsSecretStorageType*

*Specifies the repository or provider to use for key storage. Currently, the supported repositories are blob storage ("Blob") and the local file system ("Files"). The default is blob in version 2 and file system in version 1.*

## Example Usage

Action needs access token acquired from Azure for Azure ARM api requests. Access token will be denied that is obtained with Azure account login. Sign in with Service Principal required to get valid access token.  

```
- uses: actions/checkout@v3
      
- name: Azure Login and Get Access Token
  run: |
      az login --service-principal -u ${{ secrets.AZURE_LOGIN_APP_ID }} -p ${{ secrets.AZURE_LOGIN_SECRET_VALUE }} --tenant ${{ secrets.AZURE_LOGIN_TENANT_ID }}
      az account get-access-token --output json > "accessToken.json"
          
- uses: rudyatkinson/azure-playfab-function-sync@v1.0.1
  with:
    playfab-developer-secret-key: ${{ secrets.DEVELOPER_SECRET_KEY }}
    playfab-title-id: ${{ secrets.TITLE_ID }}
    azure-subscription-id: ${{ secrets.SUBSCRIPTION_ID}}
    azure-resource-group: ${{ secrets.RESOURCE_GROUP }}
    azure-function-app-name: ${{ secrets.APP_NAME }}
    playfab-unregister-unused-functions: true
```
  
## Recommended Usage

```
- uses: actions/checkout@v3

- name: Resolve
  shell: bash
  run: |
    pushd './${{ secrets.APP_PACKAGE_PATH }}'
    dotnet build --configuration Release --output ./output
    popd
    
- name: Deploy
  uses: Azure/functions-action@v1
  with:
    app-name: ${{ secrets.APP_NAME }}
    package: '${{ secrets.APP_PACKAGE_PATH }}/output'
    publish-profile: ${{ secrets.APP_PUBLISH_PROFILE }}
    
- name: Azure Login and Get Access Token
  run: |
      az login --service-principal -u ${{ secrets.AZURE_LOGIN_APP_ID }} -p ${{ secrets.AZURE_LOGIN_SECRET_VALUE }} --tenant ${{ secrets.AZURE_LOGIN_TENANT_ID }}
      az account get-access-token --output json > "accessToken.json"
          
- uses: rudyatkinson/azure-playfab-function-sync@v1.0.1
  with:
    playfab-developer-secret-key: ${{ secrets.DEVELOPER_SECRET_KEY }}
    playfab-title-id: ${{ secrets.TITLE_ID }}
    azure-subscription-id: ${{ secrets.SUBSCRIPTION_ID}}
    azure-resource-group: ${{ secrets.RESOURCE_GROUP }}
    azure-function-app-name: ${{ secrets.APP_NAME }}
    playfab-unregister-unused-functions: true
```

## Azure Service Principal Documents

* [Create an Azure service principal with the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli)
* [Create an Azure service principal in the portal](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal)

## Changelogs
### 16/03/2023 Update
* Created test repository and added an action status. From now on, every version will be automatically tested before it is published to ensure its quality and stability.
### v1.0.1  
* Renamed 'playfab-clean-unused-functions' to 'playfab-unregister-unused-functions' due to a naming typo.
* The README has been updated with more details.

## The action generally supports 

* `ubuntu-20.04`
* `ubuntu-22.04`
* `macOS-11`
* `macOS-12`
* `windows-2019`
* `windows-2022`

## Additional Links

* [Azure Functions Action](https://github.com/marketplace/actions/azure-functions-action)
* [Azure Blob Storage vs File Storage – What’s the Difference?](https://cloudinfrastructureservices.co.uk/azure-blob-storage-vs-file-storage-whats-the-difference-pros-and-cons)
