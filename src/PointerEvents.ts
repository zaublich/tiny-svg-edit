import { Observable } from 'rxjs'

enum ButtonType{
  Left = 0,
  Middle = 1,
  Right = 2
}
class PointerEvent {
    x:number
    y:number
    relX:number
    relY:number
    type:string
    button: ButtonType

    constructor(x:number, y:number, relX:number, relY:number, type:string, button = 0) {
      this.x = x;
      this.y = y;
      this.button = button;
      this.relX = relX;
      this.relY = relY;
      this.type = type;
      console.log(button)
    }
  }

const PointerEventObservable = (node:Element) => new Observable<PointerEvent>(subscriber => {
    const pointerPos = { x: 0, y: 0 };

    node.addEventListener('pointerdown', (e) => {
      subscriber.next({ type: 'DOWN', button: e.button, x: e.clientX - node.getBoundingClientRect().x, y: e.clientY - node.getBoundingClientRect().y, relX: e.pageX - pointerPos.x, relY: e.pageY - pointerPos.y })
      pointerPos.x = e.pageX;
      pointerPos.y = e.pageY;
      //e.stopPropagation()
      //e.preventDefault()
    });

    window.addEventListener('pointerup', (e) => {
      subscriber.next({ type: 'UP', button: e.button, x: e.clientX, y: e.clientY, relX: e.pageX - pointerPos.x, relY: e.pageY - pointerPos.y })
      pointerPos.x = e.pageX;
      pointerPos.y = e.pageY;
      e.stopPropagation()
      e.preventDefault()
      return false;
    });

    node.addEventListener('wheel', (e) => {
      subscriber.next({ type: 'SCROLL', x: e.clientX - node.getBoundingClientRect().x, y: e.clientY - node.getBoundingClientRect().y - 52, relX: e.deltaY, relY: 0 })
      e.preventDefault();
      e.returnValue = false;
      return false;
    })

    window.addEventListener('pointermove', (e) => {
      subscriber.next({ type: 'MOVE', button: e.button, x: e.clientX, y: e.clientY, relX: e.pageX - pointerPos.x, relY: e.pageY - pointerPos.y })
      pointerPos.x = e.pageX;
      pointerPos.y = e.pageY;
    });
  });

  export {
      PointerEventObservable,
      PointerEvent,
      ButtonType
  }
