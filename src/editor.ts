import { Document } from './document'
import { o, svg, html } from 'sinuous'
import { PointerEventObservable, PointerEvent, ButtonType } from './PointerEvents'
import { map } from 'sinuous/map'
import { Observable, S } from 'sinuous/observable'
import * as rxjs from 'rxjs'
import { render } from 'react-dom'
const counter = o(0)

const position = o({ x: 30.0, y: 0.0 });

const normalize = (s) => {
  if (s.w < 0) {
    s.x = s.x + s.w;
    s.w = -s.w;
  }

  if (s.h < 0) {
    s.y = s.y + s.h;
    s.h = -s.h;
  }
}
const collide = (s:{x:number, y:number, height:number, width: number}, bb:{x:number, y:number, height:number, width: number}) => {
  const n = normalize(s);
  return !((s.x + s.width < bb.x) || (s.y + s.height < bb.y) || (s.x > bb.x + bb.width) || (s.y > bb.y + bb.height));
}

const inside = (x:number, y:number, bb:{x:number, y:number, height:number, width: number}) => {
  return x > bb.x && y > bb.y && x < bb.x + bb.width && y < bb.y + bb.height;
}

function clamp(val:number, min:number, max:number) {
  return Math.max(min, Math.min(val, max));
}

class ControlPoint {
  point: Observable<DOMPoint>
  refPoint: string | null
  constructor(x: number, y: number, refPoint = null) {
    this.point = o(new DOMPoint(x, y));
    this.refPoint = refPoint;
  }

  distance(p:ControlPoint) {
    const p1 = p.point()
    const p2 = this.point()
    const vec = { x: p2.x - p1.x, y: p2.y - p1.y }
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  }

  move(x:number, y:number) {
    const p = this.point()
    this.point(new DOMPoint(p.x + x, p.y + y))
  }
}

const getBBox = (points: Array<DOMPoint>, mat: SVGMatrix):DOMRect => {
  let top = Number.MAX_SAFE_INTEGER
  let left = Number.MAX_SAFE_INTEGER
  let bottom = Number.MIN_SAFE_INTEGER
  let right = Number.MIN_SAFE_INTEGER
  for (const p of points) {
    const tp = p.matrixTransform(mat)
    top = Math.min(top, tp.y)
    left = Math.min(left, tp.x)
    bottom = Math.max(bottom, tp.y)
    right = Math.max(right, tp.x)
  }
  return new DOMRect(left, top, right - left, bottom - top);
}

const transformedBBox = (bbox: SVGRect, mat: SVGMatrix) => {
  const tl = (new DOMPoint(bbox.x, bbox.y)).matrixTransform(mat);
  const tr = (new DOMPoint(bbox.x + bbox.width, bbox.y)).matrixTransform(mat);
  const bl = (new DOMPoint(bbox.x, bbox.y + bbox.height)).matrixTransform(mat);
  const br = (new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height)).matrixTransform(mat);
  const top = Math.min(tl.y, br.y, tr.y, bl.y);
  const left = Math.min(tl.x, br.x, tr.x, bl.x);
  const bottom = Math.max(tl.y, br.y, tr.y, bl.y);
  const right = Math.max(tl.x, br.x, tr.x, bl.x);
  return new DOMRect(left, top, right - left, bottom - top);
}

class Viewport {
    scale: number
    x: number
    y: number
    constructor({ x = 0, y = 0, scale = 1 }) {
        this.scale = scale;
        this.x = x;
        this.y = y;
    }
}

class ViewNode {
  mat: DOMMatrix
  className: string
  id: string
  mousedown:Record<number, (node:string, info:string)=>void>
  constructor(id:string, className:string) {
    this.mat = new DOMMatrix()
    console.log(this.mat)
    this.id = id;
    this.className = className;
    this.mousedown = {}
  }

  getBBox() {
    return new DOMRect();
  }

  render() {
    return svg``;
  }

  controlPointMoved(id:string, ev:PointerEvent) {
    console.log(id, ev);
  }
}

class Rect extends ViewNode {
  topLeft: ControlPoint;
  bottomRight: ControlPoint
  height: number
  width: number
  constructor(id:string, className:string, x:number, y:number, width:number, height:number) {
    super(id, className);
    this.topLeft = new ControlPoint(x, y);
    this.bottomRight = new ControlPoint(x + width, y + height);
    this.width = width
    this.height = height
  }

  render() {
    return svg`<rect class=${this.className} id=${this.id} transform=${this.mat} x=${this.topLeft.point().x} y=${this.topLeft.point().y} width=${this.width} height=${this.height}/>`
  }

  getParamPoints() {
    return [this.topLeft, this.bottomRight]
  }

  getBBox() {
    const topLeft = this.topLeft.point();
    const bottomRight = this.bottomRight.point();
    return getBBox([
      new DOMPoint(topLeft.x, topLeft.y),
      new DOMPoint(bottomRight.x, topLeft.y),
      new DOMPoint(bottomRight.x, bottomRight.y),
      new DOMPoint(topLeft.x, bottomRight.y)
    ], this.mat);
  }
}

class SelectionBox extends ViewNode {
  topLeft: ControlPoint;
  topRight: ControlPoint;
  bottomRight: ControlPoint
  bottomLeft: ControlPoint
  rotationPoint: ControlPoint

  height: number
  width: number
  constructor(id:string, className:string, x:number, y:number, width:number, height:number) {
    super(id, className);
    this.topLeft = new ControlPoint(x, y);
    this.bottomRight = new ControlPoint(x + width, y + height);
    this.topRight = new ControlPoint(x + width, y);
    this.bottomLeft = new ControlPoint(x, y + height);
    this.rotationPoint = new ControlPoint(x + width / 2, y);
    this.width = width
    this.height = height
  }

  render() {
    return svg`<rect class=${this.className} id=${this.id} transform=${this.mat} x=${this.topLeft.point().x} y=${this.topLeft.point().y} width=${this.width} height=${this.height}/>`
  }

  getParamPoints() {
    return [this.topLeft, this.bottomRight]
  }

  getBBox() {
    const topLeft = this.topLeft.point();
    const bottomRight = this.bottomRight.point();
    return getBBox([
      new DOMPoint(topLeft.x, topLeft.y),
      new DOMPoint(bottomRight.x, topLeft.y),
      new DOMPoint(bottomRight.x, bottomRight.y),
      new DOMPoint(topLeft.x, bottomRight.y)
    ], this.mat);
  }
}

class Circle extends ViewNode {
  center: ControlPoint;
  radius: ControlPoint;
  constructor(id:string, className:string, cx:number, cy:number, rx:number, ry:number) {
    super(id, className);
    this.radius = new ControlPoint(rx, ry);
    this.center = new ControlPoint(cx, cy);
  }

  render() {
    const radius = this.center.distance(this.radius);
    return svg`
    <g class=${this.className} id=${this.id} transform=${this.mat}>
      <circle fill="#eee" cx=${this.center.point().x} cy=${this.center.point().y} stroke="#000" r=${radius}/>
    </g>
    `
  }

  controlPointMoved(id:string, ev:PointerEvent) {
    console.log(ev);
  }

  getBBox() {
    const radius = this.center.distance(this.radius);
    const center = this.center.point()
    const box = getBBox([
      new DOMPoint(center.x - radius, center.y - radius),
      new DOMPoint(center.x + radius, center.y - radius),
      new DOMPoint(center.x + radius, center.y + radius),
      new DOMPoint(center.x - radius, center.y + radius)
    ], this.mat);
    return box;
  }

  getParamPoints() {
    return [this.center, this.radius];
  }
}

class Path extends ViewNode {
  points: Array<ControlPoint>
  constructor(id:string, className:string) {
    super(id, className);
    this.points = []
  }
}

class DragType {
  type: string | null
  node: string | null
  info: string | null
  IsSet() {
    return this.type != null && this.node != null;
  }

  constructor(t:string | null = null, n: string | null = null, i: string | null = null) {
    this.type = t;
    this.node = n;
    this.info = i;
  }
}

class Editor {
    drag: Observable<DragType>
    selection: Observable<SVGRect>
    selectionBox: Observable<Rect>
    selected: Observable<Set<string>>
    focusedNode: Observable<string|null>
    nodeIndex:Observable<Array<string>>
    nodeIndexCache:Array<string>
    nodes: Observable<Record<string, ViewNode>>
    nodeCache: Record<string, ViewNode>
    viewport: Observable<Viewport>
    rotation: Observable<DOMPoint>
    rootNode: Element
    pointerEvent: rxjs.Observable<PointerEvent>

    constructor(root:Element) {
      this.rotation = o(new DOMPoint())
      this.selectionBox = o(new Rect('selection-box', 'selection-box', 0, 0, 0, 0))
      this.selected = o(new Set<string>())
      this.nodes = o({})
      this.focusedNode = o(null)
      this.nodeIndex = o([])

      this.nodeIndexCache = []
      this.nodeCache = {}
      for (let xIdx = 0; xIdx < 3; xIdx++) {
        for (let yIdx = 0; yIdx < 3; yIdx++) {
          this.nodeIndexCache.push(`n${xIdx}_${yIdx}`)
          this.nodeCache[`n${xIdx}_${yIdx}`] = new Circle(`n${xIdx}_${yIdx}`, 'node circle', xIdx * 64, yIdx * 64, xIdx * 64 + 16, yIdx * 64);
        }
      }
      this.nodes(this.nodeCache);
      this.nodeIndex(this.nodeIndexCache)
      this.rootNode = root;
      this.drag = o(new DragType());
      this.selection = o(new DOMRect());
      this.viewport = o(new Viewport({}));
      this.pointerEvent = PointerEventObservable(this.rootNode);
      this.bindEvents()
    }

    getSelectionNode() {
      return this.rootNode.querySelector('.selection');
    }

    getViewportNode() {
      return this.rootNode.querySelector('#viewport') as SVGGraphicsElement;
    }

    getNode(id:string) {
      return this.rootNode.querySelector('.node#' + id);
    }

    getNodeList() {
      return Array.from(this.rootNode.querySelectorAll('.node'));
    }

    getRubberSelection() {
      return this.rootNode.querySelector('#rubber');
    }

    resizeSelection(relX:number, relY:number, originX:number, originY:number) {
      //const selection = this.selectionBox().getBBox();
      const tbox = this.selectionBox().getBBox()
      const cv = this.viewport();
      let scaleX = (tbox.width + relX / cv.scale) / tbox.width;
      let scaleY = (tbox.height + relY / cv.scale) / tbox.height;
      if (scaleX < 1) {
        scaleX = scaleY = Math.min(scaleX, scaleY);
      } else {
        scaleX = scaleY = Math.max(scaleX, scaleY);
      }

      if (scaleX > 0 && scaleY > 0) {
        this.selectionBox().mat.scaleSelf(scaleX, scaleY, 1.0, tbox.x - originX * tbox.width, tbox.y - originY * tbox.height, 0);
        this.selectionBox(this.selectionBox());
      }
    }

    dragControl(ev:PointerEvent) {
      switch (this.drag().node) {
        case 'selected': {
          const box = this.selectionBox();
          box.mat.translateSelf(ev.relX / this.viewport().scale, ev.relY / this.viewport().scale, 0)
          this.selectionBox(box);
          break;
        }
        case 'br-resize': {
          this.resizeSelection(ev.relX, ev.relY, 0, 0);
          break;
        }
        case 'tl-resize': {
          this.resizeSelection(-ev.relX, -ev.relY, -1, -1);
          break;
        }
        case 'bl-resize': {
          this.resizeSelection(-ev.relX, ev.relY, -1, 0);
          break;
        }
        case 'tr-resize': {
          this.resizeSelection(ev.relX, -ev.relY, 0, -1);
          break;
        }
      }
    }

    dragCanvas(ev:PointerEvent) {
      switch (this.drag().node) {
        case 'angle': {
          break;
        }
        case 'rubber': {
          const c = this.selection();
          this.selection(new DOMRect(c.x, c.y, c.width + ev.relX, c.height + ev.relY))
          break;
        }
        case 'movement': {
          const cv = this.viewport();
          this.viewport({ x: cv.x + ev.relX / cv.scale, y: cv.y + ev.relY / cv.scale, scale: cv.scale })
          break;
        }
      }
    }

    selectNodes(r:Element) {
      if (r) {
        const s = r.getBoundingClientRect();
        const nodeList = this.getNodeList();
        const selectedNodes = nodeList.reduce((accumulator, n) => {
          if (collide(s, n.getBoundingClientRect())) {
            accumulator.add(n.id);
          }
          return accumulator;
        }, new Set<string>())
        if (selectedNodes.size) {
          this.selected(selectedNodes)
          this.updateSelectionBox();
        } else {
          this.selected(new Set<string>());
          this.selectionBox(new Rect('selection-box', 'selection-box', 0, 0, 0, 0))
        }
      }
    }

    updateNodesTransformation() {
      const v = this.viewport()
      const ctm = this.selectionBox().mat
      if (ctm) {
        const selected = this.selected()
        selected.forEach((e) => {
          const node = this.nodeCache[e]
          if (node) {
            const mt = ctm.multiply(node.mat)
            if (mt) {
              this.nodeCache[e].mat = new DOMMatrix([mt.a, mt.b, mt.c, mt.d, mt.e, mt.f]);
            }
          }
        });
      }
      const box = this.selectionBox().getBBox()
      this.selectionBox(new Rect('selection-box', 'selection-box', box.x, box.y, box.width, box.height))
    }

    updateCanvasZoom(ev:PointerEvent) {
      const sign = Math.sign(ev.relX)
      const scaleChange = Math.pow(1.05, -sign)
      const cv = this.viewport();
      const newScale = cv.scale * scaleChange
      const totalX = (ev.x / newScale) - (ev.x / cv.scale - cv.x)
      const totalY = (ev.y / newScale) - (ev.y / cv.scale - cv.y)
      this.viewport({ x: totalX, y: totalY, scale: newScale });
    }

    bindEvents() {
      this.pointerEvent.subscribe((ev) => {
        if (ev.type == 'DOWN') {
          if (ev.button == ButtonType.Left && this.drag().IsSet() == false) {
            this.drag(new DragType('canvas', 'rubber'));
            this.selected(new Set<string>())
            this.selectionBox(new Rect('selection-box', 'selection-box', 0, 0, 0, 0))
            const rect = this.rootNode?.getBoundingClientRect();
            if (rect) {
              this.selection(new DOMRect(ev.x, ev.y - 50, 0, 0))
            }
            this.nodes(this.nodeCache)
          } else if (ev.button == ButtonType.Right) {
            this.drag(new DragType('canvas', 'movement'));
          }
        }
        if (ev.type == 'MOVE' && this.drag().IsSet()) {
          if (this.drag().type == 'canvas') {
            this.dragCanvas(ev)
          }

        if (this.drag().type == 'control') {
            this.dragControl(ev);
          }
        }

        if (this.drag().type == 'control-point') {
          const drag = this.drag();
          if (drag.node != null && drag.info != null) {
           const node = this.nodeCache[drag.node].controlPointMoved(drag.info, ev);
          }
        }

        if (ev.type == 'SCROLL') {
          this.updateCanvasZoom(ev);
        }

        if (ev.type == 'UP') {
          if (ev.button == ButtonType.Left) {
            if (this.drag().type == 'angle') {
              this.rotation(new DOMPoint(0, 0));
            } else if (this.drag().type == 'canvas' && this.drag().node == 'rubber') {
              const r = this.getRubberSelection();
              if (r) {
                this.selectNodes(r);
              }
            }
          }

          this.updateNodesTransformation();
          this.drag(new DragType());
        }
      })
    }

    rubberSelection() {
        if (this.drag().node == 'rubber') {
            const v = this.selection();
            return () => svg`<path id="rubber" fill="#7dd5" stroke="#affc" d="m${v.x} ${v.y} h${v.width} v${v.height} h${-v.width} z"></path>`
        } else {
          svg``;
        }
    }

    getSelectedElements() {
        return [];
    }

    renderNodes() {
      const nodes = this.nodes()
      const selected = this.selected();
      const nodeIndex = this.nodeIndex()
      const nonSelected = o(nodeIndex.filter((n) => !selected.has(n)))
      return map(nonSelected, (n) => {
        const v = nodes[n];
        return v.render()
      });
    }

    renderSelectedNodes() {
      const nodes = this.nodes()
      const selected = this.selected();
      const nodeIndex = this.nodeIndex()
      const nonSelected = o(nodeIndex.filter((n) => selected.has(n)))
      const selectedList = map(nonSelected, (n) => {
        const v = nodes[n];
        return v.render();
      });

      return svg`<g class="selected" transform-origion="center" transform=${this.selectionBox().mat}>${selectedList}</g>`
    }

    drawNodesSelectionBox() {
      const box = this.selectionBox().getBBox()
      const rect = transformedBBox(new DOMRect(box.x, box.y, box.width, box.height), box.mat);
      const left = rect.left;
      const top = rect.top;
      const right = rect.right;
      const bottom = rect.bottom;
      const v = this.viewport()
      if (this.selected().size > 0) {
        return svg` <rect id="selected" x=${left - 4 / v.scale} y=${top - 4 / v.scale} class="draggable selection" width=${right - left + 8 / v.scale} height=${bottom - top + 8 / v.scale} fill="#fff0" stroke="#555" stroke-width="1" stroke-dasharray="3" vector-effect="non-scaling-stroke" />
          <rect id="tl-resize"class="draggable tl-resize" x=${left - 8 / v.scale} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <rect id="tr-resize" class="draggable tr-resize" x=${right} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <rect id="bl-resize" class="draggable bl-resize" x=${left - 8 / v.scale} y=${bottom} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <rect id="br-resize" class="draggable br-resize" x=${right} y=${bottom} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <circle id="angle" class="draggable angle" cx=${left + rect.width / 2 + this.rotation().x} cy=${top + this.rotation().y} r=${6 / v.scale} fill="#f00" stroke-width="1px" stroke="#000" vector-effect="non-scaling-size"/>
          `;
      } else {
        return svg``
      }
    }

    updateSelectionBox() {
      let top = Number.MAX_SAFE_INTEGER
      let left = Number.MAX_SAFE_INTEGER;
      let bottom = Number.MIN_SAFE_INTEGER;
      let right = Number.MIN_SAFE_INTEGER;

      const selected = this.selected();
      selected.forEach((v) => {
          const cbbox = this.nodeCache[v].getBBox();
          const bbox = cbbox
          top = Math.min(top, bbox.top);
          left = Math.min(left, bbox.left);
          bottom = Math.max(bottom, bbox.bottom);
          right = Math.max(right, bbox.right);
      });

      if (bottom != top || left != right) {
        const ctm = new DOMMatrix()
        if (ctm) {
          const inversed = new DOMRect(left, top, right - left, bottom - top);
          this.selectionBox(new Rect('selection-box', 'selection-box', inversed.left, inversed.top, inversed.width, inversed.height));
        }
      }
    }

    processDown(e:Event) {
      const target = e.target as SVGGraphicsElement
      if (target.classList.contains('node')) {
        this.drag(new DragType('node', target.id));
      } else {
        if (target.classList.contains('draggable')) {
          this.drag(new DragType('control', target.id));
        } else if (target.classList.contains('control-point')) {
          if (target.parentNode) {
            this.drag(new DragType('control-point', target.parentNode.id, target.id));
          }
        }
      }
      e.preventDefault();
      return false;
    }

    processOver(e:Event) {
      const target = e.target as SVGGraphicsElement
      if (target.classList.contains('node')) {
        console.log('node', target.classList)
      }
    }

    canvas() {
      return () => {
        const v = this.viewport();
        const mat = new DOMMatrix(`scale(${v.scale},${v.scale}) translate(${v.x}px,${v.y}px)`)
        return svg`
        <svg onpointerdown=${(e) => this.processDown(e)} onpointerover=${(e) => this.processOver(e)} oncontextmenu=${(e) => e.preventDefault()} id="svg-root" viewBox="0 0 1000 1000"  preserveAspectRatio="xMidYMid meet">
            <g id="viewport" transform=${mat}>
            ${this.renderNodes()}
            ${this.renderSelectedNodes()}
            ${this.drawNodesSelectionBox()}
            </g>
            ${this.rubberSelection()}
        </svg>
        `;
        }
    }
}

export {
    Editor
}
