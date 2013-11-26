/**
 * 自定义事件
 * event.js
 * @author ningzbruc@gmail.com|huya.nzb@alibaba-inc.com 
 * @github https://github.com/kingback
 * @date 2013-11-12
 * @update 2013-11-26
 * @version 0.0.2
 */

;(function() {
    
    //TODO
    //事件配置 fireOnce
    //事件类型配置 async
    //多类型事件绑定 on('click select', fn) on(['click', 'select'], fn)
    //detach方式 handler?
    //detach bind的callback
    //more API? once
    //siblings a|click, b|click, c|click
    
    var ON = 'on',
        DEF = 'def',
        AFTER = 'after',
        
        OBJECT = 'object',
        STRING = 'string',
        FUNCTION = 'function',
        
        COLON = ':',
        
        //混合属性
        mix = function(r, s) {
            if (r && s) {
                for (var k in s) {
                    if (s.hasOwnProperty(k)) {
                        r[k] = s[k];
                    }
                }
            }
            return r;
        },
        
        //混合返回新对象
        merge = function() {
            var obj = {},
                args = arguments;
            
            for (var i = 0, l = args.length; i < l; i++) {
                mix(obj, args[i]);
            }
            
            return obj;  
        },
        
        //循环数组
        each = Array.prototype.forEach ? function(arr, fn) {
            return Array.prototype.forEach.call(arr, fn);
        } : function(arr, fn) {
            if (arr && arr.length) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    fn.call(arr, arr[i], i, arr);
                }
            }
            return arr;
        },
        
        //部分循环数组
        some = Array.prototype.some ? function(arr, fn) {
            return Array.prototype.some.call(arr, fn); 
        } : function(arr, fn) {
            var ret;
            if (arr && arr.length) {
                for (var i = 0, l = arr.length; (i < l && !ret); i++) {
                    ret = fn.call(arr, arr[i], i, arr);
                }
            }
            return ret;
        },
        
        //查找序号
        indexOf = Array.prototype.indexOf ? function(arr, item) {
            return Array.prototype.indexOf(arr, item)
        } : function(arr, item) {
            var index = -1;
            some(arr, function(i) {
                if (i === item) {
                    index = i;
                    return true;
                }
            });
            return index;
        },
        
        //绑定上下文
        bind = Function.prototype.bind ? function(fn, context) {
            return Function.prototype.bind.call(fn, context);
        } : function(fn, context) {
            var args = [].slice(2);
            return function() {
                fn.apply(context, args);
            };
        };
    
    /**
     * 事件中心构造函数
     * @constructor EventTarget
     * @param {Object} cfg 配置参数
     * @param {String} cfg.prefix 事件前缀
     * @see _initEventTarget
     */
    function EventTarget() {
        this._initEventTarget.apply(this, arguments);
    }
    
    //原型
    EventTarget.prototype = {
        
        /**
         * 构造函数
         * @property constructor
         * @public
         */
        constructor: EventTarget,
        
        //----------------------------- 公有方法 -----------------------------
        
        /**
         * 添加父对象
         * @method addTarget
         * @param {Object} target 父对象
         * @chainable
         * @public
         */
        addTarget: function(target) {
            var targets = this._evtCfg.targets;
            
            if (target instanceof EventTarget && indexOf(targets, target) < 0) {
                targets.push(target);
            }
            
            return this;
        },
        
        /**
         * 移除父对象
         * @method removeTarget
         * @param {Object} target 父对象
         * @chainable
         * @public
         */
        removeTarget: function(target) {
            var targets = this._evtCfg.targets,
                index = indexOf(targets, target);
            
            if (index > -1) {
                targets.splice(index, 1);
            }
            
            return this;
        },
        
        /**
         * 发布事件
         * @method publish
         * @param {String} type 事件类型
         * @param {Object} options 事件属性
         * @param {Function} options.defaultFn 事件默认回调
         * @chainable
         * @public
         */
        publish: function(type, options) {
            var type = this._getPrefixEventType(type),
                allSubs = this._getEventSubs(type);
                
            options || (options = {});
            
            if (typeof options === FUNCTION) {
                options = {
                    def: options
                };
            } else {
                options.def = options.defaultFn;
                delete options.defaultFn;
            }
            
            mix(allSubs, options);
            
            return this;
        },
        
        /**
         * 绑定事件（defaultFn之前）
         * @method on
         * @param {String} 事件类型
         * @param {Function} 事件回调
         * @param {Object} 事件回调上下文
         * @chainable
         * @public
         */
        on: function(type, callback, context) {
            return this._addEvent(ON, type, callback, context);
        },
        
        /**
         * 绑定事件（同on）
         * @method before
         * @param {String} 事件类型
         * @param {Function} 事件回调
         * @param {Object} 事件回调上下文
         * @chainable
         * @public
         */
        before: function() {
            return this.on.apply(this, arguments);
        },
        
        /**
         * 绑定事件（defaultFn之后）
         * @method after
         * @param {String} 事件类型
         * @param {Function} 事件回调
         * @param {Object} 事件回调上下文
         * @chainable
         * @public
         */
        after: function(type, callback, context) {
            return this._addEvent(AFTER, type, callback, context);
        },
        
        /**
         * 触发事件
         * @method fire
         * @param {String} 事件类型
         * @param {Object} 事件对象
         * @chainable
         * @public
         */
        fire: function(type, obj) {
            var type = this._getPrefixEventType(type),
                facade = mix({
                    type: type,
                    prefix: this._evtCfg.prefix,
                    target: this,
                    currentTarget: this
                }, obj);
                
            this._evtCfg.emitFacade && (facade = new EventFacade(facade));
            
            this._fireEvent(type, ON, facade);
            
            if (!facade.prevented) {
                this._fireEvent(type, DEF, facade);
                this._fireEvent(type, AFTER, facade);
            }
            
            return this;
        },
        
        /**
         * 解除事件
         * @method detach
         * @param {String} type 事件类型
         * @param {Function} callback 事件回调
         * @param {String} when 事件时间
         * @see _detachEvent
         * @chainable
         * @public
         */
        detach: function() {
            return this._detachEvent.apply(this, arguments);
        },
        
        /**
         * 销毁事件中心
         * @method destroyEventTarget
         * @chainable
         * @public
         */
        destroyEventTarget: function() {
            return this._destroyEventTarget.apply(this, arguments);
        },
        
        //----------------------------- 私有方法 -----------------------------
        
        /**
         * 初始化事件中心对象
         * @method _initEventTarget
         * @param {Object} cfg 配置参数
         * @param {String} cfg.prefix 事件前缀
         * @protected
         */ 
        _initEventTarget: function(cfg) {
            this._evtCfg = {
                prefix: '',
                events: {},
                targets: [],
                emitFacade: true,
                broadcast: false,
                bubbles: false,
                destroyed: false
            };
            mix(this._evtCfg, cfg);
        },
        
        /**
         * 销毁事件中心对象
         * @method _destroyEventTarget
         * @chainable
         * @protected
         */
        _destroyEventTarget: function() {
            this.detach();
            this._evtCfg.targets = [];
            this._evtCfg.destroyed = true;
            return this;
        },
        
        /**
         * 获取带前缀的事件类型
         * @method _getPrefixEventType
         * @param {String} type 事件类型
         * @return {String} 返回带前缀的事件类型
         * @protected
         */
        _getPrefixEventType: function(type) {
            return this._evtCfg.prefix && type.indexOf(COLON) < 0 ? (this._evtCfg.prefix + COLON + type) : type;
        },
        
        /**
         * 解析带前缀的事件类型
         * @method _parsePrefixEventType
         * @param {String} type 事件类型
         * @return {String} 返回不带前缀的事件类型
         * @protected
         */
        _parsePrefixEventType: function(type) {
            return type.split(COLON).pop();
        },
        
        /**
         * 获取事件回调数组
         * @method _getEventSubs
         * @param {String} type 事件类型
         * @param {String} when 事件时间
         * @return {Array} subs 回调数组
         * @protected
         */
        _getEventSubs: function(type, when) {
            var events = this._evtCfg.events,
                allSubs = events[type] || (events[type] = {});
            
            return when ? (when == DEF ? [allSubs[when]] : (allSubs[when] || (allSubs[when] = []))) : allSubs;
        },
        
        /**
         * 绑定事件
         * @method _addEvent
         * @param {String} when 事件时间
         * @param {String} type 事件类型
         * @param {Function} callback 事件回调
         * @param {Object} context 事件回调上下文
         * @protected
         */
        _addEvent: function(when, type, callback, context) {
            if (typeof type === OBJECT) {
                for (var evt in type) {
                    if (type.hasOwnProperty(evt)) {
                        this._addEvent(when, evt, type[evt], callback);
                    }
                }
            } else {
                var type = this._getPrefixEventType(type),
                    subs = this._getEventSubs(type, when);
                
                if (context) {
                    callback = bind(callback, context);
                }
                
                if (indexOf(subs, callback) < 0) {
                    subs.push(callback);
                }
            }
            
            return this;
        },
        
        /**
         * 解除事件
         * @method _detachEvent
         * @param {String} type 事件类型
         * @param {Function} callback 事件回调
         * @param {String} when 事件时间
         * @protected
         */
        _detachEvent: function(type, callback, when) {
            type = type && this._getPrefixEventType(type);
            
            if (!type) {
                //this.detach();
                this._evtCfg.events = {};
            } else if (!callback) {
                //this.detach('click');
                delete this._evtCfg[type];
            } else if (typeof callback === STRING) {
                //this.detach('click', 'after');
                delete this._getEventSubs(type)[callback];
            } else if (!when) {
                //this.detach('click', callback);
                this._detachEvent(type, callback, ON);
                this._detachEvent(type, callback, DEF);
                this._detachEvent(type, callback, AFTER);
            } else {
                //this.detach('click', callback, 'on');
                //this.detach('click', callback, 'after');
                var subs = this._getEventSubs(type, when),
                    index = indexOf(subs, callback);
                
                if (index > -1) {
                    subs.splice(index, 1);
                }
            }
            
            return this;
        },
        
        /**
         * 触发事件
         * @method _fireEvent
         * @param {String} type 事件类型
         * @param {String} when 事件时间
         * @param {Object} facade 事件对象
         * @protected
         */
        _fireEvent: function(type, when, facade) {
            var self = this,
                target = facade.target,
                currentTarget = facade.currentTarget,
                subs = this._getEventSubs(type, when);
            
            if (this._evtCfg.destroyed) { return; }
                
            some(subs, function(sub) {
                if (facade.stopped == 2) {
                    //如果立即停止
                    return true;
                } else {
                    //预防回调不存在或已被删除
                    sub && sub.call(self, facade);
                }
            });
            
            //冒泡
            if (!facade.stopped && this._evtCfg.bubbles) {
                self._bubbleToTargets(type, when, facade);
            }
            
            //传播到全局
            //只在事件发起目标传播一次
            if (!facade.stopped && target === currentTarget && currentTarget._evtCfg.broadcast) {
                facade.target = EventTarget.Global;
                EventTarget.Global._fireEvent(type, when, facade);
            }
        },
        
        /**
         * 冒泡至父对象
         * @method _bubbleToTargets
         * @param {String} type 事件类型
         * @param {String} when 事件时间
         * @param {Object} facade 事件对象
         * @protected
         */
        _bubbleToTargets: function(type, when, facade) {
            var targets = this._evtCfg.targets;
            
            //TODO
            //添加重复target可能会重复触发
            //leaf.addTarget(other).addTarget(root)
            //other.addTarget(root);
            //leaf.fire();
            //root fire 2 times 
            each(targets, function(target) {
                facade.target = target;
                target._fireEvent(type, when, facade);
            });
        }
        
    };
    
    
    /**
     * 事件对象构造函数
     * @constructor EventFacade
     * @param {Object} 事件中心
     * @param {String} 事件类型
     * @param {Object} 传递参数
     */
    function EventFacade(obj) {
        this.stopped = 0;
        this.prevented = 0;
        mix(this, obj);
    }
    
    //原型
    EventFacade.prototype = {
        
        /**
         * 构造函数
         * @property constructor
         * @public
         */
        constructor: EventFacade,
        
        /**
         * 阻止默认事件
         * @method preventDefault
         * @public
         */
        preventDefault: function() {
            this.prevented = 1;
            return this;
        },
        
        /**
         * 阻止冒泡
         * @method stopPropagation
         * @public
         */
        stopPropagation: function() {
            this.stopped = 1;
            return this;
        },
        
        /**
         * 立即执行及阻止冒泡
         * @method stopImmediatePropagation
         * @public
         */
        stopImmediatePropagation: function() {
            this.stopped = 2;
            return this;
        },
        
        /**
         * 阻止默认事件，并且阻止冒泡
         * @method halt
         * @param {Boolean} immediate 是否阻止后续回调执行
         * @public
         */
        halt: function(immediate) {
            this.preventDefault();
            immediate ? this.stopImmediatePropagation() : this.stopPropagation();
            return this;
        }
    };
    
    //全局变量
    this.EventTarget = EventTarget;
    this.EventFacade = EventTarget.Facade = EventFacade;
    this.EventGlobal = EventTarget.Global = new EventTarget();
    
})();