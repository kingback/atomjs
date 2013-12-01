!function(){function a(){this._initEventTarget.apply(this,arguments)}function b(a){this.stopped=0,this.prevented=0,j(this,a)}var c="on",d="def",e="after",f="object",g="string",h="function",i=":",j=function(a,b){if(a&&b)for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a},k=Array.prototype.forEach?function(a,b){return Array.prototype.forEach.call(a,b)}:function(a,b){if(a&&a.length)for(var c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);return a},l=Array.prototype.some?function(a,b){return Array.prototype.some.call(a,b)}:function(a,b){var c;if(a&&a.length)for(var d=0,e=a.length;e>d&&!c;d++)c=b.call(a,a[d],d,a);return c},m=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf(a,b)}:function(a,b){var c=-1;return l(a,function(a){return a===b?(c=a,!0):void 0}),c},n=Function.prototype.bind?function(a,b){return Function.prototype.bind.call(a,b)}:function(a,b){var c=[].slice(2);return function(){a.apply(b,c)}};a.prototype={constructor:a,addTarget:function(b){var c=this._evtCfg.targets;return b instanceof a&&m(c,b)<0&&c.push(b),this},removeTarget:function(a){var b=this._evtCfg.targets,c=m(b,a);return c>-1&&b.splice(c,1),this},publish:function(a,b){var a=this._getPrefixEventType(a),c=this._getEventSubs(a);return b||(b={}),typeof b===h?b={def:b}:(b.def=b.defaultFn,delete b.defaultFn),j(c,b),this},on:function(a,b,d){return this._addEvent(c,a,b,d)},before:function(){return this.on.apply(this,arguments)},after:function(a,b,c){return this._addEvent(e,a,b,c)},fire:function(a,f){var a=this._getPrefixEventType(a),g=j({type:a,prefix:this._evtCfg.prefix,target:this,currentTarget:this},f);return this._evtCfg.emitFacade&&(g=new b(g)),this._fireEvent(a,c,g),g.prevented||(this._fireEvent(a,d,g),this._fireEvent(a,e,g)),this},detach:function(){return this._detachEvent.apply(this,arguments)},destroyEventTarget:function(){return this._destroyEventTarget.apply(this,arguments)},_initEventTarget:function(a){this._evtCfg={prefix:"",events:{},targets:[],emitFacade:!0,broadcast:!1,bubbles:!1,destroyed:!1},j(this._evtCfg,a)},_destroyEventTarget:function(){return this.detach(),this._evtCfg.targets=[],this._evtCfg.destroyed=!0,this},_getPrefixEventType:function(a){return this._evtCfg.prefix&&a.indexOf(i)<0?this._evtCfg.prefix+i+a:a},_parsePrefixEventType:function(a){return a.split(i).pop()},_getEventSubs:function(a,b){var c=this._evtCfg.events,e=c[a]||(c[a]={});return b?b==d?[e[b]]:e[b]||(e[b]=[]):e},_addEvent:function(a,b,c,d){if(typeof b===f)for(var e in b)b.hasOwnProperty(e)&&this._addEvent(a,e,b[e],c);else{var b=this._getPrefixEventType(b),g=this._getEventSubs(b,a);d&&(c=n(c,d)),m(g,c)<0&&g.push(c)}return this},_detachEvent:function(a,b,f){if(a=a&&this._getPrefixEventType(a))if(b)if(typeof b===g)delete this._getEventSubs(a)[b];else if(f){var h=this._getEventSubs(a,f),i=m(h,b);i>-1&&h.splice(i,1)}else this._detachEvent(a,b,c),this._detachEvent(a,b,d),this._detachEvent(a,b,e);else delete this._evtCfg[a];else this._evtCfg.events={};return this},_fireEvent:function(b,c,d){var e=this,f=d.target,g=d.currentTarget,h=this._getEventSubs(b,c);this._evtCfg.destroyed||(l(h,function(a){return 2==d.stopped?!0:(a&&a.call(e,d),void 0)}),!d.stopped&&this._evtCfg.bubbles&&e._bubbleToTargets(b,c,d),!d.stopped&&f===g&&g._evtCfg.broadcast&&(d.target=a.Global,a.Global._fireEvent(b,c,d)))},_bubbleToTargets:function(a,b,c){var d=this._evtCfg.targets;k(d,function(d){c.currentTarget=d,d._fireEvent(a,b,c)})}},b.prototype={constructor:b,preventDefault:function(){return this.prevented=1,this},stopPropagation:function(){return this.stopped=1,this},stopImmediatePropagation:function(){return this.stopped=2,this},halt:function(a){return this.preventDefault(),a?this.stopImmediatePropagation():this.stopPropagation(),this}},this.EventTarget=a,this.EventFacade=a.Facade=b,this.EventGlobal=a.Global=new a}();