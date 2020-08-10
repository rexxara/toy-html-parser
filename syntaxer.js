const { StartTagToken, EndTagToken } = require('./lexer')

class HTMLDocument {
  constructor () {
    this.isDocument = true
    this.childNodes = []
  }
}
class Node {}
class Element extends Node {
  constructor (token) {
    super(token)
    for (const key in token) {
      this[key] = token[key]
    }
    this.childNodes = [] 
  }
  [Symbol.toStringTag] () {
    return `Element<${this.name}>`
  }
}
class Text extends Node {
  constructor (value) {
    super(value)
    this.value = value || ''
  }
}

function HTMLSyntaticalParser () {
  const stack = [new HTMLDocument]

  this.receiveInput = function (token) {
    if (typeof token === 'string') {//merge text <p>test  </p> ===> tes + t
      if (seeTop(stack) instanceof Text) {
        seeTop(stack).value += token
      } else {
        let t = new Text(token)//html change line  textNode first char 
        // <head data-rex="1">CURRENT
        //     <title> CURRENT cool </title>
        seeTop(stack).childNodes.push(t)
        stack.push(t)
      }
    } else if (seeTop(stack) instanceof Text) {//node process end,return pre node,因为上一层已经在chileNode里有这个节点的引用
      stack.pop()
    }

    if (token instanceof StartTagToken) {
      let e = new Element(token)//create childNode and push new node in to stack top
      seeTop(stack).childNodes.push(e)
      return stack.push(e)
    }
    if (token instanceof EndTagToken) {//node process end,return pre node,因为上一层已经在chileNode里有这个节点的引用
      return stack.pop()
    }
  }

  this.getOutput = () => stack[0]//return dom tree
}

function seeTop (stack) {
  return stack[stack.length - 1]
}

module.exports = {
  HTMLSyntaticalParser
}
