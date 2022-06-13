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
}
