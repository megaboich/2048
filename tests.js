!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=92)}({0:function(e,t,n){"use strict";n.d(t,"b",function(){return r}),n.d(t,"a",function(){return o}),n.d(t,"c",function(){return s});
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var i=function(e,t){return(i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)};function r(e,t){function n(){this.constructor=e}i(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}function o(e,t,n,i){return new(n||(n=Promise))(function(r,o){function s(e){try{c(i.next(e))}catch(e){o(e)}}function u(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){e.done?r(e.value):new n(function(t){t(e.value)}).then(s,u)}c((i=i.apply(e,t||[])).next())})}function s(e,t){var n,i,r,o,s={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return o={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function u(o){return function(u){return function(o){if(n)throw new TypeError("Generator is already executing.");for(;s;)try{if(n=1,i&&(r=2&o[0]?i.return:o[0]?i.throw||((r=i.return)&&r.call(i),0):i.next)&&!(r=r.call(i,o[1])).done)return r;switch(i=0,r&&(o=[2&o[0],r.value]),o[0]){case 0:case 1:r=o;break;case 4:return s.label++,{value:o[1],done:!1};case 5:s.label++,i=o[1],o=[0];continue;case 7:o=s.ops.pop(),s.trys.pop();continue;default:if(!(r=(r=s.trys).length>0&&r[r.length-1])&&(6===o[0]||2===o[0])){s=0;continue}if(3===o[0]&&(!r||o[1]>r[0]&&o[1]<r[3])){s.label=o[1];break}if(6===o[0]&&s.label<r[1]){s.label=r[1],r=o;break}if(r&&s.label<r[2]){s.label=r[2],s.ops.push(o);break}r[2]&&s.ops.pop(),s.trys.pop();continue}o=t.call(e,s)}catch(e){o=[6,e],i=0}finally{n=r=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,u])}}}},1:function(e,t,n){"use strict";var i;n.d(t,"a",function(){return i}),function(e){e.Up="up",e.Down="down",e.Right="right",e.Left="left"}(i||(i={}))},10:function(e,t,n){"use strict";n.d(t,"a",function(){return r});var i=n(0);function r(e){return i.a(this,void 0,void 0,function(){return i.c(this,function(t){return[2,new Promise(function(t){setTimeout(function(){t()},e)})]})})}},17:function(e,t,n){"use strict";n.d(t,"a",function(){return l});var i=n(0),r=n(1),o=n(2),s=n(4),u=n(3),c=n(10),a=n(5),l=function(){function e(e,t){this.rand=t,this.scores=0,this.userActionsQueue=[],this.grid=new s.a(e)}return e.prototype.getScores=function(){return this.scores},e.prototype.serialize=function(){var e={scores:this.scores,gridSerialized:this.grid.serialize()};return JSON.stringify(e)},e.prototype.initFromState=function(e){try{var t=JSON.parse(e),n=Object(a.a)(t.scores),i=Object(a.a)(s.a.deserialize(t.gridSerialized));return this.scores=n,this.grid=i,!0}catch(e){return!1}},e.prototype.queueAction=function(e){this.userActionsQueue.push(e)},e.prototype.processAction=function(){return i.a(this,void 0,void 0,function(){var e;return i.c(this,function(t){switch(t.label){case 0:return 0!==this.userActionsQueue.length?[3,2]:[4,Object(c.a)(100)];case 1:return t.sent(),[3,0];case 2:return e=this.userActionsQueue.splice(0,1)[0],[2,this.processSingleAction(e)]}})})},e.prototype.processSingleAction=function(e){var t=[];if("MOVE"===e.type&&t.push.apply(t,this.processMoveAction(e.direction)),"START"===e.type)if(e.serializedState&&this.initFromState(e.serializedState)){t.push(new o.b);for(var n=0;n<this.grid.size;n++)for(var i=0;i<this.grid.size;i++)this.grid.cells[n][i]>0&&t.push(new o.c({cellIndex:i,rowIndex:n,value:this.grid.cells[n][i]}))}else{this.scores=0,t.push(new o.b);for(n=0;n<this.grid.size;n++)for(i=0;i<this.grid.size;i++)this.grid.cells[n][i]>0&&(t.push(new o.d({cellIndex:i,rowIndex:n})),this.grid.cells[n][i]=0);var r=this.insertNewTileToVacantSpace();r&&t.push(new o.c(r))}return t},e.prototype.calculateMoveEvents=function(e){for(var t=[],n=0,i=this.grid.getRowDataByDirection(e);n<i.length;n++)for(var r=i[n],s=0,c=u.a.ProcessRow(r);s<c.length;s++){var a=c[s],l=r[a.oldIndex],f=r[a.newIndex];a.isMerged?t.push(new o.e(l,f,a.mergedValue)):t.push(new o.f(l,f,a.value,a.isDeleted))}return t},e.prototype.processMoveAction=function(e){for(var t=this.calculateMoveEvents(e),n=t.length>0,i=0,s=t;i<s.length;i++){var u=s[i];u instanceof o.f&&(this.grid.updateTileByPos(u.newPosition,u.value),this.grid.removeTileByPos(u.oldPosition)),u instanceof o.e&&(this.grid.updateTileByPos(u.mergePosition,u.newValue),this.grid.removeTileByPos(u.oldPosition),this.scores+=u.newValue)}if(n){var c=this.insertNewTileToVacantSpace();if(!c)throw new Error("New title must be inserted somewhere!");t.push(new o.c(c))}else{if(t.push(new o.g(e)),0==this.grid.availableCells().length)this.calculateMoveEvents(r.a.Up).length>0||this.calculateMoveEvents(r.a.Right).length>0||this.calculateMoveEvents(r.a.Left).length>0||this.calculateMoveEvents(r.a.Down).length>0||t.push(new o.a)}return t},e.prototype.insertNewTileToVacantSpace=function(){var e=this.grid.availableCells();if(e.length>0){var t=e[this.rand.getRandomNumber(0,e.length)],n={rowIndex:t.rowIndex,cellIndex:t.cellIndex,value:2};return this.grid.insertTileByPos(n,n.value),n}},e}()},2:function(e,t,n){"use strict";n.d(t,"e",function(){return o}),n.d(t,"f",function(){return s}),n.d(t,"c",function(){return u}),n.d(t,"d",function(){return c}),n.d(t,"g",function(){return a}),n.d(t,"b",function(){return l}),n.d(t,"a",function(){return f});var i=n(0),r=function(){return function(){}}(),o=function(e){function t(t,n,i){var r=e.call(this)||this;return r.oldPosition=t,r.mergePosition=n,r.newValue=i,r}return i.b(t,e),t}(r),s=function(e){function t(t,n,i,r){var o=e.call(this)||this;return o.oldPosition=t,o.newPosition=n,o.value=i,o.shouldBeDeleted=r,o}return i.b(t,e),t}(r),u=function(e){function t(t){var n=e.call(this)||this;return n.tile=t,n}return i.b(t,e),t}(r),c=function(e){function t(t){var n=e.call(this)||this;return n.position=t,n}return i.b(t,e),t}(r),a=function(e){function t(t){var n=e.call(this)||this;return n.direction=t,n}return i.b(t,e),t}(r),l=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i.b(t,e),t}(r),f=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i.b(t,e),t}(r)},3:function(e,t,n){"use strict";n.d(t,"b",function(){return i}),n.d(t,"a",function(){return r});var i=function(){function e(e,t,n,i){void 0===i&&(i=0),this.oldIndex=e,this.newIndex=t,this.value=n,this.mergedValue=i}return Object.defineProperty(e.prototype,"isDeleted",{get:function(){return this.mergedValue<0},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"isMerged",{get:function(){return this.mergedValue>0},enumerable:!0,configurable:!0}),e}(),r=function(){function e(){}return e.ProcessRow=function(e){for(var t=e[0].value,n=e[0].value>0?1:0,r=[],o=void 0,s=1;s<e.length;++s){var u=e[s].value;0!=u&&(t==u?(o?o.mergedValue=-1:r.push(new i(n-1,n-1,u,-1)),r.push(new i(s,n-1,u,u+t)),t=0):(s>n&&(o=new i(s,n,u),r.push(o)),t=u,++n))}return r},e}()},4:function(e,t,n){"use strict";n.d(t,"a",function(){return r});var i=n(1),r=function(){function e(e){this.size=e,this.cells=new Array(this.size);for(var t=0;t<this.size;t++){this.cells[t]=new Array(this.size);for(var n=0;n<this.size;n++)this.cells[t][n]=0}}return e.prototype.serialize=function(){for(var e=[],t=0;t<this.size;++t)e.push(this.cells[t].join(","));return e.join("|")},e.deserialize=function(t){var n=new e(0);return n.initFromState(t),n},e.prototype.initFromState=function(e){var t=e.split("|");this.size=t.length,this.cells=[];for(var n=0;n<this.size;++n){var i=[];this.cells.push(i);var r=t[n].split(",");if(r.length!=this.size)throw new Error("Incorrect serialized grid state");for(var o=0;o<this.size;++o)i.push(parseInt(r[o],10))}},e.prototype.insertTileByPos=function(e,t){this.insertTile(e.rowIndex,e.cellIndex,t)},e.prototype.insertTile=function(e,t,n){if(e<0)throw new Error("X position "+e+"is < 0");if(t<0)throw new Error("Y position "+t+"is < 0");if(e>=this.size)throw new Error("X position "+e+"is more than grid size");if(t>=this.size)throw new Error("Y position "+t+"is more than grid size");if(0!=this.cells[e][t])throw new Error("Cell with position "+e+", "+t+" is occupied");this.cells[e][t]=n},e.prototype.removeTile=function(e,t){this.cells[e][t]=0},e.prototype.removeTileByPos=function(e){this.removeTile(e.rowIndex,e.cellIndex)},e.prototype.getTile=function(e,t){return{rowIndex:e,cellIndex:t,value:this.cells[e][t]}},e.prototype.updateTileByPos=function(e,t){this.cells[e.rowIndex][e.cellIndex]=t},e.prototype.availableCells=function(){for(var e=[],t=0;t<this.size;++t)for(var n=0;n<this.size;++n)0==this.cells[t][n]&&e.push({rowIndex:t,cellIndex:n});return e},e.prototype.getRowDataByDirection=function(e){var t=[];switch(e){case i.a.Left:for(var n=0;n<this.size;++n){for(var r=[],o=0;o<this.size;++o)r.push(this.getTile(n,o));t.push(r)}break;case i.a.Right:for(n=0;n<this.size;++n){for(r=[],o=0;o<this.size;++o)r.push(this.getTile(n,this.size-o-1));t.push(r)}break;case i.a.Up:for(o=0;o<this.size;++o){for(r=[],n=0;n<this.size;++n)r.push(this.getTile(n,o));t.push(r)}break;case i.a.Down:for(o=0;o<this.size;++o){for(r=[],n=0;n<this.size;++n)r.push(this.getTile(this.size-n-1,o));t.push(r)}}return t},e}()},5:function(e,t,n){"use strict";function i(e,t){if(null!==e&&void 0!==e)return e;try{var n=t||"Validation failed";if(null===e)throw new Error(n+": value must not be null");if(void 0===e)throw new Error(n+": value must not be undefined");throw new Error(n)}catch(e){throw console.error(e),e}}n.d(t,"a",function(){return i})},92:function(e,t,n){var i=n(93);i.keys().forEach(i)},93:function(e,t,n){var i={"./game/game2048.spec.ts":94,"./game/grid.spec.ts":97,"./game/row-processor.spec.ts":95};function r(e){var t=o(e);return n(t)}function o(e){var t=i[e];if(!(t+1)){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}return t}r.keys=function(){return Object.keys(i)},r.resolve=o,e.exports=r,r.id=93},94:function(e,t,n){"use strict";n.r(t);var i=n(0),r=n(1),o=n(17),s=n(4);describe("Game2048",function(){function e(e){var t=new o.a(4,function(e){return{getRandomNumber:function(){return e}}}(0));return t.grid=s.a.deserialize(e),t}it("handles move right",function(){return i.a(void 0,void 0,void 0,function(){var t,n;return i.c(this,function(i){switch(i.label){case 0:return(t=e("2,4,0,0|\n                     0,0,0,0|\n                     2,0,0,2|\n                     0,0,0,0")).queueAction({type:"MOVE",direction:r.a.Right}),[4,t.processAction()];case 1:return i.sent(),n="2,0,2,4|\n                      0,0,0,0|\n                      0,0,0,4|\n                      0,0,0,0",expect(t.grid.cells).toEqual(s.a.deserialize(n).cells),[2]}})})}),it("handles move left",function(){return i.a(void 0,void 0,void 0,function(){var t,n;return i.c(this,function(i){switch(i.label){case 0:return(t=e("0,2,2,0|\n                     0,0,0,0|\n                     0,0,2,0|\n                     0,0,0,0")).queueAction({type:"MOVE",direction:r.a.Left}),[4,t.processAction()];case 1:return i.sent(),n="4,2,0,0|\n                      0,0,0,0|\n                      2,0,0,0|\n                      0,0,0,0",expect(t.grid.cells).toEqual(s.a.deserialize(n).cells),[2]}})})})})},95:function(e,t,n){"use strict";n.r(t);var i=n(3);describe("Row Processor tests",function(){function e(e){for(var t=[],n=0;n<e.length;++n)t.push({rowIndex:n,cellIndex:0,value:e[n]});return t}it("Nothing moves",function(){var t=e([2,0,0,0]),n=i.a.ProcessRow(t);expect(n).toEqual([])}),it("Nothing moves 2",function(){var t=e([2,4,8,16]),n=i.a.ProcessRow(t);expect(n).toEqual([])}),it("Single move",function(){var t=e([0,0,0,2]),n=[new i.b(3,0,2)],r=i.a.ProcessRow(t);expect(r).toEqual(n)}),it("Stacked move",function(){var t=e([0,2,0,4]),n=[new i.b(1,0,2),new i.b(3,1,4)],r=i.a.ProcessRow(t);expect(r).toEqual(n)}),it("Stacked move 2",function(){var t=e([0,2,4,8]),n=[new i.b(1,0,2),new i.b(2,1,4),new i.b(3,2,8)],r=i.a.ProcessRow(t);expect(r).toEqual(n)}),it("Simple merge",function(){var t=e([2,2,0,0]),n=[new i.b(0,0,2,-1),new i.b(1,0,2,4)],r=i.a.ProcessRow(t);expect(r).toEqual(n)}),it("Merge with space",function(){var t=e([2,0,2,0]),n=[new i.b(0,0,2,-1),new i.b(2,0,2,4)],r=i.a.ProcessRow(t);expect(r).toEqual(n)}),it("Move with merge",function(){var t=e([0,0,2,2]),n=[new i.b(2,0,2,-1),new i.b(3,0,2,4)],r=i.a.ProcessRow(t);expect(r).toEqual(n)}),it("Move with merge with spaces",function(){var t=e([0,2,0,2]),n=[new i.b(1,0,2,-1),new i.b(3,0,2,4)],r=i.a.ProcessRow(t);expect(r).toEqual(n)}),it("Double merge",function(){var t=e([2,2,2,2]),n=[new i.b(0,0,2,-1),new i.b(1,0,2,4),new i.b(2,1,2,-1),new i.b(3,1,2,4)],r=i.a.ProcessRow(t);expect(r).toEqual(n)})})},97:function(e,t,n){"use strict";n.r(t);var i=n(1),r=n(4);function o(e,t,n){return{rowIndex:e,cellIndex:t,value:n}}describe("Grid state",function(){it("Empty grid serializaion",function(){var e=new r.a(2);expect(e.serialize()).toBe("0,0|0,0")}),it("Filled grid serializaion",function(){var e=new r.a(2);e.insertTile(0,0,1),e.insertTile(0,1,2),e.insertTile(1,0,3),e.insertTile(1,1,4),expect(e.serialize()).toBe("1,2|3,4")}),it("Grid deserializaion",function(){var e=r.a.deserialize("1,2,3|4,5,6|7,8,9");expect(e.serialize()).toBe("1,2,3|4,5,6|7,8,9")})}),describe("Grid insert tests",function(){it("Grid creation",function(){var e=new r.a(4);expect(e.size).toBe(4)}),it("Grid after creation all is available",function(){var e=new r.a(3).availableCells();expect(e.length).toBe(9)}),it("Grid available cells",function(){var e=new r.a(2);e.insertTile(0,0,2),expect(e.availableCells().length).toBe(3),e.insertTile(0,1,2),expect(e.availableCells().length).toBe(2),e.insertTile(1,0,2),expect(e.availableCells().length).toBe(1),e.insertTile(1,1,2),expect(e.availableCells().length).toBe(0)}),it("Grid insert wrong dimension",function(){var e=new r.a(3);expect(function(){e.insertTile(-1,0,2)}).toThrow(),expect(function(){e.insertTile(1,-1,2)}).toThrow(),expect(function(){e.insertTile(3,1,2)}).toThrow(),expect(function(){e.insertTile(1,3,2)}).toThrow()}),it("Grid insert occupied",function(){var e=new r.a(3);e.insertTile(0,0,2),expect(function(){e.insertTile(0,0,2)}).toThrow()})}),describe("Grid get data by direction",function(){it("Left",function(){var e=r.a.deserialize("1,2|3,4").getRowDataByDirection(i.a.Left),t=o(0,0,1),n=o(0,1,2),s=o(1,0,3),u=o(1,1,4);expect(e[0]).toEqual([t,n]),expect(e[1]).toEqual([s,u])}),it("Right",function(){var e=r.a.deserialize("1,2|3,4").getRowDataByDirection(i.a.Right),t=o(0,0,1),n=o(0,1,2),s=o(1,0,3),u=o(1,1,4);expect(e[0]).toEqual([n,t]),expect(e[1]).toEqual([u,s])}),it("Up",function(){var e=r.a.deserialize("1,2|3,4").getRowDataByDirection(i.a.Up),t=o(0,0,1),n=o(0,1,2),s=o(1,0,3),u=o(1,1,4);expect(e[0]).toEqual([t,s]),expect(e[1]).toEqual([n,u])}),it("Down",function(){var e=r.a.deserialize("1,2|3,4").getRowDataByDirection(i.a.Down),t=o(0,0,1),n=o(0,1,2),s=o(1,0,3),u=o(1,1,4);expect(e[0]).toEqual([s,t]),expect(e[1]).toEqual([u,n])})})}});