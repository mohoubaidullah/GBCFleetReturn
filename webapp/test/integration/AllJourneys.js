/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"fleetreturn/GBCReturnNew/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"fleetreturn/GBCReturnNew/test/integration/pages/Return",
	"fleetreturn/GBCReturnNew/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "fleetreturn.GBCReturnNew.view.",
		autoWait: true
	});
});