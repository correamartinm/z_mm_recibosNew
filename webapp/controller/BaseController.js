sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
    "sap/ui/core/routing/History",
  ],
  function (Controller, MessageBox,ValueState, History) {
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

      onAgregarDetalleButtonPress: function () {
        let oValue = true;
        this.onshowDetalleAdd(oValue);
      },

      onshowDetalleAdd: function (oValue) {
        let oModel = this.getView().getModel("layout"),
          oDescuento = "/detalleadd",
          data = [];
        this._onUpdateModel(oModel, oDescuento, oValue);

        let EditRecibo = oModel.getProperty("/EdicionRecibo");

        if (EditRecibo === true) {
          if (oValue === true) {
            this._wizard.invalidateStep(
              this.getView().byId("idDetalleWizardStep")
            );
          } else {
            this._wizard.validateStep(
              this.getView().byId("idDetalleWizardStep")
            );
          }
        }
      },

      // Paso Detalle  (Seleccion de Madios de Pago)

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
        // oFile = this.getView().byId(""),
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
        };
        let DataFinal = oldData.concat(oDatos);
        oModel.setProperty("/Detalle", DataFinal);

        let  ActiveDetalle= {
          MPkey: 0,
          NroCheq: 0,
          NroCte: 0,
          Importe: 0,
          FecEmis: null,
          FecDepo: null,
          FecCbte: null,
          FecVto: null,
          BcoEmi: "",
          BcoDes: "",
          Adjunto: "",
        };

        oModel.setProperty("/Detalle", DataFinal);
        oModel.setProperty("/ActiveDetalle", ActiveDetalle);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
        }

        let oValue = false;
        this.onshowDetalleAdd(oValue);

        oModel.setProperty("/Paso06Detalles", DataFinal.length);
        oModel.setProperty("/Paso06ImporteDetalle", oImportesSuma);
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
          oModel.createKey("/changeRequests", {
            ticketNumber: Ref,
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
