sap.ui.define(
  ["./BaseController", "sap/m/MessageToast", "sap/ui/model/json/JSONModel",],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} BaseController
   */
  function (BaseController, MessageToast, JSONModel) {
    "use strict";

    return BaseController.extend("morixe.zfirecibos.controller.MainView", {
      onInit: function () {
        this._createUserModel();
      },

      // ****************** Usuario

      _getBaseURL: function () {
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        return appModulePath;
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
          oFecha = oView.byId("idFechaDateRangeSelection");

        oRazonsocial.setValue(null);
        oCuit.setValue(null);
        oFecha.setValue(null);
        let oFilter = [];
        this._onRefreshTable(oFilter);
      },

      onFilterBarSearch: function () {
        let oView = this.getView(),
          oFilter = [];
          oRazonsocial = oView.byId("idRazonSocialMultiInput"),
          oCuit = oView.byId("idCuitMultiInput"),
          oRangoFecha = oView.byId("idFechaDateRangeSelection");
          oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: 'dd/mm/yyyy'
          });

          if (oRazonsocial.getTokens().length !== 0) {
            var orFilterL = [];
            for (var l = 0; l < oRazonsocial.getTokens().length; l++) {
              orFilterL.push(
                new sap.ui.model.Filter(
                  "crewID",
                  sap.ui.model.FilterOperator.EQ,
                  oRazonsocial.getTokens()[l].getKey()
                )
              );
            }
            oFilter.push(new sap.ui.model.Filter(orFilterL, false));
          }

          if (oCuit.getTokens().length !== 0) {
            var orFilterL = [];
            for (var l = 0; l < oCuit.getTokens().length; l++) {
              orFilterL.push(
                new sap.ui.model.Filter(
                  "crewID",
                  sap.ui.model.FilterOperator.EQ,
                  oCuit.getTokens()[l].getKey()
                )
              );
            }
            oFilter.push(new sap.ui.model.Filter(orFilterL, false));
          }

          if (oRangoFecha.getValue().length !== 0) {

            var oFInicio = oDateFormat.format(oRangoFecha.getFrom());
            var oFFin = oDateFormat.format(oRangoFecha.getTo());
    
            oFilter.push(new Filter("fecha_ficha", sap.ui.model.FilterOperator.BT, oFInicio, oFFin));
    
          }

          let AllFilter = new sap.ui.model.Filter(oFilter, true);
          
          this._onRefreshTable(AllFilter);

      },

      // *** Nuevo Recibo

      onAgregarButtonPress: function (oEvent) {
        this.getOwnerComponent().getTargets().display("TargetNewRecibo");
      },
    });
  }
);
