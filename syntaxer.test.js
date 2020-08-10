const { HTMLSyntaticalParser } = require('./syntaxer')
const { HTMLLexicalParser } = require('./lexer')

const syntaxer = new HTMLSyntaticalParser()
const lexer = new HTMLLexicalParser(syntaxer)

const testHTML = `<html maaa=a >
    <head data-rex="1">
        <title>cool </title>
        <p>hahahahaha</p>C
    </head>
    <body>
        <img src="a" />
    </body>
</html>`

for (let c of testHTML) {
  lexer.receiveInput(c)
}

console.log(JSON.stringify(syntaxer.getOutput(), null, 2))
