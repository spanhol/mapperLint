const fs = require('graceful-fs')
const path = require('path');
const Util = require('./Util');

module.exports = class Merge {

	join(mergeMapOrigem, mergeMapDestino) {
		if (!fs.existsSync(mergeMapOrigem)) {
			return
		}
		let origem = Util.lerXMLparaJs(mergeMapOrigem);
		let destino;
		if (fs.existsSync(mergeMapDestino)) {
			destino = Util.lerXMLparaJs(mergeMapDestino);
		} else {
			let node = []
			destino = { map: node }
		}

		Util.getChildren(origem.map.node).forEach(oChild => {
			Util.addChildren(destino.map.node, oChild);
		});
		Util.escreverJsParaXML(destino, mergeMapDestino);
	}

	merge(mergeMapOrigem, mergeMapDestino) {
		if (!fs.existsSync(mergeMapOrigem)) {
			return
		}
		let origem = Util.lerXMLparaJs(mergeMapOrigem);
		let destino;
		if (fs.existsSync(mergeMapDestino)) {
			destino = Util.lerXMLparaJs(mergeMapDestino);
		} else {
			destino = Util.newMapFrom(origem);
		}
		this.mergeNodes(origem.map, destino.map);
		Util.escreverJsParaXML(destino, mergeMapDestino);
	}

	mergeNodes(nodeOrigem, nodeDestino) {
		if (!nodeOrigem || !nodeDestino) {
			return
		}
		let origemChilds = Util.getChildren(nodeOrigem);
		let destinoChilds = Util.getChildren(nodeDestino);
		origemChilds.forEach(oChild => {
			let found = false;
			let mergeChild = null;
			destinoChilds.forEach(dChild => {
				if (Util.equalsIgnoreClassName(oChild, dChild)) {
					found = true;
					mergeChild = dChild;
				}
			})
			if (found) {
				this.mergeNodes(oChild, mergeChild);
			} else {
				Util.addChildren(nodeDestino, oChild);
			}
		});
	}
}