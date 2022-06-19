const Util = require('./Util');

module.exports = class Merge {

	join(mergeMapOrigem, mergeMapDestino) {
		let origem = Util.lerXMLparaJs(mergeMapOrigem);
		let destino = Util.lerXMLparaJs(mergeMapDestino);
		Util.getChildren(origem.map.node).forEach(oChild => {
			Util.addChildren(destino.map.node, oChild);
		});
		Util.escreverJsParaXML(destino, mergeMapDestino);
	}

	merge(mergeMapOrigem, mergeMapDestino) {
		let origem = Util.lerXMLparaJs(mergeMapOrigem);
		let destino = Util.lerXMLparaJs(mergeMapDestino);
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