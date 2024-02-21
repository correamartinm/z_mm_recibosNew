sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/core/routing/History",
  ],
  function (
    Controller,
    MessageBox,
    ValueState,
    FilterOperator,
    Filter,
    History
  ) {
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

      onAmountChange: function (oEvent) {
        var oInput = oEvent.getSource();
        var sValue = oInput.getValue();

        // Parse the entered value and format it as currency
        var oCurrencyType = new Currency({
          showMeasure: false,
        });

        try {
          var fParsedValue = oCurrencyType.parseValue(sValue, "string");
          oInput.setValue(oCurrencyType.formatValue(fParsedValue, "string"));
        } catch (oException) {
          // Handle parse errors, if any
          oInput.setValueState("Error");
        }
      },

      formatCurrencytoText: function (ovalue) {
        if (isNaN(ovalue) === true) {
          if (ovalue.includes(",")) {
            ovalue = ovalue.replace(/\./g, "");
            ovalue = ovalue.replace(/,/g, ".");
          }
        }

        return ovalue;
      },

      formatItem: function (text, value) {
        if (!text) {
          return "";
        } else {
          let ovalue = parseFloat(value);
          if (text.toUpperCase() === "SALDO" && value !== "") {
            if (parseFloat(value) <= 0) {
              this.getOwnerComponent()
                .getModel("mockdata")
                .setProperty("/SALDO", -1);
            } else {
              this.getOwnerComponent()
                .getModel("mockdata")
                .setProperty("/SALDO", parseFloat(value));
            }
          }
        }
        return text;
      },

      formatUrl: function (Item) {
        let srv = "/sap/opu/odata/sap/ZGWFI_COBRANZAS_APROB_SRV",
          ID = Item.Codigo,
          oName = Item.Filename,
          id = "AttachDocSet(Codigo='" + ID + "',",
          file = "Filename='" + oName,
          Adjunto = "', Adjunto='" + Item.Adjunto;
        let rta = srv + Item + "/$value";
        // let rta = srv + id + file + Adjunto +"')/$value";
        return rta;
      },

      formatNumber: function (value) {
        if (!value) return 0;

        let ovalue = parseFloat(value);
        return ovalue;
      },
      formatState: function (value) {
        if (!value) return "Error";

        let ovalue = parseFloat(value);
        if (ovalue > 0) {
          return "Warning";
        } else {
          return "Success";
        }
      },

      formatIconBool: function (param) {
        switch (param) {
          case "X":
            return "accept";

            break;
          case "A":
            return "sys-cancel";

            break;

          default:
            return "border";
            break;
        }
      },

      formatText: function (param) {
        switch (param) {
          case "X":
            return this._i18n().getText("btnprocesado");

            break;
          case "A":
            return this._i18n().getText("btnanulado");

            break;

          default:
            return "";
            break;
        }
      },

      formatCurrency: function (param) {
        let oValue,
          oCurrencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(
            { currencyCode: false }
          );

        if (param === undefined) return param;
        if (isNaN(param) === true && param.includes(",")) {
          return param;
        }

        if (param) {
          oValue = oCurrencyFormat.format(param);
          return oValue;
        } else {
          return param;
        }
      },

      formatStateBool: function (param) {
        switch (param) {
          case "X":
            return "Success";

            break;
          case "A":
            return "Error";

            break;

          default:
            return "None";
            break;
        }
      },
      // ********************** File Uploader

      onAttachmentChange: function (oEvent) {
        let FileControl = oEvent.getSource();
        FileControl.setValueState("None");
      },

      //*********************************** */

      _oncreateModelNew: function (oModel, oView, oEntity, oPayload) {
        return new Promise((resolve, reject) => {
          oView.setBusy(true);
          let that = this;
          oModel.create(oEntity, oPayload, {
            success: function (oData) {
              oView.setBusy(false);
              resolve({ Respuesta: "OK", Datos: oData });
              oModel.refresh(true);
            }.bind(this),

            error: function (oError) {
              oView.setBusy(false);
              resolve({ Respuesta: "ERROR", Datos: oError });
              // Reiniciar
            }.bind(this),
          });
        });
      },

      onCheckStep: function (oEvent) {
        let Entidad = oEvent.oSource.sPath,
          step,
          registros = oEvent.mParameters.data.results.length;

        switch (Entidad) {
          // case "/DescuentosSet":
          //   step = "idDescuentosWizardStep";
          //   break;
          // case "/RetencionesSet":
          //   step = "idRetencionesWizardStep";
          //   break;
          case "/PagosSet":
            step = "idDetalleWizardStep";
            break;
        }
        if (step === undefined) return;
        if (registros === 0) {
          this._wizard.invalidateStep(this.getView().byId(step));
        } else {
          this._wizard.validateStep(this.getView().byId(step));
        }
      },

      _i18n: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      // ********************************************
      // Ficheros *******************
      // ********************************************

      onCallFileDialogRECIB: function (oEvent) {
        let oItem = {},
          oFilter = [],
          oMockModel = this.getOwnerComponent().getModel("mockdata");

        let oData = oEvent.getSource().getBindingContext().getObject();
        oItem.Cliente = oData.Cliente;
        oItem.Recibo = oData.Numero;
        oItem.Tipo = "RECIB";

        oMockModel.setProperty("/FileParameters", oItem);

        oFilter.push(new Filter("Recibo", FilterOperator.EQ, oItem.Recibo));
        oFilter.push(new Filter("Codigo", FilterOperator.EQ, oItem.Cliente));
        oFilter.push(new Filter("Tipo", FilterOperator.EQ, oItem.Tipo));

        this.onFileDialog(oItem, oFilter);
      },

      onCallFileDialogDESC: function (oEvent) {
        let oSource = oEvent.getSource().getId(),
          oItem = {},
          oFilter = [],
          oMockModel = this.getOwnerComponent().getModel("mockdata");

        let paso1 = oMockModel.getProperty("/Paso01Cliente");
        oItem.Cliente = paso1.Cliente;
        oItem.Tipo = "DESC";

        oMockModel.setProperty("/FileParameters", oItem);

        oFilter.push(new Filter("Codigo", FilterOperator.EQ, oItem.Cliente));
        oFilter.push(new Filter("Tipo", FilterOperator.EQ, oItem.Tipo));

        this.onFileDialog(oItem, oFilter);
      },

      onCallFileDialogRETE: function (oEvent) {
        let oSource = oEvent.getSource().getId(),
          oItem = {},
          oFilter = [],
          oMockModel = this.getOwnerComponent().getModel("mockdata");

        let paso1 = oMockModel.getProperty("/Paso01Cliente");
        let paso5 = oMockModel.getProperty("/ActiveRetencion");
        oItem.filename = paso5.NroLinea;
        oItem.Cliente = paso1.Cliente;
        oItem.Tipo = "RETE";

        oMockModel.setProperty("/FileParameters", oItem);

        oFilter.push(new Filter("Codigo", FilterOperator.EQ, oItem.Cliente));
        oFilter.push(new Filter("Tipo", FilterOperator.EQ, oItem.Tipo));

        this.onFileDialog(oItem, oFilter);
      },

      onCallFileDialogDETA: function (oEvent) {
        let oSource = oEvent.getSource().getId(),
          oItem = {},
          oFilter = [],
          oMockModel = this.getOwnerComponent().getModel("mockdata");

        let paso1 = oMockModel.getProperty("/Paso01Cliente");

        let paso5 = oMockModel.getProperty("/ActiveDetalle");
        oItem.filename = paso5.Descripcion;
        oItem.Cliente = paso1.Cliente;
        oItem.Tipo = "DETA";

        oMockModel.setProperty("/FileParameters", oItem);
        oFilter.push(new Filter("Codigo", FilterOperator.EQ, oItem.Cliente));
        oFilter.push(new Filter("Tipo", FilterOperator.EQ, oItem.Tipo));

        this.onFileDialog(oItem, oFilter);
      },

      onFileDialog: function (oItem, oFilters) {
        if (!this._oDialogUploadSet) {
          this._oDialogUploadSet = sap.ui.xmlfragment(
            "UploadFile",
            "morixe.zfirecibos.view.fragments.FileUploader",
            this
          );
          this.getView().addDependent(this._oDialogUploadSet);
        }

        // Filtro Ficheros

        let check = this.getOwnerComponent()
            .getModel("mockdata")
            .getProperty("/FileParameters"),
          oUploadCollection = sap.ui.core.Fragment.byId(
            "UploadFile",
            "attachmentUpl"
          ),
          oTitle = "";
        switch (check.Tipo) {
          case "DESC":
            oTitle = "Solo Adjuntos Descuentos";
            break;

          case "DETA":
            oTitle = "Solo Adjuntos Medios de Pago";
            break;

          case "RECIB":
            oTitle = "Adjuntos ";
            break;

          case "RETE":
            oTitle = "Solo Adjuntos de Retenciones";
            break;

          default:
            break;
        }

        // Muestro Dialogo
        if (oItem.Recibo !== undefined) {
          this._oDialogUploadSet.setTitle(
            "Cliente: " + oItem.Cliente + " Numero: " + oItem.Recibo
          );
        } else {
          this._oDialogUploadSet.setTitle( "Cliente: " + oItem.Cliente+" - "+ oTitle);
        }

        let Item = oUploadCollection.getBinding("items");

        Item.filter(oFilters);

        if (check.Tipo === "RECIB") {
          oUploadCollection.setUploadEnabled(false);
          // oUploadCollection.setUploadButtonInvisible(false);
        }

        this._oDialogUploadSet.open();
      },

      onCloseonFileDialog: function () {
        this._oDialogUploadSet.close();
        this._oDialogUploadSet.destroy();
        this._oDialogUploadSet = null;
      },

      onSelectAllAttachments: function (oEvent) {
        var aUploadedItems = sap.ui.core.Fragment.byId(
            "UploadFile",
            "attachmentUpl"
          ).getItems(),
          bSelected = oEvent.getSource().getSelected();
        if (bSelected) {
          //if CheckBox is selected
          aUploadedItems.forEach((oItem) =>
            oItem.getListItem().setSelected(true)
          );
          sap.ui.core.Fragment.byId("UploadFile", "download").setEnabled(true);
        } else {
          aUploadedItems.forEach((oItem) =>
            oItem.getListItem().setSelected(false)
          );
          sap.ui.core.Fragment.byId("UploadFile", "remove").setEnabled(false);
          sap.ui.core.Fragment.byId("UploadFile", "download").setEnabled(false);
        }
      },

      onSelectionChangeAttachment: function () {
        if (
          sap.ui.core.Fragment.byId("UploadFile", "attachmentUpl")
            .getList()
            .getSelectedItems().length > 0
        ) {
          //if user selects 1 or more uploaded item

          sap.ui.core.Fragment.byId("UploadFile", "remove").setEnabled(true);
          sap.ui.core.Fragment.byId("UploadFile", "download").setEnabled(true);
        } else {
          sap.ui.core.Fragment.byId("UploadFile", "remove").setEnabled(false);
          sap.ui.core.Fragment.byId("UploadFile", "download").setEnabled(false);
        }
      },

      onRemove: function (oEvent) {
        var oAttachmentUpl = sap.ui.core.Fragment.byId(
          "UploadFile",
          "attachmentUpl"
        );
        oAttachmentUpl.setBusy(true);
        let that = this;
        oAttachmentUpl.getItems().forEach((oItem) => {
          if (oItem.getListItem().getSelected()) {
            var sPath = oItem.getBindingContext().getPath();
            this.getView()
              .getModel()
              .remove(sPath, {
                success: function () {
                  oAttachmentUpl.removeItem(oItem); //remove from displayed list
                },
                error: function (oError) {
                  that.parseErrorMsg(oError);
                },
              });
          }
        });
        // oEvent.getSource().setEnabled(false);
        sap.ui.core.Fragment.byId("UploadFile", "download").setEnabled(false);

        if (oAttachmentUpl.getItems().length > 0) {
          sap.ui.core.Fragment.byId("UploadFile", "checkbox").setVisible(true);
        } else {
          sap.ui.core.Fragment.byId("UploadFile", "checkbox").setVisible(false);
        }
        oAttachmentUpl.setBusy(false);
      },

      onDownload: function (oEvent) {
        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          File = oMockModel.getProperty("/FileParameters"),
          oAttachmentUpl = sap.ui.core.Fragment.byId(
            "UploadFile",
            "attachmentUpl"
          );

        oAttachmentUpl.setBusy(true);
        oAttachmentUpl.getItems().forEach((oItem) => {
          if (oItem.getListItem().getSelected()) {
            let uri = this.formatUrl(oItem.getBindingContext().getPath());
            oItem.setUrl(uri);
            oItem.download(true);
            oItem.getListItem().setSelected(false);
          }
        });
        oAttachmentUpl.setBusy(false);
        oEvent.getSource().setEnabled(false);
      },
      
      onStartUpload: function () {
        var oAttachmentUpl = sap.ui.core.Fragment.byId(
          "UploadFile",
          "attachmentUpl"
        );

        if (oAttachmentUpl === undefined) {
          return;
        }

        let oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oSlug,
          paso1 = oMockModel.getProperty("/FileParameters");
        if (paso1.filename === undefined) {
          paso1.filename = "";
        } else {
          paso1.filename = paso1.filename + " - ";
        }

        var aIncompleteItems = oAttachmentUpl.getIncompleteItems();
        this.iIncompleteItems = aIncompleteItems.length;
        if (this.iIncompleteItems !== 0) {
          oAttachmentUpl.setBusy(true);
          this.i = 0; //used to turn off busy indicator when all uploads complete
          for (var i = 0; i < this.iIncompleteItems; i++) {
            var sFileName = aIncompleteItems[i].getProperty("fileName");
            var oXCSRFToken = new sap.ui.core.Item({
              key: "X-CSRF-Token",
              text: this.getOwnerComponent().getModel().getSecurityToken(),
            });

            if (paso1.Recibo !== undefined) {
              oSlug = new sap.ui.core.Item({
                key: "SLUG",
                text:
                  "Clientes=" +
                  paso1.Cliente +
                  ",Tipo=" +
                  paso1.Tipo +
                  ",Recibo=" +
                  paso1.Recibo +
                  ",Nombre=" +
                  sFileName,
              });
            } else {
              oSlug = new sap.ui.core.Item({
                key: "SLUG",
                text:
                  "Clientes=" +
                  paso1.Cliente +
                  ",Tipo=" +
                  paso1.Tipo +
                  ",Nombre=" +
                  paso1.filename +
                  sFileName,
              });
            }

            oAttachmentUpl.addHeaderField(oXCSRFToken).addHeaderField(oSlug);
          }
        }
      },
      onUploadCompleted: function (oEvent) {
        let oMockModel = this.getOwnerComponent().getModel("mockdata");
        this.i += 1;
        if (this.i === this.iIncompleteItems) {
          //turn off busy indicator when all attachments have completed uploading
          sap.ui.core.Fragment.byId("UploadFile", "attachmentUpl").setBusy(
            false
          );
        }

        let Data = oEvent.oSource.getHeaderFields()[1].getText(),
          Cadena = Data.split(",", 2),
          ofileRet = oMockModel.getProperty("/fileretencion"),
          ofileMP = oMockModel.getProperty("/filempago");

        var oAttachmentUpl = sap.ui.core.Fragment.byId(
          "UploadFile",
          "attachmentUpl"
        );

        let ovalue = oAttachmentUpl.getItems().length;

        switch (Cadena[1]) {
          case "Tipo=DESC":
            oMockModel.setProperty("/filedescuento", true);
            break;

          case "Tipo=RETE":
            oMockModel.setProperty("/fileretencion", ovalue);
            break;
          case "Tipo=DETA":
            oMockModel.setProperty("/filempago", ovalue);
            break;

          default:
            break;
        }
        console.log("Fichero Cargado");
      },
      parseErrorMsg: function (oError) {
        //parses oData error messages dependent on different return values
        var oMessage, sType;
        if (oError.response) {
          //for update
          sType = typeof oError.response;
          if (sType === "string" || sType === "object")
            oMessage = JSON.parse(oError.response.body).error.message.value;
          else
            return MessageBox.error(
              "Unhandled server error:\n\n" +
                oError.response +
                "\n\nReport this issue to Admin for a future fix."
            );
        } else if (oError.responseText) {
          //for create
          sType = typeof oError.responseText;
          if (sType === "string" || sType === "object")
            oMessage = JSON.parse(oError.responseText).error.message.value;
          else
            return MessageBox.error(
              "Unhandled server error:\n\n" +
                oError.responseText +
                "\n\nReport this issue to Admin for a future fix."
            );
        } else if (!oError)
          return MessageToast.show("Error message is undefined");
        MessageBox.error(oMessage);
      },

      // ********************************************
      // Actualizacion de Modelos *******************
      // ********************************************

      _onGuardar: async function (oEntidad, Tipo, Step, PostEntidad) {
        let oMockModel = this.getView().getModel("mockdata"),
          oView = this.getView(),
          rtaP2 = [],
          oModel = this.getOwnerComponent().getModel(),
          oItems = oMockModel.getProperty(oEntidad);
        let DataCte = oMockModel.getProperty("/Paso01Cliente");

        for (var index = 0; index < oItems.length; index++) {
          if (Tipo === "ACTA" || Tipo === "APLIC") {
            oItems[index].Tipo = Tipo;
          } else {
            oItems[index].TipoLinea = Tipo;
            oItems[index].Cliente = DataCte.Cliente;
          }

          if (oItems[index].Importe.includes(",")) {
            oItems[index].Importe = oItems[index].Importe.replace(/\./g, "");
            oItems[index].Importe = oItems[index].Importe.replace(/,/g, ".");
          }
          if (oItems[index].Aplicado !== undefined) {
            if (oItems[index].Aplicado.includes(",")) {
              oItems[index].Aplicado = oItems[index].Importe.replace(/\./g, "");
              oItems[index].Aplicado = oItems[index].Importe.replace(/,/g, ".");
            }
          }

          // console.log(Step, oItems);
          rtaP2 = await this._oncreateModelNew(
            oModel,
            oView,
            PostEntidad,
            oItems[index]
          );

          if (rtaP2.Respuesta === "OK") {
            if (Tipo !== "ACTA" && Tipo !== "APLIC") {
              this.onStartUpload();
            }
          }

          let FilePayload = {
            Codigo: DataCte.Codigo,
            Cliente: DataCte.Cliente,
            // NroLinea: index,
            Tipo: oItems[index].Tipo,
            Control: Step,
          };

          if (Step !== "END") {
            if (rtaP2.Respuesta === "OK") {
              this._wizard.validateStep(this.getView().byId(Step));
            } else {
              this._wizard.invalidateStep(this.getView().byId(Step));
            }
          } else {
            if (rtaP2.Respuesta === "OK") {
              let sMessage = rtaP2.Datos.Mensaje,
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

      _oncreateModel: function (oModel, oView, oEntity, oPayload) {
        return new Promise((resolve, reject) => {
          oView.setBusy(true);
          oModel.create(oEntity, oPayload, {
            success: function (oData) {
              oView.setBusy(false);

              resolve(oData);
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
              oModel.refresh(true);
              resolve({ Respuesta: "OK", Datos: oData });
            }.bind(this),

            error: function (oError) {
              oView.setBusy(false);
              resolve({ Respuesta: "ERROR", Datos: oError });
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
              resolve({ Respuesta: "OK", Datos: oData });
              oModel.refresh(true);
            },
            error: function (oError) {
              oView.setBusy(false);
              resolve({ Respuesta: "ERROR", Datos: oError });
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
              resolve({ Rta: "OK", Data: oData });
            }, this),
            error: function (oError) {
              oView.setBusy(false);
              resolve({ Rta: "ERROR", Data: oError });
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

      // ********************************************
      // Mensajes *****************************
      // ********************************************

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

      _onErrorHandle: function (oError) {
        if (oError.Mensaje === undefined) {
          var oErrorMsg = JSON.parse(oError.responseText);
          var oText = oErrorMsg.error.message.value;
        } else {
          var oText = oError.Mensaje;
        }

        var sMessageTitle = this._i18n().getText("msgerror");

        let objectMsg = {
          titulo: sMessageTitle,
          mensaje: oText,
          icono: sap.m.MessageBox.Icon.ERROR,
          acciones: [sap.m.MessageBox.Action.CLOSE],
          resaltar: sap.m.MessageBox.Action.CLOSE,
        };

        this._onShowMsgBox(objectMsg).then((rta) => {});
      },
      _onShowMsgBox: function (MsgObj) {
        return new Promise((resolve, reject) => {
          MessageBox.show(MsgObj.mensaje, {
            icon: MsgObj.icono,
            title: MsgObj.titulo,
            onClose: function (oAction) {
              resolve(oAction);
            }.bind(this),
            styleClass:
              "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
            actions: MsgObj.acciones,
            emphasizedAction: MsgObj.resaltar,
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
