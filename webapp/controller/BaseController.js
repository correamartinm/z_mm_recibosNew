sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  function (Controller, History) {
    "use strict";

    return Controller.extend("morixe.zfirecibos.controller.BaseController", {
      _onUpdateModel: function (oModel, entity, values) {
        oModel.setProperty(entity, values);
      },

      _onGetDataModel: function (model, entity) {
        if (model) {
          let data = model.getProperty(entity);
          return data;
        }
      },

      formatFecha: function (sFec) {
        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "dd/mm/yyyy",
            strictParsing: true,
          }),
          oFecha = oDateFormat.format(sFec);
        return oFecha;
      },

      formatIconBool: function (param) {
        if (param === true) {
          return "accept";
        } else {
          return "decline";
        }
      },

      formatStateBool: function (param) {
        if (param === true) {
          return "Success";
        } else {
          return "Error";
        }
      },

      i18n: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      _onCallMsgBox: async function () {
        (sMessage = this.i18n.getText("undercontruction")),
          (sMessageTitle = this.i18n.getText("undercontruction"));
        this.onShowMsgBoxSucces(sMessage, sMessageTitle).then((rta) => {
          // alert(rta);
        });
      },

      _onShowMsgBoxConfirm: function (sMessage, sMessageTitle) {
        return new Promise((resolve, reject) => {
          sap.m.MessageBox.confirm(sMessage, {
            title: sMessageTitle,
            onClose: function (oAction) {
              resolve(oAction);
            }.bind(this),
            styleClass: "",
            actions: [
              sap.m.MessageBox.Action.OK,
              sap.m.MessageBox.Action.CANCEL,
            ],
            emphasizedAction: sap.m.MessageBox.Action.OK,
          });
        });
      },

      _onShowMsgBoxError: function (sMessage, sMessageTitle) {
        return new Promise((resolve, reject) => {
          sap.m.MessageBox.error(sMessage, {
            title: sMessageTitle,
            onClose: function (oAction) {
              resolve(oAction);
            }.bind(this),
            styleClass: "",
            actions: sap.m.MessageBox.Action.CLOSE,
            emphasizedAction: sap.m.MessageBox.Action.CLOSE,
          });
        });
      },

      _onShowMsgBoxSucces: function (sMessage, sMessageTitle) {
        return new Promise((resolve, reject) => {
          sap.m.MessageBox.success(sMessage, {
            title: sMessageTitle,
            onClose: function (oAction) {
              resolve(oAction);
            }.bind(this),
            styleClass: "",
            actions: sap.m.MessageBox.Action.OK,
            emphasizedAction: sap.m.MessageBox.Action.OK,
          });
        });
      },
    });
  }
);
