sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} BaseController
   */
  function (BaseController, MessageToast, FilterOperator, Filter, JSONModel) {
    "use strict";

    return BaseController.extend("morixe.zfirecibos.controller.MainView", {
      onInit: function () {
        // this._createUserModel();
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        let oTarget = oRouter.getTarget("TargetMainView");
        oTarget.attachDisplay(this._onObjectMatched, this);
      },

      // ****************** Usuario

      _onObjectMatched: function () {
        this._onRefreshTable([]);

        this.getOwnerComponent().getModel().setSizeLimit("20000");
      },

      /**
       * @override
       */
      onAfterRendering: function () {
        let oModel = this.getOwnerComponent().getModel();

        //var oJson = { Numero: gTicket, Estado: gEstado };
        //urlParameters: oJson,

        oModel.callFunction("/Iniciar", {
          method: "GET",
          success: jQuery.proxy(function (oData, response) {
            console.log("Parametros iniciales OK");
          }),
          error: jQuery.proxy(function (oError) {
            //  MessageBox.error("Error");
          }),
        });

      },

      onButtonPrintPress: function (oEvent) {
        let oPath = oEvent.getSource().getBindingContext().getPath(),
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oItem = oEvent.getSource().getBindingContext().getObject();

        var oData = {
          Codigo: oItem.Numero,
        };

        oView.setBusy(true);
        oModel.callFunction("/PrintDoc", {
          method: "GET",
          urlParameters: oData,

          success: jQuery.proxy(function (oData) {
            oView.setBusy(false);

            if (oData.PrintDoc.URL) {
              let url =
                window.location.protocol +
                "//" +
                window.location.host +
                oData.PrintDoc.URL;

              window.open(url);
            }
          }, this),
          error: jQuery.proxy(function (oError) {
            oView.setBusy(false);

            MessageToast.show(that.getResourceBundle().getText("printError"));
          }, this),
        });
      },
      // Filtros **************************

      _onRefreshTable: function (oFilter) {
        var oTable = this.byId("idTable"); //
        var binding = oTable.getBinding("items");
        binding.filter(oFilter, "Application");
      },

      onFilterBarReset: function () {
        let oView = this.getView(),
          oRazonsocial = oView.byId("idRazonSocialMultiInput"),
          oCuit = oView.byId("idCuitMultiInput"),
          oNumero = oView.byId("idnumeroMultiInput"),
          oProcesado = oView.byId("idProcesadoFilter"),
          oFecha = oView.byId("idFechaDateRangeSelection");

        oRazonsocial.removeAllTokens();
        oNumero.removeAllTokens();
        oProcesado.setSelectedKey(null);
        oCuit.removeAllTokens();
        oFecha.setValue(null);

        oNumero.setValue("");
        oRazonsocial.setValue("");

        let oFilter = [];
        this._onRefreshTable(oFilter);
      },

      onFilterBarSearch: function () {
        let oView = this.getView(),
          oFilter = [],
          oRazonsocial = oView.byId("idRazonSocialMultiInput"),
          oNumero = oView.byId("idnumeroMultiInput"),
          oProcesado = oView.byId("idProcesadoFilter").getSelectedKey(),
          oCuit = oView.byId("idCuitMultiInput"),
          oRangoFecha = oView.byId("idFechaDateRangeSelection"),
          oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "dd/mm/yyyy",
          });

        if (oNumero.getTokens().length !== 0) {
          let ofnum = new Array();
          for (var l = 0; l < oNumero.getTokens().length; l++) {
            ofnum.push(
              new sap.ui.model.Filter(
                "Numero",
                sap.ui.model.FilterOperator.EQ,
                oNumero.getTokens()[l].getKey()
              )
            );
          }
          oFilter.push(new sap.ui.model.Filter(ofnum, false));
        } else {
          if (oNumero.getValue()) {
            oFilter.push(
              new sap.ui.model.Filter(
                "Numero",
                sap.ui.model.FilterOperator.Contains,
                oNumero.getValue()
              )
            );
          }
        }

        if (oRazonsocial.getTokens().length !== 0) {
          let ofrs = new Array();
          for (var l = 0; l < oRazonsocial.getTokens().length; l++) {
            ofrs.push(
              new sap.ui.model.Filter(
                "Cliente",
                sap.ui.model.FilterOperator.EQ,
                oRazonsocial.getTokens()[l].getKey()
              )
            );
          }
          oFilter.push(new sap.ui.model.Filter(ofrs, false));
        } else {
          if (oRazonsocial.getValue()) {
            oFilter.push(
              new sap.ui.model.Filter(
                "RazonSocial",
                sap.ui.model.FilterOperator.Contains,
                oRazonsocial.getValue()
              )
            );
          }
        }

        if (oCuit.getTokens().length !== 0) {
          let ofcuit = new Array();
          for (var l = 0; l < oCuit.getTokens().length; l++) {
            ofcuit.push(
              new sap.ui.model.Filter(
                "Cuit",
                sap.ui.model.FilterOperator.EQ,
                oCuit.getTokens()[l].getKey()
              )
            );
          }
          oFilter.push(new sap.ui.model.Filter(ofcuit, false));
        } else {
          if (oCuit.getValue()) {
            oFilter.push(
              new sap.ui.model.Filter(
                "Cuit",
                sap.ui.model.FilterOperator.Contains,
                oCuit.getValue()
              )
            );
          }
        }

        if (oRangoFecha.getValue().length !== 0) {
          // var oFInicio = oDateFormat.formatoRangoFecha.getDateValue());
          // var oFFin = oDateFormat.format(oRangoFecha.getSecondDateValue());

          let fini = new Date(oRangoFecha.getDateValue() + "GMT");
          let ffin = new Date(oRangoFecha.getSecondDateValue() + "GMT");

          oFilter.push(
            new sap.ui.model.Filter(
              "Fecha",
              sap.ui.model.FilterOperator.BT,
              fini,
              ffin
            )
          );
        }

        if (oProcesado) {
          if (oProcesado === "N" || oProcesado === "") {
            oFilter.push(
              new sap.ui.model.Filter(
                "Procesado",
                sap.ui.model.FilterOperator.NE,
                "X"
              )
            );
            oFilter.push(
              new sap.ui.model.Filter(
                "Procesado",
                sap.ui.model.FilterOperator.NE,
                "A"
              )
            );
          } else {
            oFilter.push(
              new sap.ui.model.Filter(
                "Procesado",
                sap.ui.model.FilterOperator.EQ,
                oProcesado
              )
            );
          }
        }

        let AllFilter = new sap.ui.model.Filter(oFilter, true);

        this._onRefreshTable(AllFilter);
      },
      onSearchRS: function (oEvent) {
        let oTable = oEvent.getSource().getParent().getParent(),
          oTarget = oEvent.getSource(),
          oFilters = [],
          oValue = oEvent.getSource().getValue();

        if (oValue.length >= 0) {
          oFilters.push(
            new Filter("RazonSocial", FilterOperator.Contains, oValue)
          );
        } else {
          oEvent.getSource().setValue();

          // MessageToast.show(sMessage);

          jQuery.sap.delayedCall(300, this, function () {
            oTarget.focus();
          });
        }
        oTable.getBinding("items").filter([oFilters]);
      },

      onDetallePagoSetComboBoxSelectionChange: function (oEvent) {
        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oModel = this.getOwnerComponent().getModel(),
          oSource = oEvent.getSource(),
          oPath = oSource.getSelectedItem().getBindingContext().getPath();

        let vObject = oModel.getObject(oPath);

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

      onPreliminarSetTableSelectionChange: function (oEvent) {
        let oItem = oEvent.getSource().getSelectedItem(),
          oBject = oItem.getBindingContext("mockdata").getObject(),
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oCboMp = this.getView().byId("idselectMPEdit"),
          oFilter = new sap.ui.model.Filter(
            "Deposito",
            sap.ui.model.FilterOperator.Contains,
            "X"
          );

        let oBinding = oCboMp.getBinding("items");
        oBinding.filter([oFilter]);
        oBject.Fecha = new Date();
        oBject.Detalle = "";
        oMockModel.setProperty("/ActiveDetalleEdit", oBject);
      },

      onButtonEditPress: async function (oEvent) {
        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext().getPath(),
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oEntidad = "/PreliminarSet",
          Tipo = "DETA",
          oItem = oEvent.getSource().getBindingContext().getObject();

        let registros = await this._onUpdateTable(oItem.Numero);

        // if (registros.length === 1) {

        //   oMockModel.setProperty("/ActiveDetalleEdit", registros[0]);
        // } else {
        //   oMockModel.setProperty("/ActiveDetalleEdit", []);
        // }

        this.getView().byId("DLGEditMP").open();
      },

      _onUpdateTable: async function (Codigo) {
        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oModel = this.getOwnerComponent().getModel(),
          oTable = this.getView().byId("idTableMPEfet"),
          oView = this.getView(),
          oEntidad = "/PreliminarSet",
          Tipo = "DETA",
          oFilters = new Array();
        oFilters.push(
          new sap.ui.model.Filter({
            path: "Codigo",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: Codigo,
          })
        );

        let oComprobantesControl = await this._onfilterModel(
          oModel,
          oView,
          oEntidad,
          oFilters
        );

        oMockModel.setProperty("/PreliminarData", oComprobantesControl.results);

        oTable.removeSelections();
        return oComprobantesControl.results;
      },

      onSaveMPChange: async function () {
        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oPath,
          oEntidad = "/PreliminarSet",
          oCboMp = this.getView().byId("idselectMPEdit"),
          oData = oMockModel.getProperty("/ActiveDetalleEdit");

        oPath = oModel.createKey("/PreliminarSet", {
          Codigo: oData.Codigo,
          TipoLinea: oData.TipoLinea,
          NroLinea: oData.NroLinea,
          TipoNroLinea: oData.TipoNroLinea,
        });

        let rta = await this._oncreateModel(oModel, oView, oEntidad, oData);

        if (rta.Mensaje) {
          MessageToast.show(rta.Mensaje);
        }

        let registros = await this._onUpdateTable(oData.Codigo);
        oCboMp.setSelectedKey(null);
        oMockModel.setProperty("/ActiveDetalleEdit", { Detalle: "" });

        if (registros.length === 0) {
          this.onCloseMPChange();
        }
      },

      onCloseMPChange: function () {
        this.getOwnerComponent().getModel().refresh();
        this.getView().byId("DLGEditMP").close();
      },

      // *** Nuevo Recibo

      onAgregarButtonPress: function (oEvent) {
        let oMockModel = this.getView().getModel("mockdata");
        let oData = {};
        oData.Completo = false;

        oMockModel.setProperty("/Paso01Cliente", oData);

        this.getOwnerComponent().getTargets().display("TargetNewRecibo");
        let oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          oPath = oModel.createKey("/DocumentosSet", {
            Cliente: "",
          });
        this.ondeleteModel(oModel, oView, oPath);
      },
    });
  }
);
