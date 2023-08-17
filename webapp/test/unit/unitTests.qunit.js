/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"morixe/z_mm_recibos/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
