
class AttributeMod{
    name: string
    value: any
    oldValue: any
    constructor(name:string, value:any, oldValue = null){
        this.name = name;
        this.value = value;
        this.oldValue = oldValue;
    }
}

class DocumentEvent{
    attrs:Array<AttributeMod>
    constructor(target:string, attrs:Array<AttributeMod>){
        this.attrs = attrs;
    }
}

class Document {
    nodes: Array<Node>
    history: Array<DocumentEvent>  
    constructor(nodes = []){
        this.nodes = nodes
        this.history = []
    }

}

export { Document }
