#!/usr/bin/env node

let fs = require('fs');
let xmlConverter = require('xml-js');

function main() {
    const args = process.argv.slice(2);
    if (!args[0]){
        console.log("Informe um arquivo ou pasta.")
        return;
    }
    let fileName = args[0]
    if (!fileName.startsWith("/") && !fileName.startsWith(".")) {
        fileName = "./" + fileName;
    }
    processa("", fileName);
}

main();

function processa(basePath, path) {
    let caminho = basePath + path;
    let lsStat = fs.lstatSync(caminho);
    if (lsStat.isFile() && caminho.endsWith(".mm")) {
        processaArquivo(caminho);
    } else if (lsStat.isDirectory()) {
        fs.readdirSync(caminho).forEach(f => {
            // console.log(basePath + path + "/" +  f);
            processa(basePath + path + "/", f);
        });
    }
}

function processaArquivo(file) {
    // console.log('\tfile: ', file);
    fs.readFile(file, function (err, data) {
        if (file === './arquivos/fiscal/fiscal-beans-stage-four.mm'){
            console.log("a");
        }

        var js = xmlConverter.xml2js(data, { compact: true, spaces: 4 });
        traverse(js.map);
        let xml = xmlConverter.js2xml(js, { compact: true, spaces: 4, fullTagEmptyElement: true });
        // xml = xml.replace(/&&/g, '&amp;&amp;');
        xml = xml.replace(/&(?![A-Za-z]+;|#[0-9]+;)/g, '&amp;');
        xml = xml.replace(/\>\<\/icon\>/g, '/>');
        xml = xml.replace(/\>\<\/node\>/g, '>\n</node>');
        let errWriteFile = fs.writeFileSync(file, xml, 'utf8');
        if (errWriteFile) {
            console.log(errWriteFile);
        }
    });
}

function traverse(json) {
    if (!json) {
        return;
    }
    removeAttributos(json);
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
    }
}

function removeFontes(json) {

}

function removeCor(json) {

}

// function validaWritePattern(json) {

// }