/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.tsx":
/*!*********************!*\
  !*** ./src/app.tsx ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var sinuous__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sinuous */ \"./node_modules/sinuous/module/sinuous.js\");\n/* harmony import */ var _theme_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./theme.scss */ \"./src/theme.scss\");\nvar _templateObject;\n\nfunction _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }\n\n\n\nvar counter = (0,sinuous__WEBPACK_IMPORTED_MODULE_0__.o)(0);\nconsole.log(window.history.state);\n\nwindow.onpopstate = function (e) {\n  console.log('PopState', e.state);\n};\n\nvar App = function App() {\n  return (0,sinuous__WEBPACK_IMPORTED_MODULE_0__.html)(_templateObject || (_templateObject = _taggedTemplateLiteral([\"\\n  <div>\\n    <ul class=\\\"navbar\\\">\\n     <a class=\\\"navbar-item\\\" href=\\\"/\\\">Home</a>\\n      <a class=\\\"navbar-item\\\" href=\\\"/users/bob\\\">Bob's Profile</a>\\n      <a class=\\\"navbar-item\\\" href=\\\"/products/123\\\">Product 123</a>\\n    </ul>\\n    <button onclick=\", \">\", \"</button>\\n  </div>\\n\"])), function () {\n    console.log(counter());\n    counter(counter() + 1);\n  }, counter);\n};\n\nvar updateRoute = function updateRoute() {\n  //route(location.pathname + location.search)\n  window.history.replaceState({\n    count: counter()\n  }, 'hello', location.toString());\n  console.log('COUNT', counter());\n};\n\nwindow.addEventListener('hashchange ', updateRoute, false);\n\nif (document) {\n  var root = document.querySelector('#root');\n\n  if (root) {\n    root.append(App());\n  }\n}\n\n//# sourceURL=webpack://ag-react-base/./src/app.tsx?");

/***/ }),

/***/ "./src/theme.scss":
/*!************************!*\
  !*** ./src/theme.scss ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://ag-react-base/./src/theme.scss?");

/***/ }),

/***/ "./node_modules/sinuous/module/htm.js":
/*!********************************************!*\
  !*** ./node_modules/sinuous/module/htm.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nlet t=(n,e,o,f)=>{let i={};for(let s=1;s<e.length;s++){let r=e[s],u=\"number\"==typeof r?o[r]:r,l=e[++s];if(1===l)f[0]=u;else if(3===l)f[1]=Object.assign(f[1]||{},u);else if(5===l)(f[1]=f[1]||{})[e[++s]]=u;else if(6===l){let t=e[++s],n=(f[1]=f[1]||{})[t],o=i[t];o||\"function\"!=typeof u&&\"function\"!=typeof n||(o=n&&[n]||[],f[1][t]=function(){let t=\"\";for(var n=0;n<o.length;n++)t+=\"function\"==typeof o[n]?o[n].call(this):o[n];return t}),o?o.push(u):f[1][t]+=u+\"\"}else if(l){let e=()=>n.apply(null,t(n,u,o,[\"\",null]));f.push(\"function\"==typeof f[0]?e:e())}else f.push(u)}return f},n=function(t){let n,e,o=1,f=\"\",i=\"\",s=[0];let r=t=>{1===o&&(t||(f=f.replace(/^\\s*\\n\\s*|\\s*\\n\\s*$/g,\"\")))?s.push(t||f,0):3===o&&(t||f)?(s.push(t||f,1),o=2):2===o&&\"...\"===f&&t?s.push(t,3):2===o&&f&&!t?s.push(!0,5,f):o>=5&&((f||!t&&5===o)&&(s.push(f,o,e),o=6),t&&(s.push(t,o,e),o=6)),f=\"\"};for(let u=0;u<t.length;u++){u&&(1===o&&r(),r(u));for(let l=0;l<t[u].length;l++)n=t[u][l],1===o?\"<\"===n?(r(),s=[s],o=3):f+=n:4===o?\"--\"===f&&\">\"===n?(o=1,f=\"\"):f=n+f[0]:i?n===i?i=\"\":f+=n:'\"'===n||\"'\"===n?i=n:\">\"===n?(r(),o=1):o&&(\"=\"===n?(o=5,e=f,f=\"\"):\"/\"===n&&(o<5||\">\"===t[u][l+1])?(r(),3===o&&(s=s[0]),o=s,(s=s[0]).push(o,2),o=0):\" \"===n||\"\\t\"===n||\"\\n\"===n||\"\\r\"===n?(r(),o=2):f+=n),3===o&&\"!--\"===f&&(o=4,s=s[0])}return r(),s},e=new Map,o=function(o){let f=e.get(this);return f||(f=new Map,e.set(this,f)),f=t(this,f.get(o)||(f.set(o,f=n(o)),f),arguments,[]),f.length>1?f:f[0]},f=function(){let t=o.apply(this,arguments);if(t)return Array.isArray(t)?this(t):\"object\"==typeof t?t:this([t])};/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {let t=f.bind(this);return(this.wrap||t).apply(t,arguments)}\n//# sourceMappingURL=htm.js.map\n\n\n//# sourceURL=webpack://ag-react-base/./node_modules/sinuous/module/htm.js?");

/***/ }),

/***/ "./node_modules/sinuous/module/observable.js":
/*!***************************************************!*\
  !*** ./node_modules/sinuous/module/observable.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"S\": () => (/* binding */ f),\n/* harmony export */   \"cleanup\": () => (/* binding */ s),\n/* harmony export */   \"computed\": () => (/* binding */ f),\n/* harmony export */   \"isListening\": () => (/* binding */ u),\n/* harmony export */   \"o\": () => (/* binding */ i),\n/* harmony export */   \"observable\": () => (/* binding */ i),\n/* harmony export */   \"on\": () => (/* binding */ d),\n/* harmony export */   \"root\": () => (/* binding */ o),\n/* harmony export */   \"sample\": () => (/* binding */ c),\n/* harmony export */   \"subscribe\": () => (/* binding */ l),\n/* harmony export */   \"transaction\": () => (/* binding */ e),\n/* harmony export */   \"unsubscribe\": () => (/* binding */ v)\n/* harmony export */ });\nlet n=[];let t,r;function u(){return!!t}function o(n){let r=t,u=()=>{};t=u,a(u);let o=n(()=>{S(u),t=void 0});return t=r,o}function c(n){let r=t;t=void 0;let u=n();return t=r,u}function e(t){let u=r;r=[];let o=t();let c=r;return r=u,c.forEach(t=>{if(t.t!==n){let r=t.t;t.t=n,t(r)}}),o}function i(u){function o(c){if(0===arguments.length)return t&&!o.__o.has(t)&&(o.__o.add(t),t.u.push(o)),u;if(r)return o.t===n&&r.push(o),o.t=c,c;u=c;let e=t;return t=void 0,o.o=new Set(o.__o),o.o.forEach(n=>n.i=!1),o.o.forEach(n=>{n.i||n()}),t=e,u}return o.$o=1,o.__o=new Set,o.t=n,o}function f(n,r){function u(){let o=t;return t&&t.__c.push(u),S(u),u.i=!0,t=u,r=n(r),t=o,r}function o(){return u.i?t&&u.u.forEach(n=>n()):r=u(),r}return n.s=u,a(u),u(),o.$o=1,o}function s(n){return t&&t.l.push(n),n}function l(n){return f(n),()=>S(n.s)}function d(n,t,r,u){return n=[].concat(n),f(r=>{n.forEach(n=>n());let o=r;return u||(o=c(()=>t(r))),u=!1,o},r)}function v(n){S(n.s)}function S(n){n.__c.forEach(S),n.u.forEach(t=>{t.__o.delete(n),t.o&&t.o.delete(n)}),n.l.forEach(n=>n()),a(n)}function a(n){n.u=[],n.__c=[],n.l=[]}\n//# sourceMappingURL=observable.js.map\n\n\n//# sourceURL=webpack://ag-react-base/./node_modules/sinuous/module/observable.js?");

/***/ }),

/***/ "./node_modules/sinuous/module/sinuous.js":
/*!************************************************!*\
  !*** ./node_modules/sinuous/module/sinuous.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"o\": () => (/* reexport safe */ _observable_js__WEBPACK_IMPORTED_MODULE_0__.o),\n/* harmony export */   \"observable\": () => (/* reexport safe */ _observable_js__WEBPACK_IMPORTED_MODULE_0__.observable),\n/* harmony export */   \"api\": () => (/* binding */ r),\n/* harmony export */   \"h\": () => (/* binding */ u),\n/* harmony export */   \"hs\": () => (/* binding */ a),\n/* harmony export */   \"html\": () => (/* binding */ c),\n/* harmony export */   \"svg\": () => (/* binding */ p)\n/* harmony export */ });\n/* harmony import */ var _observable_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./observable.js */ \"./node_modules/sinuous/module/observable.js\");\n/* harmony import */ var _htm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./htm.js */ \"./node_modules/sinuous/module/htm.js\");\nlet r={},i=[];function f(e){return this.t&&this.t[e.type](e)}r.h=(...e)=>{let t,o=n=>{if(null==n);else if(\"string\"==typeof n)t?r.add(t,n):t=r.s?document.createElementNS(\"http://www.w3.org/2000/svg\",n):document.createElement(n);else if(Array.isArray(n))t||(t=document.createDocumentFragment()),n.forEach(o);else if(n instanceof Node)t?r.add(t,n):t=n;else if(\"object\"==typeof n)r.property(t,n,null,r.s);else if(\"function\"==typeof n)if(t){let e=r.add(t,\"\");r.insert(t,n,e)}else t=n.apply(null,e.splice(1));else r.add(t,\"\"+n)};return e.forEach(o),t},r.insert=(e,t,o,n,s)=>(e=o&&o.parentNode||e,s=s||n instanceof Node&&n,t===n||(n&&\"string\"!=typeof n||!(\"string\"==typeof t||\"number\"==typeof t&&(t+=\"\"))?\"function\"==typeof t?r.subscribe(()=>{n=r.insert(e,t.call({el:e,endMark:o}),o,n,s)}):(o?n&&(s||(s=n.o&&n.o.nextSibling||o.previousSibling),r.rm(e,s,o)):e.textContent=\"\",n=null,t&&!0!==t&&(n=r.add(e,t,o))):(null!=n&&e.firstChild?o?(o.previousSibling||e.lastChild).data=t:e.firstChild.data=t:o?r.add(e,t,o):e.textContent=t,n=t)),n),r.property=(e,t,o,n,s)=>{if(null!=t)if(!o||\"attrs\"===o&&(n=!0))for(o in t)r.property(e,t[o],o,n,s);else\"o\"!==o[0]||\"n\"!==o[1]||t.$o?\"function\"==typeof t?r.subscribe(()=>{r.property(e,t.call({el:e,name:o}),o,n,s)}):s?e.style.setProperty(o,t):n||\"data-\"===o.slice(0,5)||\"aria-\"===o.slice(0,5)?e.setAttribute(o,t):\"style\"===o?\"string\"==typeof t?e.style.cssText=t:r.property(e,t,null,n,!0):(\"class\"===o&&(o+=\"Name\"),e[o]=t):((e,t,o)=>{t=t.slice(2).toLowerCase(),o?e.addEventListener(t,f):e.removeEventListener(t,f),(e.t||(e.t={}))[t]=o})(e,o,t)},r.add=(e,t,o)=>{let n=(e=>{const{childNodes:t}=e;if(t&&11===e.nodeType)return t.length<2?t[0]:{o:r.add(e,\"\",t[0])}})(t=(e=>\"string\"==typeof e?document.createTextNode(e):e instanceof Node?e:r.h(i,e))(t))||t;return e.insertBefore(t,o&&o.parentNode&&o),n},r.rm=(e,t,o)=>{for(;t&&t!==o;){let o=t.nextSibling;e===t.parentNode&&e.removeChild(t),t=o}},r.subscribe=_observable_js__WEBPACK_IMPORTED_MODULE_0__.subscribe,r.cleanup=_observable_js__WEBPACK_IMPORTED_MODULE_0__.cleanup,r.root=_observable_js__WEBPACK_IMPORTED_MODULE_0__.root,r.sample=_observable_js__WEBPACK_IMPORTED_MODULE_0__.sample,r.hs=(...e)=>{let t=r.s;r.s=!0;let o=u(...e);return r.s=t,o};let u=(...e)=>r.h.apply(r.h,e),a=(...e)=>r.hs.apply(r.hs,e),c=(...e)=>_htm_js__WEBPACK_IMPORTED_MODULE_1__.default.apply(u,e),p=(...e)=>_htm_js__WEBPACK_IMPORTED_MODULE_1__.default.apply(a,e);\n//# sourceMappingURL=sinuous.js.map\n\n\n//# sourceURL=webpack://ag-react-base/./node_modules/sinuous/module/sinuous.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/app.tsx");
/******/ 	
/******/ })()
;