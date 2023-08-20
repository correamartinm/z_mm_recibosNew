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
              Codigo: 1,
              Rsocial: "Empresa 01",
              Cuit: 30010101011,
              Domicilio: "Dom Empresa 01 ",
              Localidad: "Localidad Empresa 01",
              IVA: "Resposable Inscripto",
            },
            {
              Codigo: 2,
              Rsocial: "Empresa 02",
              Cuit: 30020202022,
              Domicilio: "Dom Empresa 02 ",
              Localidad: "Localidad Empresa 02",
              IVA: "Resposable Inscripto",
            },
            {
              Codigo: 3,
              Rsocial: "Empresa 03",
              Cuit: 30030303033,
              Domicilio: "Dom Empresa 03 ",
              Localidad: "Localidad Empresa 03",
              IVA: "Resposable Inscripto",
            },
            {
              Codigo: 4,
              Rsocial: "Empresa 04",
              Cuit: 30040404044,
              Domicilio: "Dom Empresa 04 ",
              Localidad: "Localidad Empresa 04",
              IVA: "Resposable Inscripto",
            },
            {
              Codigo: 5,
              Rsocial: "Empresa 05",
              Cuit: 30050505055,
              Domicilio: "Dom Empresa 05 ",
              Localidad: "Localidad Empresa 05",
              IVA: "Resposable Inscripto",
            },
          ],
          Paso01Cliente: [
            {
              Codigo: 0,
              Rsocial: "",
              Domicilio: "",
              Localidad: "",
              TipoIva: "",
              Observaciones: "",
              Anticipo: false,
              Recibo: false,
            },
          ],
          TiposMediosPago: [
            {
              key: 1,
              Desc: "Efectivo",
              Tipo: "Efectivo",
            },
            {
              key: 2,
              Desc: "Depósito Bancario Efectivo",
              Tipo: "Deposito",
            },
            {
              key: 3,
              Desc: "Depósito Bancario Cheque",
              Tipo: "Deposito",
            },
            {
              key: 4,
              Desc: "Transferencia Bancaria",
              Tipo: "Transferencia",
            },
            {
              key: 5,
              Desc: "Cheque Físico al Día",
              Tipo: "Cheque",
            },
            {
              key: 6,
              Desc: "Cheque Físico al Diferido",
              Tipo: "Cheque",
            },
            {
              key: 7,
              Desc: "Cheque Electrónico al Día",
              Tipo: "Cheque",
            },
            {
              key: 8,
              Desc: "Cheque Electrónico Diferido ",
              Tipo: "Cheque",
            },
            {
              key: 9,
              Desc: "Cheque en custoria al Día",
              Tipo: "Cheque",
            },
            {
              key: 10,
              Desc: "Cheque en custoria al Diferido",
              Tipo: "Cheque",
            },
            {
              key: 11,
              Desc: "Deuda Publicada Bco Macro",
              Tipo: "Deuda",
            },
            {
              key: 12,
              Desc: "Deuda Publicada Bco Santander",
              Tipo: "Deuda",
            },
            {
              key: 13,
              Desc: "Deuda Publicada Bco Galicia",
              Tipo: "Deuda",
            },
            {
              key: 14,
              Desc: "Mercado Pago",
              Tipo: "MP",
            }
          ],
          TiposDescuentos: [
            {
              key: 1,
              Desc: "Descuento Comercial",
              Tipo: "DTO"
            },
            {
              key: 2,
              Desc: "Devolución",
              Tipo: "DEV"
            },
            {
              key: 3,
              Desc: "Depósito Bancario Cheque",
              Tipo: "Deposito",
            },
            {
              key: 4,
              Desc: "Roturas/Mermas",
              Tipo: "ROME"
            },
            {
              key: 5,
              Desc: "Diferencia de Enntrega",
              Tipo: "DIF"
            },
            {
              key: 6,
              Desc: "Otro",
              Tipo: "OTRO"
            }
          ],
          TiposRetencion: [
            {
              key: 1,
              Desc: "IVA"
              
            },
            {
              key: 2,
              Desc: "IIGG"
              
            },
            {
              key: 3,
              Desc: "SUSS"
              
            },
            {
              key: 4,
              Desc: "IIBB BS AS"
              
            },
            {
              key: 5,
              Desc: "IBB CHUBUT"
              
            },
            {
              key: 6,
              Desc: "IIBB CHACO",
              
            },
            {
              key: 7,
              Desc: "IIBB CORDOBA"
              
            },
            {
              key: 8,
              Desc: "IIBB CORRIENTES"
              
            },
            {
              key: 9,
              Desc: "IIBB SALTA"
          
            },
            {
              key: 10,
              Desc: "IIBB ENTRE RIOS"
              
            },
            {
              key: 11,
              Desc: "IIBB MISIONES"
              
            },
            {
              key: 12,
              Desc: "IIBB LA PAMPA"
              
            },
            {
              key: 13,
              Desc: "IIBB NEUQUEN"
              
            }
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
          Descuentos: [
          ],
          Paso04CantidadDescuentos: 0,
          Paso04ImporteDescuentos: 0,
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
          Retenciones: [],
          Paso05CantidadRetenciones: 0,
          Paso05ImporteRetenciones: 0,
          Paso06Detalles : 0,
          Paso06ImporteDetalle : 0,
          Detalle: [],
          Resumen: [],

          cbts: [
            {
              TC: "FC",
              Numero: 1,
              Fecha: "03/08/2023",
              Fechav: "03/09/2023",
              Importe: 5000,
              Moneda: "PSO",
              Saldo: 4500,
              Aplicar: 0,
            },
            {
              TC: "FC",
              Numero: 2,
              Fecha: "04/08/2023",
              Fechav: "03/09/2023",
              Importe: 3000,
              Moneda: "PSO",
              Saldo: 1500,
              Aplicar: 0,
            },
            {
              TC: "FC",
              Numero: 3,
              Fecha: "05/08/2023",
              Fechav: "05/09/2023",
              Importe: 6000,
              Moneda: "PSO",
              Saldo: 4500,
              Aplicar: 0,
            },
          ],
        });
        this.setModel(oMockDataModel, "mockdata");

        var oLayoutModel = new sap.ui.model.json.JSONModel({
          descuentosadd: false,
          retencionesadd: false,
          detalleadd: false,
          controlrecibo: false,
          MpKey: 1
        });
        this.setModel(oLayoutModel, "layout");
      },
    });
  }
);
