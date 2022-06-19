const fs = require('graceful-fs')
const path = require('path');
const Util = require('./Util');
const Linter = require('./Linter');

module.exports = class ProjectManager {
	constructor(path, init = false, nomeProjeto = null) {
		this.path = path;
		this.linter = linter;
		this.nomeProjeto = nomeProjeto;
		if (init) {
			this._init();
		} else {
			this._load();
		}
	}

	_init() {
		this._criaPastas();
		this._criaMiJson();
		//cria arquivo mi.json
		//processa arquivos da pasta mdm e list classes e caminhos em mi.json
	}

	_criaPastas() {
		if (!this.nomeProjeto) {
			this.nomeProjeto = this.path.substring(this.path.lastIndexOf("\\") + 1);
		} else {
			let nomePasta = this.path.substring(this.path.lastIndexOf("\\") + 1);
			if (this.nomeProjeto != nomePasta) {
				this.path = path.join(this.path, this.nomeProjeto);
			}
		}
		if (!fs.existsSync(this.path)) {
			Util.criaPasta(path.join(this.path, this.nomeProjeto))
		}
		Util.criaPasta(path.join(this.path, "mdm"));
		Util.criaPasta(path.join(this.path, "build"));
		Util.criaPasta(path.join(this.path, "out"));
	}

	_criaMiJson() {
		fs.writeFileSync(
			path.join(this.path, "mi.json"),
			{
				"name": this.nomeProjeto,
				"version": "",
				"description": "",
				"main": "run.sh",
				"scripts": {}
			});
	}

	_load() {
		//le arquivo mi.json
	}

	build() {

	}

	install() {

	}


	run(script) {

	}

	generateClass(className) {

	}
	generateGenerator(linguagem, tipo) {

	}
}