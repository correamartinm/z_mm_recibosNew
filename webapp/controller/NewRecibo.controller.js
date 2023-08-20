sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/core/ValueState",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, FilterOperator, Filter, ValueState) {
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

      guardarDescuento: function () {
       
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



        oldData = this._onGetDataModel(oModel, oDescuentos);

         let oValue = false,
          oDescuentos = "/Descuentos";
        this.onshowDescuentoAdd(oValue);

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
            parseFloat(oImportesSuma) + parseFloat(oItems[index].Importe);
        }

        let oCantidad = "/Paso04CantidadDescuentos",
          oImporteDec = "/Paso04ImporteDescuentos";
        this._onUpdateModel(oModel, oCantidad, DataFinal.length);
        this._onUpdateModel(oModel, oImporteDec, oImportesSuma);
      },

      cancelarDescuento: function () {
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

      guardarDetalle: function () {
        let oValue = false,
          oImportesSuma = 0,
          oRetenciones = "/Detalle";
        this.onshowDetalleAdd(oValue);

        let oModel = this.getView().getModel("mockdata"),
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
          oImportePago = this.getView().byId("idImportePagoInput");
        // oNCertificado = this.getView().byId("idCertificadoRetencionInput"),

        let oldData = this._onGetDataModel(oModel, oRetenciones);

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
        this._onUpdateModel(oModel, oRetenciones, DataFinal);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
        }

        let oCantidad = "/Paso05CantidadRetenciones",
          oImporte = "/Paso05ImporteRetenciones";
        this._onUpdateModel(oModel, oCantidad, DataFinal.length);
        this._onUpdateModel(oModel, oImporte, oImportesSuma);
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

      onWizardComplete: function () {},

      onNavBack: async function () {
        this.getOwnerComponent().getTargets().display("TargetMainView");

        // let sMessage = this.i18n.getText("msgcancel"),
        //   sMessageTitle = this.i18n.getText("msgvolver");

        // this.onShowMsgBoxSucces(sMessage, sMessageTitle).then((rta) => {
        //   if (rta === "OK")
        //     this.getOwnerComponent().getTargets().display("TargetMainView");
        // });
      },
    });
  }
);
