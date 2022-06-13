module.exports = class Mode {
	constructor(ref, nome) {
		this.ref = ref
		this.nome = nome
		this.templates = []
		this.visitado = false
		this.usado = false
		this.valido = true
	}

	toString() {
		let templates = " templates: [";
		this.templates.forEach(t => {
			if (t) {
				if (templates != " templates: [") {
					templates += ", "
				}
				templates += t.toString()
			}
		});
		templates += "]"
		return this.nome + templates
	}
}