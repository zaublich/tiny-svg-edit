// import { expect } from 'chai';
// import * as jsdom from 'jsdom'
import { StoreProvider } from '../src/context/storeProvider';
import { BasicAction, EpicsMiddlewareInterface, ReducerBase, ReducerStateBase, ActionWithState } from '../src/context/baseReducer'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { of, Observable, Subject, empty } from 'rxjs';
import { delay, mergeAll } from 'rxjs/operators';

class testReducer implements ReducerBase {
  reduce(state: ReducerStateBase, action: BasicAction): ReducerStateBase {
    throw new Error('Method not implemented.');
  }
}

type callback = (action:ActionWithState)=>Observable<BasicAction> ;

class TestEpics implements EpicsMiddlewareInterface {
  epics :Map<string, callback>
  events :Subject<Observable<BasicAction>>;
  constructor() {
    this.epics = new Map<string, callback>()
    this.events = new Subject<Observable<BasicAction> >();
  }

  add(name:string, cb:(action:ActionWithState) => Observable<BasicAction>):void {
    this.epics.set(name, cb);
  }

  send(action: ActionWithState): void {
    if (action && action.action) {
      const call = this.epics.get(action.action.type)
        if (call) {
          this.events.next(call(action));
        }
      }
  }

  observe():Observable<BasicAction> {
    return this.events.pipe(mergeAll<BasicAction>());
  }
}

describe('Options tests', () => { // the tests container
    it('check epics', () => new Promise((resolve, reject) => {
      const epics = new TestEpics();

      epics.add('tost1', (action:ActionWithState):Observable<BasicAction> => {
        console.time('epics1');
        return of({ type: 'trest2' }).pipe(delay(500));
      });

      epics.add('tost2', (action:ActionWithState):Observable<BasicAction> => {
        console.time('epics2');
        return empty();
      });

      epics.add('tost', (action:ActionWithState):Observable<BasicAction> => {
        console.time('epics');
        return of({ type: 'test' }).pipe(delay(400));
      });

      epics.add('tost3', (action:ActionWithState):Observable<BasicAction> => {
        console.time('epics3');
        return empty();
      });

      epics.observe().subscribe((x:BasicAction) => {
        if (x.type == 'test') {
          console.timeEnd('epics');
          resolve(true);
        } else {
          reject(new Error('unexpected'));
        }
      });

      epics.send({ action: { type: 'tost1', payload: null }, state: {} })
      epics.send({ action: { type: 'tost2', payload: null }, state: {} })
      epics.send({ action: { type: 'tost', payload: null }, state: {} })
      epics.send({ action: { type: 'tost3', payload: null }, state: {} })
    }));

    it('checking default options', () => { // the single test
      const root = document.createElement('div');
      document.body.appendChild(root);
      const reducer = new testReducer();
      ReactDOM.render(
        <StoreProvider reducer={ reducer } epics={ new TestEpics() }><h1>Testing</h1></StoreProvider>,
        root
      );
    });
});
