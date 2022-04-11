#!/usr/bin/env node

const fs = require('graceful-fs')
const path = require('path');
const process = require('process');

const xmlConverter = require('xml-js');
const options = {
    basePathEntrada: "",
    basePathSaida: "",
    desviarSaida: false,
    fontes: false,
    cor: false,
    validaChamadas: false
}

function main() {
    const args = process.argv.slice(2);
    if (!args[0]) {
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
                options.fontes = true;
                break;
            case "-c":
                options.cor = true;
                break;
        }
    }
    options.basePathEntrada = path.resolve(args[0])
    processa("");
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

main();

function processa(caminho) {
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
        let xml = xmlConverter.js2xml(js, { compact: true, spaces: 4, fullTagEmptyElement: true });
        xml = xml.replace(/&(?![A-Za-z]+;|#[0-9]+;)/g, '&amp;');
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

function traverse(json) {
    if (!json) {
        return;
    }
    removeAttributos(json, options);
    Object.keys(json).forEach(key => {
        if (key === 'node' && typeof json[key] === 'object') {
            removeAttributos(json[key]);
            traverse(json[key])
        }
    })
}

function removeAttributos(json) {
    if (json._attributes) {
        if (json._attributes.CREATED) {
            delete json._attributes.CREATED;
        }
        if (json._attributes.ID) {
            delete json._attributes.ID;
        }
        if (json._attributes.MODIFIED) {
            delete json._attributes.MODIFIED;
        }
        if (options.fontes) {
            if (json._attributes.FONT) {
                delete json._attributes.FONT;
            }
        }
        if (options.cor) {
            if (json._attributes.COLOR) {
                delete json._attributes.COLOR;
            }
        }
    }
}

// function validaWritePattern(json) {
    //TODO
// }