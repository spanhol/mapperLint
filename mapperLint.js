#!/usr/bin/env node

const fs = require('graceful-fs')
const path = require('path');
const process = require('process');

const Linter = require('./Linter');
const Validator = require('./Validator');
const Util = require('./Util');
const Merger = require('./Merger');
const ProjectManager = require('./ProjectManager');

const options = {
	basePathEntrada: "",
	basePathSaida: "",
	desviarSaida: false,
	removerFontes: false,
	removerCor: false,
	validar: false,
	merge: false,
	join: false,
	init: false,
	generate: false,
}

function main() {
	const help = "  Recebe um arquivo ou pasta como primeiro parametro, processa os arquivos .mm dentro do caminho informado, limpandos os atributos desnecessarios.\n"
		+ "  Após a inicialização do projeto é possivel referenciar as classes pelo nome apenas\n\n"
		+ "  -i | -init [nomeProjeto] [pasta\\base\\do\\projeto] \t\tInicializa um novo projeto, pode ser passado apenas o parametro -i ou -i e nome e pasta base do projeto \n"
		+ "  (em desenvolvimento) -r | -run\t\tRoda main ou script nomeado\n"
		+ "  (em desenvolvimento) -w | -watch (classe) (linguagem) (gerador)\t\tObserva classe e roda gerador quando o arquivo muda\n\n"
		+ "  (em desenvolvimento) -s | -struct (classe)\t\tGera struct class da classe informada\n\n"
		+ "  (em desenvolvimento) -b \t\tAdiciona links nos tipos encontrados\n"

		+ "  -v | -valida (mapa.mm)\t\tProcura erros no mapa\n"
		+ "  -d | -destino (mapa.mm)\t\tMuda pasta de saida. Por padrão é o caminho passado por parametro\n"
		+ "  -f | -fontes\t\tLimpa também atributos de fonte\n"
		+ "  -c | -cor\t\tLimpa também atributos de cor\n"


		+ "  -m | -merge (origem.mm) (destino.mm)\t\tcopia todos os elementos do mapa origem para o mapa destino, ignora os elementos existentes\n"
		;

	const args = process.argv.slice(2);
	if (!args[0]) {
		console.log(help);
		return;
	}
	options.basePathEntrada = path.join(__dirname)
	options.basePathSaida = path.join(__dirname)

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case "-d":
			case "destino":
				options.desviarSaida = true;
				if (i + 1 < args.length) {
					i++
					options.basePathSaida = path.resolve(args[i]);
				} else {
					console.log("argumento -d espera um caminho de arquivo após ele");
				}
				break;
			case "-f":
			case "-fontes":
				options.removerFontes = true;
				break;
			case "-c":
			case "-cor":
				options.removerCor = true;
				break;
			case "-v":
			case "-validar":
				options.validar = true;
				if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
					i++
					options.basePathEntrada = path.resolve(args[i]);
				}
				break;
			case "-m":
			case "-merge":
				if (i + 2 < args.length) {
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
			case "-join":
				if (i + 2 < args.length) {
					options.join = true;
					i++
					options.mergeMapOrigem = path.resolve(args[i]);
					i++
					options.mergeMapDestino = path.resolve(args[i]);
				} else {
					console.log("argumento -j espera dois caminhos de arquivo após ele");
				}
				break;
			case "-i":
			case "-init":
				options.init = true;
				if (i + 1 < args.length) {
					i++
					options.nomeProjeto = args[i];
					if (i + 1 < args.length) {
						i++
						options.projectBasePath = path.resolve(args[i]);
					} else {
						options.projectBasePath = path.resolve(".");
					}
				} else {
					options.projectBasePath = path.resolve(".");
				}
				break;
			case "-r":
			case "-run":
				options.run = true;
				if (i + 1 < args.length) {
					i++
					options.runScript = path.resolve(args[i]);
				}
				break;
			// case "-b":
			// case "-build":
			// 	break;
			// case "-install":
			// 	break;
			// case "-g":
			// case "-generate":
			// 	//-generate [name] [linguagem] [tipo]
			// 	if (i + 3 > args.length) {
			// 		console.log("parametros faltando:\n"
			// 			+ "EX: mapperlint -generate [name] [linguagem] [tipo]"
			// 		)
			// 		break;
			// 	}
			// 	options.generate = true;
			// 	i++
			// 	options.className = args[i];
			// 	i++
			// 	options.linguagemGerador = args[i];
			// 	i++
			// 	options.tipoGerador = args[i];
			// 	break;
			case "-h":
			case "-help":
				console.log(help);
				break;
			default:
				if (!args[i].startsWith("-") && i == 0) {
					options.basePathEntrada = path.resolve(args[i]);
				}
		}
	}



	if (options.merge) {
		let linter = new Linter(options);
		options.basePathEntrada = options.mergeMapOrigem
		linter.processa();
		options.basePathEntrada = options.mergeMapDestino
		linter.processa();
		merge();
	} else if (options.join) {
		let linter = new Linter(options);
		options.basePathEntrada = options.mergeMapOrigem
		linter.processa();
		options.basePathEntrada = options.mergeMapDestino
		linter.processa();
		join();
	} else if (options.init) {
		let pm = new ProjectManager(options.projectBasePath, true, options.nomeProjeto);
	} else if (options.run) {
		let pm = new ProjectManager(path.resolve("."));
		pm.run();
	} else if (options.build) {
		let pm = new ProjectManager(path.resolve("."));
		pm.build();
	} else if (options.install) {
		let pm = new ProjectManager(path.resolve("."));
		pm.install();
		// } else if (options.generate) {
		// let pm = new ProjectManager(path.resolve("."));
		// pm.generate();
	} else {
		if (options.basePathEntrada) {
			let linter = new Linter(options);
			linter.processa();
		}
	}
}

main();