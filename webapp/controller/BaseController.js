sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
    "sap/ui/core/routing/History",
  ],
  function (Controller, MessageBox, ValueState, History) {
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

      _onFocusControl: function (oControl) {
        jQuery.sap.delayedCall(600, this, function () {
          oControl.focus;
        });
      },

      //  Detalle

      onAddCliente: function () {
        let Payload = {
            Codigo: "1",
            RazonSocial: "Empresa Test 01",
            Cuit: "30260778721",
            Domicilio: "Independencia 711",
            Localidad: "Claromeco",
            TipoIVA: "Resposable Inscripto",
            Observaciones: "Observaciones TEST",
          },
          oModel = this.getOwnerComponent().getModel(),
          oView = this.getView(),
          Entidad = "/CLIENTESSet";

        let rta = this._oncreateModel(oModel, oView, Entidad, Payload);
        console.log(rta);
      },

      formatFecha: function (sFec) {
        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "dd/MM/yyyy",
            strictParsing: true,
            UTC: true,
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
      // ********************** File Uploader

      onAttachmentChange: function (oEvent) {
        let FileControl = oEvent.getSource();
        FileControl.setValueState("None");
      },

      _addHeaderParameters: function (FileControl) {
        var that = this;
        FileControl.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "slug",
            value: FileControl.getValue(),
          })
        );

        FileControl.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "x-csrf-token",
            value: that.getOwnerComponent().getModel().getSecurityToken(),
          })
        );
      },

      _onPostFile: function (FileControl, Ref) {
        var sAttachmentURL =
          oModel.sServiceUrl +
          oModel.createKey("/AttachDocSet", {
            Cliente: Ref,
            Tipo: oTipo,
          }) +
          "/attachments";
        this._addHeaderParameters(FileControl);
        FileControl.setSendXHR(true);
        FileControl.setUploadUrl(sAttachmentURL);
        FileControl.upload();
        FileControl.setValue("");
        FileControl.removeAllHeaderParameters();
      },

      //*********************************** */

      _onSaveData: async function (oModel, oView, item) {
        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          paso1 = oMockModel.getProperty("/Paso01Cliente");

        let oPayload = {
            Codigo: item.Codigo || "",
            Cliente: paso1.Cliente || "",
            TipoLinea: item.TipoLinea || "",
            Descripcion: item.Descripcion || "",
            Importe: item.Importe.toString() || "",
            Numero: item.Numero.toString() || "",
            Fecha: item.Fecha || "",
            Documentacion: item.Documentacion || "",
            Mensaje: item.Mensaje || "",
            Resultado: item.Resultado || "",
            Detalle: item.Detalle || "",
            NroCheque: item.NroCheque || "",
            FechaEmision: item.FechaEmision || null,
            FechaVencimiento: item.FechaVencimiento || null,
            BancoEmisor: item.BancoEmisor || "",
            BancoDestino: item.BancoDestino || "",
          },
          oEntidad = "/DocumenPosSet";
        console.log(oPayload);
        let rta = await this._oncreateModel(oModel, oView, oEntidad, oPayload);

        return rta;
      },

      _i18n: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      // Actualizacion Modelos -------------------

      _oncreateModel: function (oModel, oView, oEntity, oPayload) {
        return new Promise((resolve, reject) => {
          oView.setBusy(true);
          oModel.create(oEntity, oPayload, {
            success: function (oData) {
              oView.setBusy(false);

              resolve(oData);
              // if (oData.Tipo === "E") {
              //   // Error
              // } else {
              //   oModel.refresh;
              //   // Correcto
              // }
            }.bind(this),

            error: function (oError) {
              oView.setBusy(false);
              resolve(oError);
              // Reiniciar
            }.bind(this),
          });
        });
      },

      onupdateModel: function (oModel, oView, oPath, oPayload) {
        return new Promise((resolve, reject) => {
          oView.setBusy(true);
          oModel.update(oPath, oPayload, {
            success: function (oData) {
              oView.setBusy(false);

              if (oData.Tipo === "E") {
                // Error
              } else {
                resolve(oData);
                oModel.refresh;
                // Correcto
              }
            }.bind(this),

            error: function (oError) {
              oView.setBusy(false);

              // Reiniciar
            }.bind(this),
          });
        });
      },

      ondeleteModel: function (oModel, oView, oPath) {
        return new Promise((resolve, reject) => {
          oView.setBusy(true);
          oModel.remove(oPath, {
            method: "DELETE",
            success: function (oData) {
              oView.setBusy(false);
              resolve(oData);
              oModel.refresh;
            },
            error: function (oError) {
              oView.setBusy(false);
            },
          });
        });
      },

      _onreadModel: function (oModel, oView, oPath) {
        return new Promise((resolve, reject) => {
          let that = this;
          oView.setBusy(true);
          oModel.read(oPath, {
            success: jQuery.proxy(function (oData) {
              oView.setBusy(false);
              resolve(oData);
            }, this),
            error: function (oError) {
              oView.setBusy(false);
              that._onErrorHandle(oError);
            },
          });
        });
      },

      _onfilterModel: function (oModel, oView, oEntity, oFilters) {
        return new Promise((resolve, reject) => {
          oView.setBusy(true);
          oModel.read(oEntity, {
            filters: [oFilters],
            success: jQuery.proxy(function (oData) {
              oView.setBusy(false);
              resolve(oData);
            }, this),
            error: function (oError) {
              oView.setBusy(false);
            },
          });
        });
      },

      // Mensajeria -----------------------

      _onShowMsgBoxConfirm: function (sMessage, sMessageTitle) {
        return new Promise((resolve, reject) => {
          MessageBox.confirm(sMessage, {
            icon: MessageBox.Icon.QUESTION,
            title: sMessageTitle,
            onClose: function (oAction) {
              resolve(oAction);
            }.bind(this),
            styleClass: "",
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
          });
        });
      },

      _onShowMsgBoxError: function (sMessage, sMessageTitle) {
        return new Promise((resolve, reject) => {
          MessageBox.error(sMessage, {
            icon: MessageBox.Icon.ERROR,
            title: sMessageTitle,
            onClose: function (oAction) {
              resolve(oAction);
            }.bind(this),
            styleClass: "",
            actions: MessageBox.Action.CLOSE,
            emphasizedAction: MessageBox.Action.CLOSE,
          });
        });
      },

      _onShowMsgBoxSucces: function (sMessage, sMessageTitle) {
        return new Promise((resolve, reject) => {
          MessageBox.success(sMessage, {
            icon: MessageBox.Icon.SUCCESS,
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
