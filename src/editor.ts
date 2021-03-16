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

const transformedBBox = (bbox: SVGRect, mat: DOMMatrix) => {
  const tl = mat.transformPoint(new DOMPoint(bbox.x, bbox.y));
  const br = mat.transformPoint(new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height));
  const tr = mat.transformPoint(new DOMPoint(bbox.x + bbox.width, bbox.y));
  const bl = mat.transformPoint(new DOMPoint(bbox.x, bbox.y + bbox.height));
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
    nodeIndex:Observable<Array<string>>
    nodeIndexCache:Array<string>
    nodes: Observable<Record<string, ViewNode>>
    nodeCache: Record<string, ViewNode>
    viewport: Observable<Viewport>
    rootNode: Element
    pointerEvent: rxjs.Observable<PointerEvent>

    constructor(root:Element) {
      this.selectionBox = o(new ViewNode())
      this.selected = o(new Set<string>())
      this.nodes = o({})
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

    bindEvents() {
      this.pointerEvent.subscribe((ev) => {
        const drag = this.drag();
        if (drag.length == 0 && ev.type == 'DOWN') {
          if (ev.button == 1) {
            this.drag('rubber');
            const v = this.viewport()
            const ctm = this.getViewportNode().getCTM().inverse()
            if (ctm) {
              const selected = this.selected()
              selected.forEach((e) => {
                const node = (this.getNode(e) as SVGGraphicsElement)
                if (node) {
                  const mt = ctm.multiply(node.getCTM())
                  if (mt) {
                    this.nodeCache[e].mat = (new DOMMatrix([mt.a, mt.b, mt.c, mt.d, mt.e, mt.f]))
                  }
                }
              });
            }
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

        if (drag == 'selection' && ev.type == 'MOVE') {
          var box = this.selectionBox();
          box.mat.translateSelf(ev.relX / this.viewport().scale, ev.relY / this.viewport().scale, 0)
          this.selectionBox(box);
        }

        if (drag == 'rubber' && ev.type == 'MOVE') {
          const c = this.selection();
          this.selection(new DOMRect(c.x, c.y, c.width + ev.relX, c.height + ev.relY))
        }

        if (drag == 'movement' && ev.type == 'MOVE') {
          const cv = this.viewport();
          this.viewport({ x: cv.x + ev.relX / cv.scale, y: cv.y + ev.relY / cv.scale, scale: cv.scale })
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
          if (ev.button == 1 && this.drag) {
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
          console.log('Undrag')
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

      return svg`<g class="selected" transform=${this.selectionBox().mat}>${selectedList}</g>`
    }

    drawNodesSelectionBox() {
      const box = this.selectionBox()
      const left = box.x;
      const top = box.y;
      const right = left + box.width
      const bottom = top + box.height;
      const v = this.viewport()
      if (this.selected().size > 0) {
        console.log('redrawing')
        return svg`
        <rect  x=${left - 4 / v.scale} y=${top - 4 / v.scale} class="selection" width=${right - left + 8 / v.scale} transform=${box.mat} height=${bottom - top + 8 / v.scale} 
              fill="#fff0" stroke="#555" stroke-width="1" stroke-dasharray="3" vector-effect="non-scaling-stroke" />
              <rect  x=${left - 8 / v.scale} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale} transform=${box.mat} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
              <rect  x=${right} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale} transform=${box.mat} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
              <rect  x=${left - 8 / v.scale} y=${bottom} width=${8 / v.scale} height=${8 / v.scale} transform=${box.mat} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
              <rect  x=${right} y=${bottom} width=${8 / v.scale} height=${8 / v.scale} transform=${box.mat} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
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
            const mat = new DOMMatrix([ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f]);
            const bbox = transformedBBox(svgNode.getBBox(), mat)
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
          const inversed = transformedBBox(new DOMRect(left, top, right - left, bottom - top), new DOMMatrix([ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f]));
          this.selectionBox(new ViewNode(inversed.x, inversed.y, inversed.width, inversed.height));
        }
      }
    }

    processDown(e:Event) {
      const target = e.target as SVGGraphicsElement
      if (target.classList.contains('selection')) {
        this.drag('selection')
      }

      return false;
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
