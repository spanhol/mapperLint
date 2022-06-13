module.exports = class Pattern {
	constructor(ref, nome, children) {
		this.ref = ref
		this.nome = nome
		this.children = children
		this.visitado = false
		this.usado = false
		this.valido = true
	}
}