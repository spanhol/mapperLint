const fs = require('graceful-fs')
const path = require('path');
const Util = require('./Util');

module.exports = class Lint {

	constructor(options) {
		this.options = options;
	}

	processa(caminho = "") {
		if (caminho.endsWith(".git")) {
			return
		}
		let pathAbsoluto = path.join(options.basePathEntrada, caminho)
		if (!fs.existsSync(pathAbsoluto)) {
			return
		}
		let lsStat = fs.lstatSync(pathAbsoluto);
		if (lsStat.isFile() && pathAbsoluto.endsWith(".mm")) {
			processaArquivo(caminho);
		} else if (lsStat.isDirectory()) {
			criaPastaSaida(caminho)
			fs.readdirSync(pathAbsoluto).forEach(file => {
				processa(caminho + "/" + file);
			});
		}
	}

	criaPastaSaida(arquivo) {
		if (options.desviarSaida) {
			let err = fs.mkdirSync(path.join(options.basePathSaida, arquivo), { recursive: true })
			if (err) {
				return console.error(err);
			}
		}
	}

	processaArquivo(file) {
		let js = Util.lerXMLparaJs(path.join(options.basePathEntrada, file));
		traverse(js.map);
		if (options.validar) {
			validate(js.map);
		}
		let outFile = path.join(options.basePathEntrada, file);
		if (options.desviarSaida) {
			outFile = path.join(options.basePathSaida, file);
		}
		Util.escreverJsParaXML(js, outFile);
	}

	traverse(obj) {
		if (!obj) {
			return;
		}
		converteCodigos(obj)
		removeAttributos(obj);
		let err = Util.traverse(obj,
			[e => { return true }, e => { return true }],
			[converteCodigos, removeAttributos])
		if (err) {
			console.log(err)
		}
	}

	validate(json) {
		if (!json) {
			return;
		}
		validator = new Validator();
		validator.validate(json);
	}

	converteCodigos(json) {
		if (json._attributes) {
			if (json._attributes.TEXT) {
				json._attributes.TEXT = json._attributes.TEXT.replace(new RegExp("<", 'g'), "&lt;");
				json._attributes.TEXT = json._attributes.TEXT.replace(new RegExp("\n", 'g'), "&#xa;");
			}
		}
	}

	removeAttributos(json) {
		if (json._attributes) {
			delete json._attributes.CREATED;
			delete json._attributes.ID;
			delete json._attributes.MODIFIED;
			delete json._attributes.VSHIFT;
			delete json._attributes.HGAP;
			delete json._attributes.STYLE;
			//se remover cor
			if (options.removerCor) {
				delete json._attributes.COLOR;
			}
		}
		//se remover fontes
		if (options.removerFontes) {
			delete json.font;
		}
	}
}