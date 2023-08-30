sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/core/ValueState",
    "sap/m/Dialog",
    "sap/m/Button",
    "../libs/Download",
    "sap/m/MessageToast",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    FilterOperator,
    Filter,
    ValueState,
    Dialog,
    Button,
    Download,
    MessageToast
  ) {
    "use strict";

    return BaseController.extend("morixe.zfirecibos.controller.NewRecibo", {
      onInit: function () {
        this._wizard = this.byId("idWizard");

        this._oNavContainer = this.byId("wizardNavContainer");
        this._oWizardContentPage = this.byId("idRecibosPage");
      },

      // ************ Controles ****************

      _onFocusControl: function (oControl) {
        jQuery.sap.delayedCall(300, this, function () {
          oControl.focus;
        });
      },

      // ************ Control de los Pasos ****************
      // Paso Datos del Cliente

      onReciboPreliminarCheckBox: function () {
        // let oData = this._onGetDataModel("mockdata", "Cliente");
        // console.log(oData);
        // let Step = this.byId("idClienteWizardStep");
        // if (oData.Anticipo !== true) {
        //   this._wizard.invalidateStep(
        //     this.getView().byId("idPagoaCtaWizardStep")
        //   );
        // } else {
        //   this._wizard.invalidateStep(
        //     this.getView().byId("idPagoaCtaWizardStep")
        //   );
        // }
      },

      onWizardStepClienteComplete: function () {
        let oModel = this.getView().getModel("mockdata"),
          oData = this._onGetDataModel(oModel, "/Paso01Cliente");
        console.log(oData);
        let Step = this.byId("idClienteWizardStep");

        if (oData.Anticipo === true) {
          Step.setNextStep(this.getView().byId("idDetalleWizardStep"));
        } else {
          Step.setNextStep(this.getView().byId("idPagoaCtaWizardStep"));
        }
      },

      onInputRazonSocialChange: function (oEvent) {
        let oRasSoc = oEvent.getSource().getValue(),
          vObject,
          oEntidad = "/Paso01Cliente",
          oModel = this.getView().getModel("mockdata"),
          Step = this.getView().byId("idClienteWizardStep"),
          oSource = oEvent.getSource(),
          oPath = oSource
            .getSelectedItem()
            .getBindingContext("mockdata")
            .getPath();

        vObject = oModel.getObject(oPath);

        if (vObject !== undefined) {
          let dataPaso1 = {
            Codigo: vObject.Codigo,
            Domicilio: vObject.Domicilio,
            Localidad: vObject.Localidad,
            TipoIva: vObject.IVA,
            Rsocial: vObject.Rsocial,
            Cuit: vObject.Cuit,
            Observaciones: "",
            Anticipo: false,
            Recibo: false,
          };

          this._onUpdateModel(oModel, oEntidad, dataPaso1);

          this._wizard.validateStep(Step);
        } else {
          this._wizard.invalidateStep(Step);
        }
      },

      // Paso Seleccion Pagos a Cuenta
      onTablePagoCtaSelectionChange: function () {
        this._onCheckPago();
      },

      _onCheckPago: function () {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oModel = this.getView().getModel("mockdata"),
          vObject,
          oImportesSuma = 0,
          oPath,
          Data = [],
          oComprobantes = "/Paso02Seleccionados",
          oCantidad = "/Paso02CantidadPagos",
          oImporte = "/Paso02ImportePagos",
          oItems = oTable.getSelectedItems();

        if (oItems.length > 0) {
          for (var index = 0; index < oItems.length; index++) {
            oPath = oItems[index].getBindingContextPath();
            vObject = oModel.getObject(oPath);

            if (oItems[index].getSelected() === true) {
              // let  oValue = oItems[index].getCells()[6].getValue();
              Data.push(vObject);

              oImportesSuma =
                parseFloat(oImportesSuma) + parseFloat(vObject.Aplicar);
            }
          }
        }

        this._onUpdateModel(oModel, oComprobantes, Data);
        this._onUpdateModel(oModel, oCantidad, Data.length);
        this._onUpdateModel(oModel, oImporte, oImportesSuma);
      },

      // Paso Seleccion de Comprobantes

      onSearchFieldSearchComprobante: function (oEvent) {
        let oTable = oEvent.getSource().getParent().getParent(),
          oValue = oEvent.getSource().getValue(),
          oFilters = [];

        if (oValue) {
          oFilters.push(new Filter("Numero", FilterOperator.EQ, oValue));
          oTable.getBinding("items").filter([oFilters]);
        } else {
          oTable.getBinding("items").filter([oFilters]);
        }
      },

      onWizardStepComprobanteComplete: function (oEvent) {},

      onTableComprobantesSelectionChange: function (oEvent) {
        let oTable = this.getView().byId("idComprobanteTable"),
          oModel = this.getView().getModel("mockdata"),
          oItems = oTable.getItems(),
          oPath,
          oControlCheck,
          vObject;

        for (var index = 0; index < oItems.length; index++) {
          oItems[index].getCells()[6].setEnabled(oItems[index].getSelected());
          oPath = oItems[index].getBindingContextPath();
          vObject = oModel.getObject(oPath);

          if (oItems[index].getSelected() === false) {
            oItems[index].getCells()[6].setValue();
            oItems[index]
              .getCells()[6]
              .setValueState(sap.ui.core.ValueState.None);
          } else {
            // oControlCheck = await this._onCheckStock(vObject);
            oItems[index].getCells()[6].setEnabled(oItems[index].getSelected());

            if (
              oItems[index].getCells()[6].getValue() === "0" ||
              oItems[index].getCells()[6].getValue() === ""
            ) {
              oItems[index].getCells()[6].setValue(vObject.Saldo);
            }

            // oItems[index].setSelected() === false;
            oItems[index]
              .getCells()[6]
              .setValueState(sap.ui.core.ValueState.None);

            this._onFocusControl(oItems[index].getCells()[6]);
          }
        }

        this._onCheckComprobantes();
      },
      onInputImporteChange: function (oEvent) {
        let oTarget = oEvent.getSource(),
          oStockTable = this.getView().byId("idComprobanteTable"),
          oMax = oEvent.getSource().getParent().getCells()[5].getText(),
          oValue = oTarget.getValue();
        let oItem = oStockTable.getSelectedItem();

        oValue = parseFloat(oValue);
        oMax = parseFloat(oMax);

        // ************** Controlar Stock **********************

        if (oValue > 0 && oValue <= oMax) {
          oTarget.setValueState(ValueState.None);
        } else {
          oTarget.setValueState(ValueState.Warning);
        }

        this._onCheckComprobantes();
      },

      _onCheckComprobantes: function () {
        let oTable = this.getView().byId("idComprobanteTable"),
          oModel = this.getView().getModel("mockdata"),
          vObject,
          oImportesSuma = 0,
          oPath,
          Data = [],
          oComprobantes = "/Paso03Comprobantes",
          oCantidad = "/Paso03CantidadComprobantes",
          oImporte = "/Paso03ImporteComprobantes",
          oItems = oTable.getSelectedItems();

        if (oItems.length > 0) {
          for (var index = 0; index < oItems.length; index++) {
            oPath = oItems[index].getBindingContextPath();
            vObject = oModel.getObject(oPath);

            if (oItems[index].getSelected() === true) {
              // let  oValue = oItems[index].getCells()[6].getValue();
              Data.push(vObject);

              oImportesSuma =
                parseFloat(oImportesSuma) + parseFloat(vObject.Aplicar);
            }
          }
          this._wizard.validateStep(
            this.getView().byId("idComprobanteWizardStep")
          );
        } else {
          this._wizard.invalidateStep(
            this.getView().byId("idComprobanteWizardStep")
          );
        }
        this._onUpdateModel(oModel, oComprobantes, Data);
        this._onUpdateModel(oModel, oCantidad, Data.length);
        this._onUpdateModel(oModel, oImporte, oImportesSuma);
      },

      // Paso Descuentos
      onAgregarDescuentoButtonPress: function () {
        let oValue = true;
        this.onshowDescuentoAdd(oValue);
      },

      onshowDescuentoAdd: function (oValue) {
        let oModel = this.getView().getModel("layout"),
          oDescuento = "/descuentosadd",
          data = [];
        this._onUpdateModel(oModel, oDescuento, oValue);

        if (oValue === true) {
          this._wizard.invalidateStep(
            this.getView().byId("idDescuentosWizardStep")
          );
        } else {
          this._wizard.validateStep(
            this.getView().byId("idDescuentosWizardStep")
          );
        }
      },

      onGuardarButtonDescPress: function () {
        let oModel = this.getView().getModel("mockdata"),
          oNcomprobante = this.getView().byId("idComprobanteInput"),
          oFecha = this.getView().byId("idFechaDatePickerFDescuento"),
          oImporte = this.getView().byId("idImporteInput"),
          oMotivo = this.getView().byId("idMotivoInput"),
          oFile = this.getView().byId("idDescuentoFileUploader"),
          oldData = [];

        if (!oMotivo.getSelectedKey()) {
          oMotivo.setValueState(ValueState.Error);
          return;
        } else {
          oMotivo.setValueState(ValueState.None);
        }

        if (!oImporte.getValue()) {
          oImporte.setValueState(ValueState.Error);
          return;
        } else {
          oImporte.setValueState(ValueState.None);
        }

        if (!oNcomprobante.getValue()) {
          oNcomprobante.setValueState(ValueState.Error);
          return;
        } else {
          oNcomprobante.setValueState(ValueState.None);
        }

        if (!oFecha.getDateValue()) {
          oFecha.setValueState(ValueState.Error);
          return;
        } else {
          oFecha.setValueState(ValueState.None);
        }

        if (!oFile.getValue()) {
          oFile.setValueState(ValueState.Error);
          return;
        } else {
          oFile.setValueState(ValueState.None);
        }

        let oValue = false,
          oImportesSuma,
          oDescuentos = "/Descuentos";
        this.onshowDescuentoAdd(oValue);

        oldData = this._onGetDataModel(oModel, oDescuentos);

        let oDatos = {
          Motivokey: oMotivo.getSelectedKey(),
          MotivoDesc: oMotivo.getSelectedItem().getText(),
          NComprobante: parseFloat(oNcomprobante.getValue()),
          Fecha: oFecha.getDateValue(),
          Importe: parseFloat(oImporte.getValue()),
        };
        let DataFinal = oldData.concat(oDatos);

        this._onUpdateModel(oModel, oDescuentos, DataFinal);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
        }

        let oCantidad = "/Paso04CantidadDescuentos",
          oImporteDec = "/Paso04ImporteDescuentos";
        this._onUpdateModel(oModel, oCantidad, DataFinal.length);
        this._onUpdateModel(oModel, oImporteDec, oImportesSuma);
      },

      onVolverButtonCancelarDescPress: function () {
        let oValue = false;
        this.onshowDescuentoAdd(oValue);
      },

      // Paso Retenciones

      onAgregarRetencionesButtonPress: function () {
        let oValue = true;
        this.onshowRetencionesAdd(oValue);
      },

      onshowRetencionesAdd: function (oValue) {
        let oModel = this.getView().getModel("layout"),
          oDescuento = "/retencionesadd",
          data = [];
        this._onUpdateModel(oModel, oDescuento, oValue);

        if (oValue === true) {
          this._wizard.invalidateStep(
            this.getView().byId("idRetencionesWizardStep")
          );
        } else {
          this._wizard.validateStep(
            this.getView().byId("idRetencionesWizardStep")
          );
        }
      },

      guardarRetencion: function () {
        let oModel = this.getView().getModel("mockdata"),
          oTipo = this.getView().byId("idTipoRetencionInput"),
          oFecha = this.getView().byId("idFechaDatePickerFRetencion"),
          oImporte = this.getView().byId("idImporteRetencionInput"),
          oNCertificado = this.getView().byId("idCertificadoRetencionInput"),
          oFile = this.getView().byId("idRetencionesFileUploader"),
          oldData = [];

        if (!oTipo.getSelectedKey()) {
          oTipo.setValueState(ValueState.Error);
          return;
        } else {
          oTipo.setValueState(ValueState.None);
        }

        if (!oImporte.getValue()) {
          oImporte.setValueState(ValueState.Error);
          return;
        } else {
          oImporte.setValueState(ValueState.None);
        }

        if (!oNCertificado.getValue()) {
          oNCertificado.setValueState(ValueState.Error);
          return;
        } else {
          oNCertificado.setValueState(ValueState.None);
        }

        if (!oFecha.getDateValue()) {
          oFecha.setValueState(ValueState.Error);
          return;
        } else {
          oFecha.setValueState(ValueState.None);
        }

        if (!oFile.getValue()) {
          oFile.setValueState(ValueState.Error);
          return;
        } else {
          oFile.setValueState(ValueState.None);
        }

        oldData = this._onGetDataModel(oModel, oRetenciones);

        let oDatos = {
          Tipokey: oTipo.getSelectedKey(),
          TipoDesc: oTipo.getSelectedItem().getText(),
          NCertificado: parseFloat(oNCertificado.getValue()),
          Fecha: oFecha.getDateValue(),
          Importe: parseFloat(oImporte.getValue()),
        };
        let DataFinal = oldData.concat(oDatos);
        this._onUpdateModel(oModel, oRetenciones, DataFinal);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(oItems[index].Importe);
        }

        let oCantidad = "/Paso05CantidadRetenciones",
          oImporteRet = "/Paso05ImporteRetenciones";
        this._onUpdateModel(oModel, oCantidad, DataFinal.length);
        this._onUpdateModel(oModel, oImporteRet, oImportesSuma);

        let oValue = false,
          oRetenciones = "/Retenciones";
        this.onshowRetencionesAdd(oValue);
      },

      cancelarRetencion: function () {
        let oValue = false;
        this.onshowRetencionesAdd(oValue);
      },

      // Paso Detalle  (Seleccion de Madios de Pago)

      onAgregarDetalleButtonPress: function () {
        let oValue = true;
        this.onshowDetalleAdd(oValue);
      },

      onInputTipoPagoChange: function (oEvent) {
        let vObject,
          oEntidad = "/ActiveMP",
          oModel = this.getView().getModel("mockdata"),
          Step = this.getView().byId("idClienteWizardStep"),
          oSource = oEvent.getSource(),
          oPath = oSource
            .getSelectedItem()
            .getBindingContext("mockdata")
            .getPath();

        vObject = oModel.getObject(oPath);

        this._onUpdateModel(oModel, oEntidad, vObject);

        // this._wizard.validateStep(Step);
      },

      onshowDetalleAdd: function (oValue) {
        let oModel = this.getView().getModel("layout"),
          oDescuento = "/detalleadd",
          data = [];
        this._onUpdateModel(oModel, oDescuento, oValue);

        if (oValue === true) {
          this._wizard.invalidateStep(
            this.getView().byId("idDetalleWizardStep")
          );
        } else {
          this._wizard.validateStep(this.getView().byId("idDetalleWizardStep"));
        }
      },

      onGuardarButtonDetallePress: function () {
        let oModel = this.getView().getModel("mockdata"),
          oLayoutModel = this.getView().getModel("layout"),
          oMP = this.getView().byId("idMedioPago"),
          oCheque = this.getView().byId("idNumeroChequeInput"),
          oCbte = this.getView().byId("idComprobantePagoInput"),
          oBcoDestino = this.getView().byId("idBancoDestinoInput"),
          oBcoEmisor = this.getView().byId("idBcoEmisorInput"),
          oFechaDeposito = this.getView().byId("idFechaDatePickerFDeposito"),
          oFechaEmision = this.getView().byId("idFechaDatePickerFEmision"),
          oFechaVencimiento = this.getView().byId(
            "idFechaDatePickerFVencimiento"
          ),
          oImportePago = this.getView().byId("idImportePagoInput"),
          oFile = this.getView().byId(""),
          oFileCheque = this.getView().byId("");

        let MpKey = this._onGetDataModel(oLayoutModel, "/MpKey");
        let MpKValidate = this._onGetDataModel(oModel, "/ActiveMP");

        // ********* Fijos
        if (!oMP.getSelectedKey()) {
          oMP.setValueState(ValueState.Error);
          return;
        } else {
          oMP.setValueState(ValueState.None);
        }

        if (!oImportePago.getValue()) {
          oImportePago.setValueState(ValueState.Error);
          return;
        } else {
          oImportePago.setValueState(ValueState.None);
        }

        //***** Segun MP Seleccionado */

        if (MpKValidate.DetCbte === true) {
          if (!oCbte.getValue()) {
            oCbte.setValueState(ValueState.Error);
            return;
          } else {
            oCbte.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.FecCbte === true) {
          if (!oFechaDeposito.getDateValue()) {
            oFechaDeposito.setValueState(ValueState.Error);
            return;
          } else {
            oFechaDeposito.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.FecVto === true) {
          if (!oFechaVencimiento.getDateValue()) {
            oFechaVencimiento.setValueState(ValueState.Error);
            return;
          } else {
            oFechaVencimiento.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.NroCheq === true) {
          if (!oCheque.getValue()) {
            oCheque.setValueState(ValueState.Error);
            return;
          } else {
            oCheque.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.Adjunto === true) {
          if (!oFile.getValue()) {
            oFile.setValueState(ValueState.Error);
            return;
          } else {
            oFile.setValueState(ValueState.None);
          }

          if (!oFileCheque.getValue()) {
            oFileCheque.setValueState(ValueState.Error);
            return;
          } else {
            oFoFileChequeile.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.FecEmis === true) {
          if (!oFechaEmision.getDateValue()) {
            oFechaEmision.setValueState(ValueState.Error);
            return;
          } else {
            oFechaEmision.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.BcoEmi === true) {
          if (!oBcoEmisor.getValue()) {
            oBcoEmisor.setValueState(ValueState.Error);
            return;
          } else {
            oBcoEmisor.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.BcoDes === true && MpKValidate.BcoDesReq === true) {
          if (!oBcoDestino.getValue()) {
            oBcoDestino.setValueState(ValueState.Error);
            return;
          } else {
            oBcoDestino.setValueState(ValueState.None);
          }
        }

        let oDetalle = "/Detalle",
          oImportesSuma = 0;

        let oldData = this._onGetDataModel(oModel, oDetalle);

        let oDatos = {
          Tipo: oMP.getSelectedKey(),
          TipoDesc: oMP.getSelectedItem().getText(),
          NroCbte: oCbte.getValue(),
          NroCheque: oCheque.getValue(),
          FechaVto: oFechaVencimiento.getDateValue(),
          FechaDto: oFechaDeposito.getDateValue(),
          FechaEmi: oFechaEmision.getDateValue(),
          BcoDestino: oBcoDestino.getValue(),
          BcoEmisor: oBcoEmisor.getValue(),
          Importe: parseFloat(oImportePago.getValue()),
        };
        let DataFinal = oldData.concat(oDatos);
        this._onUpdateModel(oModel, oDetalle, DataFinal);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
        }

        let oValue = false;
        this.onshowDetalleAdd(oValue);

        let oCantidad = "/Paso06Detalles",
          oImporte = "/Paso06ImporteDetalle";
        this._onUpdateModel(oModel, oCantidad, DataFinal.length);
        this._onUpdateModel(oModel, oImporte, oImportesSuma);
      },
      _onResetDetalleValues: function name() {
        let oModel = this.getView().getModel("mockdata"),
          oLayoutModel = this.getView().getModel("layout"),
          ActiveMP = {
            key: 1,
            Desc: "Efectivo",
            DetCbte: false,
            FecCbte: false,
            NroCheq: false,
            Adjunto: false,
            FecEmis: false,
            FecVto: false,
            BcoEmi: false,
            BcoDes: false,
            BcoDesReq: false,
          };

        this._onUpdateModel(oModel, "/ActiveMP", ActiveMP);
        this._onUpdateModel(oLayoutModel, "/MpKey", ActiveMP.key);
      },

      cancelarDetlles: function () {
        this._onResetDetalleValues();
        let oValue = false;
        this.onshowDetalleAdd(oValue);
      },

      // Photo

      capturePic: function () {
        var that = this;
        this.cameraDialog = new Dialog({
          title: this._i18n().getText("dlgtitle"),
          beginButton: new Button({
            text: this._i18n().getText("lblsacarfoto"),
            press: function (oEvent) {
              that.imageValue = document.getElementById("player");
              var oButton = oEvent.getSource();
              that.imageText = oButton.getParent().getContent()[1].getValue();
              that.cameraDialog.close();
            },
          }),
          content: [
            new sap.ui.core.HTML({
              content: "<video id='player' autoplay></video>",
            }),
            new sap.m.Input({
              placeholder: "Please input image text here",
              required: true,
            }),
          ],
          endButton: new Button({
            text: this._i18n().getText("btnvolver"),
            press: function () {
              that.cameraDialog.close();
            },
          }),
        });
        this.getView().addDependent(this.cameraDialog);
        this.cameraDialog.open();
        this.cameraDialog.attachBeforeClose(this.setImage, this);
        if (navigator.mdeiaDevices) {
          navigator.mediaDevices
            .getUserMedia({
              video: true,
            })
            .then(function (stream) {
              player.srcObject = stream;
            });
        }
      },

      setImage: function () {
        var oVBox = this.getView().byId("vBox1");
        var oItems = oVBox.getItems();
        var imageId = "archie-" + oItems.length;
        var fileName = this.imageText;
        var imageValue = this.imageValue;
        if (imageValue == null) {
          MessageToast.show("No image captured");
        } else {
          var oCanvas = new sap.ui.core.HTML({
            content:
              "<canvas id='" +
              imageId +
              "' width='320px' height='320px' " +
              " style='2px solid red'></canvas> ",
          });
          var snapShotCanvas;

          oVBox.addItem(oCanvas);
          oCanvas.addEventDelegate({
            onAfterRendering: function () {
              snapShotCanvas = document.getElementById(imageId);
              var oContext = snapShotCanvas.getContext("2d");
              oContext.drawImage(
                imageValue,
                0,
                0,
                snapShotCanvas.width,
                snapShotCanvas.height
              );
              var imageData = snapShotCanvas.toDataURL("image/png");
              var imageBase64 = imageData.substring(imageData.indexOf(",") + 1);
              //	window.open(imageData);  --Use this if you dont want to use third party download.js file
              download(imageData, fileName + ".png", "image/png");
            },
          });
        }
      },

      onButtonDeletePayPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject();

        let oTarget = oEvent.getSource(),
          // oMaterialCod = oItem.codMaterial,
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Detalle");

        // let oMaterialExist = oAddedData.findIndex(function (oMaterial) {
        //   return oMaterial.codMaterial === oMaterialCod;
        // });

        // if (oAddedData.length > 1) {
        //   let removed = oAddedData.splice(oMaterialExist, 1);
        //   oModel.setProperty("/Detalle", oAddedData);
        // } else {
        //   oModel.setProperty("/Detalle", []);
        //   this._onCheckTableItems();
        // }

        oModel.refresh();
      },

      onWizardStepDetalleActivate: function () {
        // let oModel = this.getView().getModel("mockdata"),
        //   oData = this._onGetDataModel("mockdata", "/Paso01Cliente");
        // console.log(oData);
        // let Step = this.byId("idClienteWizardStep");
        // if (oData.Anticipo === true) {
        //   this._wizard.invalidateStep(
        //     this.getView().byId("idDetalleWizardStep")
        //   );
        // } else {
        //   this._wizard.invalidateStep(
        //     this.getView().byId("idDetalleWizardStep")
        //   );
        // }
      },

      onWizardStepDetalleComplete: function (params) {
        this._oNavContainer.to(this.byId("idwizardReviewPage"));
      },

      onNavtoStep2: function (oEvent) {
        this.onWizardStepClienteComplete();
        // this._handleNavigationToStep(2);
      },

      _handleNavigationToStep: function (iStepNumber) {
        var fnAfterNavigate = function () {
          this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
          this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
        }.bind(this);

        this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
        this._backToWizardContent();
      },

      _backToWizardContent: function () {
        this._oNavContainer.backToPage(this._oWizardContentPage.getId());
      },

      wizardCompletedHandler: function () {
        this._oNavContainer.to(this.byId("idwizardReviewPage"));
      },

      discardProgress: function () {
        this._wizard.discardProgress(this.byId("idClienteWizardStep"));

        var clearContent = function (content) {
          for (var i = 0; i < content.length; i++) {
            if (content[i].setValue) {
              content[i].setValue("");
            }

            if (content[i].getContent) {
              clearContent(content[i].getContent());
            }
          }
        };
        clearContent(this._wizard.getSteps());
      },

      // Impresion *****************************

      onPrint: function (oTk, oStd) {
        var oModel = this.getView().getModel(),
          oKey = oModel.createKey("/ImpresionSet", {
            Numero: oTk,
            Estado: oStd,
          });

        oModel.read(oKey, {
          success: function (oData) {
            if (oData2.Tipo !== "E") {
              window.open(oData.Url);
            }
          }.bind(this),
          error: function (oError) {
            MessageBox.information("ERROR EN IMPRESION");
          },
        });
      },

      onWizardComplete: function () {},

      onConfirmarReciboButtonPress: function () {},
      onAnularButtonPress: function () {
        this.discardProgress();
      },

      onNavBack: async function () {
        // this.getOwnerComponent().getTargets().display("TargetMainView");

        let sMessage = this._i18n().getText("msgcancel"),
          sMessageTitle = this._i18n().getText("msgvolver");

        this._onShowMsgBoxConfirm(sMessage, sMessageTitle).then((rta) => {
          if (rta === "OK") this.discardProgress();
          this.getOwnerComponent().getTargets().display("TargetMainView");
        });
      },
    });
  }
);
