sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createJsonModel : function(sPath) {
			var oJsonData = new sap.ui.model.json.JSONModel();
			oJsonData.loadData(sPath);
			return oJsonData;
		}
		
	};
});