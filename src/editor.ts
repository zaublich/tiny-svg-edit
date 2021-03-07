import { Document } from './document'
import { o, svg, html } from 'sinuous'
import { PointerEventObservable, PointerEvent } from './PointerEvents'
import { map } from 'sinuous/map'
import { Observable } from 'sinuous/observable'
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
  if ((s.x + s.width < bb.x) || (s.y + s.height < bb.y) || (s.x > bb.x + bb.width) || (s.y > bb.y + bb.height)) {
    return false;
  } else {
    return true;
  }
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

class Editor {
    drag: Observable<number>
    selection: Observable<SVGRect>
    viewport: Observable<Viewport>
    rootNode: Element
    pointerEvent: rxjs.Observable<PointerEvent>
    selectedNodes: Observable<Array<string>>

    constructor(root:Element) {
        this.rootNode = root;
        this.drag = o(0);
        this.selection = o(new DOMRect());
        this.viewport = o(new Viewport({}));
        this.pointerEvent = PointerEventObservable(this.rootNode);
        this.selectedNodes = o([]);
        this.bindEvents()
    }

    bindEvents() {
        this.pointerEvent.subscribe((ev) => {
        if (ev.type == 'DOWN') {
          this.drag(ev.button);
          const rect = this.rootNode?.getBoundingClientRect();
          if (rect) {
            this.selection(new DOMRect(ev.x, ev.y - 50, 0, 0))
          }
        }

        if (this.drag() == 1 && ev.type == 'MOVE') {
          const c = this.selection();
          this.selection(new DOMRect(c.x, c.y, c.width + ev.relX, c.height + ev.relY))
          console.log(this.selection());
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
                accumulator.push(n.id);
              }
              return accumulator;
            }, [])
            if (selectedNodes) {
                this.selectedNodes(selectedNodes)
            } else {
                this.selectedNodes([])
            }
          }
          this.drag(0);
        }
      })
    }

    rubberSelection() {
        if (this.drag()) {
            const v = this.selection();
            return () => svg`<path id="rubber" fill="#7dd5" stroke="#affc" d="m${v.x} ${v.y} h${v.width} v${v.height} h${-v.width} z"></path>`
        } else {
          svg``;
        }
    }

    getSelectedElements() {
        return [];
    }

    drawNodesSelectionBox() {
        const e = this.getSelectedElements;
        return () => {
          const elements = e()
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
      const viewport = this.viewport;
      return () => {
        const v = viewport();
        return svg`
        <svg oncontextmenu=${(e) => e.preventDefault()} id="svg-root" viewBox="0 0 1000 1000"  preserveAspectRatio="xMidYMid meet">
            <g transform="scale(${v.scale},${v.scale}) translate(${v.x} ${v.y}) ">
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
