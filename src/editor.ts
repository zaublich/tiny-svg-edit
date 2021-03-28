import { Document } from './document'
import { o, svg, html } from 'sinuous'
import { PointerEventObservable, PointerEvent } from './PointerEvents'
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
const collide = (s, bb) => {
  const n = normalize(s);
  return !((s.x + s.width < bb.x) || (s.y + s.height < bb.y) || (s.x > bb.x + bb.width) || (s.y > bb.y + bb.height));
}

const inside = (x, y, bb) => {
  return x > bb.x && y > bb.y && x < bb.x + bb.width && y < bb.y + bb.height;
}

function clamp(val:number, min:number, max:number) {
  return Math.max(min, Math.min(val, max));
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

class ControlPoint{
  point: DOMPoint
  refPoint: string | null
  constructor(point:DOMPoint, refPoint=null) {
    this.point = point;
    this.refPoint = refPoint;
  }
}

class ViewNode {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  mat: DOMMatrix
  
  constructor(x = 0, y = 0, width = 0, height = 0, fill = '') {
    this.mat = new DOMMatrix()
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.fill = fill;
  }
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

class Editor {
    drag: Observable<string>
    selection: Observable<SVGRect>
    selectionBox: Observable<ViewNode>
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
      this.selectionBox = o(new ViewNode())
      this.selected = o(new Set<string>())
      this.nodes = o({})
      this.focusedNode = o(null)
      this.nodeIndex = o([])

      this.nodeIndexCache = []
      this.nodeCache = {}
      for (let xIdx = 0; xIdx < 40; xIdx++) {
        for (let yIdx = 0; yIdx < 40; yIdx++) {
          this.nodeIndexCache.push(`n${xIdx}_${yIdx}`)
          this.nodeCache[`n${xIdx}_${yIdx}`] = new ViewNode(xIdx * 10, yIdx * 10, 8, 8, '#fff');
        }
      }
      this.nodes(this.nodeCache);
      this.nodeIndex(this.nodeIndexCache)
      this.rootNode = root;
      this.drag = o('');
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
      return this.rootNode.querySelector('#' + id);
    }

    getNodeList() {
      return Array.from(this.rootNode.querySelectorAll('.node'));
    }

    getRubberSelection() {
      return this.rootNode.querySelector('#rubber');
    }

    resizeSelection(relX:number, relY:number, originX:number, originY:number) {
      const box = this.selectionBox();
      const tbox = transformedBBox(new DOMRect(box.x, box.y, box.width, box.height), box.mat)
      const cv = this.viewport();
      let scaleX = (tbox.width + relX / cv.scale) / tbox.width;
      let scaleY = (tbox.height + relY / cv.scale) / tbox.height;

      if (scaleX < 1) {
        scaleX = scaleY = Math.min(scaleX, scaleY);
      } else {
        scaleX = scaleY = Math.max(scaleX, scaleY);
      }

      if (scaleX > 0 && scaleY > 0) {
        box.mat.scaleSelf(scaleX, scaleY, 1.0, tbox.x - originX * tbox.width, tbox.y - originY * tbox.height, 0);
        this.selectionBox(box);
      }
    }

    bindEvents() {
      this.pointerEvent.subscribe((ev) => {
        const drag = this.drag();
        if (drag.length == 0 && ev.type == 'DOWN') {
          if (ev.button == 1) {
            this.drag('rubber');
            this.selected(new Set<string>())
            this.selectionBox(new ViewNode(0, 0, 0, 0))
            const rect = this.rootNode?.getBoundingClientRect();
            if (rect) {
              this.selection(new DOMRect(ev.x, ev.y - 50, 0, 0))
            }
            this.nodes(this.nodeCache)
          } else if (ev.button == 3) {
            this.drag('movement')
          }
        }

        if (ev.type == 'MOVE') {
          switch (drag) {
            case 'angle': {
              const old = new DOMPoint(this.rotation().x, this.rotation().y)
              const oldAngle = Math.atan2(old.y, old.x);
              this.rotation(new DOMPoint(old.x + ev.relX, old.y + ev.relY))
              const box = this.selectionBox()
              const angle = Math.atan2(this.rotation().y, this.rotation().x);
              box.mat.translateSelf(box.x + box.width / 2, box.y + box.height / 2);
              box.mat.rotateSelf(0, 0.0, (angle - oldAngle) * 180 / Math.PI);
              box.mat.translateSelf(-(box.x + box.width / 2), -(box.y + box.height / 2))
              this.selectionBox(box);
              break;
            }
            case 'selection': {
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

        if (ev.type == 'SCROLL') {
          const sign = Math.sign(ev.relX)
          const scaleChange = Math.pow(1.05, -sign)
          const cv = this.viewport();
          const newScale = cv.scale * scaleChange
          const totalX = (ev.x / newScale) - (ev.x / cv.scale - cv.x)
          const totalY = (ev.y / newScale) - (ev.y / cv.scale - cv.y)
          this.viewport({ x: totalX, y: totalY, scale: newScale });
        }

        if (ev.type == 'UP') {
          if (ev.button == 1) {
            if (drag == 'angle') {
              this.rotation(new DOMPoint(0, 0));
            } else {
              const r = this.getRubberSelection();
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
                  this.selectionBox(new ViewNode(0, 0, 0, 0))
                }
              }
            }
          }

          const v = this.viewport()
          const ctm = this.getViewportNode().getCTM().inverse()
          if (ctm) {
            const selected = this.selected()
            selected.forEach((e) => {
              const node = (this.getNode(e) as SVGGraphicsElement)
              if (node) {
                const mt = ctm.multiply(node.getCTM())
                if (mt) {
                  this.nodeCache[e].mat = new DOMMatrix([mt.a, mt.b, mt.c, mt.d, mt.e, mt.f]);
                }
              }
            });
          }

          const box = this.selectionBox()
          const rect = transformedBBox(new DOMRect(box.x, box.y, box.width, box.height), box.mat);
          this.selectionBox(new ViewNode(rect.x, rect.y, rect.width, rect.height))
          this.drag('');
        }
      })
    }

    rubberSelection() {
        if (this.drag() == 'rubber') {
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
        return svg`<rect id=${n} class="node" x=${v.x} y=${v.y} transform=${v.mat} width=${v.width} height=${v.height} fill=${v.fill} />`
      });
    }

    renderSelectedNodes() {
      const nodes = this.nodes()
      const selected = this.selected();
      const nodeIndex = this.nodeIndex()
      const nonSelected = o(nodeIndex.filter((n) => selected.has(n)))
      const selectedList = map(nonSelected, (n) => {
        const v = nodes[n];
        return svg`<rect id=${n} class="node" x=${v.x} y=${v.y} transform=${v.mat} width=${v.width} height=${v.height} fill=${v.fill} />`
      });

      return svg`<g class="selected" transform-origion="center" transform=${this.selectionBox().mat}>${selectedList}</g>`
    }

    processDown(e:Event) {
      const target = e.target as SVGGraphicsElement
      if (target.classList.contains('node')) {
        this.focusedNode(target.id) 
      } else {
        if (target.classList.contains('br-resize')) {
          this.drag('br-resize')
        }

        if (target.classList.contains('angle')) {
          this.drag('angle')
        }

        if (target.classList.contains('tl-resize')) {
          this.drag('tl-resize')
        }

        if (target.classList.contains('tr-resize')) {
          this.drag('tr-resize')
        }

        if (target.classList.contains('bl-resize')) {
          this.drag('bl-resize')
        }

        if (target.classList.contains('selection')) {
          this.drag('selection')
        }
      }
      e.preventDefault();
      return false;
    }

    drawNodesSelectionBox() {
      const box = this.selectionBox()
      const rect = transformedBBox(new DOMRect(box.x, box.y, box.width, box.height), box.mat);
      const left = rect.left;
      const top = rect.top;
      const right = rect.right;
      const bottom = rect.bottom;
      const v = this.viewport()
      if (this.selected().size > 0) {
        return svg` <rect  x=${left - 4 / v.scale} y=${top - 4 / v.scale} class="draggable selection" width=${right - left + 8 / v.scale} height=${bottom - top + 8 / v.scale} fill="#fff0" stroke="#555" stroke-width="1" stroke-dasharray="3" vector-effect="non-scaling-stroke" />
          <rect class="draggable tl-resize" x=${left - 8 / v.scale} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <rect class="draggable tr-resize" x=${right} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <rect class="draggable bl-resize" x=${left - 8 / v.scale} y=${bottom} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <rect class="draggable br-resize" x=${right} y=${bottom} width=${8 / v.scale} height=${8 / v.scale} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
          <circle class="draggable angle" cx=${left + rect.width / 2 + this.rotation().x} cy=${top + this.rotation().y} r=${6 / v.scale} fill="#f00" stroke-width="1px" stroke="#000" vector-effect="non-scaling-size"/>
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
        const node = document.getElementById(v);
        if (node) {
          const svgNode = node as SVGGraphicsElement;
          const ctm = svgNode.getCTM();
          if (ctm) {
            const bbox = transformedBBox(svgNode.getBBox(), ctm)
            top = Math.min(top, bbox.top);
            left = Math.min(left, bbox.left);
            bottom = Math.max(bottom, bbox.bottom);
            right = Math.max(right, bbox.right);
          }
        }
      });

      if (bottom != top || left != right) {
        const ctm = this.getViewportNode().getCTM()?.inverse()
        if (ctm) {
          const inversed = transformedBBox(new DOMRect(left, top, right - left, bottom - top), ctm);
          this.selectionBox(new ViewNode(inversed.x, inversed.y, inversed.width, inversed.height));
        }
      }
    }

    canvas() {
      return () => {
        const v = this.viewport();
        const mat = new DOMMatrix(`scale(${v.scale},${v.scale}) translate(${v.x}px,${v.y}px)`)
        return svg`
        <svg onpointerdown=${(e) => this.processDown(e)} oncontextmenu=${(e) => e.preventDefault()} id="svg-root" viewBox="0 0 1000 1000"  preserveAspectRatio="xMidYMid meet">
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
