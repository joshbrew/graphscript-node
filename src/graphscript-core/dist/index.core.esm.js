var x=class{data={};triggers={};ctr=0;constructor(e){typeof e=="object"&&(this.data=e)}setState=e=>{Object.assign(this.data,e);let t=Object.getOwnPropertyNames(e);for(let n of t)this.triggerEvent(n,this.data[n]);if(this.triggers[G]){let n=r=>{r(e)},s=this.triggers[G].length;for(let r=s-1;r>=0;r--)n(this.triggers[G][r].onchange)}return this.data};setValue=(e,t)=>{this.data[e]=t,this.triggerEvent(e,t)};triggerEvent=(e,t)=>{if(this.triggers[e]){let n=r=>{r.onchange(t)},s=this.triggers[e].length;for(let r=s-1;r>=0;r--)n(this.triggers[e][r])}};subscribeState=e=>this.subscribeEvent(G,e);unsubscribeState=e=>this.unsubscribeEvent(G,e);subscribeEvent=(e,t,n,s)=>{if(e){n&&s&&!this.triggers[e]&&Object.defineProperty(this.data,e,{get:()=>n[s],set:_=>{n[s]=_},enumerable:!0,configurable:!0}),this.triggers[e]||(this.triggers[e]=[]);let r=this.ctr;return this.ctr++,this.triggers[e].push({sub:r,onchange:t}),r}else return};unsubscribeEvent=(e,t)=>{let n=this.triggers[e];if(n)if(t===void 0)delete this.triggers[e],delete this.data[e];else{let s,r=n.find((_,o)=>{if(_.sub===t)return s=o,!0});return r&&n.splice(s,1),Object.keys(n).length===0&&(delete this.triggers[e],delete this.data[e]),this.onRemoved&&this.onRemoved(r),!0}};subscribeEventOnce=(e,t)=>{let n,s=r=>{t(r),this.unsubscribeEvent(e,n)};return n=this.subscribeEvent(e,s),n};getEvent=(e,t)=>{if(typeof t!="number")return this.triggers[e];for(let n in this.triggers[e])if(this.triggers[e][n].sub===t)return this.triggers[e][n]};getSnapshot=()=>{let e={};for(let t in this.data)e[t]=this.data[t]};onRemoved},G="*s";var q=new x,w=class extends Function{__bound;__call;constructor(){return super("return this.__bound.__call.apply(this.__bound, arguments)"),this.__bound=this.bind(this),this.__bound}},y=class i{__node={tag:`node${Math.floor(Math.random()*1e15)}`,unique:`${Math.floor(Math.random()*1e15)}`,state:q};__children;__parent;__operator;__listeners;__props;__args;constructor(e,t,n){if(this.__setProperties(e,t,n),typeof e=="function"||e?.__callable){let s=new w;s.__call=(..._)=>this.__operator(..._);let r=new Proxy(s,{get:(_,o,a)=>Reflect.has(this,o)?Reflect.get(this,o,a):Reflect.get(_,o,a),set:(_,o,a,f)=>Reflect.has(this,o)?Reflect.set(this,o,a,f):Reflect.set(_,o,a,f)});return Object.setPrototypeOf(r,this),r}}get __graph(){return this.__node?.graph}set __graph(e){this.__node.graph=e}__setProperties=(e,t,n)=>{if((()=>{let r=e;typeof e=="function"?S(e)?e=new e:e={__operator:e,__node:{forward:!0,tag:e.name}}:typeof e=="string"&&n?.get(e)&&(e=n.get(e)),"__node"in e||(e.__node={}),e.__node.initial||(e.__node.initial=r)})(),typeof e=="object"){let r=()=>{e.__node?.state?this.__node.state=e.__node.state:n&&(e.__node.state=n.__node.state)},_=()=>{e.__props&&(typeof e.__props=="function"&&(e.__props=new e.__props),typeof e.__props=="object"&&this.__proxyObject(e.__props))},o=()=>{e.__node.tag||(e.__operator?.name?e.__node.tag=e.__operator.name:e.__node.tag=`node${Math.floor(Math.random()*1e15)}`)},a=()=>{typeof e.__node=="string"?n?.get(e.__node.tag)?e=n.get(e.__node.tag):e.__node={}:e.__node||(e.__node={}),n&&(e.__node.graph=n),e instanceof b&&(e.__node.source=e)},f=()=>{if(!e.__parent&&t&&(e.__parent=t),t?.__node&&!(t instanceof b||e instanceof b)&&(e.__node.tag=t.__node.tag+"."+e.__node.tag),t instanceof b&&e instanceof b&&(e.__node.loaders&&Object.assign(t.__node.loaders?t.__node.loaders:{},e.__node.loaders),t.__node.mapGraphs)){e.__node.nodes.forEach(h=>{t.set(e.__node.tag+"."+h.__node.tag,h)});let u=()=>{e.__node.nodes.forEach(h=>{t.__node.nodes.delete(e.__node.tag+"."+h.__node.tag)})};this.__addOndisconnected(u)}},l=()=>{if(typeof e.default=="function"&&!e.__operator&&(e.__operator=e.default),e.__operator){if(typeof e.__operator=="string"&&n){let u=n.get(e.__operator);u&&(e.__operator=u.__operator),!e.__node.tag&&e.__operator.name&&(e.__node.tag=e.__operator.name)}typeof e.__operator=="function"&&(e.__operator=this.__setOperator(e.__operator)),e.default&&(e.default=e.__operator)}},c=()=>{e.__node=Object.assign(this.__node,e.__node);let u=Object.getOwnPropertyNames(e).filter(h=>{if(!O[h])return!0});for(let h of u)h in e&&h!=="name"&&(this[h]=e[h])},d=()=>{this.__onconnected&&(typeof this.__onconnected=="function"?this.__onconnected=this.__onconnected.bind(this):Array.isArray(this.__onconnected)&&(this.__onconnected=this.__onconnected.map(u=>u.bind(this))),typeof this.__ondisconnected=="function"?this.__ondisconnected=this.__ondisconnected.bind(this):Array.isArray(this.__ondisconnected)&&(this.__ondisconnected=this.__ondisconnected.map(u=>u.bind(this))))};r(),o(),_(),a(),f(),c(),d(),l()}};__subscribe=(e,t,n,s,r,_,o)=>{let a=(l,c=(u,h)=>h||u,d=e)=>{let u;if(_){let p=j(d,_,this.__node.graph);d=p.__callback,u=p.__args}let h=this.__node.state.subscribeEvent(l,d,this,t),g=this.__node.state.getEvent(l,h);return this.__listeners||(this.__listeners={}),this.__listeners[l]=this.__node.state.triggers[l],g&&(g.source=this.__node.tag,t&&(g.key=t),g.target=c(e,s),r&&(g.tkey=r),n&&(g.subInput=n),_&&(g.arguments=u,g.__args=_),o&&(g.__callback=o),g.node=this,g.graph=this.__node.graph),h},f=l=>{let c=this.__node.graph.get(l);if(!c&&l.includes(".")){s=l.substring(0,l.lastIndexOf("."));let d=this.__node.graph.get(l.substring(0,s));r=l.lastIndexOf(".")+1,d&&typeof d[t]=="function"&&(l=(...u)=>d[r](...u))}else c.__operator&&(l=c.__operator,r="__operator");return l};if(t){if((!this.__node.localState||!this.__node.localState[t])&&this.__addLocalState(this,t),typeof e=="string"){if(o=this.__node.tag+"."+e,r=e,s){if(this.__node.graph?.get(s)){let d=this.__node.graph?.get(s);if(typeof d[e]=="function"){let u=d[e];e=(...h)=>{u(...h)}}else{let u=e;e=g=>{d[u]=g}}}}else if(typeof this[e]=="function"){let d=this[e];e=(...u)=>{d(...u)}}else this.__node.graph?.get(e)&&(e=f(e));if(typeof e!="function")return}let l,c=n?this.__node.unique+"."+t+"input":this.__node.unique+"."+t;return typeof e=="function"&&!e?.__node?l=a(c,(d,u)=>u||d,e):e?.__node&&(l=a(c,(d,u)=>u||d.__node.unique,(...d)=>{e.__operator&&e.__operator(...d)})),l}else{if(typeof e=="string"&&(o=e,s||(s=e),this.__node.graph.get(e)&&(e=this.__node.graph.get(e)),r="__operator",typeof e!="object"))return;let l,c=n?this.__node.unique+"input":this.__node.unique;return typeof e=="function"&&!e?.__node?l=a(c,(d,u)=>u||d,e):e?.__node&&(l=a(c,(d,u)=>u||d.__node.unique,(...d)=>{e.__operator&&e.__operator(...d)})),l}};__unsubscribe=(e,t,n)=>t?this.__node.state.unsubscribeEvent(n?this.__node.unique+"."+t+"input":this.__node.unique+"."+t,e):this.__node.state.unsubscribeEvent(n?this.__node.unique+"input":this.__node.unique,e);__setOperator=e=>{e=e.bind(this),this.__args&&this.__node.graph&&(e=j(e,this.__args,this.__node.graph).__callback);let t=`${this.__node.unique}input`;if(this.__operator=(...n)=>{this.__node.state.triggers[t]&&this.__node.state.setValue(t,n);let s=e(...n);return this.__node.state.triggers[this.__node.unique]&&(typeof s?.then=="function"?s.then(r=>{r!==void 0&&this.__node.state.setValue(this.__node.unique,r)}).catch(console.error):s!==void 0&&this.__node.state.setValue(this.__node.unique,s)),s},this.__parent instanceof i&&!this.__subscribedToParent&&this.__parent.__operator){let n=this.__parent.__subscribe(this),s=()=>{this.__parent?.__unsubscribe(n),delete this.__subscribedToParent};this.__addOndisconnected(s),this.__subscribedToParent=!0}return this.__operator};__addLocalState=(e,t)=>{if(!e)return;this.__node.localState||(this.__node.localState={});let n=this.__node.localState,s=(r,_)=>{let o=this.__node.unique+"."+_,a=`${o}input`,f,l,c,d;if(typeof r[_]=="function"&&_!=="__operator")this.__props?.[_]?c=this.__props:c=n,f=()=>c[_],l=u=>{this.__props?.[_]||(u=u.bind(this)),c[_]=(...h)=>{this.__node.state.triggers[a]&&this.__node.state.setValue(a,h);let g=u(...h);return this.__node.state.triggers[o]&&(typeof g?.then=="function"?g.then(p=>{this.__node.state.triggerEvent(o,p)}).catch(console.error):this.__node.state.triggerEvent(o,g)),g}},n[_]=r[_].bind(this),d={get:f,set:l,enumerable:!0,configurable:!0};else if(_!=="__graph"){let u,h,g;this.__props?.[_]?g=this.__props:g=n,u=()=>g[_],h=p=>{g[_]=p,this.__node.state.triggers[o]&&this.__node.state.triggerEvent(o,p)},n[_]=r[_],d={get:u,set:h,enumerable:!0,configurable:!0}}if(Object.defineProperty(r,_,d),typeof this.__node.initial=="object"){let u=Object.getOwnPropertyDescriptor(this.__node.initial,_);(u===void 0||u?.configurable)&&Object.defineProperty(this.__node.initial,_,d)}};if(t)s(e,t);else for(let r in e)s(e,r)};__proxyObject=e=>{let t=I(e);for(let n of t){let s={get:()=>e[n],set:r=>{e[n]=r},enumerable:!0,configurable:!0};if(Object.defineProperty(this,n,s),typeof this.__node.initial=="object"){let r=Object.getOwnPropertyDescriptor(this.__node.initial,n);(r===void 0||r?.configurable)&&Object.defineProperty(this.__node.initial,n,s)}}};__addOnconnected(e){e=e.bind(this),Array.isArray(this.__onconnected)?this.__onconnected.push(e):typeof this.__onconnected=="function"?this.__onconnected=[e,this.__onconnected]:this.__onconnected=e}__addOndisconnected(e){e=e.bind(this),Array.isArray(this.__ondisconnected)?this.__ondisconnected.push(e):typeof this.__ondisconnected=="function"?this.__ondisconnected=[e,this.__ondisconnected]:this.__ondisconnected=e}__callConnected(e=this){if(typeof this.__onconnected=="function")this.__onconnected(this);else if(Array.isArray(this.__onconnected)){let t=n=>{n(this)};this.__onconnected.forEach(t)}}__callDisconnected(e=this){if(typeof this.__ondisconnected=="function")this.__ondisconnected(this);else if(Array.isArray(this.__ondisconnected)){let t=n=>{n(this)};this.__ondisconnected.forEach(t)}}},b=class i{__node={tag:`graph${Math.floor(Math.random()*1e15)}`,unique:`${Math.random()}`,nodes:new Map,state:q,roots:{}};constructor(e){this.init(e)}init=e=>{if(e){let t=Object.assign({},e);delete t.roots,N(this.__node,t),e.roots&&this.load(e.roots)}};load=(e,t=!1)=>{function n(_,o,a=!0,f=!0){if(f){_||(_={});for(let l in o)!l.startsWith("__")&&o[l]&&typeof o[l]=="object"?(_[l]=o[l],o[l]?.__children&&n({},o[l].__children,!1,!1)):typeof o[l]=="function"&&(_[l]=o[l]);n(_,o,!0,!1)}else if(o?.__children&&!a)o.__children?.constructor.name==="Object"?_.__children?.constructor.name==="Object"?_.__children=n(_.__children,o.__children,!0,!1):_.__children=n({},o.__children,!0,!1):_.__children=o.__children;else if(a)for(let l in o)!l.startsWith("__")&&o[l]&&typeof o[l]=="object"?(_[l]=Object.assign({},o[l]),o[l]?.__children&&(_[l].__children=n({},o[l].__children,!1,!1))):typeof o[l]=="function"&&(_[l]=o[l]);return _}this.__node.roots=n(this.__node.roots?this.__node.roots:{},e);let s=Object.assign({},e);s.__node&&delete s.__node;let r=this.recursiveSet(s,this,void 0,e,t);if(e.__node){if(!e.__node.tag)e.__node._tag=`roots${Math.floor(Math.random()*1e15)}`;else if(!this.get(e.__node.tag)){let _=new y(e,this,this);this.set(_.__node.tag,_),this.runLoaders(_,this,e,e.__node.tag),_.__listeners&&(r[_.__node.tag]=_.__listeners)}}else e.__listeners&&this.setListeners(e.__listeners);return this.setListeners(r),s};setLoaders=(e,t)=>(t?this.__node.loaders=e:Object.assign(this.__node.loaders,e),this.__node.loaders);runLoaders=(e,t,n,s)=>{for(let r in this.__node.loaders)typeof this.__node.loaders[r]=="object"?(this.__node.loaders[r].init&&this.__node.loaders[r](e,t,this,this.__node.roots,n,s),this.__node.loaders[r].connected&&e.__addOnconnected(this.__node.loaders[r].connect),this.__node.loaders[r].disconnected&&e.__addOndisconnected(this.__node.loaders[r].disconnect)):typeof this.__node.loaders[r]=="function"&&this.__node.loaders[r](e,t,this,this.__node.roots,n,s)};add=(e,t,n=!0)=>{let s={};typeof t=="string"&&(t=this.get(t));let r;if(typeof e=="function"?S(e)?e.prototype instanceof y?(e=e.prototype.constructor(e,t,this),r=!0):e=new e:e={__operator:e,__callable:!0}:typeof e=="string"&&(e=this.__node.roots[e]),!e)return;if(!r){let a=Object.getOwnPropertyNames(e),f=Object.getOwnPropertyNames(Object.getPrototypeOf(e));a.push(...f),a=a.filter(c=>!O.includes(c));let l={};for(let c of a)l[c]=e[c];e=l}if(e.__node||(e.__node={}),e.__node.initial=e,typeof e=="object"&&this.get(e.__node.tag))if(n)this.remove(e.__node.tag,!0);else return;else if(e.__node.tag&&this.get(e.__node.tag))return this.get(e.__node.tag);let _,o=N({},e,2);if(r?_=e:_=new y(e,t,this),this.set(_.__node.tag,_),this.runLoaders(_,t,e,_.__node.tag),this.__node.roots[_.__node.tag]=o,_.__children&&(_.__children=Object.assign({},_.__children),this.recursiveSet(_.__children,_,s,_.__children)),_.__listeners){s[_.__node.tag]=Object.assign({},_.__listeners);for(let a in _.__listeners){let f=_.__listeners[a];_[a]&&(delete s[_.__node.tag][a],s[_.__node.tag][_.__node.tag+"."+a]=f),typeof f=="string"&&(_.__children?.[f]?s[_.__node.tag][a]=_.__node.tag+"."+f:t instanceof y&&(t.__node.tag===f||t.__node.tag.includes(".")&&t.__node.tag.split(".").pop()===f)&&(s[_.__node.tag][a]=t.__node.tag))}}return this.setListeners(s),_.__callConnected(),_};recursiveSet=(e,t,n={},s,r=!1)=>{let _=Object.getOwnPropertyNames(s).filter(a=>!O.includes(a)),o=Object.getOwnPropertyNames(Object.getPrototypeOf(s)).filter(a=>!O.includes(a));_.push(...o);for(let a of _){if(a.includes("__"))continue;let f=s[a];if(Array.isArray(f))continue;let l;if(typeof f=="function"?S(f)?(f=new f,f instanceof y&&(f=f.prototype.constructor(f,t,this),l=!0)):f={__operator:f,__callable:!0}:typeof f=="string"?this.__node.nodes.get(f)?f=this.__node.nodes.get(f):f=this.__node.roots[f]:typeof f=="boolean"&&(this.__node.nodes.get(a)?f=this.__node.nodes.get(a):f=this.__node.roots[a]),f&&typeof f=="object"){if(!l&&!(f instanceof y)){let h=Object.getOwnPropertyNames(f).filter(m=>!O.includes(m)),g=Object.getOwnPropertyNames(Object.getPrototypeOf(f)).filter(m=>!O.includes(m));g.splice(g.indexOf("constructor"),1),h.push(...g);let p={};for(let m of h)p[m]=f[m];f=p}if(f.__node||(f.__node={}),f.__node.tag||(f.__node.tag=a),f.__node.initial||(f.__node.initial=e[a]),r&&this.get(f.__node.tag))this.remove(f.__node.tag,!0);else if(this.get(f.__node.tag)&&!(!(t instanceof i)&&t?.__node)||t?.__node&&this.get(t.__node.tag+"."+f.__node.tag))continue;let c,d=!1,u=N({},f,2);if(l||f instanceof y?c=f:(c=new y(f,t,this),d=!0),!d&&f instanceof y&&!l&&t instanceof y){let h=this.subscribe(t.__node.tag,c.__node.tag),g=p=>{this.unsubscribe(t.__node.tag,h)};c.__addOndisconnected(g)}else if(c){if(this.set(c.__node.tag,c),this.runLoaders(c,t,e[a],a),e[a]=c,this.__node.roots[c.__node.tag]=u,c.__children&&(c.__children=Object.assign({},c.__children),this.recursiveSet(c.__children,c,n,c.__children)),c.__listeners){n[c.__node.tag]=Object.assign({},c.__listeners);for(let h in c.__listeners){let g=c.__listeners[h],p=h;c[h]&&(delete n[c.__node.tag][h],p=c.__node.tag+"."+h,n[c.__node.tag][p]=g),typeof g=="string"&&(c.__children?.[g]?n[c.__node.tag][p]=c.__node.tag+"."+g:t instanceof y&&(t.__node.tag===g||t.__node.tag.includes(".")&&t.__node.tag.split(".").pop()===g)&&(n[c.__node.tag][p]=t.__node.tag))}}c.__callConnected()}}}return n};remove=(e,t=!0)=>{if(this.unsubscribe(e),typeof e=="string"&&(e=this.get(e)),e instanceof y){this.delete(e.__node.tag),delete this.__node.roots[e.__node.tag],t&&this.clearListeners(e),e.__callDisconnected();let n=s=>{for(let r in s)this.unsubscribe(s[r]),this.delete(s[r].__node.tag),delete this.__node.roots[s[r].__node.tag],this.delete(r),delete this.__node.roots[r],s[r].__node.tag=s[r].__node.tag.substring(s[r].__node.tag.lastIndexOf(".")+1),t&&this.clearListeners(s[r]),s[r].__callDisconnected(),s[r].__children&&n(s[r].__children)};e.__children&&n(e.__children)}return e?.__node.tag&&e?.__parent&&(delete e?.__parent,e.__node.tag=e.__node.tag.substring(e.__node.tag.indexOf(".")+1)),e?.__node.graph&&(e.__node.graph=void 0),e};run=(e,...t)=>{if(typeof e=="string"){let n=this.get(e);if(!n&&e.includes(".")){if(n=this.get(e.substring(0,e.lastIndexOf("."))),typeof n?.[e.substring(e.lastIndexOf(".")+1)]=="function")return n[e.substring(e.lastIndexOf(".")+1)](...t)}else if(n?.__operator)return n.__operator(...t)}if(e?.__operator)return e?.__operator(...t)};setListeners=e=>{for(let t in e){let n=this.get(t);if(typeof e[t]=="object")for(let s in e[t]){let r=this.get(s),_;if(typeof e[t][s]!="object")e[t][s]={__callback:e[t][s]};else if(!e[t][s].__callback)for(let o in e[t][s]){typeof e[t][s][o]!="object"&&(e[t][s][o]={__callback:e[t][s][o]},n.__operator&&(e[t][s][o].__callback===!0||typeof e[t][s][o].__callback>"u")&&(e[t][s][o].__callback=n.__operator));let a=this.get(o);if(a)_=this.subscribe(a,e[t][s][o].__callback,e[t][s][o].__args,void 0,e[t][s][o].subInput,t);else{let f=s.substring(0,s.lastIndexOf("."));if(a=this.get(f),a){let l=s.substring(s.lastIndexOf(".")+1);_=this.subscribe(a,e[t][s][o].__callback,e[t][s][o].__args,l,e[t][s][o].subInput,t)}}}if("__callback"in e[t][s])if(n&&((e[t][s].__callback===!0||typeof e[t][s].__callback>"u")&&(e[t][s].__callback=n.__operator),typeof e[t][s].__callback=="function"&&(e[t][s].__callback=e[t][s].__callback.bind(n))),r)_=this.subscribe(r,e[t][s].__callback,e[t][s].__args,void 0,e[t][s].subInput,t);else{let o=s.substring(0,s.lastIndexOf("."));r=this.get(o),r&&(_=this.subscribe(r,e[t][s].__callback,e[t][s].__args,s.substring(s.lastIndexOf(".")+1),e[t][s].subInput,t))}}}};clearListeners=(e,t)=>{if(typeof e=="string"&&(e=this.get(e)),e?.__listeners)for(let n in e.__listeners){if(t&&n!==t||typeof e.__listeners[n]?.sub!="number")continue;let s=this.get(n);if(s)if(typeof!e.__listeners[n]?.__callback=="number")for(let r in e.__listeners[n])e.__listeners[n][r]?.sub&&(this.unsubscribe(s,e.__listeners[n][r].sub,void 0,e.__listeners[n][r].subInput),e.__listeners[n][r].sub=void 0);else typeof e.__listeners[n]?.sub=="number"&&(this.unsubscribe(s,e.__listeners[n].sub,void 0,e.__listeners[n].subInput),e.__listeners[n].sub=void 0);else if(s=this.get(n.substring(0,n.lastIndexOf("."))),s)if(typeof e.__listeners[n]=="object"&&!e.__listeners[n]?.__callback)for(let r in e.__listeners[n])typeof e.__listeners[n][r]?.sub=="number"&&(this.unsubscribe(s,e.__listeners[n][r].sub,n.substring(n.lastIndexOf(".")+1),e.__listeners[n][r].subInput),e.__listeners[n][r].sub=void 0);else typeof e.__listeners[n]?.sub=="number"&&(this.unsubscribe(s,e.__listeners[n].sub,n.substring(n.lastIndexOf(".")+1),e.__listeners[n].subInput),e.__listeners[n].sub=void 0)}};get=e=>this.__node.nodes.get(e);getByUnique=e=>Array.from(this.__node.nodes.values()).find(t=>{if(t.__node.unique===e)return!0});set=(e,t)=>this.__node.nodes.set(e,t);delete=e=>this.__node.nodes.delete(e);list=()=>Array.from(this.__node.nodes.keys());getListener=(e,t,n)=>{let s=this.get(e);if(s){let r=s.__node.unique;return t&&(r+="."+t),this.__node.state.getEvent(r,n)}};getProps=(e,t)=>{if(typeof e=="string"&&(e=this.get(e)),e instanceof y){let n;if(t)n=Object.assign({},this.__node.roots[e.__node.tag]);else{n=Object.assign({},e);for(let s in n)s.includes("__")&&delete n[s]}}};subscribe=(e,t,n,s,r,_,o)=>{let a=e;typeof e=="string"&&(a=this.get(e),!a&&e.includes(".")&&(a=this.get(e.substring(0,e.lastIndexOf("."))),s=e.substring(e.lastIndexOf(".")+1))),_ instanceof y&&(_=_.__node.tag);let f;if(typeof t=="string"){f=t;let c=d=>{if(this.get(d)?.__operator){let u=this.get(d);_=d,d=function(...h){return u.__operator(...h)}}else if(d.includes(".")){_=d.substring(0,d.lastIndexOf("."));let u=this.get(_),h=d.substring(d.lastIndexOf(".")+1);o=h,typeof u[h]=="function"?u[h]instanceof y?d=u[h]:d=function(...g){return u[h](...g)}:d=function(g){return u[h]=g,u[h]}}return d};if(_){let d=this.get(_);typeof d?.[t]=="function"?(o=t,t=function(...u){return d[s](...u)}):d?.[s]?(o=s,d[s]instanceof y?t=d[s]:t=function(u){return d[s]=u,d[s]}):t=c(t)}else t=c(t)}let l;if(a instanceof y){let c=()=>{l=a.__subscribe(t,s,r,_,o,n,f);let d=()=>{l!==void 0&&a.__unsubscribe(l,s,r),l=void 0};a.__addOndisconnected(()=>{d(),a.__addOnconnected(()=>{l===void 0&&a.__node.graph.__node.tag===this.__node.tag&&c()})}),typeof t=="string"&&this.get(t)&&(t=this.get(t)),t instanceof y&&t.__addOndisconnected(()=>{d()})};c()}else if(typeof e=="string"){let c=this.get(e);if(c){if(t instanceof y&&t.__operator){let d=()=>{l=c.__subscribe(t.__operator,s,r,_,o,n,f);let u=()=>{l!==void 0&&c.__unsubscribe(l,s,r)};c.__addOndisconnected(()=>{u(),c.__addOnconnected(()=>{l===void 0&&c.__node.graph.__node.tag===this.__node.tag&&d()})}),t.__addOndisconnected(u)};d()}else if(typeof t=="function"||typeof t=="string"){let d=()=>{l=c.__subscribe(t,s,r,_,o,n,f);let u=()=>{l!==void 0&&c.__unsubscribe(l,s,r),l=void 0};c.__addOndisconnected(()=>{u(),c.__addOnconnected(()=>{l===void 0&&c.__node.graph.__node.tag===this.__node.tag&&d()})}),typeof t=="string"&&this.get(t)&&this.get(t).__addOndisconnected(u)};d()}}else typeof t=="string"&&(t=this.__node.nodes.get(t).__operator),typeof t=="function"&&!t?.__node&&(l=this.__node.state.subscribeEvent(e,t))}return l};unsubscribe=(e,t,n,s)=>e instanceof y?e.__unsubscribe(t,n,s):this.get(e)?.__unsubscribe(t,n,s);setState=e=>{this.__node.state.setState(e)}};function N(i,e,t=1/0,n=0){for(let s in e)e[s]?.constructor.name==="Object"&&n<t?(n++,i[s]?.constructor.name==="Object"?N(i[s],e[s],t,n):i[s]=N({},e[s],t,n)):i[s]=e[s];return i}function I(i){var e=[],t=i;do{var n=Object.getOwnPropertyNames(t);let s=function(r){e.indexOf(r)===-1&&e.push(r)};n.forEach(s)}while(t=Object.getPrototypeOf(t));return e}function v(i){let e=I(i),t={};for(let n of e)t[n]=i[n];return t}function S(i){return R(i)==="class"}function R(i){return typeof i=="function"?i.prototype?Object.getOwnPropertyDescriptor(i,"prototype")?.writable?"function":"class":i.constructor.name==="AsyncFunction"?"async":"arrow":""}var A=(i,e)=>{if(e.get(i)?.__operator){let t=e.get(i);return(...n)=>{t.__operator(...n)}}else if(i.includes(".")){let t=i.split("."),n=t.pop(),s=t.join("."),r=e.get(s);return typeof e.get(s)?.[n]=="function"?(..._)=>r[n](..._):()=>r[n]}else if(e.get(i)){let t=e.get(i);return()=>t}else{let t=i;return()=>t}},j=(i,e,t)=>{let n=[],s=(_,o)=>{if(_==="__output"||_==="__input"||_==="__callback")n[o]={__callback:a=>a,__args:void 0,idx:o};else if(typeof _=="string")n[o]={__callback:A(_,t),__args:void 0,idx:o};else if(typeof _=="function"){let a=_;n[o]={__callback:(...f)=>a(...f),__args:void 0,idx:o}}else if(typeof _=="object"&&(_.__input||_.__callback)){let a=function(f){let l=f.__input?f.__input:f.__callback;if(typeof f.__input=="string"&&(l={__callback:A(f.__input,t),__args:void 0,idx:o}),f.__args){let c=j(l,f.__args,t);l={__callback:c.__callback,__args:c.__args,idx:o}}else l={__callback:l,__args:void 0,idx:o};if(f.__output){let c=f.__output;if(typeof f.__output=="string"?c={__callback:A(c,t),__args:void 0,idx:o}:typeof _.__output=="object"&&(c=a(c)),typeof c?.__callback=="function"){let d=l.__callback,u=c.__callback;l={__callback:(...h)=>u(d(...h)),__args:c.__args,idx:o}}}return l};n[o]=a(_)}else{let a=_;n[o]={__callback:()=>a,__args:void 0,idx:o}}};e.forEach(s),typeof i=="string"&&(i={__callback:A(i,t),__args:void 0});let r=typeof i=="function"?i:i.__callback;return i=function(..._){let o=f=>f.__callback(..._);return r(...n.map(o))},{__callback:i,__args:n}},O=Object.getOwnPropertyNames(Object.getPrototypeOf({}));var C=(i,e,t)=>{i.__node.backward&&e instanceof y&&t.setListeners({[e.__node.tag]:{[i.__node.tag]:e}})},T=(i,e,t)=>{if(i.__operator){let n=Math.random();if(i.__node.loops||(i.__node.loops={}),typeof i.__node.delay=="number"){let s=i.__operator;i.__setOperator((...r)=>new Promise((_,o)=>{i.__node.loops[n]=setTimeout(async()=>{_(await s(...r))},i.__node.delay)}))}else if(i.__node.frame===!0){let s=i.__operator;i.__setOperator((...r)=>new Promise((_,o)=>{i.__node.loops[n]=requestAnimationFrame(async()=>{_(await s(...r))})}))}if(typeof i.__node.repeat=="number"||typeof i.__node.recursive=="number"){let s=i.__operator;i.__setOperator(async(...r)=>{let _=i.__node.repeat?i.__node.repeat:i.__node.recursive,o,a=async(f,...l)=>{for(;f>0;){if(i.__node.delay||i.__node.frame){s(...l).then(async c=>{i.__node.recursive?await a(f,c):await a(f,...l)});break}else o=await s(...r);f--}};return await a(_,...r),o})}if(i.__node.loop&&typeof i.__node.loop=="number"){let s=i.__operator,r=i.__node.loop;i.__setOperator((...o)=>{if("looping"in i.__node||(i.__node.looping=!0),i.__node.looping){let a=performance.now();s(...o),i.__node.loops[n]=setTimeout(()=>{let l=performance.now()-a-i.__node.loop;l>0?r=i.__node.loop-l:r=i.__node.loop,r<=0&&(r=i.__node.loop),i.__operator(...o)},r)}}),i.__node.looping&&i.__operator();let _=o=>{o.__node.looping&&(o.__node.looping=!1),o.__node.loops[n]&&(clearTimeout(o.__node.loops[n]),cancelAnimationFrame(o.__node.loops[n]))};i.__addOndisconnected(_)}}},$=(i,e,t)=>{if(i.__node.animate===!0||i.__animation){let n=i.__operator;i.__setOperator((...r)=>{"animating"in i.__node||(i.__node.animating=!0),i.__node.animating&&(typeof i.__animation=="function"?i.__animation(...r):n(...r),i.__node.animationFrame=requestAnimationFrame(()=>{i.__operator(...r)}))}),(i.__node.animating||(!("animating"in i.__node)||i.__node.animating)&&i.__animation)&&setTimeout(()=>{i.__node.animationFrame=requestAnimationFrame(i.__operator)},10);let s=r=>{r.__node.animating&&(r.__node.animating=!1),r.__node.animationFrame&&cancelAnimationFrame(r.__node.animationFrame)};i.__addOndisconnected(s)}},J=(i,e,t)=>{if(typeof i.__branch=="object"&&i.__operator&&!i.__branchApplied){let n=i.__operator;i.__branchApplied=!0,i.__operator=(...s)=>{let r=n(...s);for(let _ in i.__branch){let o=()=>{typeof i.__branch[_].then=="function"?i.__branch[_].then(r):i.__branch[_].then instanceof y&&i.__branch[_].then.__operator?i.__branch[_].then.__operator(r):r=i.__branch[_].then};typeof i.__branch[_].if=="function"?i.__branch[_].if(r)==!0&&o():i.__branch[_].if===r&&o()}return r}}if(i.__listeners){for(let n in i.__listeners)if(typeof i.__listeners[n]=="object"&&i.__listeners[n].branch&&!i.__listeners[n].branchApplied){let s=i.__listeners[n].callback;i.__listeners[n].branchApplied=!0,i.__listeners.callback=r=>{let _=()=>{typeof i.__listeners[n].branch.then=="function"?r=i.__listeners[n].branch.then(r):i.__listeners[n].branch.then instanceof y&&i.__listeners[n].branch.then.__operator?r=i.__listeners[n].branch.then.__operator(r):r=i.__listeners[n].branch.then};return typeof i.__listeners[n].branch.if=="function"?i.__listeners[n].branch.if(r)&&_():i.__listeners[n].branch.if===r&&_(),s(r)}}}},W=(i,e,t)=>{if(i.__listeners)for(let n in i.__listeners)typeof i.__listeners[n]=="object"&&i.__listeners[n].oncreate&&i.__listeners[n].callback(i.__listeners[n].oncreate)},V=(i,e,t)=>{if(i.__listeners)for(let n in i.__listeners)typeof i.__listeners[n]=="object"&&typeof i.__listeners[n].binding=="object"&&(i.__listeners.callback=i.__listeners.callback.bind(i.__listeners[n].binding))},B=(i,e,t)=>{if(i.__listeners){for(let n in i.__listeners)if(typeof i.__listeners[n]=="object"&&typeof i.__listeners[n].transform=="function"&&!i.__listeners[n].transformApplied){let s=i.__listeners[n].callback;i.__listeners[n].transformApplied=!0,i.__listeners.callback=r=>(r=i.__listeners[n].transform(r),s(r))}}},H=(i,e,t)=>{i.post&&!i.__operator?i.__setOperator(i.post):!i.__operator&&typeof i.get=="function"&&i.__setOperator(i.get),!i.get&&i.__operator,i.aliases&&i.aliases.forEach(n=>{t.set(n,i);let s=r=>{t.__node.nodes.delete(n)};i.__addOndisconnected(s)}),typeof t.__node.roots?.[i.__node.tag]=="object"&&i.get&&(t.__node.roots[i.__node.tag].get=i.get)},F={backprop:C,loop:T,animate:$,branching:J,triggerListenerOncreate:W,bindListener:V,transformListenerResult:B,substitute__operator:H};var U=i=>{let e={};for(let t in i)typeof i[t]=="object"?e[t]=U(i[t]):typeof i[t]=="function"?e[t]=i[t].toString():e[t]=i[t];return e};function se(i){typeof i!="string"&&(i=i.toString());let e=i.match(/\(?[^]*?\)?\s*=>/);if(e)return e[0].replace(/[()\s]/gi,"").replace("=>","").split(",");let t=i.match(/\([^]*?\)/);return t?t[0].replace(/[()\s]/gi,"").split(","):[]}var D=i=>{let e=i.indexOf("=>")+1;return e<=0&&(e=i.indexOf("){")),e<=0&&(e=i.indexOf(") {")),i.slice(0,i.indexOf("{",e)+1)};function P(i=""){let e=r=>r.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i,"$2$3$4"),t=D(i),n=e(i),s;if(t.includes("function")){let r=t.substring(t.indexOf("(")+1,t.lastIndexOf(")"));s=new Function(r,n)}else if(t.substring(0,6)===n.substring(0,6)){let r=t.substring(t.indexOf("(")+1,t.lastIndexOf(")"));s=new Function(r,n.substring(n.indexOf("{")+1,n.length-1))}else try{s=(0,eval)(i)}catch{}return s}function re(i="{}"){try{let e=typeof i=="string"?JSON.parse(i):i,t=n=>{for(let s in n)if(typeof n[s]=="string"){let r=P(n[s]);typeof r=="function"&&(n[s]=r)}else typeof n[s]=="object"&&t(n[s]);return n};return t(e)}catch(e){console.error(e);return}}var k=function(){let i=new Map,e=[],t=["this"];function n(){i.clear(),e.length=0,t.length=1}function s(_,o){var a=e.length-1,f=e[a];if(typeof f=="object")if(f[_]===o||a===0)t.push(_),e.push(o.pushed);else for(;a-->=0;){if(f=e[a],typeof f=="object"&&f[_]===o){a+=2,e.length=a,t.length=a,--a,e[a]=o,t[a]=_;break}a--}}function r(_,o){if(o!=null&&typeof o=="object"){_&&s(_,o);let a=i.get(o);if(a)return"[Circular Reference]"+a;i.set(o,t.join("."))}return o}return function(o,a){try{return e.push(o),JSON.stringify(o,r,a)}finally{n()}}}();JSON.stringifyWithCircularRefs===void 0&&(JSON.stringifyWithCircularRefs=k);var z=function(){let i=new Map,e=[],t=["this"];function n(){i.clear(),e.length=0,t.length=1}function s(_,o){var a=e.length-1,f=e[a];if(typeof f=="object")if(f[_]===o||a===0)t.push(_),e.push(o.pushed);else for(;a-->=0;){if(f=e[a],typeof f=="object"&&f[_]===o){a+=2,e.length=a,t.length=a,--a,e[a]=o,t[a]=_;break}a--}}function r(_,o){if(o!=null&&typeof o=="object"){_&&s(_,o);let a=i.get(o);if(a)return"[Circular Reference]"+a;i.set(typeof o=="function"?o.toString():o,t.join("."))}return typeof o=="function"?o.toString():o}return function(o,a){try{return e.push(o),JSON.stringify(o,r,a)}finally{n()}}}();JSON.stringifyWithFunctionsAndCircularRefs===void 0&&(JSON.stringifyWithFunctionsAndCircularRefs=z);var Q=function(){let i=new Map,e=[],t=["this"];function n(){i.clear(),e.length=0,t.length=1}function s(_,o){var a=e.length-1;if(e[a]){var f=e[a];if(typeof f=="object")if(f[_]===o||a===0)t.push(_),e.push(o.pushed);else for(;a-->=0;){if(f=e[a],typeof f=="object"&&f[_]===o){a+=2,e.length=a,t.length=a,--a,e[a]=o,t[a]=_;break}a++}}}function r(_,o){let a;if(o!=null)if(typeof o=="object"){let f=o.constructor.name;_&&f==="Object"&&s(_,o);let l=i.get(o);if(l)return"[Circular Reference]"+l;if(i.set(o,t.join(".")),f==="Array")o.length>20?a=o.slice(o.length-20):a=o;else if(f.includes("Set"))a=Array.from(o);else if(f!=="Object"&&f!=="Number"&&f!=="String"&&f!=="Boolean")a="instanceof_"+f;else if(f==="Object"){let c={};for(let d in o)if(o[d]==null)c[d]=o[d];else if(Array.isArray(o[d]))o[d].length>20?c[d]=o[d].slice(o[d].length-20):c[d]=o[d];else if(o[d].constructor.name==="Object"){c[d]={};for(let u in o[d])if(Array.isArray(o[d][u]))o[d][u].length>20?c[d][u]=o[d][u].slice(o[d][u].length-20):c[d][u]=o[d][u];else if(o[d][u]!=null){let h=o[d][u].constructor.name;h.includes("Set")?c[d][u]=Array.from(o[d][u]):h!=="Number"&&h!=="String"&&h!=="Boolean"?c[d][u]="instanceof_"+h:c[d][u]=o[d][u]}else c[d][u]=o[d][u]}else{let u=o[d].constructor.name;u.includes("Set")?c[d]=Array.from(o[d]):u!=="Number"&&u!=="String"&&u!=="Boolean"?c[d]="instanceof_"+u:c[d]=o[d]}a=c}else a=o}else a=o;return a}return function(o,a){e.push(o);let f=JSON.stringify(o,r,a);return n(),f}}();JSON.stringifyFast===void 0&&(JSON.stringifyFast=Q);function ae(i){if(typeof i.__methods=="object")for(let e in i.__methods){let t=i.__methods[e],n=typeof t=="function"?t:P(t);e==="__operator"?i.__setOperator(n):i[e]=n.bind(i)}}var L=class extends b{name=`service${Math.floor(Math.random()*1e15)}`;restrict;constructor(e){super({...e,loaders:e?.loaders?Object.assign({...F},e.loaders):{...F}}),e?.services&&this.addServices(e.services),e?.restrict&&(this.restrict=e.restrict),this.load(this)}addServices=e=>{for(let t in e)if(typeof e[t]=="function"&&(e[t]=new e[t]),e[t]?.__node?.loaders&&Object.assign(this.__node.loaders,e[t].__node.loaders),e[t]?.__node?.nodes){e[t].__node.nodes.forEach((r,_)=>{this.get(_)?this.set(t+"."+_,r):this.set(_,r)}),this.__node.nodes.forEach((r,_)=>{e[t].__node.nodes.get(_)||e[t].__node.nodes.set(_,r)});let n=this.set;this.set=(r,_)=>(e[t].set(r,_),n(r,_));let s=this.delete;this.delete=r=>(e[t].delete(r),s(r))}else typeof e[t]=="object"&&this.load(e[t])};handleMethod=(e,t,n)=>{let s=t,r=this.__node.nodes.get(e);if(r||(r=this.__node.roots[e]),r?.[s])if(typeof r[s]!="function"){if(n){Array.isArray(n)&&n.length===1?r[s]=n[0]:r[s]=n;return}return r[s]}else return Array.isArray(n)?r[s](...n):r[s](n);else return this.handleServiceMessage({route:e,args:n,method:t})};handleServiceMessage(e){let t;return typeof e=="object"&&(e.route?t=e.route:e.node&&(t=e.node)),t?Array.isArray(e.args)?this.run(t,...e.args):this.run(t,e.args):e}handleGraphNodeCall(e,t){if(!e)return t;if(t?.args)this.handleServiceMessage(t);else return Array.isArray(t)?this.run(e,...t):this.run(e,t)}transmit=(...e)=>{if(typeof e[0]=="object"){let t=e[0];if(t.method)return this.handleMethod(t.route,t.method,t.args);if(t.route)return this.handleServiceMessage(t);if(t.node)return this.handleGraphNodeCall(t.node,t.args);this.__node.keepState&&(t.route&&this.setState({[t.route]:t.args}),t.node&&this.setState({[t.node]:t.args}));return}else return};receive=(...e)=>{if(e[0]){let t=e[0];if(typeof t=="string"){let n=t.substring(0,8);(n.includes("{")||n.includes("["))&&(n.includes("\\")&&(t=t.replace(/\\/g,"")),t[0]==='"'&&(t=t.substring(1,t.length-1)),t=JSON.parse(t))}if(typeof t=="object"){if(t.method)return this.restrict?.[t.route]?void 0:this.handleMethod(t.route,t.method,t.args);if(t.route)return this.restrict?.[t.route]?void 0:this.handleServiceMessage(t);if(t.node)return typeof t.node=="string"&&this.restrict?.[t.node]?void 0:this.handleGraphNodeCall(t.node,t.args);this.__node.keepState&&(t.route&&this.setState({[t.route]:t.args}),t.node&&this.setState({[t.node]:t.args}));return}}};pipe=(e,t,n,s,r)=>{if(e instanceof y)return r?this.subscribe(e,_=>{let o=r(_);o!==void 0?this.transmit({route:t,args:o,method:s}):this.transmit({route:t,args:_,method:s},n)}):this.subscribe(e,_=>{this.transmit({route:t,args:_,method:s},n)});if(typeof e=="string")return this.subscribe(e,_=>{this.transmit({route:t,args:_,method:s},n)})};pipeOnce=(e,t,n,s,r)=>{if(e instanceof y)return r?e.__node.state.subscribeEventOnce(e.__node.unique,_=>{let o=r(_);o!==void 0?this.transmit({route:t,args:o,method:s}):this.transmit({route:t,args:_,method:s},n)}):this.__node.state.subscribeEventOnce(e.__node.unique,_=>{this.transmit({route:t,args:_,method:s},n)});if(typeof e=="string")return this.__node.state.subscribeEventOnce(this.__node.nodes.get(e).__node.unique,_=>{this.transmit({route:t,args:_,method:s},n)})};terminate=(...e)=>{};isTypedArray=X;recursivelyAssign=M;spliceTypedArray=Y;ping=()=>(console.log("pinged!"),"pong");echo=(...e)=>(this.transmit(...e),e);log=(...e)=>(console.log(...e),!0);error=(...e)=>(console.error(...e),!0)};function X(i){return ArrayBuffer.isView(i)&&Object.prototype.toString.call(i)!=="[object DataView]"}var M=(i,e)=>{for(let t in e)e[t]?.constructor.name==="Object"&&!Array.isArray(e[t])?i[t]?.constructor.name==="Object"&&!Array.isArray(i[t])?M(i[t],e[t]):i[t]=M({},e[t]):i[t]=e[t];return i};function Y(i,e,t){let n=i.subarray(0,e),s;t&&(s=i.subarray(t+1));let r;return(n.length>0||s?.length>0)&&(r=new i.constructor(n.length+s.length)),r&&(n.length>0&&r.set(n),s&&s.length>0&&r.set(s,n.length)),r}export{w as Callable,x as EventHandler,b as Graph,y as GraphNode,L as Service,$ as animate,C as backprop,V as bindListener,J as branching,I as getAllProperties,A as getCallbackFromString,se as getFnParamNames,D as getFunctionHead,v as instanceObject,R as isFunction,S as isNativeClass,X as isTypedArray,F as loaders,T as loop,ae as methodstrings,P as parseFunctionFromText,re as reconstructObject,M as recursivelyAssign,U as recursivelyStringifyFunctions,Y as spliceTypedArray,q as state,Q as stringifyFast,k as stringifyWithCircularRefs,z as stringifyWithFunctionsAndCircularRefs,H as substitute__operator,B as transformListenerResult,W as triggerListenerOncreate,j as wrapArgs};
