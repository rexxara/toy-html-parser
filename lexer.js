const EOF = void 0

function HTMLLexicalParser (syntaxer) {
  let state = data//initial state
  let token = null
  let attribute = null
  let characterReference = ''

  this.receiveInput = function (char) {//rcv char one by one
    if (state == null) {
      throw new Error('there is an error')
    } else {
      state = state(char)
    }
  }

  this.reset = function () {
    state = data
  }

  function data (c) {//rcv most of data  such as <p> CURRENT rexxra<p>
    switch (c) {
      case '&':
        //deal with &nbsp; etc...
        return characterReferenceInData
      case '<':
        return tagOpen

      default:
        //do nothing, push to syntaxer
        emitToken(c)
        return data
    }
  }

  // only handle right character reference
  function characterReferenceInData (c) { 
    if (c === ';') {
      characterReference += c
      emitToken(characterReference)
      characterReference = ''
      return data
    } else {
      characterReference += c
      return characterReferenceInData
    }
  }

  function tagOpen (c) {//<>
    if (c === '/') {
      return endTagOpen//</>
    }
    if (/[a-zA-Z]/.test(c)) {
      token = new StartTagToken()
      token.name = c.toLowerCase()
      return tagName
    }
    // no need to handle this
    // if (c === '?') {
    //   return bogusComment
    // }
    return error(c)
  }


  function tagName (c) {
    if  (c === '/') {
      return selfClosingTag
    }
    if  (/[\t \f\n]/.test(c)) {
      return beforeAttributeName
    }
    if (c === '>') {
      emitToken(token)
      return data
    }
    if (/[a-zA-Z]/.test(c)) {
      token.name += c.toLowerCase()
      return tagName//rcv tagName
    }
  }

  function beforeAttributeName (c) {
    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeName//filter space  such as:"<p SPACE classname="test">"
    }
    if (c === '/') {
      return selfClosingTag// <img/>
    }
    if (c === '>') {//<p classname="sth"> start tag end
      emitToken(token)
      return data//return init state
    }
    if (/["'<]/.test(c)) {// strange error ctrl
      return error(c)
    }

    attribute = new Attribute()
    attribute.name = c.toLowerCase()
    attribute.value = ''
    return attributeName
  }

  function attributeName (c) {
    if (c === '/') {//direct clone tag ? <p classname/ CLOSED ="test">
      token[attribute.name] = attribute.value
      return selfClosingTag
    }
    if (c === '=') {// <p classname=  PROCESS SPACE  "test">
      return beforeAttributeValue
    }
    if (/[\t \f\n]/.test(c)) {
      return beforeAttributeName
    }
    attribute.name += c.toLowerCase()//continue rcv char
    return attributeName
  }

  function beforeAttributeValue (c) {// <p classname=  PROCESS SPACE  "test">
    if (c === '"') {
      return attributeValueDoubleQuoted
    }
    if (c === "'") {
      return attributeValueSingleQuoted
    }
    if (/\t \f\n/.test(c)) {//some attribute dont hav "" or ''
      return beforeAttributeValue
    }
    attribute.value += c
    return attributeValueUnquoted
  }

  function attributeValueDoubleQuoted (c) {
    if (c === '"') {
      token[attribute.name] = attribute.value
      return beforeAttributeName
    }// one attribute end <img classname="test" CURRENT src="">
    attribute.value += c
    return attributeValueDoubleQuoted
  }

  function attributeValueSingleQuoted (c) {
    if (c === "'") {
      token[attribute.name] = attribute.value
      return beforeAttributeName
    }
    attribute.value += c
    return attributeValueSingleQuoted
  }

  function attributeValueUnquoted (c) {
    if (/[\t \f\n]/.test(c)) {//<img classname=test CURRENT src="">
      token[attribute.name] = attribute.value
      return beforeAttributeName
    }
    attribute.value += c
    return attributeValueUnquoted
  }

  function selfClosingTag (c) {// <img/ CURRENT >
    if (c === '>') {//otherwise do nothing
      emitToken(token)
      endToken = new EndTagToken()
      endToken.name = token.name
      emitToken(endToken)
      return data
    }
  }

  function endTagOpen (c) {//</ CURRENT h1>
    if (/[a-zA-Z]/.test(c)) {
      token = new EndTagToken()
      token.name = c.toLowerCase()
      return tagName
    }
    if (c === '>') {// ERROR </>
      return error(c)
    }
  }

  function emitToken (token) {
    syntaxer.receiveInput(token)
  }

  function error (c) {
    console.log(`warn: unexpected char '${c}'`)
  }
}

class StartTagToken {}

class EndTagToken {}

class Attribute {}

module.exports = {
  HTMLLexicalParser,
  StartTagToken,
  EndTagToken
}
