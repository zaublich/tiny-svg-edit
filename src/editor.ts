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
    drag: Observable<number>
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
      for (let xIdx = 0; xIdx < 20; xIdx++) {
        for (let yIdx = 0; yIdx < 40; yIdx++) {
          this.nodeIndexCache.push(`${xIdx}_${yIdx}`)
          this.nodeCache[`${xIdx}_${yIdx}`] = new ViewNode(xIdx * 10, yIdx * 10, 8, 8, '#fff');
        }
      }
      this.nodes(this.nodeCache);
      this.nodeIndex(this.nodeIndexCache)
      this.rootNode = root;
      this.drag = o(0);
      this.selection = o(new DOMRect());
      this.viewport = o(new Viewport({}));
      this.pointerEvent = PointerEventObservable(this.rootNode);
      this.bindEvents()
    }

    bindEvents() {
        this.pointerEvent.subscribe((ev) => {
        if (ev.type == 'DOWN') {
          const selectionBox = document.querySelector('#svg-root g > .selection');
          if (selectionBox && inside(ev.x, ev.y, selectionBox.getBoundingClientRect())) {
            this.drag(100);
          } else {
            this.drag(ev.button);
            this.selected().forEach((e) => {
              this.nodeCache[e].mat = this.nodeCache[e].mat.multiply(this.selectionBox().mat)
            });
            this.selected(new Set())
            const rect = this.rootNode?.getBoundingClientRect();
            if (rect) {
              this.selection(new DOMRect(ev.x, ev.y - 50, 0, 0))
            }
            this.nodes(this.nodeCache)
          }
        }

        if (this.drag() == 100 && ev.type == 'MOVE') {
          var box = this.selectionBox();
          box.mat.translateSelf(ev.relX / this.viewport().scale, ev.relY / this.viewport().scale, 0)
          this.selectionBox(box);
          const selectionBox = document.querySelector('#svg-root g > .selection');
        }

        if (this.drag() == 1 && ev.type == 'MOVE') {
          const c = this.selection();
          this.selection(new DOMRect(c.x, c.y, c.width + ev.relX, c.height + ev.relY))
        }

        if (this.drag() == 3 && ev.type == 'MOVE') {
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
          const elements = document.querySelector('#svg-root g')
          const r = document.querySelector('#rubber');
          if (ev.button == 1) {
            if (r) {
              const s = r.getBoundingClientRect();
              const selectedNodes = Array.from(elements?.querySelectorAll(':scope > .node')).reduce((accumulator, n) => {
                if (n.classList.contains('selection') == false && collide(s, n.getBoundingClientRect())) {
                  accumulator.add(n.id);
                }
                return accumulator;
              }, new Set<string>())
              if (selectedNodes) {
                this.selected(selectedNodes)
                this.updateSelectionBox();
              } else {
                this.selected(new Set<string>());
              }
            }
          }
          this.drag(0);
        }
      })
    }

    rubberSelection() {
        if (this.drag() == 1) {
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
      const nonSelected = o(this.nodeIndex().filter((n) => !selected.has(n)))
      return map(nonSelected, (n) => {
        const v = nodes[n];
        return svg`<rect id=${n} class="node" x=${v.x} y=${v.y} transform=${v.mat} width=${v.width} height=${v.height} fill=${v.fill} />`
      });
    }

    renderSelectedNodes() {
      const nodes = this.nodes()
      const selected = this.selected();
      const nonSelected = o(this.nodeIndex().filter((n) => selected.has(n)))
      const selectedList = map(nonSelected, (n) => {
        const v = nodes[n];
        return svg`<rect id=${n} class="node" x=${v.x} y=${v.y} transform=${v.mat} width=${v.width} height=${v.height} fill=${v.fill} />`
      });

      return svg`<g class="selected" transform=${this.selectionBox().mat}>${selectedList}</g>`
    }

    drawNodesSelectionBox() {
      const { width, height } = this.selectionBox()
      const box = this.selectionBox()
      const left = box.x;
      const top = box.y;
      const right = left + box.width
      const bottom = top + box.height;
      const v = this.viewport()
      if (this.selected().size > 0) {
        return svg`<rect x=${left - 8 / v.scale} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale} transform=${box.mat} fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
        <rect  x=${left - 8 / v.scale} y=${top - 8 / v.scale} class="selection" width=${right - left + 8 / v.scale} transform=${box.mat} height=${bottom - top + 8 / v.scale} 
              fill="none" stroke="#555" stroke-width="1" stroke-dasharray="3" vector-effect="non-scaling-stroke"></rect> `;
      } else {
        return svg``
      }
    }

    updateSelectionBox() {
      let top = Number.MAX_SAFE_INTEGER
      let left = Number.MAX_SAFE_INTEGER;
      let bottom = Number.MIN_SAFE_INTEGER;
      let right = Number.MIN_SAFE_INTEGER;

      this.selected().forEach((v) => {
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
        const ctm = (document.querySelector('#canvas') as SVGGraphicsElement).getCTM()?.inverse()
        if (ctm) {
          const inversed = transformedBBox(new DOMRect(left, top, right - left, bottom - top), new DOMMatrix([ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f]));
          this.selectionBox(new ViewNode(inversed.x, inversed.y, inversed.width, inversed.height));
        }
      }
    }

    canvas() {
      return () => {
        const v = this.viewport();
        return svg`
        <svg oncontextmenu=${(e) => e.preventDefault()} id="svg-root" viewBox="0 0 1000 1000"  preserveAspectRatio="xMidYMid meet">
            <g id="canvas" transform="scale(${v.scale},${v.scale}) translate(${v.x} ${v.y}) ">
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
