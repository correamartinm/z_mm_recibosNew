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
          Clientes: [
            {
              Codigo: "1",
              RazonSocial: "Empresa 01",
              Cuit: 30010101011,
              Domicilio: "Dom Empresa 01 ",
              Localidad: "Localidad Empresa 01",
              TipoIVA: "Resposable Inscripto",
            },
            {
              Codigo: "2",
              RazonSocial: "Empresa 02",
              Cuit: 30020202022,
              Domicilio: "Dom Empresa 02 ",
              Localidad: "Localidad Empresa 02",
              TipoIVA: "Resposable Inscripto",
            },
            {
              Codigo: "3",
              RazonSocial: "Empresa 03",
              Cuit: 30030303033,
              Domicilio: "Dom Empresa 03 ",
              Localidad: "Localidad Empresa 03",
              TipoIVA: "Resposable Inscripto",
            },
            {
              Codigo: "4",
              RazonSocial: "Empresa 04",
              Cuit: 30040404044,
              Domicilio: "Dom Empresa 04 ",
              Localidad: "Localidad Empresa 04",
              TipoIVA: "Resposable Inscripto",
            },
            {
              Codigo: "5",
              RazonSocial: "Empresa 05",
              Cuit: 30050505055,
              Domicilio: "Dom Empresa 05 ",
              Localidad: "Localidad Empresa 05",
              TipoIVA: "Resposable Inscripto",
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
          TiposMediosPago: [
            {
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
            {
              key: 2,
              Desc: "Depósito Bancario Efectivo",
              DetCbte: true,
              FecCbte: true,
              NroCheq: false,
              Adjunto: true,
              FecEmis: false,
              FecVto: false,
              BcoEmi: false,
              BcoDes: true,
              BcoDesReq: true,
            },
            {
              key: 3,
              Desc: "Depósito Bancario Cheque",
              DetCbte: false,
              FecCbte: false,
              NroCheq: false,
              Adjunto: false,
              FecEmis: false,
              FecVto: false,
              BcoEmi: false,
              BcoDes: false,
              BcoDesReq: true,
            },
            {
              key: 4,
              Desc: "Transferencia Bancaria",
              DetCbte: true,
              FecCbte: true,
              NroCheq: false,
              Adjunto: true,
              FecEmis: false,
              FecVto: false,
              BcoEmi: false,
              BcoDes: true,
              BcoDesReq: true,
            },
            {
              key: 5,
              Desc: "Cheque Físico al Día",
              DetCbte: false,
              FecCbte: false,
              NroCheq: true,
              Adjunto: true,
              FecEmis: true,
              FecVto: true,
              BcoEmi: true,
              BcoDes: true,
              BcoDesReq: false,
            },
            {
              key: 6,
              Desc: "Cheque Físico al Diferido",
              DetCbte: false,
              FecCbte: false,
              NroCheq: true,
              Adjunto: true,
              FecEmis: true,
              FecVto: true,
              BcoEmi: true,
              BcoDes: true,
              BcoDesReq: false,
            },
            {
              key: 7,
              Desc: "Cheque Electrónico al Día",
              DetCbte: false,
              FecCbte: false,
              NroCheq: true,
              Adjunto: true,
              FecEmis: true,
              FecVto: true,
              BcoEmi: true,
              BcoDes: true,
              BcoDesReq: false,
            },
            {
              key: 8,
              Desc: "Cheque Electrónico Diferido ",
              DetCbte: false,
              FecCbte: false,
              NroCheq: true,
              Adjunto: true,
              FecEmis: true,
              FecVto: true,
              BcoEmi: true,
              BcoDes: true,
              BcoDesReq: false,
            },
            {
              key: 9,
              Desc: "Cheque en custoria al Día",
              DetCbte: true,
              FecCbte: true,
              NroCheq: true,
              Adjunto: true,
              FecEmis: true,
              FecVto: true,
              BcoEmi: true,
              BcoDes: true,
              BcoDesReq: true,
            },
            {
              key: 10,
              Desc: "Cheque en custoria al Diferido",
              DetCbte: true,
              FecCbte: true,
              NroCheq: true,
              Adjunto: true,
              FecEmis: true,
              FecVto: true,
              BcoEmi: true,
              BcoDes: true,
              BcoDesReq: true,
            },
            {
              key: 11,
              Desc: "Mercado Pago",
              DetCbte: true,
              FecCbte: true,
              NroCheq: false,
              Adjunto: true,
              FecEmis: false,
              FecVto: false,
              BcoEmi: false,
              BcoDes: false,
              BcoDesReq: false,
            },
          ],
          TiposDescuentos: [
            {
              key: 1,
              Desc: "Descuento Comercial",
              Tipo: "DTO",
            },
            {
              key: 2,
              Desc: "Devolución",
              Tipo: "DEV",
            },
            {
              key: 3,
              Desc: "Depósito Bancario Cheque",
              Tipo: "Deposito",
            },
            {
              key: 4,
              Desc: "Roturas/Mermas",
              Tipo: "ROME",
            },
            {
              key: 5,
              Desc: "Diferencia de Enntrega",
              Tipo: "DIF",
            },
            {
              key: 6,
              Desc: "Otro",
              Tipo: "OTRO",
            },
          ],
          TiposRetencion: [
            {
              key: 1,
              Desc: "IVA",
            },
            {
              key: 2,
              Desc: "IIGG",
            },
            {
              key: 3,
              Desc: "SUSS",
            },
            {
              key: 4,
              Desc: "IIBB BS AS",
            },
            {
              key: 5,
              Desc: "IBB CHUBUT",
            },
            {
              key: 6,
              Desc: "IIBB CHACO",
            },
            {
              key: 7,
              Desc: "IIBB CORDOBA",
            },
            {
              key: 8,
              Desc: "IIBB CORRIENTES",
            },
            {
              key: 9,
              Desc: "IIBB SALTA",
            },
            {
              key: 10,
              Desc: "IIBB ENTRE RIOS",
            },
            {
              key: 11,
              Desc: "IIBB MISIONES",
            },
            {
              key: 12,
              Desc: "IIBB LA PAMPA",
            },
            {
              key: 13,
              Desc: "IIBB NEUQUEN",
            },
          ],
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
          },
          NoComprobantes: false,
          Resumen: []

  
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
