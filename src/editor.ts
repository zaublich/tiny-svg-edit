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
  constructor(x:number, y:number, width:number, height:number, fill:string) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.fill = fill;
  }
}
class Editor {
    drag: Observable<number>
    selection: Observable<SVGRect>
    selected: Observable<Set<string>>
    nodeIndex:Observable<Array<string>>
<<<<<<< HEAD
    nodes: Observable<Record<string, ViewNode>>
=======
    nodeIndexCache:Array<string>
    nodes: Observable<Record<string, ViewNode>>
    nodeCache: Record<string, ViewNode>
>>>>>>> f02b19558a6c54c9dd69f43a965ab0681cc1dbf3
    viewport: Observable<Viewport>
    rootNode: Element
    pointerEvent: rxjs.Observable<PointerEvent>

    constructor(root:Element) {
      this.selected = o(new Set<string>())
      this.nodes = o({})
      this.nodeIndex = o([])
<<<<<<< HEAD
      const nodeIndex = []
      const nodes = {}
      for (let xIdx = 0; xIdx < 40; xIdx++) {
        for (let yIdx = 0; yIdx < 40; yIdx++) {
          nodeIndex.push(`${xIdx}-${yIdx}`)
          nodes[`${xIdx}-${yIdx}`] = new ViewNode(xIdx * 10, yIdx * 10, 8, 8, '#fff');
=======
      this.nodeIndexCache = []
      this.nodeCache = {}
      for (let xIdx = 0; xIdx < 20; xIdx++) {
        for (let yIdx = 0; yIdx < 40; yIdx++) {
          this.nodeIndexCache.push(`${xIdx}-${yIdx}`)
          this.nodeCache[`${xIdx}-${yIdx}`] = new ViewNode(xIdx * 10, yIdx * 10, 8, 8, '#fff');
>>>>>>> f02b19558a6c54c9dd69f43a965ab0681cc1dbf3
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
            console.log('HERE')
          } else {
            this.drag(ev.button);
            const rect = this.rootNode?.getBoundingClientRect();
            if (rect) {
              this.selection(new DOMRect(ev.x, ev.y - 50, 0, 0))
            }
          }
        }

        if (this.drag() == 100 && ev.type == 'MOVE') {
          for (var idx of Array.from(this.selected())) {
            this.nodeCache[idx].x += ev.relX / this.viewport().scale;
            this.nodeCache[idx].y += ev.relY / this.viewport().scale;
          }
          this.nodes(this.nodeCache);
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
          if (r && ev.button == 1) {
            const s = r.getBoundingClientRect();
            const selectedNodes = Array.from(elements?.querySelectorAll(':scope > .node')).reduce((accumulator, n) => {
              if (n.classList.contains('selection') == false && collide(s, n.getBoundingClientRect())) {
                accumulator.add(n.id);
              }
              return accumulator;
            }, new Set<string>())
            if (selectedNodes) {
              this.selected(selectedNodes)
                //this.selectedNodes(selectedNodes)
            } else {
              this.selected(new Set<string>());
                //this.selectedNodes([])
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
<<<<<<< HEAD
      console.log(selected)
=======
>>>>>>> f02b19558a6c54c9dd69f43a965ab0681cc1dbf3
      return map(this.nodeIndex, (n) => {
        const v = nodes[n];
        if (selected.has(n)) {
          return svg`<rect id=${n} class="node selected" x=${v.x} y=${v.y} width=${v.width} height=${v.height} fill=${v.fill} />`
        } else {
          return svg`<rect id=${n} class="node" x=${v.x} y=${v.y} width=${v.width} height=${v.height} fill=${v.fill} />`
        }
      });
    }

    drawNodesSelectionBox() {
        return () => {
          const elements = Array.from(document.querySelectorAll('.node.selected'))
<<<<<<< HEAD
          console.log('Elements', elements);
=======
>>>>>>> f02b19558a6c54c9dd69f43a965ab0681cc1dbf3
          if (elements.length > 0) {
              const box = elements[0].getBBox();
              let top = box.y;
              let bottom = box.y + box.height;
              let left = box.x;
              let right = box.x + box.width;
              elements.slice(1).forEach((e) => {
                  const bbox = e.getBBox()
                  top = Math.min(top, bbox.y);
                  left = Math.min(left, bbox.x);
                  bottom = Math.max(bottom, bbox.y + bbox.height);
                  right = Math.max(right, bbox.x + bbox.width);
              });
              const v = this.viewport();
              return svg`
                  <rect  class="selection" x=${left - 4 / v.scale} y=${top - 4 / v.scale} width=${right - left + 8 / v.scale} height=${bottom - top + 8 / v.scale} 
                  fill="none" stroke="#555" stroke-width="1" stroke-dasharray="3" vector-effect="non-scaling-stroke"
                  ></rect>
                  <rect x=${left - 8 / v.scale} y=${top - 8 / v.scale} width=${8 / v.scale} height=${8 / v.scale}  fill="#ccc" stroke="#000" vector-effect="non-scaling-stroke" />
                  `
          } else {
              svg``
          }
        };
     }

    canvas() {
      return () => {
        const v = this.viewport();
        return svg`
        <svg oncontextmenu=${(e) => e.preventDefault()} id="svg-root" viewBox="0 0 1000 1000"  preserveAspectRatio="xMidYMid meet">
            <g transform="scale(${v.scale},${v.scale}) translate(${v.x} ${v.y}) ">
            ${this.renderNodes()}
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
