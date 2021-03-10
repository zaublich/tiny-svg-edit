
// class AttributeMod{
//     name: string
//     value: any
//     oldValue: any
//     constructor(name:string, value:any, oldValue = null){
//         this.name = name;
//         this.value = value;
//         this.oldValue = oldValue;
//     }
// }

// class DocumentEvent{

//     constructor(target:string, attrs:Array<AttributeMod>){
//         this.attrs = attrs;
//     }
// }

class DocumentNode {
    id:string;
    tag:string;
    attributes:Map<string, any>
    constructor(id:string, tag:string, attributes:Map<string, any>) {
        this.id = id;
        this.tag = tag;
        this.attributes = attributes;
    }
}
class Document {
    nodes: {}
    constructor(nodes:Map<string, DocumentNode>) {
        this.nodes = nodes;
    }
}

export { Document }
