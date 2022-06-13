#!/usr/bin/env node

const fs = require('graceful-fs')
const path = require('path');
const process = require('process');

const Validator = require('./Validator');
const Util = require('./Util');

const xmlConverter = require('xml-js');
const options = {
    basePathEntrada: "",
    basePathSaida: "",
    desviarSaida: false,
    removerFontes: false,
    removerCor: false,
    validar: false,
}

function main() {
    const help = "  Recebe um arquivo ou pasta como primeiro parametro, processa os arquivos .mm dentro do caminho informado, limpandos os atributos desnecessarios.\n"
        + "  -h Mostra esse help\n"
        + "  -d Muda pasta de saida. Por padrão é o caminho passado por parametro\n"
        + "  -f Limpa também atributos de fonte\n"
        + "  -c Limpa também atributos de cor\n"
        // + "  -b Adiciona links nos tipos encontrados\n"
        + "  -v Procura erros no mapa\n";

    const args = process.argv.slice(2);
    if (!args[0]) {
        console.log(help);
        console.log("Informe um arquivo ou pasta.")
        return;
    }
    options.basePathEntrada = path.join(__dirname)
    options.basePathSaida = path.join(__dirname)

    for (let i = 1; i < args.length; i++) {
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
            case "-h":
                console.log(help);
                break;
        }
    }
    options.basePathEntrada = path.resolve(args[0])
    processa();
}

main();

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
    fs.readFile(path.join(options.basePathEntrada, file), function (err, data) {
        var js = xmlConverter.xml2js(data, { compact: true, spaces: 4 });
        traverse(js.map);
        if (options.validar) {
            validate(js.map);
        }

        let xml = xmlConverter.js2xml(js, { compact: true, spaces: 4, fullTagEmptyElement: true });
        xml = xml.replace(/&(?![A-Za-z]+;|#[0-9]+;|#[A-Za-z]+;)/g, '&amp;');
        xml = xml.replace(/\>\<\/icon\>/g, '/>');
        xml = xml.replace(/\>\<\/node\>/g, '>\n</node>');
        let outFile = path.join(options.basePathEntrada, file);
        if (options.desviarSaida) {
            outFile = path.join(options.basePathSaida, file);
        }
        fs.writeFile(outFile, xml, (err) => {
            if (err) {
                console.error(err);
            }
        })
    });
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