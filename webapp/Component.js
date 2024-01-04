/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "morixe/zfirecibos/model/models",
  ],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("morixe.zfirecibos.Component", {
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        var oMockDataModel = new sap.ui.model.json.JSONModel({
          Usuario: [
            {
              User: "",
              id: 0,
              firstname: "Usuario",
              lastname: "Dummy",
              email: "dummy.user@com",
              name: "User Dummy ",
              user: "XXXX",
              displayName: "Usuario Test (dummy.user@com)",
            },
          ],
          Paso2Data : [],
          Paso3Data : [],
          Paso01Cliente: {
            Codigo: "",
            RazonSocial: "",
            Domicilio: "",
            Localidad: "",
            Cuit: "",
            TipoIva: "",
            Observaciones: "",
            Accion: "",
            Anticipo: false,
            Recibo: false,
            TipoComprobante:"",
            Completo: false
          },

          ActiveMP: {
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
          },
          
          Paso02PagoaCta: [
          ],
          Paso02CantidadPagos: 0,
          Paso02ImportePagos: 0,
          Paso02Seleccionados: [],
          Paso03Comprobantes: [],
          Paso03CantidadComprobantes: 0,
          Paso03ImporteComprobantes: 0,
          Paso04CantidadDescuentos: 0,
          Paso04ImporteDescuentos: 0,
          Paso04PathUpdate: "",
          Paso04Grabado: false,
          Paso05CantidadRetenciones: 0,
          Paso05ImporteRetenciones: 0,
          Paso05PathUpdate: "",
          Paso06PathUpdate: "",
          Paso06Detalles: 0,
          Paso06ImporteDetalle: 0,
          Recibos: [],
          Descuentos: [],
          ActiveDescuento: {
            NComprobante: "",
            Fecha: null,
            Importe: "",
            Codigo: "",
            MotivoDesc: "",
            UpdPath: ""
          },
          ActiveRetencion: {
            Tipokey: "",
            TipoDesc: "",
            NCertificado: "",
            Fecha: null,
            Importe: "",
            UpdPath: ""
          },
          Retenciones: [],
          Detalle: [],
          MpUpdate: {
            ruta : "",
            datos : {}
          },
          ActiveDetalle: {
            MPkey: 0,
            MPDesc:"",
            NroCheq: "",
            NroCte: "",
            Importe: "",
            FecEmis: null,
            FecDepo: null,
            FecCbte: null,
            FecVto: null,
            BcoEmi: "",
            BcoDes: "",
            Adjunto: "",
          },
          NoComprobantes: false,
          FileParameters: {
            Cliente: "",
            Tipo: "",
            Recibo: ""
          },
          Resumen: [],
          EditaMP: false,
          ActiveRecibo: "",
          SUBTOTAL: "",
          RESTANTE: "",
          TOTAL:"",
          ANTICIPO:"",
          SALDO:"",
          ActiveStep:"1",
          filedescuento: false,
          fileretencion: false,
          filempago: false

  
        });
        this.setModel(oMockDataModel, "mockdata");

        var oLayoutModel = new sap.ui.model.json.JSONModel({
          descuentosadd: false,
          EdicionRecibo: true,
          retencionesadd: false,
          detalleadd: false,
          controlrecibo: false,
          
          MpKey: 1,
          RsKey: 0,
        });
        this.setModel(oLayoutModel, "layout");
      },
    });
  }
);
