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

      _getBaseURL: function () {
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        return appModulePath;
      },

      _onObjectMatched: function () {
        this._onRefreshTable([]);
      },

      _createUserModel: function () {
        let oMockModel = this.getView().getModel("mockdata");

        return new Promise(
          function (e) {
            var t = { userMail: "", userCode: "" };
            try {
              if (sap.ushell) {
                var a = sap.ushell.Container.getUser();
                t.userMail = a.getEmail();
                t.userCode = a.getId();
                if (t.userCode.length > 7) {
                  VgUser = t.userCode;
                  VgMail = t.userMail;

                  oMockModel.setProperty("/email", t.userMail);
                  oMockModel.setProperty("/user", t.userCode);
                } else {
                  VgUser = t.userCode;
                }
              }
            } catch (e) {
              t.userMail = "USER DEFAULT";
              t.userCode = "USER_DEFAULT";
              this._IniTUser();
            }
            e(t);
          }.bind(this)
        );
      },

      _IniTUser: function () {
        const url = this._getBaseURL() + "/user-api/currentUser";
        var oJsonModel = new JSONModel();
        let oMockModel = this.getView().getModel("mockdata");

        oJsonModel.loadData(url);
        oJsonModel
          .dataLoaded()
          .then(() => {
            if (!oJsonModel.getData().email) {
            } else {
              oMockModel.setProperty("/email", oJsonModel.getData().email);
              sap.ui.getCore().setModel(oJsonModel, "userapi");
            }
          })
          .catch(() => {});
      },

      onButtonPrintPress: function (params) {},
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
          oProcesado = oView.byId("idProcesadoFilter"),
          oFecha = oView.byId("idFechaDateRangeSelection");

        oRazonsocial.setValue(null);
        oProcesado.setSelectedKey(null);
        oCuit.setValue(null);
        oFecha.setValue(null);
        let oFilter = [];
        this._onRefreshTable(oFilter);
      },

      onFilterBarSearch: function () {
        let oView = this.getView(),
          oFilter = [],
          oRazonsocial = oView.byId("idRazonSocialMultiInput"),
          oProcesado = oView.byId("idProcesadoFilter").getSelectedKey(),
          oCuit = oView.byId("idCuitMultiInput"),
          oRangoFecha = oView.byId("idFechaDateRangeSelection"),
          oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "dd/mm/yyyy",
          });

        if (oRazonsocial.getTokens().length !== 0) {
          var orFilterL = [];
          for (var l = 0; l < oRazonsocial.getTokens().length; l++) {
            orFilterL.push(
              new sap.ui.model.Filter(
                "RazonSocial",
                sap.ui.model.FilterOperator.Contains,
                oRazonsocial.getTokens()[l].getKey()
              )
            );
          }
          oFilter.push(new sap.ui.model.Filter(orFilterL, true));
        }

        if (oCuit.getTokens().length !== 0) {
          var orFilterL = [];
          for (var l = 0; l < oCuit.getTokens().length; l++) {
            orFilterL.push(
              new sap.ui.model.Filter(
                "Cuit",
                sap.ui.model.FilterOperator.EQ,
                oCuit.getTokens()[l].getKey()
              )
            );
          }
          oFilter.push(new sap.ui.model.Filter(orFilterL, true));
        }

        if (oRangoFecha.getValue().length !== 0) {
          var oFInicio = oDateFormat.format(oRangoFecha.getFrom());
          var oFFin = oDateFormat.format(oRangoFecha.getTo());

          oFilter.push(
            new Filter("Fecha", sap.ui.model.FilterOperator.BT, oFInicio, oFFin)
          );
        }

        if (oProcesado) {
          if (oProcesado === "X") {
            oFilter.push(
              new sap.ui.model.Filter(
                "Procesado",
                sap.ui.model.FilterOperator.EQ,
                oProcesado
              )
            );
          } else {
            oFilter.push(
              new sap.ui.model.Filter(
                "Procesado",
                sap.ui.model.FilterOperator.NE,
                "X"
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

      onButtonEditPress: function (oEvent) {
        this._onEditMode();
        let oPath = oEvent.getSource().getBindingContext().getPath(),
          oItem = oEvent.getSource().getBindingContext().getObject();
      },

      _onEditMode: function () {
        let oLayoutModel = this.getView().getModel("layout"),
          oEntidad = "/EdicionRecibo",
          oValue = oLayoutModel.getProperty(oEntidad);
        oValue = !oValue;

        oLayoutModel.setProperty(oEntidad, oValue);
      },

      // *** Nuevo Recibo

      onAgregarButtonPress: function (oEvent) {
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
