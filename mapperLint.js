#!/usr/bin/env node

const fs = require('graceful-fs')
const path = require('path');
const process = require('process');

const Validator = require('./Validator');
const Util = require('./Util');
const Merger = require('./Merger');

const options = {
	basePathEntrada: "",
	basePathSaida: "",
	desviarSaida: false,
	removerFontes: false,
	removerCor: false,
	validar: false,
	merge: false,
	join: false,
	mergeMapOrigem: "",
	mergeMapDestino: "",
}

function main() {
	const help = "  Recebe um arquivo ou pasta como primeiro parametro, processa os arquivos .mm dentro do caminho informado, limpandos os atributos desnecessarios.\n"
		+ "  -h Mostra esse help\n"
		+ "  -d Muda pasta de saida. Por padrão é o caminho passado por parametro\n"
		+ "  -f Limpa também atributos de fonte\n"
		+ "  -c Limpa também atributos de cor\n"
		// + "  -b Adiciona links nos tipos encontrados\n"
		+ "  -v Procura erros no mapa\n"
		+ "  -m (origem.mm) (destino.mm) copia todos os nodes do mapa origem para o mapa destino, ignora os nodes existentes\n"
		;

	const args = process.argv.slice(2);
	if (!args[0]) {
		console.log(help);
		console.log("Informe um arquivo ou pasta.")
		return;
	}
	options.basePathEntrada = path.join(__dirname)
	options.basePathSaida = path.join(__dirname)

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case "-d":
				options.desviarSaida = true;
				i++
				options.basePathSaida = path.resolve(args[i]);
				break;
			case "-f":
				options.removerFontes = true;
				break;
			case "-c":
				options.removerCor = true;
				break;
			case "-v":
				options.validar = true;
				break;
			case "-m":
				if (i + 2 <= args.length) {
					options.merge = true;
					i++
					options.mergeMapOrigem = path.resolve(args[i]);
					i++
					options.mergeMapDestino = path.resolve(args[i]);
				} else {
					console.log("argumento -m espera dois caminhos de arquivo após ele");
				}
				break;
			case "-j":
				if (i + 2 <= args.length) {
					options.join = true;
					i++
					options.mergeMapOrigem = path.resolve(args[i]);
					i++
					options.mergeMapDestino = path.resolve(args[i]);
				} else {
					console.log("argumento -m espera dois caminhos de arquivo após ele");
				}
				break;
			case "-h":
				console.log(help);
				break;
		}
	}
	if (options.merge) {
		options.basePathEntrada = options.mergeMapOrigem
		processa();
		options.basePathEntrada = options.mergeMapDestino
		processa();
		merge();
	} else if (options.join) {
		options.basePathEntrada = options.mergeMapOrigem
		processa();
		options.basePathEntrada = options.mergeMapDestino
		processa();
		join();
	} else {
		options.basePathEntrada = path.resolve(args[0])
		processa();
	}
}

main();

function merge() {
	let merger = new Merger();
	merger.merge(options.mergeMapOrigem, options.mergeMapDestino);
}

function join() {
	let merger = new Merger();
	merger.join(options.mergeMapOrigem, options.mergeMapDestino);
}

function processa(caminho = "") {
	if (caminho.endsWith(".git")) {
		return
	}
	let pathAbsoluto = path.join(options.basePathEntrada, caminho)
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

function criaPastaSaida(arquivo) {
	if (options.desviarSaida) {
		let err = fs.mkdirSync(path.join(options.basePathSaida, arquivo), { recursive: true })
		if (err) {
			return console.error(err);
		}
	}
}

function processaArquivo(file) {
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

function traverse(obj) {
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

function validate(json) {
	if (!json) {
		return;
	}
	validator = new Validator();
	validator.validate(json);
}

function converteCodigos(json) {
	if (json._attributes) {
		if (json._attributes.TEXT) {
			json._attributes.TEXT = json._attributes.TEXT.replace(new RegExp("<", 'g'), "&lt;");
			json._attributes.TEXT = json._attributes.TEXT.replace(new RegExp("\n", 'g'), "&#xa;");
		}
	}
}

function removeAttributos(json) {
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