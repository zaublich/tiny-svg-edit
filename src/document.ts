
import { Observable } from 'sinuous/observable'
import { o } from 'sinuous'
class DocumentEvent {
    source:string

    timestamp: DOMHighResTimeStamp
    observedValues: Record<string, any> | null
    mutatedValues:Record<string, any>
    constructor (source:string, mutatedValues:Record<string, any>, timestamp:DOMHighResTimeStamp = performance.now(), observedValues = null) {
        this.timestamp = performance.now()
        this.observedValues = observedValues;
        this.mutatedValues = mutatedValues;
        this.source = source;
    }
}

class DocumentNode {
    id:string;
    tag:string;
    attributes:Map<string, any>
    nodeIndex:Observable<string[]>
    activeNodes:Observable<string[]>
    constructor(id:string, tag:string, attributes:Map<string, any>) {
        this.id = id;
        this.tag = tag;
        this.attributes = attributes;
        this.nodeIndex = o([])
        this.activeNodes = o([])
    }
}

class Document {
    nodes:Record<string, DocumentNode>

    constructor(nodes:Record<string, DocumentNode>) {
        this.nodes = nodes;
    }

    reduce(action: DocumentEvent) {
    }
}

export { Document }
