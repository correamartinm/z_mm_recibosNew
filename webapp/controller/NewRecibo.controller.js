sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/core/ValueState",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/Fragment",
    "../libs/Download",
    "sap/m/MessageToast",
    "sap/ui/model/type/Currency",
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
    Fragment,
    Download,
    MessageToast,
    Currency
  ) {
    "use strict";
    let ofiltersCBT = [],
      ofiltersPCA = [];
    return BaseController.extend("morixe.zfirecibos.controller.NewRecibo", {
      onInit: function () {
        this._wizard = this.byId("idWizard");

        this._oNavContainer = this.byId("wizardNavContainer");
        this._oWizardContentPage = this.byId("idRecibosPage");
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        let oTarget = oRouter.getTarget("TargetNewRecibo");
        oTarget.attachDisplay(this._onObjectMatched, this);
      },

      // *************

      onformatImportes: function (oEvent) {
        var oInput = oEvent.getSource(),
          oValue = oInput.getValue();

        oInput.setValue(this.formatCurrency(oValue));
      },

      // ********************** Dialogos de Ayuda **************************

      getBaseURL: function () {
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        return appId;
      },

      VHD_Open_Sociedad: function (oEvent) {
        var aFilters = [],
          oView = this.getView(),
          sInputValue = oEvent.getSource();

        // Creo dialogo
        if (!this.VHD_Sociedad) {
          this.VHD_Sociedad = Fragment.load({
            id: oView.getId(),
            name: this.getBaseURL() + ".view.fragments.VHDSOC",
            controller: this,
          }).then(function (oVHDSociedad) {
            oView.addDependent(oVHDSociedad);
            return oVHDSociedad;
          });
        }

        this.VHD_Sociedad.then(function (oVHDSociedad) {
          if (sInputValue.getValue() !== "") {
            var orFilterInput = [];
            orFilterInput.push(
              new Filter("RazonSocial", FilterOperator.EQ, sInputValue)
            );
            aFilters.push(new sap.ui.model.Filter(orFilterInput, false));
          }
          // muestro dialogo con valor inicial
          // oVHDSociedad.getBinding("items").filter(aFilters);
          oVHDSociedad.open();
        });
      },

      _VHD_Search_Sociedad: function (evt) {
        var sValue = evt.getParameter("value"),
          Campo,
          sValueUpper;
        sValueUpper = sValue.toUpperCase();
        if (sValue !== "") {
          if (isNaN(sValue) === true) {
            Campo = "RazonSocial";
          } else {
            Campo = "Codigo";
          }

          var oFilter = new Filter(Campo, FilterOperator.Contains, sValue);
          var oFilterUpper = new Filter(
            Campo,
            FilterOperator.Contains,
            sValueUpper
          );

          evt.getSource().getBinding("items").filter([oFilter, oFilterUpper]);
        } else {
          evt.getSource().getBinding("items").filter([]);
        }
      },

      _VHD_Confirm_Sociedad: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem"),
          oInput = this.getView().byId("SociedadFilterSet");

        if (!oSelectedItem) {
          // oInput.resetProperty("value");
          this.getOwnerComponent()
            .getModel("mockdata")
            .setProperty("/Paso01Cliente", { Codigo: "" });
          return;
        }

        // oInput.setValue(oSelectedItem.getTitle());
        this.getOwnerComponent()
          .getModel("mockdata")
          .setProperty(
            "/Paso01Cliente",
            oSelectedItem.getBindingContext().getObject()
          );

        this.onInputRazonSocialChange(
          oSelectedItem.getBindingContext().getPath()
        );
      },
      _VHD_Close_Sociedad: function (evt) {},
      // ************************* Dialogos ******************************

      onOpenDialogo: function (oEvent) {
        this._onEditMode();
        this._oNavContainer.to(this.byId("idRecibosPage"));
      },

      _onEditMode: function () {
        let oLayoutModel = this.getView().getModel("layout"),
          oEntidad = "/EdicionRecibo",
          oValue = oLayoutModel.getProperty(oEntidad);
        oValue = !oValue;

        oLayoutModel.setProperty(oEntidad, oValue);
      },

      // *****************************************************************
      _onObjectMatched: function () {
        this._onValidateStep();

        this._oNavContainer.to(this.byId("idRecibosPage"));

        this._wizard.invalidateStep(this.getView().byId("idClienteWizardStep"));

        this.onClearData();

        let oModel = this.getOwnerComponent().getModel();
        oModel.setSizeLimit(2000);
      },

      // ********************************************
      // Restablecer  Pantalla/Datos ****************
      // ********************************************

      _onClearTable: function (oTable, column) {
        let oItems = oTable.getItems();

        if (oItems.length > 0) {
          for (var index = 0; index < oItems.length; index++) {
            oItems[index].getCells()[column].setEnabled(false);
            oItems[index].getCells()[column].setValue();
            oItems[index].setSelected() === false;
          }
        }

        oTable.removeSelections();
      },

      onClearData: function () {
        let oMockModel = this.getView().getModel("mockdata");
        let oLayModel = this.getView().getModel("layout");

        oMockModel.setProperty("/Paso01Cliente", {});
        oMockModel.setProperty("/Paso2Data", []);
        oMockModel.setProperty("/Paso02Seleccionados", []);
        oMockModel.setProperty("/Paso02ImportePagos", "");
        oMockModel.setProperty("/Paso02CantidadPagos", "");

        oMockModel.setProperty("/Paso3Data", []);
        oMockModel.setProperty("/Paso03Comprobantes", []);
        oMockModel.setProperty("/Paso03ImporteComprobantes", "");
        oMockModel.setProperty("/Paso03CantidadComprobantes", "");

        oMockModel.setProperty("/Descuentos", []);
        oMockModel.setProperty("/Detalle", []);
        oMockModel.setProperty("/ActiveStep", "1");

        oMockModel.setProperty("/SUBTOTAL", "");
        oMockModel.setProperty("/RESTANTE", "");
        oMockModel.setProperty("/TOTAL", "");
        oMockModel.setProperty("/ANTICIPO", "");
        oMockModel.setProperty("/SALDO", 0);
        oMockModel.setProperty("/Paso04PathUpdate", "");
        oMockModel.setProperty("/Paso05PathUpdate", "");
        oMockModel.setProperty("/Paso06PathUpdate", "");

        oMockModel.setProperty("/filedescuento", false);
        oMockModel.setProperty("/fileretencion", 0);
        oMockModel.setProperty("/filempago", 0);

        oLayModel.setProperty("/descuentosadd", false);
        oLayModel.setProperty("/retencionesadd", false);
        oLayModel.setProperty("/detalleadd", false);

        this.getView().byId("sf02").setValue();
        this.getView().byId("sf03").setValue();
      },

      // ************ Control de los Pasos **********
      // ********************************************
      // Paso Datos del Cliente *********************
      // ********************************************

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

      onInputRazonSocialChange: async function (oPath) {
        let vObject,
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oData = oMockModel.getProperty("/Paso01Cliente"),
          recibo,
          anticipo,
          oModel = this.getOwnerComponent().getModel();
        // oSource = oEvent.getSource(),
        // oPath1 = oSource.getSelectedItem().getBindingContext().getPath();

        let oView = this.getView(),
          oEntidad2 = "/PagoCuentaSet",
          oEntidad = "/ComprobantesSet";

        let oResponseModel = await this._onreadModel(oModel, oView, oPath);
        // console.log(oResponseModel);

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

          let oPayload = {
            Codigo: vObject.Codigo,
            Cliente: vObject.Codigo,
            RazonSocial: vObject.RazonSocial,
            Domicilio: vObject.Domicilio,
            Localidad: vObject.Localidad,
            TipoIva: vObject.TipoIVA,
            Cuit: vObject.Cuit,
            Observaciones: vObject.Observaciones,
            Accion: "C",
            TipoComprobante: vObject.TipoComprobante,
          };

          if (oComprobantesControl.results.length === 0) {
            // Directo a Detalle de pagos
            oPayload.Anticipo = true;
            oPayload.Recibo = false;
            oMockModel.setProperty("/NoComprobantes", true);
            oMockModel.getProperty("/RESTANTE", 0);
          } else {
            oPayload.Anticipo = false;
            oPayload.Recibo = false;
            oPayload.Periodo = oComprobantesControl.results[0].Periodo;
            oPayload.Sociedad = oComprobantesControl.results[0].Sociedad;
            oMockModel.setProperty("/Paso3Data", oComprobantesControl.results);
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

          oMockModel.setProperty("/Paso01Cliente", oPayload);

          if (oPayload.Anticipo === true) {
            // this.onGuardarButtonClientePress();
          }
        }
        // ******** Hay documentos para el Cliente ???
      },

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

      onGuardarButtonClientePress: async function () {
        let oMockModel = this.getView().getModel("mockdata"),
          oEntidad = "/DocumentosSet",
          oTipoCte,
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oRecibo= "",
          oData = oMockModel.getProperty("/Paso01Cliente");
        if (oData.RazonSocial === "" || oData.RazonSocial === undefined) return;

        if (oData.Anticipo === true) {
          oTipoCte = "A";
        } else if (oData.Recibo === true) {
          oRecibo = "X";
          oTipoCte = "R";
        }

        if (oData !== undefined) {
          let oPayload = {
            Cliente: oData.Codigo,
            Comentarios: oData.Observaciones,
            Accion: oData.Accion,
            TipoComprobante: oTipoCte,
            Preliminar: oRecibo
          };

          let rta = await this._oncreateModel(
            oModel,
            oView,
            oEntidad,
            oPayload
          );
          // console.log(rta);
          if (rta.Mensaje !== "") {
            oData.Completo = false;
            oData.Mensaje = rta.Mensaje;
            oData.Periodo = rta.Periodo || "";
            oData.Sociedad = rta.Sociedad || "";

            oMockModel.setProperty("/Paso01Cliente", oData);

            let Step = this.byId("idClienteWizardStep");
            Step.setNextStep(this.getView().byId("idPagoaCtaWizardStep"));

            this._onValidateStep();
          }
        }
      },

      onWizardStepClienteComplete: async function () {
        let oMockModel = this.getView().getModel("mockdata"),
          oData = oMockModel.getProperty("/Paso01Cliente");
        let Step = this.byId("idPagoaCtaWizardStep");

        if (oData.Anticipo === true) {
          Step.setNextStep(this.getView().byId("idRetencionesWizardStep"));
          this._wizard.validateStep(this.getView().byId("idRetencionesWizardStep"));
        } else {
          Step.setNextStep(this.getView().byId("idComprobanteWizardStep"));
        }
        this.onFilterTableCbtes02();
        this._onCheckPago();
      },

      // ********************************************
      // Paso Seleccion Pagos a Cta-------
      // ********************************************
      // Paso Seleccion Pagos a Cuenta --------------
      // ********************************************

      onSearchFieldSearchPagoCta: function (oEvent) {
        let oTable = oEvent.getSource().getParent().getParent(),
          oValue = oEvent.getSource().getValue(),
          oItems = oTable.getSelectedItems();

        ofiltersPCA = [];
        let oFilter = new Array();
        for (var index = 0; index < oItems.length; index++) {
          ofiltersPCA.push(
            new Filter(
              "NroFactura",
              FilterOperator.EQ,
              oItems[index].getCells()[1].getText()
            )
          );
        }

        if (oValue) {
          ofiltersPCA.push(
            new Filter("NroFactura", FilterOperator.Contains, oValue)
          );

          ofiltersPCA.push(new Filter("NroFactura", FilterOperator.EQ, oValue));

          oFilter.push(new sap.ui.model.Filter(ofiltersPCA, false));
          oTable.getBinding("items").filter([oFilter]);
        } else {
          oTable.getBinding("items").filter([]);
        }
      },

      onFilterTableCbtes02: function () {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oCliente = oMockModel.getProperty("/Paso01Cliente"),
          oCCodigo = oCliente.Codigo,
          oFilters = [];
        oFilters.push(new Filter("Cliente", FilterOperator.Contains, oCCodigo));
        if (oTable.getItems() > 0)
          oTable.getBinding("items").filter([oFilters]);
      },

      onTablePagoChackBoxChange: async function (oEvent) {
        let oItem = oEvent.getParameters("listItem"),
          oModel = this.getOwnerComponent().getModel(),
          oMockModel = this.getView().getModel("mockdata"),
          oView = this.getView(),
          oPath = oItem.listItem.getBindingContextPath("mockdata"),
          vObject = oMockModel.getObject(oPath);

        if (oItem.selected === false) {
          oItem.listItem.getCells()[6].setValue();
          oItem.listItem
            .getCells()[6]
            .setValueState(sap.ui.core.ValueState.None);

          this._onCheckPago();
          return;
        }

        let oKey = oModel.createKey("/PagoCuentaSet", {
          Numero: vObject.Numero,
          Sociedad: vObject.Sociedad,
          Periodo: vObject.Periodo,
        });

        // oEntidad = "/ComprobantesSet";

        let oResponseModel = await this._onreadModel(oModel, oView, oKey);

        if (oResponseModel.Rta !== "OK") {
          oItem.listItem.setSelected(false);
          oItem.selected = false;
          vObject = [];

          let sMessage =
              oResponseModel.Data.message +
              " : " +
              oResponseModel.Data.statusCode +
              " - " +
              oResponseModel.Data.statusText,
            sMessageTitle = this._i18n().getText("msgerror");

          this._onShowMsgBoxError(sMessage, sMessageTitle).then((rta) => {});
        } else {
          if (oResponseModel.Data.Mensaje !== "") {
            MessageToast.show(oResponseModel.Mensaje);
            oItem.listItem.setSelected(false);
            oItem.selected = false;
          } else {
            // ************

            oItem.listItem.getCells()[6].setEnabled(true);
            oPath = oItem.listItem.getBindingContextPath();
            vObject = this.getView().getModel("mockdata").getObject(oPath);

            oItem.listItem
              .getCells()[6]
              .setEnabled(oItem.listItem.getSelected());

            if (
              oItem.listItem.getCells()[6].getValue() === "0.00" ||
              oItem.listItem.getCells()[6].getValue() === "0,00" ||
              oItem.listItem.getCells()[6].getValue() === ""
            ) {
              if (parseFloat(vObject.Saldo) > 0) {
                oItem.listItem
                  .getCells()[6]
                  .setValue(this.formatCurrency(vObject.Saldo));
              } else {
                oItem.listItem
                  .getCells()[6]
                  .setValue(
                    this.formatCurrency(parseFloat(vObject.Saldo) * -1)
                  );
              }
              vObject.Aplicado = oItem.listItem.getCells()[6].getValue();
            }

            oItem.listItem
              .getCells()[6]
              .setValueState(sap.ui.core.ValueState.None);

            vObject.Importe = oItem.listItem.getCells()[6].getValue();
            this._onFocusControl(oItem.listItem.getCells()[6]);

            // **************
            this._onCheckPago(oEvent);
          }
        }
      },

      onTablePagoCtaSelectionChange: function (oEvent) {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oModel = this.getView().getModel("mockdata"),
          oItems = oTable.getItems(),
          oBinding = oTable.getBinding("items"),
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
              oItems[index].getCells()[6].getValue() === "0,00" ||
              oItems[index].getCells()[6].getValue() === ""
            ) {
              if (parseFloat(vObject.Saldo) > 0) {
                oItems[index]
                  .getCells()[6]
                  .setValue(this.formatCurrency(vObject.Saldo));
              } else {
                oItems[index]
                  .getCells()[6]
                  .setValue(
                    this.formatCurrency(parseFloat(vObject.Saldo) * -1)
                  );
              }
              vObject.Aplicado = oItems[index].getCells()[6].getValue();
            }

            oItems[index]
              .getCells()[6]
              .setValueState(sap.ui.core.ValueState.None);

            vObject.Importe = oItems[index].getCells()[6].getValue();
            this._onFocusControl(oItems[index].getCells()[6]);
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
            let oValue = oItems[index].getCells()[6].getValue();

            if (oItems[index].getSelected() === true) {
              // let  oValue = oItems[index].getCells()[7].getValue();
              vObject.Importe = oValue;
              vObject.Aplicado = oValue;
              Data.push(vObject);
              Data.NroLinea = index;
              if (oValue.includes(",")) {
                oValue = oValue.replace(/\./g, "");
                oValue = oValue.replace(/\,/g, ".");
              }

              oImportesSuma = parseFloat(oImportesSuma) + parseFloat(oValue);
            }
          }
          // console.log(Data);
          oMockModel.setProperty(oComprobantes, Data);
          oMockModel.setProperty(oCantidad, Data.length);
          oMockModel.setProperty(oImporte, this.formatCurrency(oImportesSuma));
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

        if (oValue === "") oValue = 0;

        oValue = parseFloat(oValue);
        oMax = parseFloat(oMax);

        if (oValue > 0 && oValue <= oMax) {
          oTarget.setValueState(ValueState.None);
        } else {
          oTarget.setValueState(ValueState.Warning);
        }
        ///////////////

        var oInput = oEvent.getSource();
        oInput.setValue(this.formatCurrency(oValue));

        this._onCheckPago();
      },

      onGuardarButtonPagoAdicionalPress: async function () {
        let oEntidad = "/Paso02Seleccionados",
          Tipo = "ACTA",
          PostEntidad = "/PagoCuentaSet",
          Step = "idPagoaCtaWizardStep";

        this._onGuardar(oEntidad, Tipo, Step, PostEntidad);

        let StepWz = this.byId("idClienteWizardStep");
        let oData = this.getView()
          .getModel("mockdata")
          .getProperty("/Paso01Cliente");

        this.onWizardStepPagosComplete();
      },

      onWizardStepPagosComplete: function () {
        let oModel = this.getView().getModel("mockdata"),
          TipoRecibo = oModel.getProperty("/Paso01Cliente"),
          ImportePGOCTA = oModel.getProperty("/Paso02ImportePagos");

        // ValidarDetalles

        if (TipoRecibo.Anticipo === true && parseFloat(ImportePGOCTA) > 0) {
          this._wizard.validateStep(this.getView().byId("idDetalleWizardStep"));
        } else {
          this._wizard.invalidateStep( this.getView().byId("idDetalleWizardStep") );
        }
      },

      // ********************************************
      // Paso Seleccion Pagos a Comprobantes --------------
      // ********************************************

      onSearchFieldSearchComprobante: function (oEvent) {
        let oTable = oEvent.getSource().getParent().getParent(),
          oValue = oEvent.getSource().getValue(),
          oItems = oTable.getSelectedItems();

        ofiltersCBT = [];
        let oFilter = new Array();
        for (var index = 0; index < oItems.length; index++) {
          ofiltersCBT.push(
            new Filter(
              "NroFactura",
              FilterOperator.EQ,
              oItems[index].getCells()[1].getText()
            )
          );
        }

        if (oValue) {
          ofiltersCBT.push(
            new Filter("NroFactura", FilterOperator.Contains, oValue)
          );
          ofiltersCBT.push(
            new Filter("NroFactura", FilterOperator.EQ, oValue)
          );
          oFilter.push(new sap.ui.model.Filter(ofiltersCBT, false));
          oTable.getBinding("items").filter([oFilter]);
        } else {
          oTable.getBinding("items").filter([]);
        }

        // this._onCheckComprobantes();
      },

      onTableComprobantesChackBoxChange: async function (oEvent) {
        let oItem = oEvent.getParameters("listItem"),
          oModel = this.getOwnerComponent().getModel(),
          oMockModel = this.getView().getModel("mockdata"),
          oView = this.getView(),
          oPath = oItem.listItem.getBindingContextPath("mockdata"),
          vObject = oMockModel.getObject(oPath);

        if (oItem.selected === false) {
          oItem.listItem.getCells()[7].setValue();
          oItem.listItem
            .getCells()[7]
            .setValueState(sap.ui.core.ValueState.None);

          this._onCheckComprobantes();
          return;
        }

        let oKey = oModel.createKey("/ComprobantesSet", {
          Numero: vObject.Numero,
          Posicion: vObject.Posicion,
          Sociedad: vObject.Sociedad,
          Periodo: vObject.Periodo,
        });

        let oResponseModel = await this._onreadModel(oModel, oView, oKey);

        if (oResponseModel.Rta !== "OK") {
          oItem.listItem.setSelected(false);
          oItem.selected = false;
          vObject = [];

          let sMessage =
              oResponseModel.Data.message +
              " : " +
              oResponseModel.Data.statusCode +
              " - " +
              oResponseModel.Data.statusText,
            sMessageTitle = this._i18n().getText("msgerror");

          this._onShowMsgBoxError(sMessage, sMessageTitle).then((rta) => {});
        } else {
          if (oResponseModel.Data.Mensaje !== "") {
            MessageToast.show(oResponseModel.Mensaje);
            oItem.listItem.setSelected(false);
            oItem.selected = false;
          } else {
            // ****************************
            oItem.listItem
              .getCells()[7]
              .setEnabled(oItem.listItem.getSelected());
            oPath = oItem.listItem.getBindingContextPath();
            vObject = this.getView().getModel("mockdata").getObject(oPath);


              oItem.listItem
                .getCells()[7]
                .setEnabled(oItem.listItem.getSelected());

              if (
                oItem.listItem.getCells()[7].getValue() === "0.00" ||
                oItem.listItem.getCells()[7].getValue() === ""
              ) {
                if (parseFloat(vObject.Saldo) > 0) {
                  oItem.listItem
                    .getCells()[7]
                    .setValue(this.formatCurrency(vObject.Saldo));
                } else {
                  oItem.listItem
                    .getCells()[7]
                    .setValue(parseFloat(vObject.Saldo));
                }
              }

              oItem.listItem
                .getCells()[7]
                .setValueState(sap.ui.core.ValueState.None);

              this._onFocusControl(oItem.listItem.getCells()[7]);
            
            // ***************************
            this._onCheckComprobantes();
          }
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
          oItems[index].getCells()[7].setEnabled(oItems[index].getSelected());
          oPath = oItems[index].getBindingContextPath();
          vObject = oModel.getObject(oPath);

          if (oItems[index].getSelected() === false) {
            oItems[index].getCells()[7].setValue();
            oItems[index]
              .getCells()[7]
              .setValueState(sap.ui.core.ValueState.None);
          } else {
            oItems[index].getCells()[7].setEnabled(oItems[index].getSelected());

            if (
              oItems[index].getCells()[7].getValue() === "0.00" ||
              oItems[index].getCells()[7].getValue() === ""
            ) {
              if (parseFloat(vObject.Saldo) > 0) {
                oItems[index]
                  .getCells()[7]
                  .setValue(this.formatCurrency(vObject.Saldo));
              } else {
                oItems[index].getCells()[7].setValue(parseFloat(vObject.Saldo));
              }
            }

            oItems[index]
              .getCells()[7]
              .setValueState(sap.ui.core.ValueState.None);

            this._onFocusControl(oItems[index].getCells()[7]);
          }
        }

        this._onCheckComprobantes();
      },

      onInputImporteChange: function (oEvent) {
        let oTarget = oEvent.getSource(),
          oStockTable = this.getView().byId("idComprobanteTable"),
          oMax = oEvent.getSource().getParent().getCells()[6].getText(),
          oValue = oTarget.getValue();
        let oItem = oStockTable.getSelectedItem();

        if (!oValue) oValue = "0";

        oValue = parseFloat(oValue);
        oMax = parseFloat(oMax);

        if (oValue > 0 && oValue <= oMax) {
          oTarget.setValueState(ValueState.None);
        } else {
          oTarget.setValueState(ValueState.Warning);
        }

        var oInput = oEvent.getSource();
        oInput.setValue(this.formatCurrency(oValue));

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
              if (vObject.Importe.includes(",")) {
                vObject.Importe = vObject.Importe.replace(/\./g, "");
                vObject.Importe = vObject.Importe.replace(/\,/g, ".");
              }
              oImportesSuma =
                parseFloat(oImportesSuma) +
                parseFloat(parseFloat(vObject.Importe));
            }
          }
        }
        oMockModel.setProperty(oComprobantes, Data);
        oMockModel.setProperty(oCantidad, Data.length);
        oMockModel.setProperty(oImporte, this.formatCurrency(oImportesSuma));
      },

      onGuardarButtonComprobantesPress: function () {
        
        let oEntidad = "/Paso03Comprobantes",
          Tipo = "APLIC",
          EntidadPost = "/ComprobantesSet",
          Step = "idComprobanteWizardStep";

        this._onGuardar(oEntidad, Tipo, Step, EntidadPost);
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
          ofile = oModel.getProperty("/filedescuento"),
          oldData = [],
          DataFinal = [],
          oDatos = {};

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

        // if (ofile === false) {
        //   MessageToast.show("Adjunte un fichero y vuelva a intentar");
        //   return;
        // }

        let oValue = false,
          oImportesSuma = 0,
          oDecuentos = "/Descuentos";

        let Update = this._onGetDataModel(oModel, "/Paso04PathUpdate");

        if (Update === "") {
          if (!oMotivo.getSelectedKey()) {
            oMotivo.setValueState(ValueState.Error);
            return;
          } else {
            oMotivo.setValueState(ValueState.None);
          }

          oDatos = {
            Detalle: oMotivo.getSelectedItem().getText(),
            Fecha: oFecha.getDateValue(),
            Importe: oImporte.getValue(),
            Descripcion: oMotivo.getSelectedItem().getText(),
            Numero: oNcomprobante.getValue(),
            NroLinea: oMotivo.getSelectedKey(),
            // NroCheque: oMotivo.getSelectedKey(),
            // NComprobante: parseFloat(oNcomprobante.getValue()),
            // Codigo: oMotivo.getSelectedKey(),
          };
        } else {
          oDatos = {
            Detalle: oMotivo.getValue(),
            Fecha: oFecha.getDateValue(),
            Importe: oImporte.getValue(),
            Codigo: oPostDataDescuento.Codigo,
            Descripcion: oMotivo.getValue(),
            Numero: oNcomprobante.getValue(),
          };
        }

        // let DataFinal = oldData.concat(oDatos);
        DataFinal.push(oDatos);

        this._onshowDescuentoAdd(oValue, []);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) +
            parseFloat(DataFinal[index].Importe.replace(/\./g, ""));
          DataFinal.NroLinea = index;
        }

        oModel.setProperty(oDecuentos, DataFinal);
        let oCantidad = "/Paso04CantidadDescuentos",
          oImporteDec = "/Paso04ImporteDescuentos";
        oModel.setProperty(oCantidad, DataFinal.length);
        oModel.setProperty(oImporteDec, oImportesSuma);

        oModel.setProperty("/Paso04Grabado", false);
        oModel.setProperty("/Paso04PathUpdate", "");

        this.onGuardarButtonDescSavePress();
      },

      onGuardarButtonDescSavePress: function () {
        let oEntidad = "/Descuentos",
          Tipo = "DESC",
          entidadPost = "/DescuentosSet",
          Step = "idDescuentosWizardStep";

        this._onGuardar(oEntidad, Tipo, Step, entidadPost);

        let oModel = this.getView().getModel("mockdata");
        oModel.setProperty("/Paso04Grabado", true);

        this._wizard.validateStep(
          this.getView().byId("idDescuentosWizardStep")
        );
      },

      onVolverButtonCancelarDescPress: function () {
        let oValue = false;
        this._onshowDescuentoAdd(oValue, []);
        let oModel = this.getView().getModel("mockdata");
        oModel.setProperty("/Paso04Grabado", false);
      },

      onButtonDeleteDescuentoPressMsg: function (oEvent) {
        let oPath = oEvent.getSource().getBindingContext().getPath(),
          oItem = oEvent.getSource().getBindingContext().getObject(),
          sMessage =
            this._i18n().getText("lblnumcomprobante") +
            ": " +
            oItem.Numero +
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
        let oModel = this.getOwnerComponent().getModel(),
          oMockmodel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext().getPath(),
          oItem = oEvent.getSource().getBindingContext().getObject();
        // oItem.UpdPath = oPath;

        this._onshowDescuentoAdd(true, oItem);
        oMockmodel.setProperty("/Paso04PathUpdate", oPath);
      },

      onButtonDeleteDescuentoPress: async function (oPath) {
        let oModel = this.getView().getModel(),
          oItem = oModel.getObject(oPath),
          oView = this.getView(),
          oCertNro = oItem.Codigo,
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Descuentos");

        let rta = await this.ondeleteModel(oModel, oView, oPath);

        if (rta.Respuesta !== "OK") {
          this._onErrorHandle(rta.Datos);
        }
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
        if (oValue === false) {
          oMockModel.setProperty("/Paso05PathUpdate", "");
        }

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
          ofile = oModel.getProperty("/fileretencion"),
          oImportesSuma = 0,
          oCantRet = this.getView().byId("idRetencionesTable").getItems() || 0,
          oldData = [],
          DataFinal = [],
          oDatos = {};

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

        let Update = oModel.getProperty("/Paso05PathUpdate");

        let oActiveRetencion = oModel.getProperty("/ActiveRetencion");

        if (Update === "") {
          if (oCantRet.length + 1 > ofile) {
            MessageToast.show(
              "Adjunte un fichero por retención y vuelva a intentar"
            );
            return;
          }

          if (!oTipo.getSelectedKey()) {
            oTipo.setValueState(ValueState.Error);
            return;
          } else {
            oTipo.setValueState(ValueState.None);
          }

          oDatos = {
            TipoComprobante: oTipo.getSelectedItem().getText(),
            Fecha: oFecha.getDateValue(),
            Importe: oImporte.getValue(),
            Descripcion: oTipo.getSelectedItem().getText(),
            Numero: oNCertificado.getValue(),
            NroLinea: oTipo.getSelectedKey(),
            // NroCheque: oTipo.getSelectedKey(),
            // Codigo: oTipo.getSelectedKey(),
            // NCertificado: parseFloat(oNCertificado.getValue()),
          };
        } else {
          oDatos = {
            TipoComprobante: oActiveRetencion.TipoComprobante,
            Fecha: oFecha.getDateValue(),
            Importe: oImporte.getValue(),
            Codigo: oActiveRetencion.Codigo,
            Descripcion: oActiveRetencion.Descripcion,
            Numero: oNCertificado.getValue(),
          };
        }

        DataFinal.push(oDatos);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) +
            parseFloat(DataFinal[index].Importe.replace(/\./g, ""));
        }
        oModel.setProperty("/Retenciones", DataFinal);
        oModel.setProperty("/Paso05CantidadRetenciones", DataFinal.length);
        oModel.setProperty("/Paso05ImporteRetenciones", oImportesSuma);

        let oValue = false;
        this._onshowRetencionesAdd(oValue);

        this.onGuardarButtonRETSavePress();
      },

      onGuardarButtonRETSavePress: function () {
        let oEntidad = "/Retenciones",
          step = "idRetencionesWizardStep",
          EntidadPost = "/RetencionesSet",
          Tipo = "RETE";

        this._onGuardar(oEntidad, Tipo, step, EntidadPost);
      },

      onButtonEditaRetencionPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel(),
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext().getPath(),
          oItem = oEvent.getSource().getBindingContext().getObject();

        // oItem.UpdPath = oPath;

        this._onshowRetencionesAdd(true, oItem);
        oMockModel.setProperty("/Paso05PathUpdate", oPath);
      },

      cancelarRetencion: function () {
        let oValue = false;
        this._onshowRetencionesAdd(oValue);
      },

      onButtonDeleteRetencionPressMsg: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel(),
          oPath = oEvent.getSource().getBindingContext().getPath(),
          oItem = oEvent.getSource().getBindingContext().getObject(),
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

      onButtonDeleteRetencionPress: async function (oPath) {
        let oModel = this.getView().getModel(),
          oView = this.getView();

        let rta = await this.ondeleteModel(oModel, oView, oPath);

        if (rta.Respuesta !== "OK") {
          this._onErrorHandle(rta.Datos);
        }
      },

      onWizardStepRetencionComplete: function () {
        let oModel = this.getView().getModel("mockdata"),
          TipoRecibo = oModel.getProperty("/Paso01Cliente"),
          ImportePGOCTA = oModel.getProperty("/Paso02ImportePagos"),
          ImporteCBTES = oModel.getProperty("/Paso03ImporteComprobantes"),
          ImporteDTO = oModel.getProperty("/Paso04ImporteDescuentos"),
          ImporteRET = oModel.getProperty("/Paso05ImporteRetenciones");

        oModel.setProperty("/Paso04ImporteDescuentos", parseFloat(ImporteDTO));
        oModel.setProperty("/Paso05ImporteRetenciones", parseFloat(ImporteRET));

        ImporteDTO = this.formatCurrencytoText(ImporteDTO);
        ImporteRET = this.formatCurrencytoText(ImporteRET);
        ImporteCBTES = this.formatCurrencytoText(ImporteCBTES);

        let oSubTotal =
          parseFloat(ImporteCBTES) ||
          0 -
            (parseFloat(ImportePGOCTA) ||
              0 + parseFloat(ImporteDTO) ||
              0 + parseFloat(ImporteRET) ||
              0);

        oModel.setProperty("/SUBTOTAL", oSubTotal);
        oModel.getProperty("/RESTANTE", oSubTotal);

        // ValidarDetalles

        if (TipoRecibo.Anticipo === true && parseFloat(ImportePGOCTA) > 0) {
          this._wizard.validateStep(this.getView().byId("idDetalleWizardStep"));
        }

        if (parseFloat(ImportePGOCTA) > 0 && parseFloat(ImporteCBTES) > 0) {
          this._wizard.validateStep(this.getView().byId("idDetalleWizardStep"));
        }

        if (TipoRecibo.Anticipo === true && parseFloat(ImporteRET) > 0) {
          this._wizard.validateStep(this.getView().byId("idDetalleWizardStep"));
        }


      },

      // ********************************************
      // Medios de Pago ----------------------------
      // ********************************************

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
          Fecha: this.onCheckValue(vObject.Fecha),
          BcoEmi: this.onCheckValue(vObject.BancoEmisor),
          BcoDes: this.onCheckValue(vObject.BancoDestino),
          BcoDesReq: this.onCheckValueReq(vObject.BancoDestino),
        };

        oMockModel.setProperty("/ActiveMP", oPayload);
      },

      onAgregarDetalleButtonPress: function () {
        let oValue = true;
        this.onshowDetalleAdd(oValue, []);

        this.getOwnerComponent()
          .getModel("mockdata")
          .setProperty("/Paso06PathUpdate", "");
      },

      onshowDetalleAdd: function (oValue, Object) {
        let Recibo = this.getOwnerComponent()
            .getModel("mockdata")
            .getProperty("/Paso01Cliente"),
          oCboMp = this.getView().byId("idselectMP");

        let EtvoItem = oCboMp.getItemByText("EFECTIVO");

        if (Object.length === 0 && oValue === true) {
          Object.NroLinea = EtvoItem.mProperties.key;
          Object.Descripcion = EtvoItem.mProperties.text;
          oCboMp.setSelectedKey(EtvoItem.mProperties.key);
          oCboMp.fireChange();
        }

        this._onUpdateValues();

        this.getOwnerComponent()
          .getModel("layout")
          .setProperty("/detalleadd", oValue);

        this.getOwnerComponent()
          .getModel("mockdata")
          .setProperty("/ActiveDetalle", Object);

        if (oValue === true) {
          this._wizard.invalidateStep(
            this.getView().byId("idDetalleWizardStep")
          );
        } else {
          this._wizard.validateStep(this.getView().byId("idDetalleWizardStep"));
        }
      },

      onGuardarButtonDetallePress: async function () {
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
          DataFinal = [],
          oDatos = {},
          ofile = oModel.getProperty("/filempago"),
          oCantPagos = this.getView().byId("idTableMP").getItems() || 0,
          oImportePago = this.getView().byId("idImportePagoInput");

        let MpKey = this._onGetDataModel(oLayoutModel, "/MpKey");
        let MpKValidate = this._onGetDataModel(oModel, "/ActiveMP");

        // ********* Fijos

        if (!oImportePago.getValue()) {
          oImportePago.setValueState(ValueState.Error);
          return;
        } else {
          oImportePago.setValueState(ValueState.None);
        }

        var oAttachmentUpl = sap.ui.core.Fragment.byId(
          "UploadFile",
          "attachmentUpl"
        );

        if (oAttachmentUpl === undefined && oMP._getSelectedItemText() !== "EFECTIVO") {
          // return;
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

        if (MpKValidate.FecEmis === true) {
          if (!oFechaEmision.getDateValue()) {
            oFechaEmision.setValueState(ValueState.Error);
            return;
          } else {
            oFechaEmision.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.BcoEmi === true) {
          if (!oBcoEmisor.getSelectedKey()) {
            oBcoEmisor.setValueState(ValueState.Error);
            return;
          } else {
            oBcoEmisor.setValueState(ValueState.None);
          }
        }

        if (MpKValidate.BcoDes === true && MpKValidate.BcoDesReq === true) {
          if (!oBcoDestino.getSelectedKey()) {
            oBcoDestino.setValueState(ValueState.Error);
            return;
          } else {
            oBcoDestino.setValueState(ValueState.None);
          }
        }

        let Update = oModel.getProperty("/Paso06PathUpdate"),
          oImportesSuma = 0;

        let oImporteNew = oImportePago.getValue();

        if (oImporteNew.includes(",")) {
          oImporteNew = oImporteNew.replace(/\./g, "");
          oImporteNew = oImporteNew.replace(/,/g, ".");
        }

        if (Update === "") {
          if (oCantPagos.length + 1 > ofile && oMP._getSelectedItemText() !== "EFECTIVO") {
            MessageToast.show(
              "Adjunte un fichero por medio de pago y vuelva a intentar"
            );
            return;
          }

          if (!oMP.getSelectedKey()) {
            oMP.setValueState(ValueState.Error);
            return;
          } else {
            oMP.setValueState(ValueState.None);
          }

          oDatos = {
            NroLinea: oMP.getSelectedKey(),
            Descripcion: oMP.getSelectedItem().getText(),
            Numero: oCbte.getValue(),
            NroCheque: oCheque.getValue(),
            FechaEmision: oFechaEmision.getDateValue(),
            Importe: oImporteNew,
            Fecha: oFechaDeposito.getDateValue(),
            Detalle: oMP.getSelectedItem().getText(),
            FechaVencimiento: oFechaVencimiento.getDateValue(),
            BancoEmisor: oBcoEmisor.getSelectedKey(),
            BancoDestino: oBcoDestino.getSelectedKey(),
          };
        } else {
          oDatos = {
            //Detalle: oMP.getSelectedItem().getText(),
            //Descripcion: oMP.getSelectedItem().getText(),
            Descripcion: oMP.getValue(),
            Numero: oCbte.getValue(),
            NroCheque: oCheque.getValue(),
            FechaEmision: oFechaEmision.getDateValue(),
            Importe: oImporteNew,
            Fecha: oFechaDeposito.getDateValue(),
            Detalle: oMP.getValue(),
            FechaVencimiento: oFechaVencimiento.getDateValue(),
            BancoEmisor: oBcoEmisor.getSelectedKey(),
            BancoDestino: oBcoDestino.getSelectedKey(),
          };
        }

        DataFinal.push(oDatos);

        let ActiveDetalle = {
          MPkey: "0000000001",
          NroCheq: "",
          NroCte: "",
          Importe: "",
          FecEmis: null,
          FecDepo: null,
          FecCbte: null,
          FecVto: null,
          Fecha: null,
          BcoEmi: "",
          BcoDes: "",
          Adjunto: "",
        };
        oModel.setProperty("/ActiveDetalle", ActiveDetalle);
        oMP.setSelectedKey("0000000001");

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) +
            parseFloat(DataFinal[index].Importe.replace(/\./g, ""));
          DataFinal.NroLinea = index;
        }

        oModel.setProperty("/Detalle", DataFinal);
        oModel.setProperty("/Paso06Detalles", DataFinal.length);
        oModel.setProperty("/Paso06ImporteDetalle", oImportesSuma);

        this.onshowDetalleAdd(false, []);
        this._onUpdateValues();
        if (Update === "") {
          this.onGuardarButtonDETSavePress();
        } else {
          let rta = await this.onupdateModel(
            this.getOwnerComponent().getModel(),
            this.getView(),
            Update,
            oDatos
          );

          if (rta.Respuesta !== "OK") {
            this._onErrorHandle(rta.Datos);
          }

          oModel.refresh(true);
        }
      },

      onGuardarButtonDETSavePress: function () {
        let oEntidad = "/Detalle",
          Tipo = "DETA",
          oEntidadPost = "/PagosSet",
          Step = "idDetalleWizardStep";

        this._onGuardar(oEntidad, Tipo, Step, oEntidadPost);
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
        this.onshowDetalleAdd(oValue, []);
      },

      onButtonEditMPPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel(),
          oMockModel = this.getView().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext().getPath(),
          oItem = oEvent.getSource().getBindingContext().getObject();

        oMockModel.setProperty("/Paso06PathUpdate", oPath);
        this.onshowDetalleAdd(true, oItem);

        //   let Value = {
        //   ruta: oPath,
        //   datos: oItem,
        // };

        // let MpUpdate = oMockModel.setProperty("/MpUpdate", Value);

        // this.getView().byId("dialog1").open();
      },

      onCloseImporteChange: function () {
        this.getView().byId("dialog1").close();
      },

      onSaveImporteChange: async function () {
        let oModel = this.getView().getModel(),
          oMockModel = this.getView().getModel("mockdata"),
          MpUpdate = oMockModel.getProperty("/MpUpdate"),
          oPath = MpUpdate.ruta,
          oPayload = MpUpdate.datos,
          oView = this.getView();

        let rta = await this.onupdateModel(oModel, oView, oPath, oPayload);

        if (rta.Respuesta !== "OK") {
          this._onErrorHandle(rta.Datos);
        }

        oModel.refresh(true);
      },

      onButtonDeletePagoPressMsg: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel(),
          oPath = oEvent.getSource().getBindingContext().getPath(),
          oItem = oEvent.getSource().getBindingContext().getObject(),
          sMessage =
            this._i18n().getText("lbldescripcion") +
            ": " +
            oItem.Descripcion +
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

      onButtonDeletePagoPress: async function (oPath) {
        let oModel = this.getView().getModel(),
          oMockModel = this.getView().getModel("mockdata"),
          oItem = oModel.getObject(oPath),
          oView = this.getView(),
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Descuentos");

        let rta = await this.ondeleteModel(oModel, oView, oPath);

        if (rta.Respuesta !== "OK") {
          this._onErrorHandle(rta.Datos);
        } else {
          oMockModel.setProperty("/Paso06ImporteDetalle", 0);
        }

        // if (oAddedData.length > 1) {
        //   let removed = oAddedData.splice(oDetalleExist, 1);
        //   oModel.setProperty("/Detalle", oAddedData);
        // } else {
        //   oModel.setProperty("/Detalle", []);
        //   oModel.setProperty("/Paso06Detalles", 0);
        //   oModel.getProperty("/RESTANTE", 0);
        //   this.onCheckDetalles();
        // }

         oModel.refresh(true);
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

      onWizardStepDetalleComplete: function (params) {
        this._onUpdateValues();

        this._oNavContainer.to(this.byId("idwizardReviewPage"));

        let oModel = this.getOwnerComponent().getModel();
         oModel.refresh(true);
      },

      // ********************************************
      // Calculos ----------------------------
      // ********************************************

      _onUpdateValues: function () {
        let oModel = this.getView().getModel("mockdata"),
          ImportePGOCTA = this.formatCurrencytoText(
            oModel.getProperty("/Paso02ImportePagos")
          ),
          ImporteCBTES = this.formatCurrencytoText(
            oModel.getProperty("/Paso03ImporteComprobantes")
          ),
          ImporteDTO = this.formatCurrencytoText(
            oModel.getProperty("/Paso04ImporteDescuentos")
          ),
          ImporteRET = this.formatCurrencytoText(
            oModel.getProperty("/Paso05ImporteRetenciones")
          ),
          ImporteDET = this.formatCurrencytoText(
            oModel.getProperty("/Paso06ImporteDetalle")
          );

        let oSubTotal =
          parseFloat(ImportePGOCTA) +
          parseFloat(ImporteDTO) +
          parseFloat(ImporteDET) -
          parseFloat(ImporteRET);

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
      // Photo **************************************
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

      onWizardComplete: function () {},
      _backToWizardContent: function () {
        this._oNavContainer.backToPage(this._oWizardContentPage.getId());
      },

      onAnularButtonPress: function () {
        this._onClearTable(this.getView().byId("idPagoCtaTable"), 6);
        this._onClearTable(this.getView().byId("idComprobanteTable"), 7);
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

      onNavBack: async function () {
        // this.getOwnerComponent().getTargets().display("TargetMainView");

        let sMessage = this._i18n().getText("msgcancel"),
          oMockModel = this.getView().getModel("mockdata"),
          sMessageTitle = this._i18n().getText("msgvolver");

        this._onShowMsgBoxConfirm(sMessage, sMessageTitle).then((rta) => {
          if (rta === "OK") {
            this.discardProgress();
            oMockModel.setProperty("/NoComprobantes", false);
            this._onClearTable(this.getView().byId("idPagoCtaTable"), 6);
            this._onClearTable(this.getView().byId("idComprobanteTable"), 7);
            this.getOwnerComponent().getTargets().display("TargetMainView");
          }
        });
      },

      // ********************************************
      // Confirmacion Recibo*************************
      // ********************************************

      onConfirmarReciboButtonPress: async function () {
        let oMockModel = this.getView().getModel("mockdata"),
          oEntidad = "/DocumentosSet",
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oSubTotal = oMockModel.getProperty("/TOTAL"),
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
            this._onClearTable(this.getView().byId("idPagoCtaTable"), 6);
            this._onClearTable(this.getView().byId("idComprobanteTable"), 7);

            this.getOwnerComponent().getTargets().display("TargetMainView");
            oModel.refresh();
          });
        }
      },

      onAnularButtonPress: function () {
        this.discardProgress();
      },
    });
  }
);
