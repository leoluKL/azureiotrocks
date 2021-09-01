const globalCache = require("../sharedSourceFiles/globalCache")
const msalHelper = require("../msalHelper")
const baseInfoPanel = require("../sharedSourceFiles/baseInfoPanel")
const simpleExpandableSection= require("../sharedSourceFiles/simpleExpandableSection")
const simpleConfirmDialog= require("../sharedSourceFiles/simpleConfirmDialog")
const historyDataChartsDialog= require("../sharedSourceFiles/historyDataChartsDialog")

class twinInfoPanel extends baseInfoPanel{
    constructor() {
        super()
        this.openFunctionButtonSection=true
        this.openPropertiesSection=true
        this.DOM = $("#InfoContent")
        this.drawButtons(null)
        this.selectedObjects = null;
    }

    async showInfoOfSingleTwin(singleDBTwinInfo,forceRefresh){
        this.drawButtons("singleNode")
        var modelID = singleDBTwinInfo.modelID
        var twinIDs = []
        if (!globalCache.storedTwins[singleDBTwinInfo.id] && !forceRefresh) {
            //query all twins of this parent model if they havenot been queried from ADT yet
            //this is to save some time as I guess user may check other twins under same model
            for (var twinID in globalCache.DBTwins) {
                var ele = globalCache.DBTwins[twinID]
                if (ele.modelID == modelID) twinIDs.push(ele.id)
            }
        }
        if(forceRefresh) twinIDs.push(singleDBTwinInfo.id)

        var twinsData = await msalHelper.callAPI("digitaltwin/listTwinsForIDs", "POST", twinIDs)
        globalCache.storeADTTwins(twinsData)

        var singleADTTwinInfo = globalCache.storedTwins[singleDBTwinInfo.id] 
        var propertiesSection= new simpleExpandableSection("Properties Section",this.DOM)
        propertiesSection.callBack_change=(status)=>{this.openPropertiesSection=status}
        if(this.openPropertiesSection) propertiesSection.expand()
        this.drawSingleNodeProperties(singleDBTwinInfo,singleADTTwinInfo,propertiesSection.listDOM)
    }

    async rxMessage(msgPayload) {
        if (msgPayload.message == "showInfoSelectedDevices") {
            var arr = msgPayload.info;
            this.DOM.empty()
            if (arr == null || arr.length == 0) {
                this.drawButtons(null)
                this.selectedObjects = [];
                return;
            }
            this.selectedObjects = arr;
            if (arr.length == 1) {
                this.showInfoOfSingleTwin(arr[0])
            } else if (arr.length > 1) {
                this.drawButtons("multiple")
                var textDiv = $("<label style='display:block;margin-top:10px;margin-left:16px'></label>")
                textDiv.text(arr.length + " node" + ((arr.length <= 1) ? "" : "s"))
                this.DOM.append(textDiv)
            }
        }
    }

    drawButtons(selectType){
        if(selectType==null){
            this.DOM.html("<div style='padding:8px'><a style='display:block;font-style:italic;color:gray'>Define IoT setting in model so its twin type can be mapped to physical IoT device type</a><a style='display:block;font-style:italic;color:gray;padding-top:20px;padding-bottom:20px'>Press ctrl or shift key to select multiple twins</a></div>")
            return;
        }

        var buttonSection= new simpleExpandableSection("Function Buttons Section",this.DOM,{"marginTop":0})
        buttonSection.callBack_change=(status)=>{this.openFunctionButtonSection=status}
        if(this.openFunctionButtonSection) buttonSection.expand()
        
        if(selectType=="singleNode"){
            var refreshBtn = $('<button class="w3-ripple w3-bar-item w3-button w3-black"><i class="fas fa-sync-alt"></i></button>')
            buttonSection.listDOM.append(refreshBtn)
            refreshBtn.on("click",()=>{
                var currentDeviceInfo=this.selectedObjects[0]
                this.DOM.empty()
                this.showInfoOfSingleTwin(currentDeviceInfo,'forceRefresh')
            })
        }

        //delBtn.on("click",()=>{this.deleteSelected()})
        var historyDataBtn=$('<button style="width:45%"  class="w3-ripple w3-button w3-border">Show History Data</button>')
        buttonSection.listDOM.append(historyDataBtn)
        historyDataBtn.on("click",()=>{
            historyDataChartsDialog.popup()
        })

    
        var allAreIOT=true
        for(var i=0;i<this.selectedObjects.length;i++){
            var modelID=this.selectedObjects[i].modelID
            var theDBModel=globalCache.getSingleDBModelByID(modelID)
            if(!theDBModel.isIoTDeviceModel){
                allAreIOT=false
                break;
            }
        }

        
    
        if(allAreIOT){
            if (selectType == "singleNode") {
                var currentDeviceInfo=this.selectedObjects[0]
                var devID=currentDeviceInfo['id']
                var provisionBtn = $('<button style="width:45%"  class="w3-ripple w3-button w3-border">IoT Provision</button>')
                var deprovisionBtn = $('<button style="width:45%"  class="w3-ripple w3-button w3-border">IoT Deprovision</button>')
                buttonSection.listDOM.append(provisionBtn, deprovisionBtn)
                provisionBtn.on("click",()=>{this.provisionDevice(devID)})
                deprovisionBtn.on("click",()=>{this.deprovisionDevice(devID)})

                var deviceCodeBtn =$('<button style="width:90%"  class="w3-ripple w3-button w3-border">Generate Device Code</button>')
                buttonSection.listDOM.append(deviceCodeBtn)
                deviceCodeBtn.on("click",async ()=>{
                    var connectionInfo = await msalHelper.callAPI("devicemanagement/geIoTDevicesConnectionString", "POST", {"devicesID":[devID]})
                    connectionInfo=connectionInfo[devID]
                    var theDBModel = globalCache.getSingleDBModelByID(currentDeviceInfo.modelID)
                    var sampleTelemetry=globalCache.generateTelemetrySample(theDBModel.telemetryProperties)
                    var devName=globalCache.twinIDMapToDisplayName[devID]
                    //generate sample code for this specified device
                    this.generateDownloadSampleCode(devName,connectionInfo,sampleTelemetry)
                })
            }
        }
    }

    async provisionDevice(devID){
        var dbTwin=globalCache.DBTwins[devID]
        var modelID=dbTwin.modelID
        var DBModelInfo=globalCache.getSingleDBModelByID(modelID)
        try{
            var postBody= {"DBTwin":dbTwin,"desiredInDeviceTwin":{}}
            DBModelInfo.desiredProperties.forEach(ele=>{
                var propertyName=ele.path[ele.path.length-1]
                var propertySampleV= ""
                postBody.desiredInDeviceTwin[propertyName]=propertySampleV
            })
            var provisionedDocument = await msalHelper.callAPI("devicemanagement/provisionIoTDeviceTwin", "POST", postBody,"withProjectID" )
            globalCache.storeSingleDBTwin(provisionedDocument) 
            this.broadcastMessage({ "message": "TwinIoTProvisioned","modelID":modelID,"twinID":devID })
        }catch(e){
            console.log(e)
            if(e.responseText) alert(e.responseText)
        }
    }
    async deprovisionDevice(devID){
        var dbTwin=globalCache.DBTwins[devID]
        var modelID=dbTwin.modelID
        var confirmDialogDiv=new simpleConfirmDialog()
        var devName=globalCache.twinIDMapToDisplayName[devID]
        confirmDialogDiv.show(
            { width: "250px" },
            {
                title: "Warning"
                , content: "Deprovision IoT Device "+devName+"?"
                , buttons: [
                    {
                        colorClass: "w3-red w3-hover-pink", text: "Confirm", "clickFunc": async () => {
                            confirmDialogDiv.close()
                            var deprovisionedDocument = await msalHelper.callAPI("devicemanagement/deprovisionIoTDeviceTwin", "POST", {"twinID": devID},"withProjectID" )
                            globalCache.storeSingleDBTwin(deprovisionedDocument)
                            this.broadcastMessage({ "message": "TwinIoTDeprovisioned","modelID":modelID,"twinID":devID })
                        }
                    },
                    { colorClass: "w3-gray", text: "Cancel", "clickFunc": () => {confirmDialogDiv.close()}}
                ]
            }
        )
    }

    async generateDownloadSampleCode(deviceName,connectionInfo,sampleTelemetry) {
        $.ajax({
            url: 'SAMPLEDEVICECODE.js',
            dataType: "text",
            success: function (codeBase) {
                codeBase = codeBase.replace("[PLACEHOLDER_DEVICE_CONNECTION_STRING]", connectionInfo[0])
                codeBase = codeBase.replace("[PLACEHOLDER_DEVICE_CONNECTION_STRING2]", connectionInfo[1])
                codeBase = codeBase.replace("[PLACEHOLDER_TELEMETRY_PAYLOAD_SAMPLE]", JSON.stringify(sampleTelemetry, null, 2))
                var pom = $("<a></a>")
                pom.attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(codeBase));
                pom.attr('download', deviceName + ".js.sample");
                pom[0].click()
            }
        });
    }


}


module.exports = new twinInfoPanel();