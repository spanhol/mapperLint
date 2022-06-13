module.exports = class Template {
	constructor(ref, match, body) {
		this.ref = ref
		this.match = match
		this.body = body
		this.visitado = false
		this.valido = true
	}

	toString() {
		return this.match
	}
}