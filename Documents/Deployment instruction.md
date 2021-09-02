# Azure Services in Platform 
AD B2C, Function Apps, App Service, Azure Digital Twin, Event Hub, IoT Hub, CosmosDB, Storage Account, Devop, Azure Maps

# Platform Architecture
![Platform Architecture](/designFiles/azureiotrocks_architeture.drawio.svg)

# ARM Template

[ARM Template File](template.json)

[Parameter File](parameters.json)

ARM Template Visualization Diagram
![ARM Visualization](/DocumentsImages/ARM_visualization.png)

Reference Article: [Deploy ARM Template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/quickstart-create-templates-use-the-portal#edit-and-deploy-the-template)

# Devop Pipelines
Please refer to the above architecture diagram. Each devop pipeline has a number tag. They are created by the below YML files in this repository.

1. [Single Page Application](/azure-spa-pipelines.yml)
2. [Function Apps](/azure-dataprocessfunction-pipelines.yml)
3. [App Service: Task Master API](/azure-taskmasterapi-pipelines.yml)
4. [App Service: Azure Digital Twin Operation API](/azure-digitaltwinapi-pipelines.yml)
5. [APP Service: Cosmos DB Operation API](/azure-dbopapi-pipelines.yml)
6. [App Service: IoT Hub Operation API](/azure-iothubopapi-pipelines.yml)
