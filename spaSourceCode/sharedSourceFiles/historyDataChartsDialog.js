const msalHelper=require("../msalHelper")
const simpleConfirmDialog=require("./simpleConfirmDialog")
//This is a singleton class

function historyDataChartsDialog(){
    this.dialogObj=new simpleConfirmDialog("onlyHideWhenClose")
    this.dialogObj.show(
        { width: "600px" },
        {
            title: "History Digital Twin Data"
            ,"customDrawing":(parentDOM)=>{
                this.drawContent(parentDOM)
            }
            , buttons: [
            ]
        }
    )
    this.dialogObj.close()
}

historyDataChartsDialog.prototype.popup=function(){
    this.dialogObj.DOM.show()
}


historyDataChartsDialog.prototype.drawContent=function(parentDOM){
    this.fromDateControl=this.createDateTimePicker()
    this.toDateControl=this.createDateTimePicker()

    var row1=$("<div></div>")
    parentDOM.append(row1)
    var fromlable=$('<label class="w3-bar-item w3-opacity" style="padding-right:5px;font-size:1.2em;">From</label>')
    var tolable=$('<label class="w3-bar-item w3-opacity" style="padding-left:15px;padding-right:5px;font-size:1.2em;">To</label>')
    row1.append(fromlable,this.fromDateControl,tolable,this.toDateControl)

    this.chartsDOM=$('<div class="w3-border w3-container" style="margin-top:10px;width:100%;min-height:150px;max_height:500px"></div>')
    parentDOM.append(this.chartsDOM)
    this.showEmptyLable()
}

historyDataChartsDialog.prototype.showEmptyLable=function(){
    var emptylable=$('<label class="w3-bar-item w3-opacity" style="padding-right:5px;font-size:1.2em;">No history data selected</label>')
    this.chartsDOM.append(emptylable) 
}

historyDataChartsDialog.prototype.createDateTimePicker=function(){
    var nowDateTime=new Date().toString()
    var aDateControl=$('<input type="text" style="width:200px"/>')
    aDateControl.val(nowDateTime)
    aDateControl.datetimepicker({
        defaultDate:new Date()
        ,todayButton:true
        ,step:30
    });
    return aDateControl
}

module.exports = new historyDataChartsDialog();