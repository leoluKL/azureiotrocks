const moduleSwitchDialog=require("../sharedSourceFiles/moduleSwitchDialog")
const modelManagerDialog = require("../sharedSourceFiles/modelManagerDialog")
const startSelectionDialog = require("../sharedSourceFiles/startSelectionDialog")
const historyDataChartsDialog=require("../sharedSourceFiles/historyDataChartsDialog")

function deviceManagementMainToolbar() {
}

deviceManagementMainToolbar.prototype.render = function () {
    this.switchProjectBtn=$('<a class="w3-bar-item w3-button" href="#">Project</a>')
    this.modelIOBtn=$('<a class="w3-bar-item w3-button" href="#">Models</a>')
    this.dataViewBtn=$('<a class="w3-bar-item w3-button" href="#">Dataview</a>')

    $("#MainToolbar").empty()
    $("#MainToolbar").append(moduleSwitchDialog.modulesSidebar)
    $("#MainToolbar").append(moduleSwitchDialog.modulesSwitchButton,this.switchProjectBtn,this.modelIOBtn, this.dataViewBtn)

    modelManagerDialog.showRelationVisualizationSettings=false
    this.switchProjectBtn.on("click",()=>{ startSelectionDialog.popup() })
    this.modelIOBtn.on("click",()=>{ modelManagerDialog.popup() })
    this.dataViewBtn.on("click",()=>{ historyDataChartsDialog.popup() })
}

module.exports = new deviceManagementMainToolbar();