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
            {
              TC: "FC",
              Numero: 1,
              Fecha: "03/08/2023",
              Fechav: "03/09/2023",
              Importe: 5000,
              Moneda: "PSO",
              Saldo: 4500,
              Aplicar: 4500,
            },
            {
              TC: "FC",
              Numero: 2,
              Fecha: "04/08/2023",
              Fechav: "03/09/2023",
              Importe: 3000,
              Moneda: "PSO",
              Saldo: 2500,
              Aplicar: 2500,
            },
            {
              TC: "FC",
              Numero: 3,
              Fecha: "05/08/2023",
              Fechav: "05/09/2023",
              Importe: 6000,
              Moneda: "PSO",
              Saldo: 3500,
              Aplicar: 3500,
            },
          ],
          Paso02CantidadPagos: 0,
          Paso02ImportePagos: 0,
          Paso02Seleccionados: [],
          Paso03Comprobantes: [],
          Paso03CantidadComprobantes: 0,
          Paso03ImporteComprobantes: 0,
          Paso04CantidadDescuentos: 0,
          Paso04ImporteDescuentos: 0,
          Paso05CantidadRetenciones: 0,
          Paso05ImporteRetenciones: 0,
          Paso06Detalles: 0,
          Paso06ImporteDetalle: 0,
          Recibos: [
            {
              Numero: 101,
              Fecha: "01/02/2023",
              Rsocial: "Empresa 01",
              Cuit: "30028529634",
              TotalRecibo: 8000,
              Procesado: true,
              FechaProceso: "05/03/2023",
            },
            {
              Numero: 102,
              Fecha: "01/02/2023",
              Rsocial: "Empresa 01",
              Cuit: "30028529634",
              TotalRecibo: 8000,
              Procesado: true,
              FechaProceso: "05/03/2023",
            },
            {
              Numero: 103,
              Fecha: "01/02/2023",
              Rsocial: "Empresa 01",
              Cuit: "30028529634",
              TotalRecibo: 8000,
              Procesado: true,
              FechaProceso: "05/03/2023",
            },
            {
              Numero: 104,
              Fecha: "01/02/2023",
              Rsocial: "Empresa 01",
              Cuit: "30028529634",
              TotalRecibo: 8000,
              Procesado: true,
              FechaProceso: "05/03/2023",
            },
            {
              Numero: 105,
              Fecha: "01/02/2023",
              Rsocial: "Empresa 02",
              Cuit: "30028529636",
              TotalRecibo: 8000,
              Procesado: true,
              FechaProceso: "05/03/2023",
            },
            {
              Numero: 106,
              Fecha: "01/02/2023",
              Rsocial: "Empresa 06",
              Cuit: "30028529636",
              TotalRecibo: 4000,
              Procesado: false,
              FechaProceso: "",
            },
            {
              Numero: 107,
              Fecha: "01/02/2023",
              Rsocial: "Empresa 05",
              Cuit: "30028529635",
              TotalRecibo: 5000,
              Procesado: false,
              FechaProceso: "",
            },
          ],
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
          Resumen: [],
          SUBTOTAL: "",
          RESTANTE: "",
          TOTAL:"",
          ANTICIPO:"",
          SALDO:"",
          ActiveStep:"1"

  
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
