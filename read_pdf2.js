const fs = require('fs');
const pdfPackage = require('pdf-parse');

const pdf = typeof pdfPackage === 'function' ? pdfPackage : (pdfPackage.default || pdfPackage);

const dataBuffer = fs.readFileSync('referencia.pdf');
pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(console.error);
