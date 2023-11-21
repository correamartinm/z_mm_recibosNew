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
    let rtaP2, rtaP3, rtaP4, rtaP5, rtaP6;
    ("use strict");

    return BaseController.extend("morixe.zfirecibos.controller.NewRecibo", {
      onInit: function () {
        this._wizard = this.byId("idWizard");

        this._oNavContainer = this.byId("wizardNavContainer");
        this._oWizardContentPage = this.byId("idRecibosPage");
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        let oTarget = oRouter.getTarget("TargetNewRecibo");
        oTarget.attachDisplay(this._onObjectMatched, this);
      },

      _onObjectMatched: function () {
        this._onValidateStep();

        this._oNavContainer.to(this.byId("idRecibosPage"));
      },

      // ************ Control de los Pasos ****************

      // ********************************************
      // Paso Datos del Cliente
      // ********************************************

      onReciboPreliminarCheckBox: function (oEvent) {
        let oMockModel = this.getView().getModel("mockdata"),
          oData = oMockModel.getProperty("/Paso01Cliente"),
          oSourceName = oEvent.getSource().getName(),
          oSource = oEvent.getSource();

        if (oSourceName === "Anticipo") {
          if (oSource.getSelected() === true) {
            oData.Recibo = false;
          }
        } else {
          if (oSource.getSelected() === true) {
            oData.Anticipo = false;
          }
        }

        oMockModel.setProperty("/Paso01Cliente", oData);
      },
      _onValidateStep: function () {
        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          Step = this.getView().byId("idClienteWizardStep"),
          oData = oMockModel.getProperty("/Paso01Cliente");

        if (oData.Codigo !== "") {
          this._wizard.validateStep(Step);
        } else {
          this._wizard.invalidateStep(Step);
        }
      },

      onGuardarButtonClientePress: async function () {
        let oMockModel = this.getView().getModel("mockdata"),
          oEntidad = "/DocumentosSet",
          oTipoCte,
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oData = oMockModel.getProperty("/Paso01Cliente");

        let Step = this.byId("idClienteWizardStep");

        if (oData.Anticipo === true) {
          oTipoCte = "A";
        } else if (oData.Recibo === true) {
          oTipoCte = "R";
        }

        if (oData !== undefined) {
          let oPayload = {
            Cliente: oData.Codigo,
            Comentarios: oData.Observaciones,
            Accion: oData.Accion,
            TipoComprobante: oTipoCte,
          };

          if (oData.Anticipo === true) {
            Step.setNextStep(this.getView().byId("idDetalleWizardStep"));
          } else {
            Step.setNextStep(this.getView().byId("idPagoaCtaWizardStep"));
          }

          let rta = await this._oncreateModel(
            oModel,
            oView,
            oEntidad,
            oPayload
          );
          console.log(rta);
          if (rta.Mensaje !== "") {
            oData.Completo = false;
            oData.Mensaje = rta.Mensaje;
            oMockModel.setProperty("/Paso01Cliente", oData);

            this._onValidateStep();
          }
        }
      },

      onInputRazonSocialChange: async function (oEvent) {
        let vObject,
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oModel = this.getOwnerComponent().getModel(),
          oSource = oEvent.getSource(),
          anticipo,
          recibo,
          oData = oMockModel.getProperty("/Paso01Cliente"),
          oPath = oSource.getSelectedItem().getBindingContext().getPath();

        let oView = this.getView(),
          oEntidad2 = "/PagoCuentaSet",
          oEntidad = "/ComprobantesSet";

        let oResponseModel = await this._onreadModel(oModel, oView, oPath);

        if (oResponseModel.Rta !== "OK") {
          vObject = [];

          let sMessage =
          oResponseModel.Data.message +
              " : " +
              oResponseModel.Data.statusCode +
              " - " +
              oResponseModel.Data.statusText,
            sMessageTitle = this._i18n().getText("msgerror");

          this._onShowMsgBoxError(sMessage, sMessageTitle).then((rta) => {
            oMockModel.setProperty("/Paso01Cliente", {});
            return;
          });
        } else {
          vObject = oResponseModel.Data;

          var oFilters = new Array();

          let oFiltro = new sap.ui.model.Filter({
            path: "Cliente",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: vObject.Codigo,
          });
          oFilters.push(oFiltro);

          let oComprobantesControl = await this._onfilterModel(
            oModel,
            oView,
            oEntidad,
            oFilters
          );

          if (oComprobantesControl.results.length === 0) {
            // Directo a Detalle de pagos
            anticipo = true;
            recibo = false;
            oMockModel.setProperty("/NoComprobantes", true);
          } else {
            oMockModel.setProperty("/Paso3Data", oComprobantesControl.results);
            anticipo = false;
            recibo = false;
            oMockModel.setProperty("/NoComprobantes", false);
          }

          let oPagosaCtaControl = await this._onfilterModel(
            oModel,
            oView,
            oEntidad2,
            oFilters
          );

          if (oPagosaCtaControl.results.length !== 0) {
            oMockModel.setProperty("/Paso2Data", oPagosaCtaControl.results);
          }

          let oPayload = {
            Codigo: vObject.Codigo,
            RazonSocial: vObject.RazonSocial,
            Domicilio: vObject.Domicilio,
            Localidad: vObject.Localidad,
            TipoIva: vObject.TipoIVA,
            Cuit: vObject.Cuit,
            Observaciones: vObject.Observaciones,
            Accion: "C",
            Anticipo: anticipo,
            Recibo: recibo,
            TipoComprobante: vObject.TipoComprobante,
          };

          oMockModel.setProperty("/Paso01Cliente", oPayload);
        }
        // ******** Hay documentos para el Cliente ???
      },
      onWizardStepClienteComplete: async function () {
        this.onFilterTableCbtes02();
        this._onCheckPago();
      },

      // ********************************************
      // Paso Seleccion Pagos a Cuenta --------------
      // ********************************************

      onSearchFieldSearchPagoCta: function (oEvent) {
        let oTable = oEvent.getSource().getParent().getParent(),
          oValue = oEvent.getSource().getValue(),
          oFilters = [];

        if (oValue) {
          oFilters.push(new Filter("Numero", FilterOperator.Contains, oValue));
          oTable.getBinding("items").filter([oFilters]);
        } else {
          oTable.getBinding("items").filter([oFilters]);
        }
      },

      onFilterTableCbtes02: function () {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oCliente = oMockModel.getProperty("/Paso01Cliente"),
          oCCodigo = oCliente.Codigo,
          oFilters = [];
        oFilters.push(new Filter("Cliente", FilterOperator.Contains, oCCodigo));

        //        oFilters.push(new Filter("Tipo", FilterOperator.EQ, oCliente.Codigo));
        if (oTable.getItems() > 0)
          oTable.getBinding("items").filter([oFilters]);
      },

      onTablePagoCtaSelectionChange: function (oEvent) {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oModel = this.getView().getModel("mockdata"),
          oItems = oTable.getItems(),
          oPath,
          oControlCheck,
          vObject;

        for (var index = 0; index < oItems.length; index++) {
          oItems[index].getCells()[5].setEnabled(oItems[index].getSelected());
          oPath = oItems[index].getBindingContextPath();
          vObject = oModel.getObject(oPath);

          if (oItems[index].getSelected() === false) {
            oItems[index].getCells()[5].setValue();
            oItems[index]
              .getCells()[5]
              .setValueState(sap.ui.core.ValueState.None);
          } else {
            oItems[index].getCells()[5].setEnabled(oItems[index].getSelected());

            if (
              oItems[index].getCells()[5].getValue() === "0.00" ||
              oItems[index].getCells()[5].getValue() === ""
            ) {
              if (parseFloat(vObject.Saldo) > 0) {
                oItems[index].getCells()[5].setValue(vObject.Saldo);
              } else {
                oItems[index]
                  .getCells()[5]
                  .setValue(parseFloat(vObject.Saldo) * -1);
              }
              vObject.Aplicado = oItems[index].getCells()[5].getValue();
            }

            oItems[index]
              .getCells()[5]
              .setValueState(sap.ui.core.ValueState.None);

            this._onFocusControl(oItems[index].getCells()[5]);
          }
        }
        this._onCheckPago();
      },

      _onCheckPago: function () {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oMockModel = this.getView().getModel("mockdata"),
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
            vObject = oMockModel.getObject(oPath);

            if (oItems[index].getSelected() === true) {
              // let  oValue = oItems[index].getCells()[6].getValue();
              Data.push(vObject);
              Data.NroLinea = index;
              oImportesSuma =
                parseFloat(oImportesSuma) + parseFloat(vObject.Aplicado);
            }
          }

          oMockModel.setProperty(oComprobantes, Data);
          oMockModel.setProperty(oCantidad, Data.length);
          oMockModel.setProperty(oImporte, oImportesSuma);
        } else {
          oMockModel.setProperty(oComprobantes, []);
          oMockModel.setProperty(oCantidad, 0);
          oMockModel.setProperty(oImporte, 0);
        }

        if (Data.length === 0) {
          this._wizard.validateStep(
            this.getView().byId("idPagoaCtaWizardStep")
          );
        } else {
          this._wizard.invalidateStep(
            this.getView().byId("idPagoaCtaWizardStep")
          );
        }
      },

      onInputImporteChangePagos: function (oEvent) {
        let oTarget = oEvent.getSource(),
          oStockTable = this.getView().byId("idPagoCtaTable"),
          oMax = oEvent.getSource().getParent().getCells()[3].getText(),
          oValue = oTarget.getValue();
        let oItem = oStockTable.getSelectedItem();

        oValue = parseFloat(oValue);
        oMax = parseFloat(oMax);

        if (oValue > 0 && oValue <= oMax) {
          oTarget.setValueState(ValueState.None);
        } else {
          oTarget.setValueState(ValueState.Warning);
        }

        this._onCheckPago();
      },

      onGuardarButtonPagoAdicionalPress: async function () {
        let oEntidad = "/Paso02Seleccionados",
          Tipo = "ACTA",
          Step = "idPagoaCtaWizardStep";

        this._onGuardar(oEntidad, Tipo, Step);
      },

      _onGuardar: async function (oEntidad, Tipo, Step) {
        let oMockModel = this.getView().getModel("mockdata"),
          oView = this.getView(),
          oModel = this.getOwnerComponent().getModel(),
          oItems = oMockModel.getProperty(oEntidad);

        for (var index = 0; index < oItems.length; index++) {
          oItems[index].TipoLinea = Tipo;
          oItems[index].NroLinea = index;
          rtaP2 = await this._onSaveData(oModel, oView, oItems[index]);

          if (Step !== "END") {
            if (rtaP2 !== "") {
              this._wizard.validateStep(this.getView().byId(Step));
            } else {
              this._wizard.invalidateStep(this.getView().byId(Step));
            }
          } else {
            if (rtaP2 !== "") {
              let sMessage = rtaP2.Mensaje,
                oMockModel = this.getView().getModel("mockdata"),
                sMessageTitle = this._i18n().getText("msgmsgokvolver");

              this._onShowMsgBoxSucces(sMessage, sMessageTitle).then((rta) => {
                if (rta === "OK") this.discardProgress();
                oMockModel.setProperty("/NoComprobantes", false);
                this.getOwnerComponent().getTargets().display("TargetMainView");
              });
            }
          }
        }
      },

      onWizardStepPagosComplete: function () {},

      // ********************************************
      // Paso Seleccion de Comprobantes --------------
      // ********************************************
      // onFilterTableCbtes03: function () {
      //   let oTable = this.getView().byId("idPagoCtaTable"),
      //     oMockModel = this.getOwnerComponent().getModel("mockdata"),
      //     oModel = this.getOwnerComponent().getModel(),
      //     oCliente = oMockModel.getProperty("/Paso01Cliente"),
      //     oFilters;
      //   oFilters.push(
      //     new Filter("Cliente", FilterOperator.EQ, oCliente.Codigo)
      //   );

      //   oTable.getBinding("items").filter([oFilters]);
      // },

      onSearchFieldSearchComprobante: function (oEvent) {
        let oTable = oEvent.getSource().getParent().getParent(),
          oValue = oEvent.getSource().getValue(),
          oFilters = [];

        if (oValue) {
          oFilters.push(new Filter("Numero", FilterOperator.Contains, oValue));
          oTable.getBinding("items").filter([oFilters]);
        } else {
          oTable.getBinding("items").filter([oFilters]);
        }
      },

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
            oItems[index].getCells()[6].setEnabled(oItems[index].getSelected());

            if (
              oItems[index].getCells()[6].getValue() === "0.00" ||
              oItems[index].getCells()[6].getValue() === ""
            ) {
              if (parseFloat(vObject.Saldo) > 0) {
                oItems[index].getCells()[6].setValue(vObject.Saldo);
              } else {
                oItems[index]
                  .getCells()[6]
                  .setValue(parseFloat(vObject.Saldo) * -1);
              }
            }

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

        if (oValue > 0 && oValue <= oMax) {
          oTarget.setValueState(ValueState.None);
        } else {
          oTarget.setValueState(ValueState.Warning);
        }

        this._onCheckComprobantes();
      },

      _onCheckComprobantes: function () {
        let oTable = this.getView().byId("idComprobanteTable"),
          oMockModel = this.getView().getModel("mockdata"),
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
            vObject = oMockModel.getObject(oPath);

            if (oItems[index].getSelected() === true) {
              Data.push(vObject);
              Data.NroLinea = index;
              oImportesSuma =
                parseFloat(oImportesSuma) + parseFloat(vObject.Aplicado);
            }
          }
        }
        oMockModel.setProperty(oComprobantes, Data);
        oMockModel.setProperty(oCantidad, Data.length);
        oMockModel.setProperty(oImporte, oImportesSuma);
      },
      onGuardarButtonComprobantesPress: function () {
        let oEntidad = "/Paso03Comprobantes",
          Tipo = "APLIC",
          Step = "idComprobanteWizardStep";

        this._onGuardar(oEntidad, Tipo, Step);
      },
      onWizardStepComprobanteComplete: function (oEvent) {},

      // ********************************************
      // Paso Descuentos ---------------------------
      // ********************************************

      onAgregarDescuentoButtonPress: function () {
        let oValue = true;
        let ActiveDescuento = {
          NComprobante: "",
          Fecha: null,
          Importe: "",
          Motivo: "",
          MotivoDesc: "",
          UpdPath: "",
        };

        this._onshowDescuentoAdd(oValue, ActiveDescuento);
      },

      _onshowDescuentoAdd: function (oValue, Object) {
        let oMockModel = this.getView().getModel("mockdata"),
          oModel = this.getView().getModel("layout"),
          oMotivo = this.getView().byId("idMotivoInput"),
          oDescuento = "/descuentosadd",
          data = [];

        this._onUpdateModel(oModel, oDescuento, oValue);

        // oMotivo.setSelectedKey(Object.Motivokey);
        oMockModel.setProperty("/ActiveDescuento", Object);

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
          oPostDataDescuento = oModel.getProperty("/ActiveDescuento"),
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

        // if (!oFile.getValue()) {
        //   oFile.setValueState(ValueState.Error);
        //   return;
        // } else {
        //   oFile.setValueState(ValueState.None);
        // }

        let oValue = false,
          oImportesSuma = 0,
          oRetenciones = "/Descuentos";

        oldData = this._onGetDataModel(oModel, oRetenciones);

        let oDatos = {
          Motivokey: oMotivo.getSelectedKey(),
          MotivoDesc: oMotivo.getSelectedItem().getText(),
          NComprobante: parseFloat(oNcomprobante.getValue()),
          Fecha: oFecha.getDateValue(),
          Importe: parseFloat(oImporte.getValue()),
          Codigo: oMotivo.getSelectedKey(),
          Descripcion: oMotivo.getSelectedItem().getText(),
          Numero: oNcomprobante.getValue(),
        };
        let DataFinal = oldData.concat(oDatos);

        this._onshowDescuentoAdd(oValue, []);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
          DataFinal.NroLinea = index;
        }

        oModel.setProperty(oRetenciones, DataFinal);
        let oCantidad = "/Paso04CantidadDescuentos",
          oImporteDec = "/Paso04ImporteDescuentos";
        oModel.setProperty(oCantidad, DataFinal.length);
        oModel.setProperty(oImporteDec, oImportesSuma);

        if (oPostDataDescuento.UpdPath !== "") {
          this.onButtonDeleteDescuentoPress(oPostDataDescuento.UpdPath);
        }
      },
      onGuardarButtonDescSavePress: function () {
        let oEntidad = "/Descuentos",
          Tipo = "DESC",
          Step = "idDescuentosWizardStep";

        this._onGuardar(oEntidad, Tipo, Step);
      },

      onVolverButtonCancelarDescPress: function () {
        let oValue = false;
        this._onshowDescuentoAdd(oValue, []);
      },

      onButtonDeleteDescuentoPressMsg: function (oEvent) {
        let oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject(),
          sMessage =
            this._i18n().getText("lblnumcomprobante") +
            ": " +
            oItem.NComprobante +
            " " +
            this._i18n().getText("lblimpor") +
            ": " +
            oItem.Importe,
          sMessageTitle = this._i18n().getText("msgdelete");

        this._onShowMsgBoxConfirm(sMessage, sMessageTitle).then((rta) => {
          if (rta === "OK") {
            this.onButtonDeleteDescuentoPress(oPath);
          }
        });
      },

      onButtonEditaDescuentoPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject();
        oItem.UpdPath = oPath;

        this._onshowDescuentoAdd(true, oItem);
      },

      onUploadDescuento: function () {
        let oFile = this.getView().byId("idDescuentoFileUploader");
      },

      onButtonDeleteDescuentoPress: function (oPath) {
        let oModel = this.getView().getModel("mockdata"),
          oItem = oModel.getObject(oPath),
          oCertNro = oItem.Codigo,
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Descuentos");

        let oRetencionExist = oAddedData.findIndex(function (oRetenciones) {
          return oRetenciones.Codigo === oCertNro;
        });

        if (oAddedData.length > 1) {
          let removed = oAddedData.splice(oRetencionExist, 1);
          oModel.setProperty("/Descuentos", oAddedData);
        } else {
          oModel.setProperty("/Descuentos", []);
        }

        oModel.refresh();
      },

      // ********************************************
      // Paso Retenciones ------------------------
      // ********************************************

      onAgregarRetencionesButtonPress: function () {
        let oValue = true,
          ActiveRetencion = {
            Tipokey: "",
            TipoDesc: "",
            NCertificado: "",
            Fecha: null,
            Importe: "",
            UpdPath: "",
          };

        this._onshowRetencionesAdd(oValue, ActiveRetencion);
      },

      _onshowRetencionesAdd: function (oValue, Object) {
        let oLayModel = this.getView().getModel("layout"),
          oMockModel = this.getOwnerComponent().getModel("mockdata");

        oMockModel.setProperty("/ActiveRetencion", Object);
        oLayModel.setProperty("/retencionesadd", oValue);

        // if (oValue === true) {
        //   this._wizard.invalidateStep(
        //     this.getView().byId("idRetencionesWizardStep")
        //   );
        // } else {
        //   this._wizard.validateStep(
        //     this.getView().byId("idRetencionesWizardStep")
        //   );
        // }
      },

      guardarRetencion: function () {
        let oModel = this.getView().getModel("mockdata"),
          oTipo = this.getView().byId("idTipoRetencionInput"),
          oFecha = this.getView().byId("idFechaDatePickerFRetencion"),
          oImporte = this.getView().byId("idImporteRetencionInput"),
          oNCertificado = this.getView().byId("idCertificadoRetencionInput"),
          oFile = this.getView().byId("idRetencionesFileUploader"),
          oImportesSuma = 0,
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
          // oFile.setValueState(ValueState.Error);
          // return;
        } else {
          oFile.setValueState(ValueState.None);
        }

        oldData = oModel.getProperty("/Retenciones");

        let oActiveRetencion = oModel.getProperty("/ActiveRetencion");
        let oDatos = {
          Tipokey: oTipo.getSelectedKey(),
          TipoDesc: oTipo.getSelectedItem().getText(),
          NCertificado: parseFloat(oNCertificado.getValue()),
          Fecha: oFecha.getDateValue(),
          Importe: parseFloat(oImporte.getValue()),
          Codigo: oTipo.getSelectedKey(),
          Descripcion: oTipo.getSelectedItem().getText(),
          Numero: oNCertificado.getValue(),
        };
        let DataFinal = oldData.concat(oDatos);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
          DataFinal.NroLinea = index;
        }
        oModel.setProperty("/Retenciones", DataFinal);

        oModel.setProperty("/Paso05CantidadRetenciones", DataFinal.length);
        oModel.setProperty("/Paso05ImporteRetenciones", oImportesSuma);

        let oValue = false;
        this._onshowRetencionesAdd(oValue);

        if (oActiveRetencion.UpdPath !== "") {
          this.onButtonDeleteRetencionPress(oActiveRetencion.UpdPath);
        }
      },

      onGuardarButtonRETSavePress: function () {
        let oEntidad = "/Retenciones",
          Tipo = "RETE",
          Step = "idRetencionesWizardStep";

        this._onGuardar(oEntidad, Tipo, Step);
      },

      onButtonEditaRetencionPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject();
        oItem.UpdPath = oPath;

        this._onshowRetencionesAdd(true, oItem);
      },

      cancelarRetencion: function () {
        let oValue = false;
        this._onshowRetencionesAdd(oValue);
      },

      onButtonDeleteRetencionPressMsg: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject(),
          sMessage =
            this._i18n().getText("lblncertificado") +
            ": " +
            oItem.NCertificado +
            " " +
            this._i18n().getText("lblimpor") +
            ": " +
            oItem.Importe,
          sMessageTitle = this._i18n().getText("msgdelete");

        this._onShowMsgBoxConfirm(sMessage, sMessageTitle).then((rta) => {
          if (rta === "OK") {
            this.onButtonDeleteRetencionPress(oPath);
          }
        });
      },

      onButtonDeleteRetencionPress: function (oPath) {
        let oModel = this.getView().getModel("mockdata"),
          oItem = oModel.getObject(oPath),
          oCertNro = oItem.NCertificado,
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Retenciones");

        let oRetencionExist = oAddedData.findIndex(function (oRetenciones) {
          return oRetenciones.NCertificado === oCertNro;
        });

        if (oAddedData.length > 1) {
          let removed = oAddedData.splice(oRetencionExist, 1);
          oModel.setProperty("/Retenciones", oAddedData);
        } else {
          oModel.setProperty("/Retenciones", []);
        }

        oModel.refresh();
      },

      onWizardStepRetencionComplete: function () {
        let oModel = this.getView().getModel("mockdata"),
          ImportePGOCTA = oModel.getProperty("/Paso02ImportePagos"),
          ImporteCBTES = oModel.getProperty("/Paso03ImporteComprobantes"),
          ImporteDTO = oModel.getProperty("/Paso04ImporteDescuentos"),
          ImporteRET = oModel.getProperty("/Paso05ImporteRetenciones");

        oModel.setProperty("/Paso02ImportePagos", parseFloat(ImportePGOCTA));
        oModel.setProperty(
          "/Paso03ImporteComprobantes",
          parseFloat(ImporteCBTES)
        );
        oModel.setProperty("/Paso04ImporteDescuentos", parseFloat(ImporteDTO));
        oModel.setProperty("/Paso05ImporteRetenciones", parseFloat(ImporteRET));

        let oSubTotal =
          parseFloat(ImporteCBTES) ||
          0 -
            (parseFloat(ImportePGOCTA) ||
              0 + parseFloat(ImporteDTO) ||
              0 + parseFloat(ImporteRET) ||
              0);

        oModel.setProperty("/SUBTOTAL", oSubTotal);
        oModel.getProperty("/RESTANTE", oSubTotal);
      },

      // ********************************************
      // Medios de Pago ----------------------------
      // ********************************************

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

      onAgregarDetalleButtonPress: function () {
        let oValue = true;
        this.onshowDetalleAdd(oValue);
      },

      onshowDetalleAdd: function (oValue) {
        this._onUpdateValues();
        let oModel = this.getView().getModel("layout"),
          oDescuento = "/detalleadd",
          data = [];
        this._onUpdateModel(oModel, oDescuento, oValue);

        let oFile = this.getView().byId("idChequeFileUploader");
        oFile.setValue();

        let EditRecibo = oModel.getProperty("/EdicionRecibo");

        // if (EditRecibo === true) {
        //   if (oValue === true) {
        //     this._wizard.invalidateStep(
        //       this.getView().byId("idDetalleWizardStep")
        //     );
        //   } else {
        //     this._wizard.validateStep(
        //       this.getView().byId("idDetalleWizardStep")
        //     );
        //   }
        // }
      },

      onCheckDetalles: function () {
        let oModel = this.getView().getModel("mockdata"),
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Detalle");

        if (oAddedData.length > 0) {
          this._wizard.validateStep(this.getView().byId("idDetalleWizardStep"));
        } else {
          this._wizard.invalidateStep(
            this.getView().byId("idDetalleWizardStep")
          );
        }
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
      },

      onConfirmarReciboButtonPress: function () {
        let oEntidad = "/Detalle",
          Tipo = "DETA",
          Step = "idDetalleWizardStep";

        this._onGuardar(oEntidad, Tipo, Step);
      },

      onGuardarButtonDETSavePress: function () {
        let oEntidad = "/Detalle",
          Tipo = "DETA",
          Step = "idDetalleWizardStep";

        this._onGuardar(oEntidad, Tipo, Step);
      },

      onGuardarButtonDetallePress: function () {
        let oModel = this.getView().getModel("mockdata"),
          oLayoutModel = this.getView().getModel("layout");

        let MpActive = this._onGetDataModel(oModel, "/ActiveDetalle"),
          oMP = this.getView().byId("idselectMP"),
          oCheque = this.getView().byId("idDetNroCheque"),
          oCbte = this.getView().byId("idDetComprobante"),
          oBcoDestino = this.getView().byId("idDetBcoDestino"),
          oBcoEmisor = this.getView().byId("idDetBcoEmisor"),
          oFechaDeposito = this.getView().byId("idDetFecDeposito"),
          oFechaEmision = this.getView().byId("idDetFechaEmision"),
          oFechaVencimiento = this.getView().byId("idDetFecVto"),
          oImportePago = this.getView().byId("idImportePagoInput");
        // oFile = this.getView().byId("idChequeFileUploader"),
        // oFileCheque = this.getView().byId("");

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

        // if (MpKValidate.Adjunto === true) {
        //   if (!oFile.getValue()) {
        //     oFile.setValueState(ValueState.Error);
        //     return;
        //   } else {
        //     oFile.setValueState(ValueState.None);
        //   }

        //   if (!oFileCheque.getValue()) {
        //     oFileCheque.setValueState(ValueState.Error);
        //     return;
        //   } else {
        //     oFoFileChequeile.setValueState(ValueState.None);
        //   }
        // }

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

        let oldData = oModel.getProperty("/Detalle"),
          oImportesSuma = 0;

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
          Codigo: oMP.getSelectedKey(),
          Descripcion: oMP.getSelectedItem().getText(),
          Numero: oCbte.getValue(),

          Fecha: oFechaDeposito.getDateValue(),

          Detalle: oMP.getSelectedItem().getText(),
          FechaEmision: oFechaEmision.getDateValue(),
          FechaVencimiento: oFechaVencimiento.getDateValue(),
          BancoEmisor: oBcoEmisor.getValue(),
          BancoDestino: oBcoDestino.getValue(),
        };
        let DataFinal = oldData.concat(oDatos);

        let ActiveDetalle = {
          MPkey: "0000000001",
          NroCheq: "",
          NroCte: "",
          Importe: "",
          FecEmis: null,
          FecDepo: null,
          FecCbte: null,
          FecVto: null,
          BcoEmi: "",
          BcoDes: "",
          Adjunto: "",
        };

        oModel.setProperty("/ActiveDetalle", ActiveDetalle);
        oMP.setSelectedKey("0000000001");

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
          DataFinal.NroLinea = index;
        }
        oModel.setProperty("/Detalle", DataFinal);
        let oValue = false;
        this.onshowDetalleAdd(oValue);

        oModel.setProperty("/Paso06Detalles", DataFinal.length);
        oModel.setProperty("/Paso06ImporteDetalle", oImportesSuma);

        this._onUpdateValues();
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
        let oFile = this.getView().byId("idChequeFileUploader");
        oFile.setValue();

        this._onUpdateModel(oModel, "/ActiveMP", ActiveMP);
        this._onUpdateModel(oLayoutModel, "/MpKey", ActiveMP.key);
      },

      cancelarDetlles: function () {
        this._onResetDetalleValues();
        let oValue = false;
        this.onshowDetalleAdd(oValue);
        this.onCheckDetalles();
      },
      onButtonDeletePagoPressMsg: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject(),
          sMessage =
            this._i18n().getText("lbldescripcion") +
            ": " +
            oItem.TipoDesc +
            " " +
            this._i18n().getText("lblimpor") +
            ": " +
            oItem.Importe,
          sMessageTitle = this._i18n().getText("msgdelete");

        this._onShowMsgBoxConfirm(sMessage, sMessageTitle).then((rta) => {
          if (rta === "OK") {
            this.onButtonDeletePagoPress(oPath);
          }
        });
      },

      onButtonDeletePagoPress: function (oPath) {
        let oModel = this.getView().getModel("mockdata"),
          oItem = oModel.getObject(oPath),
          oCertNro = oItem.TipoDesc,
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Detalle");

        let oDetalleExist = oAddedData.findIndex(function (oRetenciones) {
          return oRetenciones.TipoDesc === oCertNro;
        });

        if (oAddedData.length > 1) {
          let removed = oAddedData.splice(oDetalleExist, 1);
          oModel.setProperty("/Detalle", oAddedData);
        } else {
          oModel.setProperty("/Detalle", []);
          oModel.setProperty("/Paso06Detalles", 0);
          oModel.setProperty("/Paso06ImporteDetalle", 0);
          oModel.getProperty("/RESTANTE", 0);
          this.onCheckDetalles();
        }

        oModel.refresh();
      },

      onInputTipoPagoChange: function (oEvent) {
        let vObject,
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oModel = this.getOwnerComponent().getModel(),
          oSource = oEvent.getSource(),
          oPath = oSource.getSelectedItem().getBindingContext().getPath();

        vObject = oModel.getObject(oPath);

        let oPayload = {
          key: vObject.Codigo,
          Desc: vObject.Descripcion,
          DetCbte: this.onCheckValue(vObject.Detalle),
          FecCbte: this.onCheckValue(vObject.Fecha),
          NroCheq: this.onCheckValue(vObject.NroCheque),
          Adjunto: this.onCheckValue(vObject.Adjuntos),
          FecEmis: this.onCheckValue(vObject.FechaEmision),
          FecVto: this.onCheckValue(vObject.FechaVencimiento),
          BcoEmi: this.onCheckValue(vObject.BancoEmisor),
          BcoDes: this.onCheckValue(vObject.BancoDestino),
          BcoDesReq: this.onCheckValueReq(vObject.BancoDestino),
        };

        oMockModel.setProperty("/ActiveMP", oPayload);
      },

      onCheckValue: function (oValue) {
        if (oValue === "X") {
          return true;
        } else if (oValue === "") {
          return false;
        } else {
          return true;
        }
      },

      onCheckValueReq: function (oValue) {
        if (oValue === "X") {
          return true;
        } else if (oValue === "O") {
          return false;
        } else {
          return false;
        }
      },

      _onUpdateValues: function () {
        let oModel = this.getView().getModel("mockdata"),
          ImportePGOCTA = oModel.getProperty("/Paso02ImportePagos"),
          ImporteCBTES = oModel.getProperty("/Paso03ImporteComprobantes"),
          ImporteDTO = oModel.getProperty("/Paso04ImporteDescuentos"),
          ImporteRET = oModel.getProperty("/Paso05ImporteRetenciones"),
          ImporteDET = oModel.getProperty("/Paso06ImporteDetalle");

        // oModel.setProperty("/Paso06ImporteDetalle", parseFloat(ImporteDET));

        let oSubTotal =
          parseFloat(ImporteCBTES) -
          (parseFloat(ImportePGOCTA) +
            parseFloat(ImporteDTO) +
            parseFloat(ImporteRET) +
            parseFloat(ImporteDET));

        let oSub =
          parseFloat(ImporteCBTES) -
          (parseFloat(ImportePGOCTA) +
            parseFloat(ImporteDTO) +
            parseFloat(ImporteRET));

        let oAnticipo = ImporteDET - oSubTotal;

        let ActST = oSub - parseFloat(ImporteDET);

        oModel.setProperty("/RESTANTE", ActST);

        oModel.setProperty("/TOTAL", oSubTotal);

        oModel.setProperty("/ANTICIPO", oAnticipo);
      },

      // ********************************************
      // Photo ----------------------------
      // ********************************************

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

      // ***********************************************
      // **************** Navegacion *******************
      // ***********************************************
      _backToWizardContent: function () {
        this._oNavContainer.backToPage(this._oWizardContentPage.getId());
      },

      onWizardStepDetalleComplete: function (params) {
        this._onUpdateValues();

        this._oNavContainer.to(this.byId("idwizardReviewPage"));
      },

      onShowInfoMsg: function (oEvent) {
        let oModel = this.getView().getModel("mockdata"),
          ImportePGOCTA = oModel.getProperty("/Paso02ImportePagos"),
          ImporteCBTES = oModel.getProperty("/Paso03ImporteComprobantes"),
          ImporteDTO = oModel.getProperty("/Paso04ImporteDescuentos"),
          ImporteRET = oModel.getProperty("/Paso05ImporteRetenciones"),
          ImportePGO = oModel.getProperty("/Paso06ImporteDetalle");

        let MPGOCTA =
          this._i18n().getText("lblpagoacta") +
          ": " +
          ImportePGOCTA.toString() +
          "\n";
        let MCBTES =
          this._i18n().getText("lbldocsafectados") +
          ": " +
          ImporteCBTES.toString() +
          "\n";
        let MDTO =
          this._i18n().getText("lbldescuentos") +
          ": " +
          ImporteDTO.toString() +
          "\n";
        let MRET =
          this._i18n().getText("lblretenciones") +
          ": " +
          ImporteRET.toString() +
          "\n";

        let PGO =
          this._i18n().getText("lblmedios") + ": " + ImportePGO.toString();

        let sMessage = MCBTES + MPGOCTA + MDTO + MRET + PGO,
          sMessageTitle = this._i18n().getText("msginfotitle");

        this._onShowMsgBoxSucces(sMessage, sMessageTitle).then((rta) => {});
      },
      // ********************************************
      // ********************************************

      onAnularButtonPress: function () {
        this.onNavBack();
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

      // ********************************************
      // Impresion *****************************
      // ********************************************

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

      onConfirmarReciboButtonPress: async function () {
        let oMockModel = this.getView().getModel("mockdata"),
          oEntidad = "/DocumentosSet",
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oSubTotal = oMockModel.getProperty("/TOTAL");
        oData = oMockModel.getProperty("/Paso01Cliente");

        oData.Accion = "S";

        let oPayload = {
          Cliente: oData.Codigo,
          Comentarios: oData.Observaciones,
          Accion: oData.Accion,
          TipoComprobante: oData.TipoComprobante,
          Total: oSubTotal.toString(),
        };

        let rta2 = await this._oncreateModel(oModel, oView, oEntidad, oPayload);

        if (rta2.Mensaje) {
          let sMessage = rta2.Mensaje,
            sMessageTitle = this._i18n().getText("msgok");

          this._onShowMsgBoxSucces(sMessage, sMessageTitle).then((rta) => {
            if (rta === "OK") this.discardProgress();
            oMockModel.setProperty("/NoComprobantes", false);
            this.discardProgress();

            this.getOwnerComponent().getTargets().display("TargetMainView");
            oModel.refresh();
          });
        }
      },
      onAnularButtonPress: function () {
        this.discardProgress();
      },

      onNavBack: async function () {
        // this.getOwnerComponent().getTargets().display("TargetMainView");

        let sMessage = this._i18n().getText("msgcancel"),
          oMockModel = this.getView().getModel("mockdata"),
          sMessageTitle = this._i18n().getText("msgvolver");

        this._onShowMsgBoxConfirm(sMessage, sMessageTitle).then((rta) => {
          if (rta === "OK") this.discardProgress();
          oMockModel.setProperty("/NoComprobantes", false);
          this.getOwnerComponent().getTargets().display("TargetMainView");
        });
      },
    });
  }
);
