const xmlConverter = require('xml-js');
const fs = require('graceful-fs')
const path = require('path');

module.exports = class Util {

	static traverse(obj, condition, act) {
		if (condition.length == 0 || act.length == 0) {
			return "Deve ser passado ao menos uma codicao e ação"

		}
		if (condition.length != act.length) {
			return "Quantidade de condicoes é diferente da quantidade de ações"
		}

		let fila = [];
		fila.push(obj);
		while (fila.length > 0) {
			let atual = fila.pop();
			if (!atual) {
				return null
			}
			for (let i = 0; i < condition.length; i++) {
				if (condition[i](atual)) {
					act[i](atual)
				}
			}
			Util.getChildren(atual).forEach(n => {
				fila.push(n)
				n.parentNode = atual;
			});
		}
		return null;
	}


	/* percorre nodes 
	* quando o node atende a condição executa o act nele
	* se for passado a flag returnFirst retorna o primeiro node que atende a condição
	*/
	static findNodeByConditionAndAct(obj, condition, act) {
		if (condition.length == 0 || act.length == 0) {
			return "Deve ser passado ao menos uma codicao e ação"

		}
		if (condition.length != act.length) {
			return "Quantidade de condicoes é diferente da quantidade de ações"
		}

		let fila = [];
		fila.push(obj);
		while (fila.length > 0) {
			let atual = fila.pop();
			if (!atual) {
				return null
			}
			for (let i = 0; i < condition.length; i++) {
				if (condition[i](atual)) {
					act[i](atual)
				}
			}
			Util.getChildren(atual).forEach(n => {
				fila.push(n)
			});
		}
		return null;
	}

	static findChildByConditionAndAct(obj, condition, act) {
		if (condition.length == 0 || act.length == 0) {
			return "Deve ser passado ao menos uma codicao e ação"

		}
		if (condition.length != act.length) {
			return "Quantidade de condicoes é diferente da quantidade de ações"
		}

		Util.getChildren(obj).forEach(child => {
			for (let i = 0; i < condition.length; i++) {
				if (condition[i](child)) {
					act[i](child)
				}
			}
		});
		return null;
	}

	static removeParentNodeRef(obj) {
		let fila = [];
		fila.push(obj);
		while (fila.length > 0) {
			let atual = fila.pop();
			if (!atual) {
				return null
			}
			delete atual.parentNode
			Util.getChildren(atual).forEach(n => {
				fila.push(n)
			});
		}
		return null;
	}

	static getText(obj) {
		return obj?._attributes?.TEXT ? obj._attributes.TEXT : null
	}

	static getChildren(obj) {
		if (!obj?.node) {
			return []
		}
		if (Array.isArray(obj.node)) {
			return obj.node;
		} else if (typeof obj.node === 'object') {
			let children = []
			children.push(obj.node)
			return children
		}
	}

	static addChildren(obj, child) {
		if (!obj || !child) {
			return
		}
		if (!obj.node) {
			obj.node = [];
			obj.node.push(child);
		} else if (Array.isArray(obj.node)) {
			obj.node.push(child);
		} else if (typeof obj.node === 'object') {
			let children = []
			children.push(obj.node)
			children.push(child)
			obj.node = children;
		}
	}

	static lerXMLparaJs(inFile) {
		let data = fs.readFileSync(inFile)
		return xmlConverter.xml2js(data, { compact: true, spaces: 4 });
	}

	static limpaJsParaTransformarEmXML(js) {
		Util.removeParentNodeRef(js.map);
	}

	static escreverJsParaXML(js, outFile) {
		this.limpaJsParaTransformarEmXML(js);
		let xml = xmlConverter.js2xml(js, { compact: true, spaces: 4, fullTagEmptyElement: true });
		xml = xml.replace(/&(?![A-Za-z]+;|#[0-9]+;|#[A-Za-z]+;)/g, '&amp;');
		xml = xml.replace(/\>\<\/icon\>/g, '/>');
		xml = xml.replace(/\>\<\/node\>/g, '>\n</node>');
		fs.writeFileSync(outFile, xml);
	}

	static equals(node1, node2) {
		if (node1._attributes?.TEXT != node2._attributes?.TEXT) {
			return false;
		}
		if (node1.icon?._attributes?.BUILTIN != node2.icon?._attributes?.BUILTIN) {
			return false;
		}
		return true;
	}

	static equalsIgnoreClassName(node1, node2) {
		if (Util.isAnyClass(node1) && Util.isAnyClass(node2)) {
			return true;
		}
		if (node1._attributes?.TEXT != node2._attributes?.TEXT) {
			return false;
		}
		if (node1.icon?._attributes?.BUILTIN != node2.icon?._attributes?.BUILTIN) {
			return false;
		}
		return true;
	}

	static isAnyClass(node) {
		return node.icon?._attributes?.BUILTIN.startsWith("Descriptor.");
	}


}
