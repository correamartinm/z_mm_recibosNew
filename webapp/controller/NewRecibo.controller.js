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
    "use strict";

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
      },
      // ************ Controles ****************

      // ************ Control de los Pasos ****************

      // Paso Datos del Cliente

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
        vObject = oModel.getObject(oPath);
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
        } else {
          
          oMockModel.setProperty("/Paso3Data",oComprobantesControl.results );
          anticipo = false;
          recibo = false;
        }

        // let oPagosaCtaControl = await this._onfilterModel(
        //   oModel,
        //   oView,
        //   oEntidad2,
        //   oFilters
        // );

        // if (oPagosaCtaControl.results.length !== 0) {
          
          
        //   oMockModel.setProperty("/Paso2Data",oPagosaCtaControl.results );
          
        // }




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

        // ******** Hay documentos para el Cliente ???
      },
      onWizardStepClienteComplete: async function () {
        this.onFilterTableCbtes02();
      },


      // Paso Seleccion Pagos a Cuenta --------------

      onFilterTableCbtes02: function () {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oMockModel = this.getOwnerComponent().getModel("mockdata"),
          oCliente = oMockModel.getProperty("/Paso01Cliente"),
          oCCodigo =oCliente.Codigo,
          oFilters = [];
        oFilters.push( new Filter("Cliente", FilterOperator.Contains, oCCodigo ));

//        oFilters.push(new Filter("Tipo", FilterOperator.EQ, oCliente.Codigo));
        if (oTable.getItems() > 0)
          oTable.getBinding("items").filter([oFilters]);
      },

      onTablePagoCtaSelectionChange: function () {
        this._onCheckPago();
      },

      _onCheckPago: function () {
        let oTable = this.getView().byId("idPagoCtaTable"),
          oMockModel= this.getView().getModel("mockdata"),
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

              oImportesSuma =
                parseFloat(oImportesSuma) + parseFloat(vObject.Aplicar);
            }
          }
        }

        oMockModel.setProperty(oComprobantes, Data);
        oMockModel.setProperty(oCantidad, Data.length);
        oMockModel.setProperty(oImporte, oImportesSuma);
     
      },

      onWizardStepPagosComplete: function () {
        
      },


      // Paso Seleccion de Comprobantes --------------
      
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
          oFilters.push(new Filter("Numero", FilterOperator.EQ, oValue));
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
              oItems[index].getCells()[6].getValue() === "0" ||
              oItems[index].getCells()[6].getValue() === ""
            ) {
              oItems[index].getCells()[6].setValue(vObject.Saldo);
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
          oModel = this.getView().getModel("mockdata"),
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
            vObject = oModel.getObject(oPath);

            if (oItems[index].getSelected() === true) {
              Data.push(vObject);

              oImportesSuma =
                parseFloat(oImportesSuma) + parseFloat(vObject.Aplicar);
            }
          }
          this._wizard.validateStep(
            this.getView().byId("idComprobanteWizardStep")
          );
        } else {
          this._wizard.invalidateStep(
            this.getView().byId("idComprobanteWizardStep")
          );
        }
        this._onUpdateModel(oModel, oComprobantes, Data);
        this._onUpdateModel(oModel, oCantidad, Data.length);
        this._onUpdateModel(oModel, oImporte, oImportesSuma);
      },

      onWizardStepComprobanteComplete: function (oEvent) {},

      // Paso Descuentos ---------------------------

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

        if (!oFile.getValue()) {
          oFile.setValueState(ValueState.Error);
          return;
        } else {
          oFile.setValueState(ValueState.None);
        }

        let oValue = false,
          oImportesSuma,
          oDescuentos = "/Descuentos";

        oldData = this._onGetDataModel(oModel, oDescuentos);

        let oDatos = {
          Motivokey: oMotivo.getSelectedKey(),
          MotivoDesc: oMotivo.getSelectedItem().getText(),
          NComprobante: parseFloat(oNcomprobante.getValue()),
          Fecha: oFecha.getDateValue(),
          Importe: parseFloat(oImporte.getValue()),
        };
        let DataFinal = oldData.concat(oDatos);

        this._onshowDescuentoAdd(oValue, []);

        this._onUpdateModel(oModel, oDescuentos, DataFinal);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
        }

        let oCantidad = "/Paso04CantidadDescuentos",
          oImporteDec = "/Paso04ImporteDescuentos";
        this._onUpdateModel(oModel, oCantidad, DataFinal.length);
        this._onUpdateModel(oModel, oImporteDec, oImportesSuma);
      },

      onVolverButtonCancelarDescPress: function () {
        let oValue = false;
        this._onshowDescuentoAdd(oValue, []);
      },

      onButtonDeleteDescuentoPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
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
          //  alert(rta);
        });
      },

      onButtonEditaDescuentoPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject();
        oItem.UpdPath = oPath;

        this._onshowDescuentoAdd(true, oItem);
      },

      // Paso Retenciones ------------------------

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
          oFile = this.getView().byId("idRetencionesFileUploader"),
          oImportesSuma,
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
          oFile.setValueState(ValueState.Error);
          return;
        } else {
          oFile.setValueState(ValueState.None);
        }

        oldData = oModel.getProperty("/Retenciones");

        let oDatos = {
          Tipokey: oTipo.getSelectedKey(),
          TipoDesc: oTipo.getSelectedItem().getText(),
          NCertificado: parseFloat(oNCertificado.getValue()),
          Fecha: oFecha.getDateValue(),
          Importe: parseFloat(oImporte.getValue()),
        };
        let DataFinal = oldData.concat(oDatos);
        oModel.setProperty("/Retenciones", DataFinal);

        for (var index = 0; index < DataFinal.length; index++) {
          oImportesSuma =
            parseFloat(oImportesSuma) + parseFloat(DataFinal[index].Importe);
        }

        oModel.setProperty("/Paso05CantidadRetenciones", DataFinal.length);
        oModel.setProperty("/Paso05ImporteRetenciones", oImportesSuma);

        let oValue = false;
        this._onshowRetencionesAdd(oValue);
      },

      onButtonDeleteRetencionPress: function (oEvent) {
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
          //  alert(rta);
        });
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

      // Photo ----------------------------

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

      onButtonDeletePayPress: function (oEvent) {
        let oModel = this.getOwnerComponent().getModel("mockdata"),
          oPath = oEvent.getSource().getBindingContext("mockdata").getPath(),
          oItem = oEvent.getSource().getBindingContext("mockdata").getObject();

        let oTarget = oEvent.getSource(),
          // oMaterialCod = oItem.codMaterial,
          oAddedData = this.getView()
            .getModel("mockdata")
            .getProperty("/Detalle");

        // let oMaterialExist = oAddedData.findIndex(function (oMaterial) {
        //   return oMaterial.codMaterial === oMaterialCod;
        // });

        // if (oAddedData.length > 1) {
        //   let removed = oAddedData.splice(oMaterialExist, 1);
        //   oModel.setProperty("/Detalle", oAddedData);
        // } else {
        //   oModel.setProperty("/Detalle", []);
        //   this._onCheckTableItems();
        // }

        oModel.refresh();
      },

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

      onWizardStepDetalleComplete: function (params) {
        this._oNavContainer.to(this.byId("idwizardReviewPage"));
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

      _backToWizardContent: function () {
        this._oNavContainer.backToPage(this._oWizardContentPage.getId());
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

      // Impresion *****************************

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

      onConfirmarReciboButtonPress: function () {},
      onAnularButtonPress: function () {
        this.discardProgress();
      },

      onNavBack: async function () {
        // this.getOwnerComponent().getTargets().display("TargetMainView");

        let sMessage = this._i18n().getText("msgcancel"),
          sMessageTitle = this._i18n().getText("msgvolver");

        this._onShowMsgBoxConfirm(sMessage, sMessageTitle).then((rta) => {
          if (rta === "OK") this.discardProgress();
          this.getOwnerComponent().getTargets().display("TargetMainView");
        });
      },
    });
  }
);
