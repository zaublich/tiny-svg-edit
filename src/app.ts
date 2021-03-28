import { o, html, svg } from 'sinuous';
import { Editor } from './editor'
import './theme.scss';

const App = (editor) => html`
  <style>
    .invisible{
      stroke: none;
      fill: none;
      width: 0;
      height 0;
    }

    #app {
      width: 1000px;
      height: 1000px;
      background: #aaa;
    }
    
    .draggable:hover{
      stroke-width: 2px;
    }

    svg {
      width: 1000px;
      height: 1000px;
      background: #faa;
    }
  </style>
  <div id="app">
    <ul class="navbar">
     <a class="navbar-item" href="#">Home</a>
      <a class="navbar-item" href="#users/bob">Bob's Profile</a>
      <a class="navbar-item" href="#products/123">Product 123</a>
    </ul>
    ${editor.canvas()}
  </div>
`;

if (document) {
  const root = document.querySelector('#root');
  if (root) {
    const editor = new Editor(root)
    root.append(App(editor));
  }
}
