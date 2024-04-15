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

      onButtonEditPress: async function (oEvent) {
       

        let oPath = oEvent.getSource().getBindingContext().getPath(),
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oView = this.getView(),
          oModel = this.getOwnerComponent().getModel(),
          oItem = oEvent.getSource().getBindingContext().getObject(),
          oCboMp = this.getView().byId("idselectMPEdit");


          let oKey = oModel.createKey("/PagosSet", { Codigo: oItem.Numero });
          let oMp = await this._onreadModel(oModel, oView, oKey);
          if (oMp.Rta === "OK"){

          }

          debugger;

        let EtvoItem = oCboMp.getItemByText("DEPOSITO BANCARIO EN EFECTIVO");

        Object.NroLinea = EtvoItem.mProperties.key;
        Object.Descripcion = EtvoItem.mProperties.text;
        oCboMp.setSelectedKey(EtvoItem.mProperties.key);
        oCboMp.fireChange();

        oPath = oCboMp.getSelectedItem().getBindingContext().getPath();

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
        oMockModel.setProperty("/ActiveDetalle", oItem);
        this.getView().byId("DLGEditMP").open();

      },


      onSaveMPChange: function () {

        let  oMockModel = this.getOwnerComponent().getModel("mockdata"),
        oData = oMockModel.getProperty("/ActiveDetalle");



        this.getView().byId("DLGEditMP").close();
      },


      onCloseMPChange: function () {
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
