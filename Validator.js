const Pattern = require('./Pattern');
const Mode = require('./Mode');
const Template = require('./Template');
const Util = require('./Util');

module.exports = class Validator {
	constructor() {
		this.json
		this.root
		this.start
		this.patterns = []
		this.modes = []
	}

	validate = function (json) {
		this.json = json;
		let err = Util.findNodeByConditionAndAct(json, [this.isStart],
			[e => {
				this.root = e.parentNode
				this.start = e
			}
			])
		if (err) {
			console.log(err)
		}
		this.findElements(this.root);
		console.log(this.patterns)
		this.modes.forEach(mode => {
			console.log(mode.toString())
		});
		this.findCalls(this.start)
	};


	findElements = function (obj) {
		let patternsRoot;
		let templatesRoot;
		let parametersRoot;
		let err = Util.findChildByConditionAndAct(obj,
			[
				this.isPatternsRoot,
				this.isTemplatesRoot,
				this.isParametersRoot
			],
			[
				e => patternsRoot = e,
				e => templatesRoot = e,
				e => parametersRoot = e
			])
		if (err) {
			console.log(err)
		}
		Util.getChildren(patternsRoot).forEach(e => {
			let nome = Util.getText(e);
			if (nome) {
				let pattern = new Pattern(e, nome, Util.getChildren(e))
				this.patterns.push(pattern)
			}
		});

		Util.getChildren(templatesRoot).forEach(modeRef => {
			let mode = new Mode(modeRef)
			this.modes.push(mode)
			Util.getChildren(modeRef).forEach(modeChild => {
				if (Util.getText(modeChild) == 'template') {
					let match = null;
					let body = null;
					Util.getChildren(modeChild).forEach(e => {
						if (Util.getText(e) == 'match') {
							match = e.node?._attributes?.TEXT ? e.node?._attributes?.TEXT : ""
						}
						if (Util.getText(e) == 'body') {
							body = e;
						}
					});
					mode.templates.push(new Template(modeChild, match, body))
				}
				if (Util.getText(modeChild) != 'template') { // e icone == tagGreen
					mode.nome = Util.getText(modeChild)
				}
			});
		});
	};

	removeCorElemento = function (element) {
		delete element._attributes.COLOR
	}

	marcaElementoComErro = function (element) {
		element._attributes.COLOR = "#ff0000"
	}

	marcaModesNaoUsados = function () {
		this.modes.forEach(mode => {
			if (!mode.usado) {
				mode._attributes.COLOR = "#ffff00"
			}
		});
	}

	marcaPatternsNaoUsados = function () {
		this.modes.forEach(mode => {
			if (!mode.usado) {
				mode._attributes.COLOR = "#ffff00"
			}
		});
	}

	findCalls = function (modeAtual) {
		//TODO
		// achar chamados de write pattern e apply-templates
		let err = Util.findNodeByConditionAndAct(modeAtual,
			[at => {
				return at?._attributes?.TEXT == "mode" && at.parentNode?._attributes?.TEXT == "apply-templates"
			},
			wp => wp?._attributes?.TEXT == "write-pattern"],
			[at => {
				let erro = true
				this.modes.forEach(mode => {
					if (mode.nome == at?.node?._attributes?.TEXT) {
						mode.usado = true;
						erro = false
						this.removeCorElemento(at.parentNode)
					}
				});
				if (erro) {
					this.marcaElementoComErro(at.parentNode)
				}
			},
			wp => {
				let temErro = true
				this.patterns.forEach(pattern => {
					if (pattern.nome == wp?._attributes?.TEXT) {
						pattern.usado = true;
						temErro = false
						this.removeCorElemento(at)
					}
				});
				if (temErro) {
					this.marcaElementoComErro(wp)
				}
			}
			])
		if (err) {
			console.log(err)
		}
		this.modes.forEach(mode => {
			if (mode.usado && !mode.visitado) {
				mode.visitado = true
				this.findCalls(mode)
			}
		});
	}

	isStart = function (node) {
		if (Util.getText(node) == 'start') {
			let hasMatch = false
			let hasBody = false
			Util.getChildren(node).forEach(e => {
				if (Util.getText(e) == 'match') {
					hasMatch = true
				}
				if (Util.getText(e) == 'body') {
					hasBody = true
				}
			});
			if (hasMatch && hasBody) {
				return true
			}
		}
		return false;
	};

	isPatternsRoot = function (node) {
		return node?._attributes?.TEXT ? node._attributes.TEXT == "patterns" : false;
	};

	isTemplatesRoot = function (node) {
		return node?._attributes?.TEXT ? node._attributes.TEXT == "templates" : false;
	};

	isParametersRoot = function (node) {
		return node?._attributes?.TEXT ? node._attributes.TEXT == "parameters" : false;
	};
}