var msg = "";
var vehicle = "";
var allowRefresh = false;
var vehicleId = "";
var RequestId = "";
var ImageType = {};
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/ValidateException",
	"sap/m/MessageBox",
	"fleetreturn/GBCReturnNew/model/models",
	"sap/ui/core/ValueState",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MessageToast, ValidateException, MessageBox, models, ValueState, ResourceModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("fleetreturn.GBCReturnNew.controller.Return", {
		onInit: function () {
			var oMessageManager, oView;
			//debugger;
			oView = this.getView();
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");
			var oData = {};
			var string = "";
			var complete_url = window.location.href;
			var pieces = complete_url.split("ccc");
			var langugae = complete_url.split("sap-language");
			// set i18n model on view
			if (langugae.length > 1) {
				string = langugae[1];
				string = string.substr(1, 2);
				if (string === "AR" || string === "ar") {
					sap.ui.getCore().getConfiguration().setLanguage("ar");
				} else {
					sap.ui.getCore().getConfiguration().setLanguage("en");
				}
				// if()
			}
			// sap.ui.getCore().getConfiguration().setLanguage("ar");

			const i18nModel = new ResourceModel({
				bundleName: "fleetreturn.GBCReturnNew.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
			const oBundle = this.getView().getModel("i18n").getResourceBundle();

			if (pieces.length > 1) {
				string = pieces[1];
				RequestId = string.substr(1, 9);
				oData = {
					VehicleDetVisible: false,
					idfileCheckList: true,
					idfileDL: true,
					idfileMOT: true,
					idFrontUpload: true,
					idLeftUpload: true,
					idRightUpload: true,
					idBackUpload: true,
					readmode: false,
					displaymode: true
				};
				var oModel = this.getOwnerComponent().getModel();
				var sPath = "/transferRequestDownloadSet('" + RequestId + "')";
				var that = this;
				// that = this;
				var btnHandler = function (evt) {
					that.viewImage(evt);
				};

				oModel.read(sPath, {
					success: function (oData, response) {
						// //debugger;
						//var oModel3 = new sap.ui.model.json.JSONModel(oData);
						oView.byId("idempId").setValue(oData.DriverID);
						oView.byId("idRequest").setText(oData.Zrecord);

						oView.byId("idEmpName").setText(oData.Ztransferor_n);
						oView.byId("idEmpVehicle").setText(oData.Zequnr);
						oView.byId("idVehDescr").setText(oData.Zequipdescr);
						oView.byId("idVehPlate").setText(oData.Zplate);
						that.vechileId = that.vehicle = oData.Zequnr;
						oView.byId("idTransfer").setSelectedKey(oData.Ztype);
						if (oData.Ztype === '1') {
							oView.byId("idtoempidLabel").setVisible(true);
							oView.byId("idToempId").setVisible(true);
							oView.byId("idtoempnameLabel").setVisible(true);
							oView.byId("idToEmpName").setVisible(true);
							oView.byId("idIssueText").setVisible(false);
							oView.byId("idTypeIssue").setVisible(false);
						} else if (oData.Ztype === '2' || oData.Ztype === '3') {
							oView.byId("idtoempidLabel").setVisible(false);
							oView.byId("idToempId").setVisible(false);
							oView.byId("idtoempnameLabel").setVisible(false);
							oView.byId("idToEmpName").setVisible(false);
							oView.byId("idIssueText").setVisible(false);
							oView.byId("idTypeIssue").setVisible(false);
							if (oData.Ztype === '2') {
								oView.byId("idIssueText").setVisible(true);
								oView.byId("idTypeIssue").setVisible(true);

							}
						}
						oView.byId("idTypeIssue").setSelectedKey(oData.Zissuetype);
						var dates = oData.ZrequestDate.substr(6, 2) + "/" + oData.ZrequestDate.substr(4, 2) + "/" + oData.ZrequestDate.substr(0, 4);
						oView.byId("idRequestDate").setText(dates);
						var times = oData.ZrequestTime.substr(0, 2) + ":" + oData.ZrequestTime.substr(2, 2) + ":" + oData.ZrequestTime.substr(4, 2);
						oView.byId("idRequestTime").setText(times);

						oView.byId("idRequestor").setText(oData.Zrequestor);
						oView.byId("idTransferee").setText(oData.Ztransferee);
						oView.byId("idTransfereeName").setText(oData.Ztransferee_n);
						if (that.vehicle === "") {
							var msg = oBundle.getText("msg14");
							sap.m.MessageToast.show(msg);
							oView.getModel("localModel").setProperty("/VehicleDetVisible", false);
						} else {
							oView.getModel("localModel").setProperty("/VehicleDetVisible", true);
						}
						var oModelDoc = that.getOwnerComponent().getModel();

						var myFilter = new sap.ui.model.Filter("FleetId", sap.ui.model.FilterOperator.EQ, (that.vehicle));
						oModelDoc.read("/FleetReqDocumentsSet", {
							filters: [myFilter],
							success: function (oDataImages, response1) {
								debugger;
								var oDataImagesData = new sap.ui.model.json.JSONModel(oDataImages);
								// oDataImagesData.setData(oDataImages);
								that.getView().setModel(oDataImagesData, "imagesButton");
								var oPanelLeft = that.getView().byId("idFleetImagesLeft");
								var oPanelRight = that.getView().byId("idFleetImagesRight");
								var oPanelFront = that.getView().byId("idFleetImagesFront");
								var oPanelBack = that.getView().byId("idFleetImagesBack");
								var oImages = [];
								oImages = oDataImages.results;
								for (let i = 0; i < oImages.length; i++) {
									let image = oImages[i];
									let name = "";
									if (image.AwsFileName !== "") {
										name = image.Zdate.toLocaleDateString();
										// value: "/fleet/"+image.AwsFileName 
										let oButton = new sap.m.Button({
												id: image.AwsFileName,
												text: name,
												type: "Accept",
												press: btnHandler,
												customData: new sap.ui.core.CustomData({
													key: "AwsFilePath",
													value: image.AwsFilePath

												})
											})
											// oPanel.addContent(oButton);
										if (image.DocType === "RIM") {
											oPanelRight.addContent(oButton);
										} else if (image.DocType === "BIM") {
											oPanelBack.addContent(oButton);
										} else if (image.DocType === "LIM") {
											oPanelLeft.addContent(oButton);
										} else if (image.DocType === "FIM") {
											oPanelFront.addContent(oButton);
										}
									}
								}
							},
							error: function () {
								sap.m.MessageToast.show("No Data retreived");
							}
						});

						// }

						var oModelChecklist = that.getOwnerComponent().getModel();
						var sPath = "/checkListPostSet('" + RequestId + "')";
						// var that = this;
						oModelChecklist.read(sPath, {
							success: function (oData, response) {
								var oLocalModelCk = new sap.ui.model.json.JSONModel(oData);
								oView.setModel(oLocalModelCk, "checklist");
							},
							error: function () {

								sap.m.MessageToast.show("No Data retreived");
								oView.getModel("localModel").setProperty("/VehicleDetVisible", false);
							}

						});
						// oView.byId("idVehDescr").setText(oData.EquDescr);

						//var osf = oView.byId("idReturn");
						//osf.setModel(oModel3);
						//var osf1 = oView.byId("LeaveApprover");
						//osf1.setModel(oModel3);
					},
					error: function () {

						sap.m.MessageToast.show("No Data retreived");
						oView.getModel("localModel").setProperty("/VehicleDetVisible", false);
					}

				});

			} else {
				oData = {
					VehicleDetVisible: false,
					idfileCheckList: true,
					idfileDL: true,
					idfileMOT: true,
					idFrontUpload: true,
					idLeftUpload: true,
					idRightUpload: true,
					idBackUpload: true,
					readmode: true,
					displaymode: false
				};
			}

			this.oLocalModel = new sap.ui.model.json.JSONModel(oData);
			oView.setModel(this.oLocalModel, "localModel");
			this.filenameLicense = {};
			this.filetypeLicense = {};

			//this.getView().byId("idtoempidLabel").setEnabled(false);
			this.getView().byId("idtoempidLabel").setVisible(false);
			this.getView().byId("idToempId").setVisible(false);
			this.getView().byId("idtoempnameLabel").setVisible(false);
			this.getView().byId("idToEmpName").setVisible(false);
			this.getView().byId("idIssueText").setVisible(false);
			this.getView().byId("idTypeIssue").setVisible(false);

			var oJsonModel = models.createJsonModel("/model/viewdata.json");
			this.getView().setModel(oJsonModel);

			//set json models
			//  var oJsonData = models.createJsonModel("fleetreturn/GBCReturnNew/model/viewdata.json");
		},
		onChange: function (oControlEvent) {
			// //debugger;
			this.selectedKey = oControlEvent.getSource().getSelectedKey();

			if (this.selectedKey === '1') {
				this.getView().byId("idtoempidLabel").setVisible(true);
				this.getView().byId("idToempId").setVisible(true);
				this.getView().byId("idtoempnameLabel").setVisible(true);
				this.getView().byId("idToEmpName").setVisible(true);
				this.getView().byId("idIssueText").setVisible(false);
				this.getView().byId("idTypeIssue").setVisible(false);
			} else if (this.selectedKey === '2' || this.selectedKey === '3') {
				this.getView().byId("idtoempidLabel").setVisible(false);
				this.getView().byId("idToempId").setVisible(false);
				this.getView().byId("idtoempnameLabel").setVisible(false);
				this.getView().byId("idToEmpName").setVisible(false);
				this.getView().byId("idIssueText").setVisible(false);
				this.getView().byId("idTypeIssue").setVisible(false);
				if (this.selectedKey === '2') {
					this.getView().byId("idIssueText").setVisible(true);
					this.getView().byId("idTypeIssue").setVisible(true);

				}
			}

		},
		viewImage: function (evt) {
			var obtn = evt.getSource();
			//now you have access to the respective button
			var customData = obtn.getCustomData()[0].getValue();
			// sap.m.MessageToast.show("button Clicked:" + customData)
			if (!this.displayContent) {
				this.displayContent = sap.ui.xmlfragment("fleetreturn.GBCReturnNew.fragments.filepreview", this);
				this.getView().addDependent(this.displayContent);
			}
			sap.ui.getCore().byId("idPdfViewer").setVisible(false);
			sap.ui.getCore().byId("image").setVisible(true);
			sap.ui.getCore().byId("image").setSrc(customData);
			this.displayContent.open();

		},
		onSubmit: function (oEvent) {

			// //debugger;
			that = this;
			var btnHandler = function (evt) {
				that.viewImage(evt);
			};
			const oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.Pernr = oEvent.getSource().getValue();
			if (this.Pernr !== "") {
				this.getView().byId("idempId").setValueState("None");
				this.getView().byId("idToempId").setValue("");
				this.getView().byId("idToEmpName").setText("");
				this.getView().byId("idEmpName").setText("");
				this.getView().byId("idToempId").setValueState("None");
				//	var empId = this.getView().byId("idempId").getValue();
				var that = this;

				var oModel = this.getOwnerComponent().getModel();
				var sPath = "/empDetailsSet('" + this.Pernr + "')";
				this.getView().byId('idFrontUpload').setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId('idLeftUpload').setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId('idRightUpload').setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId('idBackUpload').setValueState(sap.ui.core.ValueState.Error);
				oModel.read(sPath, {
					success: function (oData, response) {
						debugger;
						//var oModel3 = new sap.ui.model.json.JSONModel(oData);
						that.getView().byId("idEmpName").setText(oData.empName);
						that.getView().byId("idEmpVehicle").setText(oData.Equnr);
						that.getView().byId("idVehPlate").setText(oData.Plate);
						that.vechileId = that.vehicle = oData.Equnr;
						if (that.vehicle === "") {
							var msg = oBundle.getText("msg14");
							sap.m.MessageToast.show(msg);
							// sap.m.MessageToast.show("No Vehicle Details available for the employee");
							that.getView().getModel("localModel").setProperty("/VehicleDetVisible", false);
						} else {
							that.getView().getModel("localModel").setProperty("/VehicleDetVisible", true);
							var oModels = that.getOwnerComponent().getModel();

							var myFilter = new sap.ui.model.Filter("FleetId", sap.ui.model.FilterOperator.EQ, (that.vehicle));
							oModels.read("/FleetReqDocumentsSet", {
								filters: [myFilter],
								success: function (oDataImages, response1) {
									debugger;
									var oDataImagesData = new sap.ui.model.json.JSONModel(oDataImages);
									// oDataImagesData.setData(oDataImages);
									that.getView().setModel(oDataImagesData, "imagesButton");
									var oPanelLeft = that.getView().byId("idFleetImagesLeft");
									var oPanelRight = that.getView().byId("idFleetImagesRight");
									var oPanelFront = that.getView().byId("idFleetImagesFront");
									var oPanelBack = that.getView().byId("idFleetImagesBack");
									var oImages = [];
									oImages = oDataImages.results;
									// var back, left, right, front;
									// back = left = right = front = 1;
									for (let i = 0; i < oImages.length; i++) {
										let image = oImages[i];
										let name = "";
										if (image.AwsFileName !== "") {
											// if (image.DocType === "RIM") {
											// 	name = "Right-" + right;
											// 	right++;
											// } else if (image.DocType === "BIM") {
											// 	name = "Back-" + back;
											// 	back++;
											// } else if (image.DocType === "LIM") {
											// 	name = "Left-" + left;
											// 	left++;
											// } else if (image.DocType === "FIM") {
											// 	name = "Front-" + front;
											// 	front++;
											// }
											name = image.Zdate.toLocaleDateString();
											// value: "/fleet/"+image.AwsFileName 
											let oButton = new sap.m.Button({
													id: image.AwsFileName,
													text: name,
													type: "Accept",
													press: btnHandler,
													customData: new sap.ui.core.CustomData({
														key: "AwsFilePath",
														value: image.AwsFilePath

													})
												})
												// oPanel.addContent(oButton);
											if (image.DocType === "RIM") {
												oPanelRight.addContent(oButton);
											} else if (image.DocType === "BIM") {
												oPanelBack.addContent(oButton);
											} else if (image.DocType === "LIM") {
												oPanelLeft.addContent(oButton);
											} else if (image.DocType === "FIM") {
												oPanelFront.addContent(oButton);
											}
										}
									}
								},
								error: function () {
									sap.m.MessageToast.show("No Data retreived");
								}
							});

						}
						that.getView().byId("idVehDescr").setText(oData.EquDescr);

						//var osf = that.getView().byId("idReturn");
						//osf.setModel(oModel3);
						//var osf1 = that.getView().byId("LeaveApprover");
						//osf1.setModel(oModel3);
					},
					error: function () {

						sap.m.MessageToast.show("No Data retreived");
						that.getView().getModel("localModel").setProperty("/VehicleDetVisible", false);
					}

				});
			} else {
				// sap.m.MessageToast.show("");
				//	MessageBox.alert("Please enter Transferor employee ID");
				this.getView().byId("idempId").setValueState("Error");
				this.getView().byId("idempId").setValueStateText("Enter Transferor employee ID");
				this.getView().byId("idempId").setShowValueStateMessage(true);
				//this.getView().byId("idempId").setValueState("Please enter Transferor employee ID");
			}

		},

		onSubmitTransferor: function (oEvent) {

			// //debugger;

			var PernrTo = oEvent.getSource().getValue();
			if (PernrTo !== "") {
				if (this.vehicle !== "") {
					if (this.Pernr !== PernrTo) {
						this.getView().byId("idToempId").setValueState("None");
						this.getView().byId("idempId").setValueState("None");
						//	var empId = this.getView().byId("idempId").getValue();
						var that = this;

						var oModel = that.getOwnerComponent().getModel();
						var sPath = "/empDetailsSet('" + PernrTo + "')";

						oModel.read(sPath, {
							success: function (oData, response) {
								// //debugger;
								//var oModel3 = new sap.ui.model.json.JSONModel(oData);
								that.getView().byId("idToEmpName").setText(oData.empName);
								//that.getView().byId("idEmpVehicle").setText(oData.Equnr);
								//that.getView().byId("idVehDescr").setText(oData.EquDescr);
								//var osf = that.getView().byId("idReturn");
								//osf.setModel(oModel3);
								//var osf1 = that.getView().byId("LeaveApprover");
								//osf1.setModel(oModel3);
							},
							error: function () {

								sap.m.MessageToast.show("No Data retreived");
							}

						});

					} else {
						//sap.m.MessageToast.show("Transferor and Transferee cannot be same");
						this.getView().byId("idempId").setValueState("Error");
						this.getView().byId("idempId").setValueStateText("Transferor and Transferee cannot be same");
						this.getView().byId("idempId").setShowValueStateMessage(true);
						this.getView().byId("idToempId").setValueState("Error");
						this.getView().byId("idToempId").setValueStateText("Transferor and Transferee cannot be same");
						this.getView().byId("idToempId").setShowValueStateMessage(true);
					}
				} else {
					sap.m.MessageToast.show("No Vehicle details found for the entered Transferor");
				}
			} else {
				this.getView().byId("idToempId").setValueState("Error");
				this.getView().byId("idToempId").setValueStateText("Enter Transferee employee ID");
				this.getView().byId("idToempId").setShowValueStateMessage(true);
			}

		},
		openIshtimarahFile: function (oEvent) {

			var Zftype = 'ISH';
			this.openDocument(oEvent, Zftype, true);

		},
		openInsuranceFile: function (oEvent) {

			var Zftype = 'INS';
			this.openDocument(oEvent, Zftype, true);

		},
		openMOTCard: function (oEvent) {

			var Zftype = 'MOT';
			this.openDocument(oEvent, Zftype, true);

		},
		openMVPIDocument: function (oEvent) {

			var Zftype = 'MVPI';
			this.openDocument(oEvent, Zftype, true);

		},
		openCheckFile: function (oEvent) {
			var Zftype = 'CKL';
			this.openDocument(oEvent, Zftype, false);

		},
		openSASOCertificateFile: function (oEvent) {

			var Zftype = 'SASO';
			this.openDocument(oEvent, Zftype, true);

		},
		openDLFile: function (oEvent) {
			var Zftype = 'MOTD';
			this.openDocument(oEvent, Zftype, false);
		},
		openMOTCardDrvFile: function (oEvent) {
			var Zftype = 'DL';
			this.openDocument(oEvent, Zftype, false);
		},
		openRightBtn: function (oEvent) {
			var Zftype = 'RIM';
			this.openDocument(oEvent, Zftype, false);
		},
		openLeftBtn: function (oEvent) {
			var Zftype = 'LIM';
			this.openDocument(oEvent, Zftype, false);
		},
		openFrontBtn: function (oEvent) {
			var Zftype = 'FIM';
			this.openDocument(oEvent, Zftype, false);
		},
		openBackBtn: function (oEvent) {
			var Zftype = 'BIM';
			this.openDocument(oEvent, Zftype, false);
		},
		onPressBarCloseBtn: function (oEvent) {
			this.displayContent.close();
			this.fragOpen = undefined;
		},
		openDocument: function (oEvent, Zftype, fleet) {
			var vechId = this.getView().byId("idEmpVehicle").getText();

			if (Zftype !== "") {
				//call SAP and get file data
				var that = this;
				var oModel = that.getOwnerComponent().getModel();
				if (fleet === true) {
					var sPath = "/FleetDocumentsSet(Equnr=" + "'" + vechId + "'" + ",DocType=" + "'" + Zftype + "'" + ",DocSeq='')";
				} else {
					var sPath = "/FleetReqDocumentsSet(RequestId=" + "'" + RequestId + "'" + ",DocType=" + "'" + Zftype + "'" + ")";

				}
				oModel.read(sPath, {
					success: function (oData, response) {
						//var oModel3 = new sap.ui.model.json.JSONModel(oData);
						var fMres = oData.Content;
						var fType = oData.Filetype;
						var fName = oData.Filename;
						if (oData.Content === "") {
							sap.m.MessageToast.show("No Fleet Document Available");
							return;
						}
						fMres = "data:" + fType + ";base64," + fMres;

						if (!that.displayContent) {
							that.displayContent = sap.ui.xmlfragment("fleetreturn.GBCReturnNew.fragments.filepreview", that);
							that.getView().addDependent(that.displayContent);
						}

						var splitTest = fType.split("/");
						var mimType = splitTest[0];
						var fType = fName.split(".");
						var fileType = fType[1];

						switch (mimType) {
						case 'image':
							sap.ui.getCore().byId("idPdfViewer").setVisible(false);
							sap.ui.getCore().byId("image").setVisible(true);
							sap.ui.getCore().byId("image").setSrc(fMres);
							break;
						default:
							sap.ui.getCore().byId("idPdfViewer").setVisible(true);
							sap.ui.getCore().byId("image").setVisible(false);
							var html = sap.ui.getCore().byId("idPdfViewer");
							html.setContent('<iframe src="' + fMres +
								'" embedded="true" frameborder="0" target="_top" width="2000px" height="2000px"></iframe>');
							break;
						}

						if (fileType !== "docx" && fileType !== "pub" && fileType !== "xls" && fileType !== "ppt" && fileType !== "doc" && fileType !==
							"xlsx") {
							that.displayContent.open();
							that.fragOpen = true;
						}
						if (that.fragOpen === undefined) {
							window.open(fMres, "_self");
							fMres = fMres.replace("data:APPLICATION/WWI;base64,", "");
						}

						//	this.displayContent.open();

					},
					error: function () {

						sap.m.MessageToast.show("No Fleet Document Available");
					}

				});
			}

		},
		handleValueChange: function (oEvent) {
			// if(oEvent.getParameter('id'){
			this.getView().byId(oEvent.getParameter('id')).setValueState(sap.ui.core.ValueState.None);
			// }
			const oBundle = this.getView().getModel("i18n").getResourceBundle();
			const sMsg = oBundle.getText("msg7", [oEvent.getParameter("newValue")]);
			MessageToast.show(sMsg);
		},
		handleFile: function (oEvent) {
			//var oFileUploader  = this.getView().byId("idfileUploaderVAT");
			//var oFileSize =  oFileUploader.getSize();
			const oBundle = this.getView().getModel("i18n").getResourceBundle();
			const sMsg = oBundle.getText("msg6");
			sap.m.MessageToast.show(sMsg);
		},
		onComboxValidate(oEvent, id) {
			var idVal = this.getView().byId(id).getSelectedKey();
			var ids = this.getView().byId(id);

			if (idVal === "" || idVal === null) {
				const oBundle = this.getView().getModel("i18n").getResourceBundle();
				var text = oBundle.getText(id);

				var msg = oBundle.getText("msg5");
				var msg1 = oBundle.getText("msg4");
				ids.setValueState(ValueState.Error);
				ids.setValueStateText(text + " " + msg1);
				MessageBox.error(text + " " + msg, {
					actions: [sap.m.MessageBox.Action.CLOSE],

					onClose: function (sAction) {

					}
				});
				return;
			} else {
				ids.setValueState(ValueState.None);
			}
			return idVal;
		},
		onUploadDocument: function (oEvent, fileId, type, fleet) {
			var oFileUploader = "";
			oFileUploader = this.getView().byId(fileId); //onUploadDocument("idfileCheckList", "CKL");
			var domRef = oFileUploader.getFocusDomRef();
			var file = domRef.files[0];
			const oBundle = this.getView().getModel("i18n").getResourceBundle();
			// //debugger;
			if (domRef.files.length !== 0) {
				var that = this;
				this.filenameLicense[type] = file.name;
				this.filetypeLicense[type] = file.type;
				this.getView().byId(fileId).setValueState(sap.ui.core.ValueState.None);
				var reader = new FileReader();

				reader.onload = function (e) {

					//	var vContent = e.currentTarget.result.replace("application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,",
					//		"");
					var vContent = e.currentTarget.result.replace("data:" + that.filetypeLicense[type] + ";base64,", "");
					//that.postToSap(this.getView().byId("idRequestId").getText(), that.filename, that.filetype, vContent, "SHOPLICENSE");
					//var oDataModel = that.getView().getModel();
					var oDataModel = that.getOwnerComponent().getModel();
					var payLoad = {};
					if (fleet === true) {
						payLoad = {
							// "RequestId": RequestId,
							"Equnr": that.vechileId,
							"DocType": type,
							//"Content": btoa(vContent),
							"Content": vContent,
							"Filename": that.filenameLicense[type],
							"Filetype": that.filetypeLicense[type]

						};
						ImageType[type] = true;
						oDataModel.create("/FleetDocumentsSet", payLoad, {
							success: function (oEvent) {
								//debugger;
								sap.m.MessageToast.show("Successfully Uploaded Document:" + fileId);
								if (allowRefresh === true && ImageType["BIM"] === true) {
									// setTimeout('', 5000);
									// location.reload();
								} else if (ImageType["BIM"] === true) {
									allowRefresh = true;
								}
							},
							error: function (oError) {
								//debugger;
								sap.m.MessageToast.show("Error in Uploading Document:" + fileId);
								if (allowRefresh === true && ImageType["BIM"] === true) {
									// location.reload();
								} else if (ImageType["BIM"] === true) {
									allowRefresh = true;
								}
							}
						});
					} else {

						payLoad = {
							"RequestId": RequestId,
							"DocType": type,
							//"Content": btoa(vContent),
							"Content": vContent,
							"Filename": that.filenameLicense[type],
							"Filetype": that.filetypeLicense[type],
							"FleetId": that.vechileId

						};
						ImageType[type] = true;
						oDataModel.create("/FleetReqDocumentsSet", payLoad, {
							success: function (oEvent) {
								//debugger;
								const sMsg = oBundle.getText("msg10", [fileId]);
								sap.m.MessageToast.show(sMsg);
								if (allowRefresh === true && ImageType["BIM"] === true) {
									// setTimeout('', 5000);
									// location.reload();
								} else if (ImageType["BIM"] === true) {
									allowRefresh = true;
								}
							},
							error: function (oError) {
								//debugger;
								const sMsg = oBundle.getText("msg11", [fileId]);
								sap.m.MessageToast.show(sMsg);
								// sap.m.MessageToast.show("Error in Uploading Doucment:" + fileId);
								if (allowRefresh === true && ImageType["BIM"] === true) {
									// location.reload();
								} else if (ImageType["BIM"] === true) {
									allowRefresh = true;
								}
							}
						});
					}
				};
				//file reader will start reading
				reader.readAsDataURL(file);
			}
		},
		onSign: function (oEvent) {
			var dataEnt = {
				Zrecord: RequestId,
				Status: 'X'
			};
			var oDataModel = this.getOwnerComponent().getModel();
			const oBundle = this.getView().getModel("i18n").getResourceBundle();
			oDataModel.create("/UpdateDigitialSignSet", dataEnt, {
				success: function (data) {
					const sMsg = oBundle.getText("msg3", [RequestId]);
					// msg = "Vehicle Transfer Request#" + " " + RequestId + " " + "Digital Signed Successfully";
					MessageBox.success(sMsg, {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							window.history.go(-1);

						}
					});
				},
				error: function (oError) {

					const sMsg = oBundle.getText("msg2");
					MessageBox.error(sMsg, {
						actions: [sap.m.MessageBox.Action.CLOSE],
						onClose: function (sAction) {
							// location.reload();
						}
					});

				}
			});
		},
		onPress: function (oEvent) {
			//debugger;
			const oBundle = this.getView().getModel("i18n").getResourceBundle();
			var iTransferor = this.getView().byId("idempId").getValue();
			var iTransferee = this.getView().byId("idToempId").getValue();
			var iEqunr = this.getView().byId("idEmpVehicle").getText();
			var iTransferType = this.getView().byId("idTransfer").getSelectedKey();
			//var iVehicleType = this.getView().byId("idVehicleType").getSelectedKey();
			var iVehicleType = "1";
			// var iIssueType = this.getView().byId("idTypeIssue").getSelectedKey();
			if (iTransferType === "1") {
				var itoName = this.getView().byId("idToEmpName").getText();

				if (iTransferee === "" || iTransferee === undefined) {

					var text = oBundle.getText("idtoempidLabel");
					// var idto = this.getView().byId("idtoempidLabel");
					var msg = oBundle.getText("msg5");
					// var msg1 = oBundle.getText("msg4");
					// idto.setTextState(ValueState.Error);
					// idto.setValueStateText(text + " " + msg1);
					MessageBox.error(text + " " + msg, {
						actions: [sap.m.MessageBox.Action.CLOSE],

						onClose: function (sAction) {

						}
					});
					return;
				} else if (itoName === "" || itoName === undefined) {
					var text = oBundle.getText("idtoempnameLabel");
					var msg = oBundle.getText("msg5");
					MessageBox.error(text + " " + msg, {
						actions: [sap.m.MessageBox.Action.CLOSE],

						onClose: function (sAction) {

						}
					});
					return;
				}
			} else if (iTransferType === "2") {
				var iIssueType = this.onComboxValidate(oEvent, "idTypeIssue");
				if (iIssueType === "" || iIssueType === undefined) {
					return;
				}
			}
			var iPlate = this.getView().byId("idVehPlate").getText();
			if (iEqunr != "") {
				var front = this.getView().byId('idFrontUpload').getValueState();
				var left = this.getView().byId('idLeftUpload').getValueState();
				var right = this.getView().byId('idRightUpload').getValueState();
				var back = this.getView().byId('idBackUpload').getValueState();
				if (front === "Error" || left === "Error" || right === "Error" || back === "Error") {
					// msg1
					var msg = oBundle.getText("msg1");
					// sap.m.MessageToast.show(msg);
					MessageBox.error(msg, {
						actions: [sap.m.MessageBox.Action.CLOSE],

						onClose: function (sAction) {

						}
					});
					return;
				}
				var idRemark = this.getView().byId("idRemark").getValue();

				var idJack = this.onComboxValidate(oEvent, "idJack");
				if (idJack === "" || idJack === undefined) {
					return;
				}

				var idJackHandle = this.onComboxValidate(oEvent, "idJackHandle");
				if (idJackHandle === "" || idJackHandle === undefined) {
					return;
				}

				var idSpareTire = this.onComboxValidate(oEvent, "idSpareTire");
				if (idSpareTire === "" || idSpareTire === undefined) {
					return;
				}

				var idTriangle = this.onComboxValidate(oEvent, "idTriangle");
				if (idTriangle === "" || idTriangle === undefined) {
					return;
				}

				var idWheelSpanner = this.onComboxValidate(oEvent, "idWheelSpanner");
				if (idWheelSpanner === "" || idWheelSpanner === undefined) {
					return;
				}

				var idFireExtinguisher = this.onComboxValidate(oEvent, "idFireExtinguisher");
				if (idFireExtinguisher === "" || idFireExtinguisher === undefined) {
					return;
				}

				// var idAirPipe = this.onComboxValidate(oEvent, "idAirPipe", "Air Pipe");
				// if (idAirPipe === "" || idAirPipe === undefined) {
				// 	return;
				// }

				// var idRadio = this.onComboxValidate(oEvent, "idRadio", "Radio");
				// if (idRadio === "" || idRadio === undefined) {
				// 	return;
				// }

				var idFuelCap = this.onComboxValidate(oEvent, "idFuelCap");
				if (idFuelCap === "" || idFuelCap === undefined) {
					return;
				}
				// var idAirScoop = this.onComboxValidate(oEvent, "idAirScoop", "Air Scoop");
				// if (idAirScoop === "" || idAirScoop === undefined) {
				// 	return;
				// }

				var idWindScreenScratch = this.onComboxValidate(oEvent, "idWindScreenScratch");
				if (idWindScreenScratch === "" || idWindScreenScratch === undefined) {
					return;
				}

				var idFrontTireCon = this.onComboxValidate(oEvent, "idFrontTireCon");
				if (idFrontTireCon === "" || idFrontTireCon === undefined) {
					return;
				}

				var idBackTireCon = this.onComboxValidate(oEvent, "idBackTireCon");
				if (idBackTireCon === "" || idBackTireCon === undefined) {
					return;
				}

				var idLightConditions = this.onComboxValidate(oEvent, "idLightConditions");
				if (idLightConditions === "" || idLightConditions === undefined) {
					return;
				}

				var idBodyScratch = this.onComboxValidate(oEvent, "idBodyScratch");
				if (idBodyScratch === "" || idBodyScratch === undefined) {
					return;
				}

				var idMirrorRearview = this.onComboxValidate(oEvent, "idMirrorRearview");
				if (idMirrorRearview === "" || idMirrorRearview === undefined) {
					return;
				}

				var idIndecation = this.onComboxValidate(oEvent, "idIndecation");
				if (idIndecation === "" || idIndecation === undefined) {
					return;
				}

				var idTailLight = this.onComboxValidate(oEvent, "idTailLight");
				if (idTailLight === "" || idTailLight === undefined) {
					return;
				}

				var idSideLight = this.onComboxValidate(oEvent, "idSideLight");
				if (idSideLight === "" || idSideLight === undefined) {
					return;
				}

				var idNumberPlate = this.onComboxValidate(oEvent, "idNumberPlate");
				if (idNumberPlate === "" || idNumberPlate === undefined) {
					return;
				}

				var idProtectionBars = this.onComboxValidate(oEvent, "idProtectionBars");
				if (idProtectionBars === "" || idProtectionBars === undefined) {
					return;
				}

				var idIstimarah = this.onComboxValidate(oEvent, "idIstimarah");
				if (idIstimarah === "" || idIstimarah === undefined) {
					return;
				}

				var idFAHS = this.onComboxValidate(oEvent, "idFAHS");
				if (idFAHS === "" || idFAHS === undefined) {
					return;
				}

				var idFirst = this.onComboxValidate(oEvent, "idFirst");
				if (idFirst === "" || idFirst === undefined) {
					return;
				}

				var idBoxBranding = this.onComboxValidate(oEvent, "idBoxBranding");
				if (idBoxBranding === "" || idBoxBranding === undefined) {
					return;
				}

				var idCabinBranding = this.onComboxValidate(oEvent, "idCabinBranding");
				if (idCabinBranding === "" || idCabinBranding === undefined) {
					return;
				}

				var idBackBranding = this.onComboxValidate(oEvent, "idBackBranding");
				if (idBackBranding === "" || idBackBranding === undefined) {
					return;
				}

				var idTruckCondition = this.onComboxValidate(oEvent, "idTruckCondition");
				if (idTruckCondition === "" || idTruckCondition === undefined) {
					return;
				}

				var idCabinCondition = this.onComboxValidate(oEvent, "idCabinCondition");
				if (idCabinCondition === "" || idCabinCondition === undefined) {
					return;
				}
				// var idJack = this.getView().byId("idJack").getSelectedKey();
				// var idJackId = this.getView().byId("idJack");
				// if (idJack === "" || idJack === null) {
				// 	idJackId.setValueState(ValueState.Error);
				// 	idJackId.setValueStateText("Jack Selection is Madatory");
				// 	MessageBox.error("Jack is blank, request cannot be created", {
				// 		actions: [sap.m.MessageBox.Action.CLOSE],

				// 		onClose: function (sAction) {

				// 		}
				// 	});
				// 	return;
				// } else {
				// 	idJackId.setValueState(ValueState.None);
				// }

				var Entry = {
					Ztransferor: iTransferor,
					Zequnr: iEqunr,
					Ztransferee: iTransferee,
					Ztype: iTransferType,
					Zvehicletype: iVehicleType,
					Zduplicate: "",
					Zrecord: "",
					Zissuetype: iIssueType,
					ZPlate: iPlate
				};

				var that = this;
				var checkList = {
					//Zrecord: data.Zrecord,

					Zjack: idJack,
					Zjackhandle: idJackHandle,
					Zsparetype: idSpareTire,
					Ztriangle: idTriangle,
					Zwheelspanner: idWheelSpanner,
					Zfireextinguisher: idFireExtinguisher,
					// Zairpipe: idAirPipe,
					// Zradio: idRadio,
					Zfuelcap: idFuelCap,
					// Zairscoop: idAirScoop,
					Zwindscreenscratch: idWindScreenScratch,
					Ztireconditions: idFrontTireCon,
					Zlightconditions: idLightConditions,
					Zbodyscratch: idBodyScratch,
					Zmirrorrearview: idMirrorRearview,
					Zindication: idIndecation,
					Ztaillight: idTailLight,
					Zsidelight: idSideLight,
					Znumberplate: idNumberPlate,
					Zprotectionbars: idProtectionBars,
					Zistimarah: idIstimarah,
					Zfahssticker: idFAHS,
					// Zmotcards: idMOT,
					// Zbrandingquality: idBrandingQuality,
					Zremarks: idRemark,
					// Zbreakdown
					// Zaccident
					// Zperiodicinspection
					// Zposted
					// Zerror
					Zvehicleid: vehicle,
					Ztirecondback: idBackTireCon,
					ZfirstAid: idFirst,
					ZboxBrand: idBoxBranding,
					ZcabinBrand: idCabinBranding,
					ZbacksideBrand: idBackBranding,
					ZtruckCond: idTruckCondition,
					ZCabinCond: idCabinCondition

				};

				var oModel = that.getOwnerComponent().getModel();

				oModel.create("/transferCreateSet",
					Entry, {
						success: function (data) {
							// //debugger;
							if (data.Zduplicate == 'X') {

								//MessageBox.alert("A Transfer Request is already in process of approval, cannot submit new request");
								//location.reload();
								checkList.Zrecord = data.Zrecord;

								// msg = "A Transfer Request#" + " " + "'" + data.Zrecord + "'" + " " +
								// 	"is already in process of approval.\n\ cannot submit a new request";
								msg = oBundle.getText("msg18", [data.Zrecord]);
								MessageBox.error(msg, {
									actions: [sap.m.MessageBox.Action.CLOSE],
									//styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function (sAction) {
										setTimeout('', 5000);
										location.reload();
									}
								});

							} else if (data.Zduplicate != 'X') {
								// //debugger;
								RequestId = data.Zrecord;
								checkList.Zrecord = data.Zrecord;
								oModel.create("/checkListPostSet",
									checkList, {
										success: function (data) {
											var msg = oBundle.getText("msg12");
											sap.m.MessageToast.show(msg);
										},
										error: function () {
											var msg = oBundle.getText("msg13");
											sap.m.MessageToast.show(msg);
										}
									});
								that.onUploadDocument(oEvent, "idFrontUpload", "FIM", false);
								that.onUploadDocument(oEvent, "idLeftUpload", "LIM", false);
								that.onUploadDocument(oEvent, "idRightUpload", "RIM", false);
								that.onUploadDocument(oEvent, "idBackUpload", "BIM", false);

								const sMsg = oBundle.getText("msg3", [data.Zrecord]);
								//	msg = "Vehicle Transfer Request#" + " " + + " " + "Submitted";
								MessageBox.success(sMsg, {
									actions: [sap.m.MessageBox.Action.CLOSE],
									//styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function (sAction) {
										// location.reload();
										if (allowRefresh === true) {
											//debugger;
											setTimeout('', 6000);
											location.reload();
										} else {
											//debugger;
											allowRefresh = true;
										}
									}
								});

								//location.reload();
							}
						},
						error: function (oError) {
							// //debugger;
							//	MessageBox.error("Error while submitting the transfer request. Please try again");
							var msg = oBundle.getText("msg2");
							MessageBox.error(msg, {
								actions: [sap.m.MessageBox.Action.CLOSE],
								//styleClass: bCompact ? "sapUiSizeCompact" : "",
								onClose: function (sAction) {
									location.reload();
								}
							});

						}

					});

			} else {
				var msg = oBundle.getText("msg9");
				MessageBox.error(msg, {
					actions: [sap.m.MessageBox.Action.CLOSE],
					//styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						//	location.reload();
					}
				});
			}
		}
	});
});