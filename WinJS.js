
/*! Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information. */
(function (global) {

    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            define([], factory);
        } else {
            global.msWriteProfilerMark && msWriteProfilerMark('WinJS.3.0 3.0.1.winjs.2014.10.2 WinJS-custom.js,StartTM');
            factory(global.WinJS);
            global.msWriteProfilerMark && msWriteProfilerMark('WinJS.3.0 3.0.1.winjs.2014.10.2 WinJS-custom.js,StopTM');
        }
    }(function (WinJS) {

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
/*jshint ignore:start */
var require;
var define;
/*jshint ignore:end */

(function () {
    "use strict";

    var defined = {};
    define = function (id, dependencies, factory) {
        if (!Array.isArray(dependencies)) {
            factory = dependencies;
            dependencies = [];
        }

        var mod = {
            dependencies: normalize(id, dependencies),
            factory: factory
        };

        if (dependencies.indexOf('exports') !== -1) {
            mod.exports = {};
        }

        defined[id] = mod;
    };

    // WinJS/Core depends on ./Core/_Base
    // should return WinJS/Core/_Base
    function normalize(id, dependencies) {
        var parent = id.split('/');
        parent.pop();
        return dependencies.map(function (dep) {
            if (dep[0] === '.') {
                var parts = dep.split('/');
                var current = parent.slice(0);
                parts.forEach(function (part) {
                    if (part === '..') {
                        current.pop();
                    } else if (part !== '.') {
                        current.push(part);
                    }
                });
                return current.join('/');
            } else {
                return dep;
            }
        });
    }

    function resolve(dependencies, exports) {
        return dependencies.map(function (depName) {
            if (depName === 'exports') {
                return exports;
            }
            var dep = defined[depName];
            if (!dep) {
                throw new Error("Undefined dependency: " + depName);
            }

            if (!dep.resolved) {
                dep.resolved = load(dep.dependencies, dep.factory, dep.exports);
                // exports shadows whatever the module factory returns
                if (dep.exports) {
                    dep.resolved = dep.exports;
                }
            }

            return dep.resolved;
        });
    }

    function load(dependencies, factory, exports) {
        var deps = resolve(dependencies, exports);
        if (factory && factory.apply) {
            return factory.apply(null, deps);
        } else {
            return factory;
        }
    }
    require = function (dependencies, factory) { //jshint ignore:line
        if (!Array.isArray(dependencies)) {
            dependencies = [dependencies];
        }
        load(dependencies, factory);
    };


})();
define("amd", function(){});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_WinJS',{});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
(function (global) {
    "use strict";

    define('WinJS/Core/_Global',global);
}(this));

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_BaseCoreUtils',[
    './_Global'
    ], function baseCoreUtilsInit(_Global) {
    "use strict";

    var hasWinRT = !!_Global.Windows;

    function markSupportedForProcessing(func) {
        /// <signature helpKeyword="WinJS.Utilities.markSupportedForProcessing">
        /// <summary locid="WinJS.Utilities.markSupportedForProcessing">
        /// Marks a function as being compatible with declarative processing, such as WinJS.UI.processAll
        /// or WinJS.Binding.processAll.
        /// </summary>
        /// <param name="func" type="Function" locid="WinJS.Utilities.markSupportedForProcessing_p:func">
        /// The function to be marked as compatible with declarative processing.
        /// </param>
        /// <returns type="Function" locid="WinJS.Utilities.markSupportedForProcessing_returnValue">
        /// The input function.
        /// </returns>
        /// </signature>
        func.supportedForProcessing = true;
        return func;
    }

    return {
        hasWinRT: hasWinRT,
        markSupportedForProcessing: markSupportedForProcessing,
        _setImmediate: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
            _Global.setTimeout(handler, 0);
        }
    };
});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_WriteProfilerMark',[
    './_Global'
], function profilerInit(_Global) {
    "use strict";

    return _Global.msWriteProfilerMark || function () { };
});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_Base',[
    './_WinJS',
    './_Global',
    './_BaseCoreUtils',
    './_WriteProfilerMark'
    ], function baseInit(_WinJS, _Global, _BaseCoreUtils, _WriteProfilerMark) {
    "use strict";

    function initializeProperties(target, members, prefix) {
        var keys = Object.keys(members);
        var isArray = Array.isArray(target);
        var properties;
        var i, len;
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            var enumerable = key.charCodeAt(0) !== /*_*/95;
            var member = members[key];
            if (member && typeof member === 'object') {
                if (member.value !== undefined || typeof member.get === 'function' || typeof member.set === 'function') {
                    if (member.enumerable === undefined) {
                        member.enumerable = enumerable;
                    }
                    if (prefix && member.setName && typeof member.setName === 'function') {
                        member.setName(prefix + "." + key);
                    }
                    properties = properties || {};
                    properties[key] = member;
                    continue;
                }
            }
            if (!enumerable) {
                properties = properties || {};
                properties[key] = { value: member, enumerable: enumerable, configurable: true, writable: true };
                continue;
            }
            if (isArray) {
                target.forEach(function (target) {
                    target[key] = member;
                });
            } else {
                target[key] = member;
            }
        }
        if (properties) {
            if (isArray) {
                target.forEach(function (target) {
                    Object.defineProperties(target, properties);
                });
            } else {
                Object.defineProperties(target, properties);
            }
        }
    }

    (function () {

        var _rootNamespace = _WinJS;
        if (!_rootNamespace.Namespace) {
            _rootNamespace.Namespace = Object.create(Object.prototype);
        }

        function createNamespace(parentNamespace, name) {
            var currentNamespace = parentNamespace || {};
            if (name) {
                var namespaceFragments = name.split(".");
                if (currentNamespace === _Global && namespaceFragments[0] === "WinJS") {
                    currentNamespace = _WinJS;
                    namespaceFragments.splice(0, 1);
                }
                for (var i = 0, len = namespaceFragments.length; i < len; i++) {
                    var namespaceName = namespaceFragments[i];
                    if (!currentNamespace[namespaceName]) {
                        Object.defineProperty(currentNamespace, namespaceName,
                            { value: {}, writable: false, enumerable: true, configurable: true }
                        );
                    }
                    currentNamespace = currentNamespace[namespaceName];
                }
            }
            return currentNamespace;
        }

        function defineWithParent(parentNamespace, name, members) {
            /// <signature helpKeyword="WinJS.Namespace.defineWithParent">
            /// <summary locid="WinJS.Namespace.defineWithParent">
            /// Defines a new namespace with the specified name under the specified parent namespace.
            /// </summary>
            /// <param name="parentNamespace" type="Object" locid="WinJS.Namespace.defineWithParent_p:parentNamespace">
            /// The parent namespace.
            /// </param>
            /// <param name="name" type="String" locid="WinJS.Namespace.defineWithParent_p:name">
            /// The name of the new namespace.
            /// </param>
            /// <param name="members" type="Object" locid="WinJS.Namespace.defineWithParent_p:members">
            /// The members of the new namespace.
            /// </param>
            /// <returns type="Object" locid="WinJS.Namespace.defineWithParent_returnValue">
            /// The newly-defined namespace.
            /// </returns>
            /// </signature>
            var currentNamespace = createNamespace(parentNamespace, name);

            if (members) {
                initializeProperties(currentNamespace, members, name || "<ANONYMOUS>");
            }

            return currentNamespace;
        }

        function define(name, members) {
            /// <signature helpKeyword="WinJS.Namespace.define">
            /// <summary locid="WinJS.Namespace.define">
            /// Defines a new namespace with the specified name.
            /// </summary>
            /// <param name="name" type="String" locid="WinJS.Namespace.define_p:name">
            /// The name of the namespace. This could be a dot-separated name for nested namespaces.
            /// </param>
            /// <param name="members" type="Object" locid="WinJS.Namespace.define_p:members">
            /// The members of the new namespace.
            /// </param>
            /// <returns type="Object" locid="WinJS.Namespace.define_returnValue">
            /// The newly-defined namespace.
            /// </returns>
            /// </signature>
            return defineWithParent(_Global, name, members);
        }

        var LazyStates = {
            uninitialized: 1,
            working: 2,
            initialized: 3,
        };

        function lazy(f) {
            var name;
            var state = LazyStates.uninitialized;
            var result;
            return {
                setName: function (value) {
                    name = value;
                },
                get: function () {
                    switch (state) {
                        case LazyStates.initialized:
                            return result;

                        case LazyStates.uninitialized:
                            state = LazyStates.working;
                            try {
                                _WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StartTM");
                                result = f();
                            } finally {
                                _WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StopTM");
                                state = LazyStates.uninitialized;
                            }
                            f = null;
                            state = LazyStates.initialized;
                            return result;

                        case LazyStates.working:
                            throw "Illegal: reentrancy on initialization";

                        default:
                            throw "Illegal";
                    }
                },
                set: function (value) {
                    switch (state) {
                        case LazyStates.working:
                            throw "Illegal: reentrancy on initialization";

                        default:
                            state = LazyStates.initialized;
                            result = value;
                            break;
                    }
                },
                enumerable: true,
                configurable: true,
            };
        }

        // helper for defining AMD module members
        function moduleDefine(exports, name, members) {
            var target = [exports];
            var publicNS = null;
            if (name) {
                publicNS = createNamespace(_Global, name);
                target.push(publicNS);
            }
            initializeProperties(target, members, name || "<ANONYMOUS>");
            return publicNS;
        }

        // Establish members of the "WinJS.Namespace" namespace
        Object.defineProperties(_rootNamespace.Namespace, {

            defineWithParent: { value: defineWithParent, writable: true, enumerable: true, configurable: true },

            define: { value: define, writable: true, enumerable: true, configurable: true },

            _lazy: { value: lazy, writable: true, enumerable: true, configurable: true },

            _moduleDefine: { value: moduleDefine, writable: true, enumerable: true, configurable: true }

        });

    })();

    (function () {

        function define(constructor, instanceMembers, staticMembers) {
            /// <signature helpKeyword="WinJS.Class.define">
            /// <summary locid="WinJS.Class.define">
            /// Defines a class using the given constructor and the specified instance members.
            /// </summary>
            /// <param name="constructor" type="Function" locid="WinJS.Class.define_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <param name="instanceMembers" type="Object" locid="WinJS.Class.define_p:instanceMembers">
            /// The set of instance fields, properties, and methods made available on the class.
            /// </param>
            /// <param name="staticMembers" type="Object" locid="WinJS.Class.define_p:staticMembers">
            /// The set of static fields, properties, and methods made available on the class.
            /// </param>
            /// <returns type="Function" locid="WinJS.Class.define_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            constructor = constructor || function () { };
            _BaseCoreUtils.markSupportedForProcessing(constructor);
            if (instanceMembers) {
                initializeProperties(constructor.prototype, instanceMembers);
            }
            if (staticMembers) {
                initializeProperties(constructor, staticMembers);
            }
            return constructor;
        }

        function derive(baseClass, constructor, instanceMembers, staticMembers) {
            /// <signature helpKeyword="WinJS.Class.derive">
            /// <summary locid="WinJS.Class.derive">
            /// Creates a sub-class based on the supplied baseClass parameter, using prototypal inheritance.
            /// </summary>
            /// <param name="baseClass" type="Function" locid="WinJS.Class.derive_p:baseClass">
            /// The class to inherit from.
            /// </param>
            /// <param name="constructor" type="Function" locid="WinJS.Class.derive_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <param name="instanceMembers" type="Object" locid="WinJS.Class.derive_p:instanceMembers">
            /// The set of instance fields, properties, and methods to be made available on the class.
            /// </param>
            /// <param name="staticMembers" type="Object" locid="WinJS.Class.derive_p:staticMembers">
            /// The set of static fields, properties, and methods to be made available on the class.
            /// </param>
            /// <returns type="Function" locid="WinJS.Class.derive_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            if (baseClass) {
                constructor = constructor || function () { };
                var basePrototype = baseClass.prototype;
                constructor.prototype = Object.create(basePrototype);
                _BaseCoreUtils.markSupportedForProcessing(constructor);
                Object.defineProperty(constructor.prototype, "constructor", { value: constructor, writable: true, configurable: true, enumerable: true });
                if (instanceMembers) {
                    initializeProperties(constructor.prototype, instanceMembers);
                }
                if (staticMembers) {
                    initializeProperties(constructor, staticMembers);
                }
                return constructor;
            } else {
                return define(constructor, instanceMembers, staticMembers);
            }
        }

        function mix(constructor) {
            /// <signature helpKeyword="WinJS.Class.mix">
            /// <summary locid="WinJS.Class.mix">
            /// Defines a class using the given constructor and the union of the set of instance members
            /// specified by all the mixin objects. The mixin parameter list is of variable length.
            /// </summary>
            /// <param name="constructor" locid="WinJS.Class.mix_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <returns type="Function" locid="WinJS.Class.mix_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            constructor = constructor || function () { };
            var i, len;
            for (i = 1, len = arguments.length; i < len; i++) {
                initializeProperties(constructor.prototype, arguments[i]);
            }
            return constructor;
        }

        // Establish members of "WinJS.Class" namespace
        _WinJS.Namespace.define("WinJS.Class", {
            define: define,
            derive: derive,
            mix: mix
        });

    })();

    return {
        Namespace: _WinJS.Namespace,
        Class: _WinJS.Class
    };

});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_ErrorFromName',[
    './_Base'
    ], function errorsInit(_Base) {
    "use strict";

    var ErrorFromName = _Base.Class.derive(Error, function (name, message) {
        /// <signature helpKeyword="WinJS.ErrorFromName">
        /// <summary locid="WinJS.ErrorFromName">
        /// Creates an Error object with the specified name and message properties.
        /// </summary>
        /// <param name="name" type="String" locid="WinJS.ErrorFromName_p:name">The name of this error. The name is meant to be consumed programmatically and should not be localized.</param>
        /// <param name="message" type="String" optional="true" locid="WinJS.ErrorFromName_p:message">The message for this error. The message is meant to be consumed by humans and should be localized.</param>
        /// <returns type="Error" locid="WinJS.ErrorFromName_returnValue">Error instance with .name and .message properties populated</returns>
        /// </signature>
        this.name = name;
        this.message = message || name;
    }, {
        /* empty */
    }, {
        supportedForProcessing: false,
    });

    _Base.Namespace.define("WinJS", {
        // ErrorFromName establishes a simple pattern for returning error codes.
        //
        ErrorFromName: ErrorFromName
    });

    return ErrorFromName;

});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_WinRT',[
    'exports',
    './_Global',
    './_Base',
], function winrtInit(exports, _Global, _Base) {
    "use strict";

    exports.msGetWeakWinRTProperty = _Global.msGetWeakWinRTProperty;
    exports.msSetWeakWinRTProperty = _Global.msSetWeakWinRTProperty;

    var APIs = [
        "Windows.ApplicationModel.DesignMode.designModeEnabled",
        "Windows.ApplicationModel.Resources.Core.ResourceContext",
        "Windows.ApplicationModel.Resources.Core.ResourceManager",
        "Windows.ApplicationModel.Search.Core.SearchSuggestionManager",
        "Windows.ApplicationModel.Search.SearchQueryLinguisticDetails",
        "Windows.Data.Text.SemanticTextQuery",
        "Windows.Foundation.Collections.CollectionChange",
        "Windows.Foundation.Uri",
        "Windows.Globalization.ApplicationLanguages",
        "Windows.Globalization.Calendar",
        "Windows.Globalization.DateTimeFormatting",
        "Windows.Globalization.Language",
        "Windows.Phone.UI.Input.HardwareButtons",
        "Windows.Storage.ApplicationData",
        "Windows.Storage.CreationCollisionOption",
        "Windows.Storage.BulkAccess.FileInformationFactory",
        "Windows.Storage.FileIO",
        "Windows.Storage.FileProperties.ThumbnailType",
        "Windows.Storage.FileProperties.ThumbnailMode",
        "Windows.Storage.FileProperties.ThumbnailOptions",
        "Windows.Storage.KnownFolders",
        "Windows.Storage.Search.FolderDepth",
        "Windows.Storage.Search.IndexerOption",
        "Windows.Storage.Streams.RandomAccessStreamReference",
        "Windows.UI.ApplicationSettings.SettingsEdgeLocation",
        "Windows.UI.ApplicationSettings.SettingsCommand",
        "Windows.UI.ApplicationSettings.SettingsPane",
        "Windows.UI.Core.AnimationMetrics",
        "Windows.UI.Input.EdgeGesture",
        "Windows.UI.Input.EdgeGestureKind",
        "Windows.UI.Input.PointerPoint",
        "Windows.UI.ViewManagement.HandPreference",
        "Windows.UI.ViewManagement.InputPane",
        "Windows.UI.ViewManagement.UISettings",
        "Windows.UI.WebUI.Core.WebUICommandBar",
        "Windows.UI.WebUI.Core.WebUICommandBarBitmapIcon",
        "Windows.UI.WebUI.Core.WebUICommandBarClosedDisplayMode",
        "Windows.UI.WebUI.Core.WebUICommandBarIconButton",
        "Windows.UI.WebUI.Core.WebUICommandBarSymbolIcon",
        "Windows.UI.WebUI.WebUIApplication",
    ];

    APIs.forEach(function (api) {
        var parts = api.split(".");
        var leaf = {};
        leaf[parts[parts.length - 1]] = {
            get: function () {
                return parts.reduce(function (current, part) { return current ? current[part] : null; }, _Global);
            }
        };
        _Base.Namespace.defineWithParent(exports, parts.slice(0, -1).join("."), leaf);
    });

});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_Events',[
    'exports',
    './_Base'
    ], function eventsInit(exports, _Base) {
    "use strict";


    function createEventProperty(name) {
        var eventPropStateName = "_on" + name + "state";

        return {
            get: function () {
                var state = this[eventPropStateName];
                return state && state.userHandler;
            },
            set: function (handler) {
                var state = this[eventPropStateName];
                if (handler) {
                    if (!state) {
                        state = { wrapper: function (evt) { return state.userHandler(evt); }, userHandler: handler };
                        Object.defineProperty(this, eventPropStateName, { value: state, enumerable: false, writable:true, configurable: true });
                        this.addEventListener(name, state.wrapper, false);
                    }
                    state.userHandler = handler;
                } else if (state) {
                    this.removeEventListener(name, state.wrapper, false);
                    this[eventPropStateName] = null;
                }
            },
            enumerable: true
        };
    }

    function createEventProperties() {
        /// <signature helpKeyword="WinJS.Utilities.createEventProperties">
        /// <summary locid="WinJS.Utilities.createEventProperties">
        /// Creates an object that has one property for each name passed to the function.
        /// </summary>
        /// <param name="events" locid="WinJS.Utilities.createEventProperties_p:events">
        /// A variable list of property names.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.createEventProperties_returnValue">
        /// The object with the specified properties. The names of the properties are prefixed with 'on'.
        /// </returns>
        /// </signature>
        var props = {};
        for (var i = 0, len = arguments.length; i < len; i++) {
            var name = arguments[i];
            props["on" + name] = createEventProperty(name);
        }
        return props;
    }

    var EventMixinEvent = _Base.Class.define(
        function EventMixinEvent_ctor(type, detail, target) {
            this.detail = detail;
            this.target = target;
            this.timeStamp = Date.now();
            this.type = type;
        },
        {
            bubbles: { value: false, writable: false },
            cancelable: { value: false, writable: false },
            currentTarget: {
                get: function () { return this.target; }
            },
            defaultPrevented: {
                get: function () { return this._preventDefaultCalled; }
            },
            trusted: { value: false, writable: false },
            eventPhase: { value: 0, writable: false },
            target: null,
            timeStamp: null,
            type: null,

            preventDefault: function () {
                this._preventDefaultCalled = true;
            },
            stopImmediatePropagation: function () {
                this._stopImmediatePropagationCalled = true;
            },
            stopPropagation: function () {
            }
        }, {
            supportedForProcessing: false,
        }
    );

    var eventMixin = {
        _listeners: null,

        addEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="WinJS.Utilities.eventMixin.addEventListener">
            /// <summary locid="WinJS.Utilities.eventMixin.addEventListener">
            /// Adds an event listener to the control.
            /// </summary>
            /// <param name="type" locid="WinJS.Utilities.eventMixin.addEventListener_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="listener" locid="WinJS.Utilities.eventMixin.addEventListener_p:listener">
            /// The listener to invoke when the event is raised.
            /// </param>
            /// <param name="useCapture" locid="WinJS.Utilities.eventMixin.addEventListener_p:useCapture">
            /// if true initiates capture, otherwise false.
            /// </param>
            /// </signature>
            useCapture = useCapture || false;
            this._listeners = this._listeners || {};
            var eventListeners = (this._listeners[type] = this._listeners[type] || []);
            for (var i = 0, len = eventListeners.length; i < len; i++) {
                var l = eventListeners[i];
                if (l.useCapture === useCapture && l.listener === listener) {
                    return;
                }
            }
            eventListeners.push({ listener: listener, useCapture: useCapture });
        },
        dispatchEvent: function (type, details) {
            /// <signature helpKeyword="WinJS.Utilities.eventMixin.dispatchEvent">
            /// <summary locid="WinJS.Utilities.eventMixin.dispatchEvent">
            /// Raises an event of the specified type and with the specified additional properties.
            /// </summary>
            /// <param name="type" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="details" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:details">
            /// The set of additional properties to be attached to the event object when the event is raised.
            /// </param>
            /// <returns type="Boolean" locid="WinJS.Utilities.eventMixin.dispatchEvent_returnValue">
            /// true if preventDefault was called on the event.
            /// </returns>
            /// </signature>
            var listeners = this._listeners && this._listeners[type];
            if (listeners) {
                var eventValue = new EventMixinEvent(type, details, this);
                // Need to copy the array to protect against people unregistering while we are dispatching
                listeners = listeners.slice(0, listeners.length);
                for (var i = 0, len = listeners.length; i < len && !eventValue._stopImmediatePropagationCalled; i++) {
                    listeners[i].listener(eventValue);
                }
                return eventValue.defaultPrevented || false;
            }
            return false;
        },
        removeEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="WinJS.Utilities.eventMixin.removeEventListener">
            /// <summary locid="WinJS.Utilities.eventMixin.removeEventListener">
            /// Removes an event listener from the control.
            /// </summary>
            /// <param name="type" locid="WinJS.Utilities.eventMixin.removeEventListener_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="listener" locid="WinJS.Utilities.eventMixin.removeEventListener_p:listener">
            /// The listener to remove.
            /// </param>
            /// <param name="useCapture" locid="WinJS.Utilities.eventMixin.removeEventListener_p:useCapture">
            /// Specifies whether to initiate capture.
            /// </param>
            /// </signature>
            useCapture = useCapture || false;
            var listeners = this._listeners && this._listeners[type];
            if (listeners) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    var l = listeners[i];
                    if (l.listener === listener && l.useCapture === useCapture) {
                        listeners.splice(i, 1);
                        if (listeners.length === 0) {
                            delete this._listeners[type];
                        }
                        // Only want to remove one element for each call to removeEventListener
                        break;
                    }
                }
            }
        }
    };

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        _createEventProperty: createEventProperty,
        createEventProperties: createEventProperties,
        eventMixin: eventMixin
    });

});



define('require-json!en-US/ui.resjson',{
    "appBarAriaLabel": "App Bar",
    "appBarCommandAriaLabel": "App Bar Item",
    "averageRating": "Average Rating",
    "backbuttonarialabel": "Back",
    "clearYourRating" : "Clear your rating",
    "closeOverlay" : "Close",
    "datePicker": "Date Picker",
    "flipViewPanningContainerAriaLabel": "Scrolling Container",
    "flyoutAriaLabel": "Flyout",
    "hubViewportAriaLabel": "Scrolling Container",
    "listViewViewportAriaLabel": "Scrolling Container",
    "menuCommandAriaLabel": "Menu Item",
    "menuAriaLabel": "Menu",
    "navBarContainerViewportAriaLabel": "Scrolling Container",
    "off" : "Off",
    "on" : "On",
    "pivotAriaLabel": "Pivot",
    "pivotViewportAriaLabel": "Scrolling Container",
    "searchBoxAriaLabel": "Searchbox",
    "searchBoxAriaLabelInputNoPlaceHolder": "Searchbox, enter to submit query, esc to clear text",
    "searchBoxAriaLabelInputPlaceHolder": "Searchbox, {0}, enter to submit query, esc to clear text",
    "searchBoxAriaLabelButton": "Click to submit query",
    "searchBoxAriaLabelQuery": "Suggestion: {0}",
    "_searchBoxAriaLabelQuery.comment": "Suggestion: query text (example: Suggestion: contoso)",
    "searchBoxAriaLabelSeparator": "Separator: {0}",
    "_searchBoxAriaLabelSeparator.comment": "Separator: separator text (example: Separator: People or Separator: Apps)",
    "searchBoxAriaLabelResult": "Result: {0}, {1}",
    "_searchBoxAriaLabelResult.comment": "Result: text, detailed text (example: Result: contoso, www.contoso.com)",
    "selectAMPM": "Select A.M P.M",
    "selectDay": "Select Day",
    "selectHour": "Select Hour",
    "selectMinute": "Select Minute",
    "selectMonth": "Select Month",
    "selectYear": "Select Year",
    "settingsFlyoutAriaLabel": "Settings Flyout",
    "tentativeRating": "Tentative Rating",
    "timePicker": "Time Picker",
    "unrated": "Unrated",
    "userRating": "User Rating",
    // AppBar Icons follow, the format of the ui.js and ui.resjson differ for
    // the AppBarIcon namespace.  The remainder of the file therefore differs.
    // Code point comments are the icon glyphs in the 'Segoe UI Symbol' font.
    "appBarIcons\\previous":                            "\uE100", //  group:Media
    "_appBarIcons\\previous.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\next":                                "\uE101", //  group:Media
    "_appBarIcons\\next.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\play":                                "\uE102", //  group:Media
    "_appBarIcons\\play.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\pause":                               "\uE103", //  group:Media
    "_appBarIcons\\pause.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\edit":                                "\uE104", //  group:File
    "_appBarIcons\\edit.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\save":                                "\uE105", //  group:File
    "_appBarIcons\\save.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\clear":                               "\uE106", //  group:File
    "_appBarIcons\\clear.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\delete":                              "\uE107", //  group:File
    "_appBarIcons\\delete.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\remove":                              "\uE108", //  group:File
    "_appBarIcons\\remove.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\add":                                 "\uE109", //  group:File
    "_appBarIcons\\add.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cancel":                              "\uE10A", //  group:Editing
    "_appBarIcons\\cancel.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\accept":                              "\uE10B", //  group:General
    "_appBarIcons\\accept.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\more":                                "\uE10C", //  group:General
    "_appBarIcons\\more.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\redo":                                "\uE10D", //  group:Editing
    "_appBarIcons\\redo.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\undo":                                "\uE10E", //  group:Editing
    "_appBarIcons\\undo.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\home":                                "\uE10F", //  group:General
    "_appBarIcons\\home.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\up":                                  "\uE110", //  group:General
    "_appBarIcons\\up.comment":                         "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\forward":                             "\uE111", //  group:General
    "_appBarIcons\\forward.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\right":                               "\uE111", //  group:General
    "_appBarIcons\\right.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\back":                                "\uE112", //  group:General
    "_appBarIcons\\back.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\left":                                "\uE112", //  group:General
    "_appBarIcons\\left.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\favorite":                            "\uE113", //  group:Media
    "_appBarIcons\\favorite.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\camera":                              "\uE114", //  group:System
    "_appBarIcons\\camera.comment":                     "{Locked:qps-ploc,qps-plocm}",    
    "appBarIcons\\settings":                            "\uE115", //  group:System
    "_appBarIcons\\settings.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\video":                               "\uE116", //  group:Media
    "_appBarIcons\\video.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\sync":                                "\uE117", //  group:Media
    "_appBarIcons\\sync.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\download":                            "\uE118", //  group:Media
    "_appBarIcons\\download.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mail":                                "\uE119", //  group:Mail and calendar
    "_appBarIcons\\mail.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\find":                                "\uE11A", //  group:Data
    "_appBarIcons\\find.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\help":                                "\uE11B", //  group:General
    "_appBarIcons\\help.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\upload":                              "\uE11C", //  group:Media
    "_appBarIcons\\upload.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\emoji":                               "\uE11D", //  group:Communications
    "_appBarIcons\\emoji.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\twopage":                             "\uE11E", //  group:Layout
    "_appBarIcons\\twopage.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\leavechat":                           "\uE11F", //  group:Communications
    "_appBarIcons\\leavechat.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mailforward":                         "\uE120", //  group:Mail and calendar
    "_appBarIcons\\mailforward.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\clock":                               "\uE121", //  group:General
    "_appBarIcons\\clock.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\send":                                "\uE122", //  group:Mail and calendar
    "_appBarIcons\\send.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\crop":                                "\uE123", //  group:Editing
    "_appBarIcons\\crop.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\rotatecamera":                        "\uE124", //  group:System
    "_appBarIcons\\rotatecamera.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\people":                              "\uE125", //  group:Communications
    "_appBarIcons\\people.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\closepane":                           "\uE126", //  group:Layout
    "_appBarIcons\\closepane.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openpane":                            "\uE127", //  group:Layout
    "_appBarIcons\\openpane.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\world":                               "\uE128", //  group:General
    "_appBarIcons\\world.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\flag":                                "\uE129", //  group:Mail and calendar
    "_appBarIcons\\flag.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\previewlink":                         "\uE12A", //  group:General
    "_appBarIcons\\previewlink.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\globe":                               "\uE12B", //  group:Communications
    "_appBarIcons\\globe.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\trim":                                "\uE12C", //  group:Editing
    "_appBarIcons\\trim.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\attachcamera":                        "\uE12D", //  group:System
    "_appBarIcons\\attachcamera.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zoomin":                              "\uE12E", //  group:Layout
    "_appBarIcons\\zoomin.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\bookmarks":                           "\uE12F", //  group:Editing
    "_appBarIcons\\bookmarks.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\document":                            "\uE130", //  group:File
    "_appBarIcons\\document.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\protecteddocument":                   "\uE131", //  group:File
    "_appBarIcons\\protecteddocument.comment":          "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\page":                                "\uE132", //  group:Layout
    "_appBarIcons\\page.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\bullets":                             "\uE133", //  group:Editing
    "_appBarIcons\\bullets.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\comment":                             "\uE134", //  group:Communications
    "_appBarIcons\\comment.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mail2":                               "\uE135", //  group:Mail and calendar
    "_appBarIcons\\mail2.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contactinfo":                         "\uE136", //  group:Communications
    "_appBarIcons\\contactinfo.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\hangup":                              "\uE137", //  group:Communications
    "_appBarIcons\\hangup.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\viewall":                             "\uE138", //  group:Data
    "_appBarIcons\\viewall.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mappin":                              "\uE139", //  group:General
    "_appBarIcons\\mappin.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\phone":                               "\uE13A", //  group:Communications
    "_appBarIcons\\phone.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\videochat":                           "\uE13B", //  group:Communications
    "_appBarIcons\\videochat.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\switch":                              "\uE13C", //  group:Communications
    "_appBarIcons\\switch.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contact":                             "\uE13D", //  group:Communications
    "_appBarIcons\\contact.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\rename":                              "\uE13E", //  group:File
    "_appBarIcons\\rename.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\pin":                                 "\uE141", //  group:System
    "_appBarIcons\\pin.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\musicinfo":                           "\uE142", //  group:Media
    "_appBarIcons\\musicinfo.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\go":                                  "\uE143", //  group:General
    "_appBarIcons\\go.comment":                         "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\keyboard":                            "\uE144", //  group:System
    "_appBarIcons\\keyboard.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dockleft":                            "\uE145", //  group:Layout
    "_appBarIcons\\dockleft.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dockright":                           "\uE146", //  group:Layout
    "_appBarIcons\\dockright.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dockbottom":                          "\uE147", //  group:Layout
    "_appBarIcons\\dockbottom.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\remote":                              "\uE148", //  group:System
    "_appBarIcons\\remote.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\refresh":                             "\uE149", //  group:Data
    "_appBarIcons\\refresh.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\rotate":                              "\uE14A", //  group:Layout
    "_appBarIcons\\rotate.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\shuffle":                             "\uE14B", //  group:Media
    "_appBarIcons\\shuffle.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\list":                                "\uE14C", //  group:Editing
    "_appBarIcons\\list.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\shop":                                "\uE14D", //  group:General
    "_appBarIcons\\shop.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\selectall":                           "\uE14E", //  group:Data
    "_appBarIcons\\selectall.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\orientation":                         "\uE14F", //  group:Layout
    "_appBarIcons\\orientation.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\import":                              "\uE150", //  group:Data
    "_appBarIcons\\import.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\importall":                           "\uE151", //  group:Data
    "_appBarIcons\\importall.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\browsephotos":                        "\uE155", //  group:Media
    "_appBarIcons\\browsephotos.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\webcam":                              "\uE156", //  group:System
    "_appBarIcons\\webcam.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\pictures":                            "\uE158", //  group:Media
    "_appBarIcons\\pictures.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\savelocal":                           "\uE159", //  group:File
    "_appBarIcons\\savelocal.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\caption":                             "\uE15A", //  group:Media
    "_appBarIcons\\caption.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\stop":                                "\uE15B", //  group:Media
    "_appBarIcons\\stop.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\showresults":                         "\uE15C", //  group:Data
    "_appBarIcons\\showresults.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\volume":                              "\uE15D", //  group:Media
    "_appBarIcons\\volume.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\repair":                              "\uE15E", //  group:System
    "_appBarIcons\\repair.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\message":                             "\uE15F", //  group:Communications
    "_appBarIcons\\message.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\page2":                               "\uE160", //  group:Layout
    "_appBarIcons\\page2.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendarday":                         "\uE161", //  group:Mail and calendar
    "_appBarIcons\\calendarday.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendarweek":                        "\uE162", //  group:Mail and calendar
    "_appBarIcons\\calendarweek.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendar":                            "\uE163", //  group:Mail and calendar
    "_appBarIcons\\calendar.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\characters":                          "\uE164", //  group:Editing
    "_appBarIcons\\characters.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mailreplyall":                        "\uE165", //  group:Mail and calendar
    "_appBarIcons\\mailreplyall.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\read":                                "\uE166", //  group:Mail and calendar
    "_appBarIcons\\read.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\link":                                "\uE167", //  group:Communications
    "_appBarIcons\\link.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\accounts":                            "\uE168", //  group:Communications
    "_appBarIcons\\accounts.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\showbcc":                             "\uE169", //  group:Mail and calendar
    "_appBarIcons\\showbcc.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\hidebcc":                             "\uE16A", //  group:Mail and calendar
    "_appBarIcons\\hidebcc.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cut":                                 "\uE16B", //  group:Editing
    "_appBarIcons\\cut.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\attach":                              "\uE16C", //  group:Mail and calendar
    "_appBarIcons\\attach.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\paste":                               "\uE16D", //  group:Editing
    "_appBarIcons\\paste.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\filter":                              "\uE16E", //  group:Data
    "_appBarIcons\\filter.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\copy":                                "\uE16F", //  group:Editing
    "_appBarIcons\\copy.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\emoji2":                              "\uE170", //  group:Mail and calendar
    "_appBarIcons\\emoji2.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\important":                           "\uE171", //  group:Mail and calendar
    "_appBarIcons\\important.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mailreply":                           "\uE172", //  group:Mail and calendar
    "_appBarIcons\\mailreply.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\slideshow":                           "\uE173", //  group:Media
    "_appBarIcons\\slideshow.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\sort":                                "\uE174", //  group:Data
    "_appBarIcons\\sort.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\manage":                              "\uE178", //  group:System
    "_appBarIcons\\manage.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\allapps":                             "\uE179", //  group:System
    "_appBarIcons\\allapps.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\disconnectdrive":                     "\uE17A", //  group:System
    "_appBarIcons\\disconnectdrive.comment":            "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mapdrive":                            "\uE17B", //  group:System
    "_appBarIcons\\mapdrive.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\newwindow":                           "\uE17C", //  group:System
    "_appBarIcons\\newwindow.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openwith":                            "\uE17D", //  group:System
    "_appBarIcons\\openwith.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contactpresence":                     "\uE181", //  group:Communications
    "_appBarIcons\\contactpresence.comment":            "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\priority":                            "\uE182", //  group:Mail and calendar
    "_appBarIcons\\priority.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\uploadskydrive":                      "\uE183", //  group:File
    "_appBarIcons\\uploadskydrive.comment":             "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\gototoday":                           "\uE184", //  group:Mail and calendar
    "_appBarIcons\\gototoday.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\font":                                "\uE185", //  group:Editing
    "_appBarIcons\\font.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontcolor":                           "\uE186", //  group:Editing
    "_appBarIcons\\fontcolor.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contact2":                            "\uE187", //  group:Communications
    "_appBarIcons\\contact2.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\folder":                              "\uE188", //  group:File
    "_appBarIcons\\folder.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\audio":                               "\uE189", //  group:Media
    "_appBarIcons\\audio.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\placeholder":                         "\uE18A", //  group:General
    "_appBarIcons\\placeholder.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\view":                                "\uE18B", //  group:Layout
    "_appBarIcons\\view.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\setlockscreen":                       "\uE18C", //  group:System
    "_appBarIcons\\setlockscreen.comment":              "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\settile":                             "\uE18D", //  group:System
    "_appBarIcons\\settile.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cc":                                  "\uE190", //  group:Media
    "_appBarIcons\\cc.comment":                         "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\stopslideshow":                       "\uE191", //  group:Media
    "_appBarIcons\\stopslideshow.comment":              "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\permissions":                         "\uE192", //  group:System
    "_appBarIcons\\permissions.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\highlight":                           "\uE193", //  group:Editing
    "_appBarIcons\\highlight.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\disableupdates":                      "\uE194", //  group:System
    "_appBarIcons\\disableupdates.comment":             "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\unfavorite":                          "\uE195", //  group:Media
    "_appBarIcons\\unfavorite.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\unpin":                               "\uE196", //  group:System
    "_appBarIcons\\unpin.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openlocal":                           "\uE197", //  group:File
    "_appBarIcons\\openlocal.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mute":                                "\uE198", //  group:Media
    "_appBarIcons\\mute.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\italic":                              "\uE199", //  group:Editing
    "_appBarIcons\\italic.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\underline":                           "\uE19A", //  group:Editing
    "_appBarIcons\\underline.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\bold":                                "\uE19B", //  group:Editing
    "_appBarIcons\\bold.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\movetofolder":                        "\uE19C", //  group:File
    "_appBarIcons\\movetofolder.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\likedislike":                         "\uE19D", //  group:Data
    "_appBarIcons\\likedislike.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dislike":                             "\uE19E", //  group:Data
    "_appBarIcons\\dislike.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\like":                                "\uE19F", //  group:Data
    "_appBarIcons\\like.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\alignright":                          "\uE1A0", //  group:Editing
    "_appBarIcons\\alignright.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\aligncenter":                         "\uE1A1", //  group:Editing
    "_appBarIcons\\aligncenter.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\alignleft":                           "\uE1A2", //  group:Editing
    "_appBarIcons\\alignleft.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zoom":                                "\uE1A3", //  group:Layout
    "_appBarIcons\\zoom.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zoomout":                             "\uE1A4", //  group:Layout
    "_appBarIcons\\zoomout.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openfile":                            "\uE1A5", //  group:File
    "_appBarIcons\\openfile.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\otheruser":                           "\uE1A6", //  group:System
    "_appBarIcons\\otheruser.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\admin":                               "\uE1A7", //  group:System
    "_appBarIcons\\admin.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\street":                              "\uE1C3", //  group:General
    "_appBarIcons\\street.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\map":                                 "\uE1C4", //  group:General
    "_appBarIcons\\map.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\clearselection":                      "\uE1C5", //  group:Data
    "_appBarIcons\\clearselection.comment":             "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontdecrease":                        "\uE1C6", //  group:Editing
    "_appBarIcons\\fontdecrease.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontincrease":                        "\uE1C7", //  group:Editing
    "_appBarIcons\\fontincrease.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontsize":                            "\uE1C8", //  group:Editing
    "_appBarIcons\\fontsize.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cellphone":                           "\uE1C9", //  group:Communications
    "_appBarIcons\\cellphone.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\reshare":                             "\uE1CA", //  group:Communications
    "_appBarIcons\\reshare.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\tag":                                 "\uE1CB", //  group:Data
    "_appBarIcons\\tag.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\repeatone":                           "\uE1CC", //  group:Media
    "_appBarIcons\\repeatone.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\repeatall":                           "\uE1CD", //  group:Media
    "_appBarIcons\\repeatall.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\outlinestar":                         "\uE1CE", //  group:Data
    "_appBarIcons\\outlinestar.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\solidstar":                           "\uE1CF", //  group:Data
    "_appBarIcons\\solidstar.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calculator":                          "\uE1D0", //  group:General
    "_appBarIcons\\calculator.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\directions":                          "\uE1D1", //  group:General
    "_appBarIcons\\directions.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\target":                              "\uE1D2", //  group:General
    "_appBarIcons\\target.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\library":                             "\uE1D3", //  group:Media
    "_appBarIcons\\library.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\phonebook":                           "\uE1D4", //  group:Communications
    "_appBarIcons\\phonebook.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\memo":                                "\uE1D5", //  group:Communications
    "_appBarIcons\\memo.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\microphone":                          "\uE1D6", //  group:System
    "_appBarIcons\\microphone.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\postupdate":                          "\uE1D7", //  group:Communications
    "_appBarIcons\\postupdate.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\backtowindow":                        "\uE1D8", //  group:Layout
    "_appBarIcons\\backtowindow.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fullscreen":                          "\uE1D9", //  group:Layout
    "_appBarIcons\\fullscreen.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\newfolder":                           "\uE1DA", //  group:File
    "_appBarIcons\\newfolder.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendarreply":                       "\uE1DB", //  group:Mail and calendar
    "_appBarIcons\\calendarreply.comment":              "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\unsyncfolder":                        "\uE1DD", //  group:File
    "_appBarIcons\\unsyncfolder.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\reporthacked":                        "\uE1DE", //  group:Communications
    "_appBarIcons\\reporthacked.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\syncfolder":                          "\uE1DF", //  group:File
    "_appBarIcons\\syncfolder.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\blockcontact":                        "\uE1E0", //  group:Communications
    "_appBarIcons\\blockcontact.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\switchapps":                          "\uE1E1", //  group:System
    "_appBarIcons\\switchapps.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\addfriend":                           "\uE1E2", //  group:Communications
    "_appBarIcons\\addfriend.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\touchpointer":                        "\uE1E3", //  group:System
    "_appBarIcons\\touchpointer.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\gotostart":                           "\uE1E4", //  group:System
    "_appBarIcons\\gotostart.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zerobars":                            "\uE1E5", //  group:System
    "_appBarIcons\\zerobars.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\onebar":                              "\uE1E6", //  group:System
    "_appBarIcons\\onebar.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\twobars":                             "\uE1E7", //  group:System
    "_appBarIcons\\twobars.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\threebars":                           "\uE1E8", //  group:System
    "_appBarIcons\\threebars.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fourbars":                            "\uE1E9", //  group:System
    "_appBarIcons\\fourbars.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\scan":               			"\uE294", //  group:General
    "_appBarIcons\\scan.comment":                   	"{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\preview":            			"\uE295", //  group:General
    "_appBarIcons\\preview.comment":                   	"{Locked:qps-ploc,qps-plocm}"
}
);
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_Resources',[
    'exports',
    './_Global',
    './_WinRT',
    './_Base',
    './_Events',
    'require-json!en-US/ui.resjson',
    ], function resourcesInit(exports, _Global, _WinRT, _Base, _Events, defaultStrings) {
    "use strict";

    var appxVersion = "WinJS.3.0";
    var developerPrefix = "Developer.";
    if (appxVersion.indexOf(developerPrefix) === 0) {
        appxVersion = appxVersion.substring(developerPrefix.length);
    }

    function _getWinJSString(id) {
        var result = getString("ms-resource://" + appxVersion + "/" + id);

        if (result.empty) {
            result = _getStringBuiltIn(id);
        }

        return result;
    }

    function _getStringBuiltIn(resourceId) {

        var parts = resourceId.split("/");
        parts.shift(); // ignore the leading ui/

        var str = defaultStrings[parts.join("\\")];

        if (typeof str === "string") {
            str = { value: str };
        }

        return str || { value: resourceId, empty: true };
    }

    var resourceMap;
    var mrtEventHook = false;
    var contextChangedET = "contextchanged";
    var resourceContext;

    var ListenerType = _Base.Class.mix(_Base.Class.define(null, { /* empty */ }, { supportedForProcessing: false }), _Events.eventMixin);
    var listeners = new ListenerType();
    var createEvent = _Events._createEventProperty;

    var strings = {
        get malformedFormatStringInput() { return "Malformed, did you mean to escape your '{0}'?"; },
    };

    _Base.Namespace.define("WinJS.Resources", {
        _getWinJSString: _getWinJSString
    });

    function formatString(string) {
        var args = arguments;
        if (args.length > 1) {
            string = string.replace(/({{)|(}})|{(\d+)}|({)|(})/g, function (unused, left, right, index, illegalLeft, illegalRight) {
                if (illegalLeft || illegalRight) { throw formatString(strings.malformedFormatStringInput, illegalLeft || illegalRight); }
                return (left && "{") || (right && "}") || args[(index | 0) + 1];
            });
        }
        return string;
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Resources", {
        addEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="WinJS.Resources.addEventListener">
            /// <summary locid="WinJS.Resources.addEventListener">
            /// Registers an event handler for the specified event.
            /// </summary>
            /// <param name='type' type="String" locid='WinJS.Resources.addEventListener_p:type'>
            /// The name of the event to handle.
            /// </param>
            /// <param name='listener' type="Function" locid='WinJS.Resources.addEventListener_p:listener'>
            /// The listener to invoke when the event gets raised.
            /// </param>
            /// <param name='useCapture' type="Boolean" locid='WinJS.Resources.addEventListener_p:useCapture'>
            /// Set to true to register the event handler for the capturing phase; set to false to register for the bubbling phase.
            /// </param>
            /// </signature>
            if (_WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager && !mrtEventHook) {
                if (type === contextChangedET) {
                    try {
                        var resContext = exports._getResourceContext();
                        if (resContext) {
                            resContext.qualifierValues.addEventListener("mapchanged", function (e) {
                                exports.dispatchEvent(contextChangedET, { qualifier: e.key, changed: e.target[e.key] });
                            }, false);

                        } else {
                            // The API can be called in the Background thread (web worker).
                            _WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager.current.defaultContext.qualifierValues.addEventListener("mapchanged", function (e) {
                                exports.dispatchEvent(contextChangedET, { qualifier: e.key, changed: e.target[e.key] });
                            }, false);
                        }
                        mrtEventHook = true;
                    } catch (e) {
                    }
                }
            }
            listeners.addEventListener(type, listener, useCapture);
        },
        removeEventListener: listeners.removeEventListener.bind(listeners),
        dispatchEvent: listeners.dispatchEvent.bind(listeners),

        _formatString: formatString,

        _getStringWinRT: function (resourceId) {
            if (!resourceMap) {
                var mainResourceMap = _WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager.current.mainResourceMap;
                try {
                    resourceMap = mainResourceMap.getSubtree('Resources');
                }
                catch (e) {
                }
                if (!resourceMap) {
                    resourceMap = mainResourceMap;
                }
            }

            var stringValue;
            var langValue;
            var resCandidate;
            try {
                var resContext = exports._getResourceContext();
                if (resContext) {
                    resCandidate = resourceMap.getValue(resourceId, resContext);
                } else {
                    resCandidate = resourceMap.getValue(resourceId);
                }

                if (resCandidate) {
                    stringValue = resCandidate.valueAsString;
                    if (stringValue === undefined) {
                        stringValue = resCandidate.toString();
                    }
                }
            }
            catch (e) { }

            if (!stringValue) {
                return exports._getStringJS(resourceId);
            }

            try {
                langValue = resCandidate.getQualifierValue("Language");
            }
            catch (e) {
                return { value: stringValue };
            }

            return { value: stringValue, lang: langValue };
        },

        _getStringJS: function (resourceId) {
            var str = _Global.strings && _Global.strings[resourceId];
            if (typeof str === "string") {
                str = { value: str };
            }
            return str || { value: resourceId, empty: true };
        },

        _getResourceContext: function () {
            if (_Global.document) {
                if (typeof (resourceContext) === 'undefined') {
                    var context = _WinRT.Windows.ApplicationModel.Resources.Core.ResourceContext;
                    if (context.getForCurrentView) {
                        resourceContext = context.getForCurrentView();
                    } else {
                        resourceContext = null;
                    }

                }
            }
            return resourceContext;
        },

        oncontextchanged: createEvent(contextChangedET)

    });

    var getStringImpl = _WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager ? exports._getStringWinRT : exports._getStringJS;

    var getString = function (resourceId) {
        /// <signature helpKeyword="WinJS.Resources.getString">
        /// <summary locid='WinJS.Resources.getString'>
        /// Retrieves the resource string that has the specified resource id.
        /// </summary>
        /// <param name='resourceId' type="Number" locid='WinJS.Resources.getString._p:resourceId'>
        /// The resource id of the string to retrieve.
        /// </param>
        /// <returns type='Object' locid='WinJS.Resources.getString_returnValue'>
        /// An object that can contain these properties:
        ///
        /// value:
        /// The value of the requested string. This property is always present.
        ///
        /// empty:
        /// A value that specifies whether the requested string wasn't found.
        /// If its true, the string wasn't found. If its false or undefined,
        /// the requested string was found.
        ///
        /// lang:
        /// The language of the string, if specified. This property is only present
        /// for multi-language resources.
        ///
        /// </returns>
        /// </signature>

        return getStringImpl(resourceId);
    };

    _Base.Namespace._moduleDefine(exports, null, {
        _formatString: formatString,
        _getWinJSString: _getWinJSString
    });

    _Base.Namespace._moduleDefine(exports, "WinJS.Resources", {
        getString: {
            get: function () {
                return getString;
            },
            set: function (value) {
                getString = value;
            }
        }
    });

});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_Trace',[
    './_Global'
    ], function traceInit(_Global) {
    "use strict";

    function nop(v) {
        return v;
    }

    return {
        _traceAsyncOperationStarting: (_Global.Debug && _Global.Debug.msTraceAsyncOperationStarting && _Global.Debug.msTraceAsyncOperationStarting.bind(_Global.Debug)) || nop,
        _traceAsyncOperationCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncOperationCompleted && _Global.Debug.msTraceAsyncOperationCompleted.bind(_Global.Debug)) || nop,
        _traceAsyncCallbackStarting: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackStarting && _Global.Debug.msTraceAsyncCallbackStarting.bind(_Global.Debug)) || nop,
        _traceAsyncCallbackCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackCompleted && _Global.Debug.msTraceAsyncCallbackCompleted.bind(_Global.Debug)) || nop
    };
});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_Log',[
    'exports',
    './_Global',
    './_Base',
    ], function logInit(exports, _Global, _Base) {
    "use strict";

    var spaceR = /\s+/g;
    var typeR = /^(error|warn|info|log)$/;
    var WinJSLog = null;

    function format(message, tag, type) {
        /// <signature helpKeyword="WinJS.Utilities.formatLog">
        /// <summary locid="WinJS.Utilities.formatLog">
        /// Adds tags and type to a logging message.
        /// </summary>
        /// <param name="message" type="String" locid="WinJS.Utilities.startLog_p:message">The message to format.</param>
        /// <param name="tag" type="String" locid="WinJS.Utilities.startLog_p:tag">
        /// The tag(s) to apply to the message. Separate multiple tags with spaces.
        /// </param>
        /// <param name="type" type="String" locid="WinJS.Utilities.startLog_p:type">The type of the message.</param>
        /// <returns type="String" locid="WinJS.Utilities.startLog_returnValue">The formatted message.</returns>
        /// </signature>
        var m = message;
        if (typeof (m) === "function") { m = m(); }

        return ((type && typeR.test(type)) ? ("") : (type ? (type + ": ") : "")) +
            (tag ? tag.replace(spaceR, ":") + ": " : "") +
            m;
    }
    function defAction(message, tag, type) {
        var m = exports.formatLog(message, tag, type);
        if (_Global.console) {
            _Global.console[(type && typeR.test(type)) ? type : "log"](m);
        }
    }
    function escape(s) {
        // \s (whitespace) is used as separator, so don't escape it
        return s.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    }
    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        startLog: function (options) {
            /// <signature helpKeyword="WinJS.Utilities.startLog">
            /// <summary locid="WinJS.Utilities.startLog">
            /// Configures a logger that writes messages containing the specified tags from WinJS.log to console.log.
            /// </summary>
            /// <param name="options" type="String" locid="WinJS.Utilities.startLog_p:options">
            /// The tags for messages to log. Separate multiple tags with spaces.
            /// </param>
            /// </signature>
            /// <signature>
            /// <summary locid="WinJS.Utilities.startLog2">
            /// Configure a logger to write WinJS.log output.
            /// </summary>
            /// <param name="options" type="Object" locid="WinJS.Utilities.startLog_p:options2">
            /// May contain .type, .tags, .excludeTags and .action properties.
            ///  - .type is a required tag.
            ///  - .excludeTags is a space-separated list of tags, any of which will result in a message not being logged.
            ///  - .tags is a space-separated list of tags, any of which will result in a message being logged.
            ///  - .action is a function that, if present, will be called with the log message, tags and type. The default is to log to the console.
            /// </param>
            /// </signature>
            options = options || {};
            if (typeof options === "string") {
                options = { tags: options };
            }
            var el = options.type && new RegExp("^(" + escape(options.type).replace(spaceR, " ").split(" ").join("|") + ")$");
            var not = options.excludeTags && new RegExp("(^|\\s)(" + escape(options.excludeTags).replace(spaceR, " ").split(" ").join("|") + ")(\\s|$)", "i");
            var has = options.tags && new RegExp("(^|\\s)(" + escape(options.tags).replace(spaceR, " ").split(" ").join("|") + ")(\\s|$)", "i");
            var action = options.action || defAction;

            if (!el && !not && !has && !exports.log) {
                exports.log = action;
                return;
            }

            var result = function (message, tag, type) {
                if (!((el && !el.test(type))          // if the expected log level is not satisfied
                    || (not && not.test(tag))         // if any of the excluded categories exist
                    || (has && !has.test(tag)))) {    // if at least one of the included categories doesn't exist
                        action(message, tag, type);
                    }

                result.next && result.next(message, tag, type);
            };
            result.next = exports.log;
            exports.log = result;
        },
        stopLog: function () {
            /// <signature helpKeyword="WinJS.Utilities.stopLog">
            /// <summary locid="WinJS.Utilities.stopLog">
            /// Removes the previously set up logger.
            /// </summary>
            /// </signature>
            exports.log = null;
        },
        formatLog: format
    });

    _Base.Namespace._moduleDefine(exports, "WinJS", {
        log: {
            get: function () {
                return WinJSLog;
            },
            set: function (value) {
                WinJSLog = value;
            }
        }
    });
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Core/_BaseUtils',[
    'exports',
    './_Global',
    './_Base',
    './_BaseCoreUtils',
    './_ErrorFromName',
    './_Resources',
    './_Trace',
    '../Promise',
    '../Scheduler'
    ], function baseUtilsInit(exports, _Global, _Base, _BaseCoreUtils, _ErrorFromName, _Resources, _Trace, Promise, Scheduler) {
    "use strict";

    var strings = {
        get notSupportedForProcessing() { return "Value is not supported within a declarative processing context, if you want it to be supported mark it using WinJS.Utilities.markSupportedForProcessing. The value was: '{0}'"; }
    };

    var requestAnimationWorker;
    var requestAnimationId = 0;
    var requestAnimationHandlers = {};
    var isPhone = false;
    var validation = false;
    var platform = _Global.navigator.platform;
    var isiOS = platform === "iPhone" || platform === "iPad" || platform === "iPod";

    function nop(v) {
        return v;
    }

    function getMemberFiltered(name, root, filter) {
        return name.split(".").reduce(function (currentNamespace, name) {
            if (currentNamespace) {
                return filter(currentNamespace[name]);
            }
            return null;
        }, root);
    }

    function getMember(name, root) {
        /// <signature helpKeyword="WinJS.Utilities.getMember">
        /// <summary locid="WinJS.Utilities.getMember">
        /// Gets the leaf-level type or namespace specified by the name parameter.
        /// </summary>
        /// <param name="name" locid="WinJS.Utilities.getMember_p:name">
        /// The name of the member.
        /// </param>
        /// <param name="root" locid="WinJS.Utilities.getMember_p:root">
        /// The root to start in. Defaults to the global object.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.getMember_returnValue">
        /// The leaf-level type or namespace in the specified parent namespace.
        /// </returns>
        /// </signature>
        if (!name) {
            return null;
        }
        return getMemberFiltered(name, root || _Global, nop);
    }

    function getCamelCasedName(styleName) {
        // special case -moz prefixed styles because their JS property name starts with Moz
        if (styleName.length > 0 && styleName.indexOf("-moz") !== 0 && styleName.charAt(0) === "-") {
            styleName = styleName.slice(1);
        }
        return styleName.replace(/\-[a-z]/g, function (x) { return x[1].toUpperCase(); });
    }

    function addPrefixToCamelCasedName(prefix, name) {
        if (prefix === "") {
            return name;
        }

        return prefix + name.charAt(0).toUpperCase() + name.slice(1);
    }

    function addPrefixToCSSName(prefix, name) {
        return (prefix !== "" ? "-" + prefix.toLowerCase() + "-" : "") + name;
    }

    function getBrowserStyleEquivalents() {
        // not supported in WebWorker
        if (!_Global.document) {
            return {};
        }

        var equivalents = {},
            docStyle = _Global.document.documentElement.style,
            stylePrefixesToTest = ["", "webkit", "ms", "Moz"],
            styles = ["animation",
                "transition",
                "transform",
                "animation-name",
                "animation-duration",
                "animation-delay",
                "animation-timing-function",
                "animation-iteration-count",
                "animation-direction",
                "animation-fill-mode",
                "grid-column",
                "grid-columns",
                "grid-column-span",
                "grid-row",
                "grid-rows",
                "grid-row-span",
                "transform-origin",
                "transition-property",
                "transition-duration",
                "transition-delay",
                "transition-timing-function",
                "scroll-snap-points-x",
                "scroll-snap-points-y",
                "scroll-chaining",
                "scroll-limit",
                "scroll-limit-x-max",
                "scroll-limit-x-min",
                "scroll-limit-y-max",
                "scroll-limit-y-min",
                "scroll-snap-type",
                "scroll-snap-x",
                "scroll-snap-y",
                "touch-action",
                "overflow-style",
                "user-select" // used for Template Compiler test
            ],
            prefixesUsedOnStyles = {};

        for (var i = 0, len = styles.length; i < len; i++) {
            var originalName = styles[i],
                styleToTest = getCamelCasedName(originalName);
            for (var j = 0, prefixLen = stylePrefixesToTest.length; j < prefixLen; j++) {
                var prefix = stylePrefixesToTest[j];
                var styleName = addPrefixToCamelCasedName(prefix, styleToTest);
                if (styleName in docStyle) {
                    // Firefox doesn't support dashed style names being get/set via script. (eg, something like element.style["transform-origin"] = "" wouldn't work).
                    // For each style translation we create, we'll make a CSS name version and a script name version for it so each can be used where appropriate.
                    var cssName = addPrefixToCSSName(prefix, originalName);
                    equivalents[originalName] = {
                        cssName: cssName,
                        scriptName: styleName
                    };
                    prefixesUsedOnStyles[originalName] = prefix;
                    break;
                }
            }
        }

        // Special cases:
        equivalents.animationPrefix = addPrefixToCSSName(prefixesUsedOnStyles["animation"], "");
        equivalents.keyframes = addPrefixToCSSName(prefixesUsedOnStyles["animation"], "keyframes");

        return equivalents;
    }

    function getBrowserEventEquivalents() {
        var equivalents = {};
        var animationEventPrefixes = ["", "WebKit"],
            animationEvents = [
                {
                    eventObject: "TransitionEvent",
                    events: ["transitionStart", "transitionEnd"]
                },
                {
                    eventObject: "AnimationEvent",
                    events: ["animationStart", "animationEnd"]
                }
            ];

        for (var i = 0, len = animationEvents.length; i < len; i++) {
            var eventToTest = animationEvents[i],
                chosenPrefix = "";
            for (var j = 0, prefixLen = animationEventPrefixes.length; j < prefixLen; j++) {
                var prefix = animationEventPrefixes[j];
                if ((prefix + eventToTest.eventObject) in _Global) {
                    chosenPrefix = prefix.toLowerCase();
                    break;
                }
            }
            for (var j = 0, eventsLen = eventToTest.events.length; j < eventsLen; j++) {
                var eventName = eventToTest.events[j];
                equivalents[eventName] = addPrefixToCamelCasedName(chosenPrefix, eventName);
                if (chosenPrefix === "") {
                    // Transition and animation events are case sensitive. When there's no prefix, the event name should be in lowercase.
                    // In IE, Chrome and Firefox, an event handler listening to transitionend will be triggered properly, but transitionEnd will not.
                    // When a prefix is provided, though, the event name needs to be case sensitive.
                    // IE and Firefox will trigger an animationend event handler correctly, but Chrome won't trigger webkitanimationend -- it has to be webkitAnimationEnd.
                    equivalents[eventName] = equivalents[eventName].toLowerCase();
                }
            }
        }

        // Non-standardized events
        equivalents["manipulationStateChanged"] = ("MSManipulationEvent" in _Global ? "ManipulationEvent" : null);
        return equivalents;
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        // Used for mocking in tests
        _setHasWinRT: {
            value: function (value) {
                _BaseCoreUtils.hasWinRT = value;
            },
            configurable: false,
            writable: false,
            enumerable: false
        },

        /// <field type="Boolean" locid="WinJS.Utilities.hasWinRT" helpKeyword="WinJS.Utilities.hasWinRT">Determine if WinRT is accessible in this script context.</field>
        hasWinRT: {
            get: function () { return _BaseCoreUtils.hasWinRT; },
            configurable: false,
            enumerable: true
        },

        // Used for mocking in tests
        _setIsiOS: {
            value: function (value) {
                isiOS = value;
            },
            configurable: false,
            writable: false,
            enumerable: false
        },

        _isiOS: {
            get: function () { return isiOS; },
            configurable: false,
            enumerable: true
        },

        _getMemberFiltered: getMemberFiltered,

        getMember: getMember,

        _browserStyleEquivalents: getBrowserStyleEquivalents(),
        _browserEventEquivalents: getBrowserEventEquivalents(),
        _getCamelCasedName: getCamelCasedName,

        ready: function ready(callback, async) {
            /// <signature helpKeyword="WinJS.Utilities.ready">
            /// <summary locid="WinJS.Utilities.ready">
            /// Ensures that the specified function executes only after the DOMContentLoaded event has fired
            /// for the current page.
            /// </summary>
            /// <returns type="WinJS.Promise" locid="WinJS.Utilities.ready_returnValue">A promise that completes after DOMContentLoaded has occurred.</returns>
            /// <param name="callback" optional="true" locid="WinJS.Utilities.ready_p:callback">
            /// A function that executes after DOMContentLoaded has occurred.
            /// </param>
            /// <param name="async" optional="true" locid="WinJS.Utilities.ready_p:async">
            /// If true, the callback is executed asynchronously.
            /// </param>
            /// </signature>
            return new Promise(function (c, e) {
                function complete() {
                    if (callback) {
                        try {
                            callback();
                            c();
                        }
                        catch (err) {
                            e(err);
                        }
                    } else {
                        c();
                    }
                }

                var readyState = ready._testReadyState;
                if (!readyState) {
                    if (_Global.document) {
                        readyState = _Global.document.readyState;
                    } else {
                        readyState = "complete";
                    }
                }
                if (readyState === "complete" || (_Global.document && _Global.document.body !== null)) {
                    if (async) {
                        Scheduler.schedule(function WinJS_Utilities_ready() {
                            complete();
                        }, Scheduler.Priority.normal, null, "WinJS.Utilities.ready");
                    } else {
                        complete();
                    }
                } else {
                    _Global.addEventListener("DOMContentLoaded", complete, false);
                }
            });
        },

        /// <field type="Boolean" locid="WinJS.Utilities.strictProcessing" helpKeyword="WinJS.Utilities.strictProcessing">Determines if strict declarative processing is enabled in this script context.</field>
        strictProcessing: {
            get: function () { return true; },
            configurable: false,
            enumerable: true,
        },

        markSupportedForProcessing: {
            value: _BaseCoreUtils.markSupportedForProcessing,
            configurable: false,
            writable: false,
            enumerable: true
        },

        requireSupportedForProcessing: {
            value: function (value) {
                /// <signature helpKeyword="WinJS.Utilities.requireSupportedForProcessing">
                /// <summary locid="WinJS.Utilities.requireSupportedForProcessing">
                /// Asserts that the value is compatible with declarative processing, such as WinJS.UI.processAll
                /// or WinJS.Binding.processAll. If it is not compatible an exception will be thrown.
                /// </summary>
                /// <param name="value" type="Object" locid="WinJS.Utilities.requireSupportedForProcessing_p:value">
                /// The value to be tested for compatibility with declarative processing. If the
                /// value is a function it must be marked with a property 'supportedForProcessing'
                /// with a value of true.
                /// </param>
                /// <returns type="Object" locid="WinJS.Utilities.requireSupportedForProcessing_returnValue">
                /// The input value.
                /// </returns>
                /// </signature>
                var supportedForProcessing = true;

                supportedForProcessing = supportedForProcessing && value !== _Global;
                supportedForProcessing = supportedForProcessing && value !== _Global.location;
                supportedForProcessing = supportedForProcessing && !(value instanceof _Global.HTMLIFrameElement);
                supportedForProcessing = supportedForProcessing && !(typeof value === "function" && !value.supportedForProcessing);

                switch (_Global.frames.length) {
                    case 0:
                        break;

                    case 1:
                        supportedForProcessing = supportedForProcessing && value !== _Global.frames[0];
                        break;

                    default:
                        for (var i = 0, len = _Global.frames.length; supportedForProcessing && i < len; i++) {
                            supportedForProcessing = supportedForProcessing && value !== _Global.frames[i];
                        }
                        break;
                }

                if (supportedForProcessing) {
                    return value;
                }

                throw new _ErrorFromName("WinJS.Utilities.requireSupportedForProcessing", _Resources._formatString(strings.notSupportedForProcessing, value));
            },
            configurable: false,
            writable: false,
            enumerable: true
        },

        _setImmediate: _BaseCoreUtils._setImmediate,

        _requestAnimationFrame: _Global.requestAnimationFrame ? _Global.requestAnimationFrame.bind(_Global) : function (handler) {
            var handle = ++requestAnimationId;
            requestAnimationHandlers[handle] = handler;
            requestAnimationWorker = requestAnimationWorker || _Global.setTimeout(function () {
                var toProcess = requestAnimationHandlers;
                var now = Date.now();
                requestAnimationHandlers = {};
                requestAnimationWorker = null;
                Object.keys(toProcess).forEach(function (key) {
                    toProcess[key](now);
                });
            }, 16);
            return handle;
        },

        _cancelAnimationFrame: _Global.cancelAnimationFrame ? _Global.cancelAnimationFrame.bind(_Global) : function (handle) {
            delete requestAnimationHandlers[handle];
        },

        // Allows the browser to finish dispatching its current set of events before running
        // the callback.
        _yieldForEvents: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
            _Global.setTimeout(handler, 0);
        },

        // Allows the browser to notice a DOM modification before running the callback.
        _yieldForDomModification: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
            _Global.setTimeout(handler, 0);
        },

        _shallowCopy: function _shallowCopy(a) {
            // Shallow copy a single object.
            return this._mergeAll([a]);
        },

        _merge: function _merge(a, b) {
            // Merge 2 objects together into a new object
            return this._mergeAll([a, b]);
        },

        _mergeAll: function _mergeAll(list) {
            // Merge a list of objects together
            var o = {};
            list.forEach(function (part) {
                Object.keys(part).forEach(function (k) {
                    o[k] = part[k];
                });
            });
            return o;
        },

        _getProfilerMarkIdentifier: function _getProfilerMarkIdentifier(element) {
            var profilerMarkIdentifier = "";
            if (element.id) {
                profilerMarkIdentifier += " id='" + element.id + "'";
            }
            if (element.className) {
                profilerMarkIdentifier += " class='" + element.className + "'";
            }
            return profilerMarkIdentifier;
        },

        _now: function _now() {
            return (_Global.performance && _Global.performance.now && _Global.performance.now()) || Date.now();
        },

        _traceAsyncOperationStarting: _Trace._traceAsyncOperationStarting,
        _traceAsyncOperationCompleted: _Trace._traceAsyncOperationCompleted,
        _traceAsyncCallbackStarting: _Trace._traceAsyncCallbackStarting,
        _traceAsyncCallbackCompleted: _Trace._traceAsyncCallbackCompleted,

        /// <field type="Boolean" locid="WinJS.Utilities.isPhone" helpKeyword="WinJS.Utilities.isPhone">Determine if we are currently running in the Phone.</field>
        isPhone: {
            get: function () { return isPhone; },
            configurable: false,
            enumerable: true
        },
        _setIsPhone: {
            set: function (value) {
                isPhone = value;
            }
        }
    });

    _Base.Namespace._moduleDefine(exports, "WinJS", {
        validation: {
            get: function () {
                return validation;
            },
            set: function (value) {
                validation = value;
            }
        }
    });

    // strictProcessing also exists as a module member
    _Base.Namespace.define("WinJS", {
        strictProcessing: {
            value: function () {
                /// <signature helpKeyword="WinJS.strictProcessing">
                /// <summary locid="WinJS.strictProcessing">
                /// Strict processing is always enforced, this method has no effect.
                /// </summary>
                /// </signature>
            },
            configurable: false,
            writable: false,
            enumerable: false
        }
    });
});


define('WinJS/Core',[
    './Core/_Base',
    './Core/_BaseCoreUtils',
    './Core/_BaseUtils',
    './Core/_ErrorFromName',
    './Core/_Events',
    './Core/_Global',
    './Core/_Log',
    './Core/_Resources',
    './Core/_Trace',
    './Core/_WinRT',
    './Core/_WriteProfilerMark'
    ], function () {
    // Wrapper module
});

/*! Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See https://github.com/winjs/winjs/blob/master/License.txt for license information. */define('require-json',{ load: function (name, req, onload, config) { onload(); }});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Promise/_StateMachine',[
    '../Core/_Global',
    '../Core/_BaseCoreUtils',
    '../Core/_Base',
    '../Core/_ErrorFromName',
    '../Core/_Events',
    '../Core/_Trace'
    ], function promiseStateMachineInit(_Global, _BaseCoreUtils, _Base, _ErrorFromName, _Events, _Trace) {
    "use strict";

    _Global.Debug && (_Global.Debug.setNonUserCodeExceptions = true);

    var ListenerType = _Base.Class.mix(_Base.Class.define(null, { /*empty*/ }, { supportedForProcessing: false }), _Events.eventMixin);
    var promiseEventListeners = new ListenerType();
    // make sure there is a listeners collection so that we can do a more trivial check below
    promiseEventListeners._listeners = {};
    var errorET = "error";
    var canceledName = "Canceled";
    var tagWithStack = false;
    var tag = {
        promise: 0x01,
        thenPromise: 0x02,
        errorPromise: 0x04,
        exceptionPromise: 0x08,
        completePromise: 0x10,
    };
    tag.all = tag.promise | tag.thenPromise | tag.errorPromise | tag.exceptionPromise | tag.completePromise;

    //
    // Global error counter, for each error which enters the system we increment this once and then
    // the error number travels with the error as it traverses the tree of potential handlers.
    //
    // When someone has registered to be told about errors (WinJS.Promise.callonerror) promises
    // which are in error will get tagged with a ._errorId field. This tagged field is the
    // contract by which nested promises with errors will be identified as chaining for the
    // purposes of the callonerror semantics. If a nested promise in error is encountered without
    // a ._errorId it will be assumed to be foreign and treated as an interop boundary and
    // a new error id will be minted.
    //
    var error_number = 1;

    //
    // The state machine has a interesting hiccup in it with regards to notification, in order
    // to flatten out notification and avoid recursion for synchronous completion we have an
    // explicit set of *_notify states which are responsible for notifying their entire tree
    // of children. They can do this because they know that immediate children are always
    // ThenPromise instances and we can therefore reach into their state to access the
    // _listeners collection.
    //
    // So, what happens is that a Promise will be fulfilled through the _completed or _error
    // messages at which point it will enter a *_notify state and be responsible for to move
    // its children into an (as appropriate) success or error state and also notify that child's
    // listeners of the state transition, until leaf notes are reached.
    //

    var state_created,              // -> working
        state_working,              // -> error | error_notify | success | success_notify | canceled | waiting
        state_waiting,              // -> error | error_notify | success | success_notify | waiting_canceled
        state_waiting_canceled,     // -> error | error_notify | success | success_notify | canceling
        state_canceled,             // -> error | error_notify | success | success_notify | canceling
        state_canceling,            // -> error_notify
        state_success_notify,       // -> success
        state_success,              // -> .
        state_error_notify,         // -> error
        state_error;                // -> .

    // Noop function, used in the various states to indicate that they don't support a given
    // message. Named with the somewhat cute name '_' because it reads really well in the states.

    function _() { }

    // Initial state
    //
    state_created = {
        name: "created",
        enter: function (promise) {
            promise._setState(state_working);
        },
        cancel: _,
        done: _,
        then: _,
        _completed: _,
        _error: _,
        _notify: _,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Ready state, waiting for a message (completed/error/progress), able to be canceled
    //
    state_working = {
        name: "working",
        enter: _,
        cancel: function (promise) {
            promise._setState(state_canceled);
        },
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Waiting state, if a promise is completed with a value which is itself a promise
    // (has a then() method) it signs up to be informed when that child promise is
    // fulfilled at which point it will be fulfilled with that value.
    //
    state_waiting = {
        name: "waiting",
        enter: function (promise) {
            var waitedUpon = promise._value;
            // We can special case our own intermediate promises which are not in a
            //  terminal state by just pushing this promise as a listener without
            //  having to create new indirection functions
            if (waitedUpon instanceof ThenPromise &&
                waitedUpon._state !== state_error &&
                waitedUpon._state !== state_success) {
                pushListener(waitedUpon, { promise: promise });
            } else {
                var error = function (value) {
                    if (waitedUpon._errorId) {
                        promise._chainedError(value, waitedUpon);
                    } else {
                        // Because this is an interop boundary we want to indicate that this
                        //  error has been handled by the promise infrastructure before we
                        //  begin a new handling chain.
                        //
                        callonerror(promise, value, detailsForHandledError, waitedUpon, error);
                        promise._error(value);
                    }
                };
                error.handlesOnError = true;
                waitedUpon.then(
                    promise._completed.bind(promise),
                    error,
                    promise._progress.bind(promise)
                );
            }
        },
        cancel: function (promise) {
            promise._setState(state_waiting_canceled);
        },
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Waiting canceled state, when a promise has been in a waiting state and receives a
    // request to cancel its pending work it will forward that request to the child promise
    // and then waits to be informed of the result. This promise moves itself into the
    // canceling state but understands that the child promise may instead push it to a
    // different state.
    //
    state_waiting_canceled = {
        name: "waiting_canceled",
        enter: function (promise) {
            // Initiate a transition to canceling. Triggering a cancel on the promise
            // that we are waiting upon may result in a different state transition
            // before the state machine pump runs again.
            promise._setState(state_canceling);
            var waitedUpon = promise._value;
            if (waitedUpon.cancel) {
                waitedUpon.cancel();
            }
        },
        cancel: _,
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Canceled state, moves to the canceling state and then tells the promise to do
    // whatever it might need to do on cancelation.
    //
    state_canceled = {
        name: "canceled",
        enter: function (promise) {
            // Initiate a transition to canceling. The _cancelAction may change the state
            // before the state machine pump runs again.
            promise._setState(state_canceling);
            promise._cancelAction();
        },
        cancel: _,
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Canceling state, commits to the promise moving to an error state with an error
    // object whose 'name' and 'message' properties contain the string "Canceled"
    //
    state_canceling = {
        name: "canceling",
        enter: function (promise) {
            var error = new Error(canceledName);
            error.name = error.message;
            promise._value = error;
            promise._setState(state_error_notify);
        },
        cancel: _,
        done: _,
        then: _,
        _completed: _,
        _error: _,
        _notify: _,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Success notify state, moves a promise to the success state and notifies all children
    //
    state_success_notify = {
        name: "complete_notify",
        enter: function (promise) {
            promise.done = CompletePromise.prototype.done;
            promise.then = CompletePromise.prototype.then;
            if (promise._listeners) {
                var queue = [promise];
                var p;
                while (queue.length) {
                    p = queue.shift();
                    p._state._notify(p, queue);
                }
            }
            promise._setState(state_success);
        },
        cancel: _,
        done: null, /*error to get here */
        then: null, /*error to get here */
        _completed: _,
        _error: _,
        _notify: notifySuccess,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Success state, moves a promise to the success state and does NOT notify any children.
    // Some upstream promise is owning the notification pass.
    //
    state_success = {
        name: "success",
        enter: function (promise) {
            promise.done = CompletePromise.prototype.done;
            promise.then = CompletePromise.prototype.then;
            promise._cleanupAction();
        },
        cancel: _,
        done: null, /*error to get here */
        then: null, /*error to get here */
        _completed: _,
        _error: _,
        _notify: notifySuccess,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Error notify state, moves a promise to the error state and notifies all children
    //
    state_error_notify = {
        name: "error_notify",
        enter: function (promise) {
            promise.done = ErrorPromise.prototype.done;
            promise.then = ErrorPromise.prototype.then;
            if (promise._listeners) {
                var queue = [promise];
                var p;
                while (queue.length) {
                    p = queue.shift();
                    p._state._notify(p, queue);
                }
            }
            promise._setState(state_error);
        },
        cancel: _,
        done: null, /*error to get here*/
        then: null, /*error to get here*/
        _completed: _,
        _error: _,
        _notify: notifyError,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Error state, moves a promise to the error state and does NOT notify any children.
    // Some upstream promise is owning the notification pass.
    //
    state_error = {
        name: "error",
        enter: function (promise) {
            promise.done = ErrorPromise.prototype.done;
            promise.then = ErrorPromise.prototype.then;
            promise._cleanupAction();
        },
        cancel: _,
        done: null, /*error to get here*/
        then: null, /*error to get here*/
        _completed: _,
        _error: _,
        _notify: notifyError,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    //
    // The statemachine implementation follows a very particular pattern, the states are specified
    // as static stateless bags of functions which are then indirected through the state machine
    // instance (a Promise). As such all of the functions on each state have the promise instance
    // passed to them explicitly as a parameter and the Promise instance members do a little
    // dance where they indirect through the state and insert themselves in the argument list.
    //
    // We could instead call directly through the promise states however then every caller
    // would have to remember to do things like pumping the state machine to catch state transitions.
    //

    var PromiseStateMachine = _Base.Class.define(null, {
        _listeners: null,
        _nextState: null,
        _state: null,
        _value: null,

        cancel: function () {
            /// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
            /// <summary locid="WinJS.PromiseStateMachine.cancel">
            /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
            /// already been fulfilled and cancellation is supported, the promise enters
            /// the error state with a value of Error("Canceled").
            /// </summary>
            /// </signature>
            this._state.cancel(this);
            this._run();
        },
        done: function Promise_done(onComplete, onError, onProgress) {
            /// <signature helpKeyword="WinJS.PromiseStateMachine.done">
            /// <summary locid="WinJS.PromiseStateMachine.done">
            /// Allows you to specify the work to be done on the fulfillment of the promised value,
            /// the error handling to be performed if the promise fails to fulfill
            /// a value, and the handling of progress notifications along the way.
            ///
            /// After the handlers have finished executing, this function throws any error that would have been returned
            /// from then() as a promise in the error state.
            /// </summary>
            /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
            /// The function to be called if the promise is fulfilled successfully with a value.
            /// The fulfilled value is passed as the single argument. If the value is null,
            /// the fulfilled value is returned. The value returned
            /// from the function becomes the fulfilled value of the promise returned by
            /// then(). If an exception is thrown while executing the function, the promise returned
            /// by then() moves into the error state.
            /// </param>
            /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
            /// The function to be called if the promise is fulfilled with an error. The error
            /// is passed as the single argument. If it is null, the error is forwarded.
            /// The value returned from the function is the fulfilled value of the promise returned by then().
            /// </param>
            /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
            /// the function to be called if the promise reports progress. Data about the progress
            /// is passed as the single argument. Promises are not required to support
            /// progress.
            /// </param>
            /// </signature>
            this._state.done(this, onComplete, onError, onProgress);
        },
        then: function Promise_then(onComplete, onError, onProgress) {
            /// <signature helpKeyword="WinJS.PromiseStateMachine.then">
            /// <summary locid="WinJS.PromiseStateMachine.then">
            /// Allows you to specify the work to be done on the fulfillment of the promised value,
            /// the error handling to be performed if the promise fails to fulfill
            /// a value, and the handling of progress notifications along the way.
            /// </summary>
            /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
            /// The function to be called if the promise is fulfilled successfully with a value.
            /// The value is passed as the single argument. If the value is null, the value is returned.
            /// The value returned from the function becomes the fulfilled value of the promise returned by
            /// then(). If an exception is thrown while this function is being executed, the promise returned
            /// by then() moves into the error state.
            /// </param>
            /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
            /// The function to be called if the promise is fulfilled with an error. The error
            /// is passed as the single argument. If it is null, the error is forwarded.
            /// The value returned from the function becomes the fulfilled value of the promise returned by then().
            /// </param>
            /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
            /// The function to be called if the promise reports progress. Data about the progress
            /// is passed as the single argument. Promises are not required to support
            /// progress.
            /// </param>
            /// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
            /// The promise whose value is the result of executing the complete or
            /// error function.
            /// </returns>
            /// </signature>
            return this._state.then(this, onComplete, onError, onProgress);
        },

        _chainedError: function (value, context) {
            var result = this._state._error(this, value, detailsForChainedError, context);
            this._run();
            return result;
        },
        _completed: function (value) {
            var result = this._state._completed(this, value);
            this._run();
            return result;
        },
        _error: function (value) {
            var result = this._state._error(this, value, detailsForError);
            this._run();
            return result;
        },
        _progress: function (value) {
            this._state._progress(this, value);
        },
        _setState: function (state) {
            this._nextState = state;
        },
        _setCompleteValue: function (value) {
            this._state._setCompleteValue(this, value);
            this._run();
        },
        _setChainedErrorValue: function (value, context) {
            var result = this._state._setErrorValue(this, value, detailsForChainedError, context);
            this._run();
            return result;
        },
        _setExceptionValue: function (value) {
            var result = this._state._setErrorValue(this, value, detailsForException);
            this._run();
            return result;
        },
        _run: function () {
            while (this._nextState) {
                this._state = this._nextState;
                this._nextState = null;
                this._state.enter(this);
            }
        }
    }, {
        supportedForProcessing: false
    });

    //
    // Implementations of shared state machine code.
    //

    function completed(promise, value) {
        var targetState;
        if (value && typeof value === "object" && typeof value.then === "function") {
            targetState = state_waiting;
        } else {
            targetState = state_success_notify;
        }
        promise._value = value;
        promise._setState(targetState);
    }
    function createErrorDetails(exception, error, promise, id, parent, handler) {
        return {
            exception: exception,
            error: error,
            promise: promise,
            handler: handler,
            id: id,
            parent: parent
        };
    }
    function detailsForHandledError(promise, errorValue, context, handler) {
        var exception = context._isException;
        var errorId = context._errorId;
        return createErrorDetails(
            exception ? errorValue : null,
            exception ? null : errorValue,
            promise,
            errorId,
            context,
            handler
        );
    }
    function detailsForChainedError(promise, errorValue, context) {
        var exception = context._isException;
        var errorId = context._errorId;
        setErrorInfo(promise, errorId, exception);
        return createErrorDetails(
            exception ? errorValue : null,
            exception ? null : errorValue,
            promise,
            errorId,
            context
        );
    }
    function detailsForError(promise, errorValue) {
        var errorId = ++error_number;
        setErrorInfo(promise, errorId);
        return createErrorDetails(
            null,
            errorValue,
            promise,
            errorId
        );
    }
    function detailsForException(promise, exceptionValue) {
        var errorId = ++error_number;
        setErrorInfo(promise, errorId, true);
        return createErrorDetails(
            exceptionValue,
            null,
            promise,
            errorId
        );
    }
    function done(promise, onComplete, onError, onProgress) {
        var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.done");
        pushListener(promise, { c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
    }
    function error(promise, value, onerrorDetails, context) {
        promise._value = value;
        callonerror(promise, value, onerrorDetails, context);
        promise._setState(state_error_notify);
    }
    function notifySuccess(promise, queue) {
        var value = promise._value;
        var listeners = promise._listeners;
        if (!listeners) {
            return;
        }
        promise._listeners = null;
        var i, len;
        for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
            var listener = len === 1 ? listeners : listeners[i];
            var onComplete = listener.c;
            var target = listener.promise;

            _Trace._traceAsyncOperationCompleted(listener.asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_SUCCESS);

            if (target) {
                _Trace._traceAsyncCallbackStarting(listener.asyncOpID);
                try {
                    target._setCompleteValue(onComplete ? onComplete(value) : value);
                } catch (ex) {
                    target._setExceptionValue(ex);
                } finally {
                    _Trace._traceAsyncCallbackCompleted();
                }
                if (target._state !== state_waiting && target._listeners) {
                    queue.push(target);
                }
            } else {
                CompletePromise.prototype.done.call(promise, onComplete);
            }
        }
    }
    function notifyError(promise, queue) {
        var value = promise._value;
        var listeners = promise._listeners;
        if (!listeners) {
            return;
        }
        promise._listeners = null;
        var i, len;
        for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
            var listener = len === 1 ? listeners : listeners[i];
            var onError = listener.e;
            var target = listener.promise;

            var errorID = _Global.Debug && (value && value.name === canceledName ? _Global.Debug.MS_ASYNC_OP_STATUS_CANCELED : _Global.Debug.MS_ASYNC_OP_STATUS_ERROR);
            _Trace._traceAsyncOperationCompleted(listener.asyncOpID, errorID);

            if (target) {
                var asyncCallbackStarted = false;
                try {
                    if (onError) {
                        _Trace._traceAsyncCallbackStarting(listener.asyncOpID);
                        asyncCallbackStarted = true;
                        if (!onError.handlesOnError) {
                            callonerror(target, value, detailsForHandledError, promise, onError);
                        }
                        target._setCompleteValue(onError(value));
                    } else {
                        target._setChainedErrorValue(value, promise);
                    }
                } catch (ex) {
                    target._setExceptionValue(ex);
                } finally {
                    if (asyncCallbackStarted) {
                        _Trace._traceAsyncCallbackCompleted();
                    }
                }
                if (target._state !== state_waiting && target._listeners) {
                    queue.push(target);
                }
            } else {
                ErrorPromise.prototype.done.call(promise, null, onError);
            }
        }
    }
    function callonerror(promise, value, onerrorDetailsGenerator, context, handler) {
        if (promiseEventListeners._listeners[errorET]) {
            if (value instanceof Error && value.message === canceledName) {
                return;
            }
            promiseEventListeners.dispatchEvent(errorET, onerrorDetailsGenerator(promise, value, context, handler));
        }
    }
    function progress(promise, value) {
        var listeners = promise._listeners;
        if (listeners) {
            var i, len;
            for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
                var listener = len === 1 ? listeners : listeners[i];
                var onProgress = listener.p;
                if (onProgress) {
                    try { onProgress(value); } catch (ex) { }
                }
                if (!(listener.c || listener.e) && listener.promise) {
                    listener.promise._progress(value);
                }
            }
        }
    }
    function pushListener(promise, listener) {
        var listeners = promise._listeners;
        if (listeners) {
            // We may have either a single listener (which will never be wrapped in an array)
            // or 2+ listeners (which will be wrapped). Since we are now adding one more listener
            // we may have to wrap the single listener before adding the second.
            listeners = Array.isArray(listeners) ? listeners : [listeners];
            listeners.push(listener);
        } else {
            listeners = listener;
        }
        promise._listeners = listeners;
    }
    // The difference beween setCompleteValue()/setErrorValue() and complete()/error() is that setXXXValue() moves
    // a promise directly to the success/error state without starting another notification pass (because one
    // is already ongoing).
    function setErrorInfo(promise, errorId, isException) {
        promise._isException = isException || false;
        promise._errorId = errorId;
    }
    function setErrorValue(promise, value, onerrorDetails, context) {
        promise._value = value;
        callonerror(promise, value, onerrorDetails, context);
        promise._setState(state_error);
    }
    function setCompleteValue(promise, value) {
        var targetState;
        if (value && typeof value === "object" && typeof value.then === "function") {
            targetState = state_waiting;
        } else {
            targetState = state_success;
        }
        promise._value = value;
        promise._setState(targetState);
    }
    function then(promise, onComplete, onError, onProgress) {
        var result = new ThenPromise(promise);
        var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.then");
        pushListener(promise, { promise: result, c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
        return result;
    }

    //
    // Internal implementation detail promise, ThenPromise is created when a promise needs
    // to be returned from a then() method.
    //
    var ThenPromise = _Base.Class.derive(PromiseStateMachine,
        function (creator) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.thenPromise))) {
                this._stack = Promise._getStack();
            }

            this._creator = creator;
            this._setState(state_created);
            this._run();
        }, {
            _creator: null,

            _cancelAction: function () { if (this._creator) { this._creator.cancel(); } },
            _cleanupAction: function () { this._creator = null; }
        }, {
            supportedForProcessing: false
        }
    );

    //
    // Slim promise implementations for already completed promises, these are created
    // under the hood on synchronous completion paths as well as by WinJS.Promise.wrap
    // and WinJS.Promise.wrapError.
    //

    var ErrorPromise = _Base.Class.define(
        function ErrorPromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.errorPromise))) {
                this._stack = Promise._getStack();
            }

            this._value = value;
            callonerror(this, value, detailsForError);
        }, {
            cancel: function () {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
                /// <summary locid="WinJS.PromiseStateMachine.cancel">
                /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
                /// already been fulfilled and cancellation is supported, the promise enters
                /// the error state with a value of Error("Canceled").
                /// </summary>
                /// </signature>
            },
            done: function ErrorPromise_done(unused, onError) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.done">
                /// <summary locid="WinJS.PromiseStateMachine.done">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                ///
                /// After the handlers have finished executing, this function throws any error that would have been returned
                /// from then() as a promise in the error state.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The fulfilled value is passed as the single argument. If the value is null,
                /// the fulfilled value is returned. The value returned
                /// from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while executing the function, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function is the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
                /// the function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// </signature>
                var value = this._value;
                if (onError) {
                    try {
                        if (!onError.handlesOnError) {
                            callonerror(null, value, detailsForHandledError, this, onError);
                        }
                        var result = onError(value);
                        if (result && typeof result === "object" && typeof result.done === "function") {
                            // If a promise is returned we need to wait on it.
                            result.done();
                        }
                        return;
                    } catch (ex) {
                        value = ex;
                    }
                }
                if (value instanceof Error && value.message === canceledName) {
                    // suppress cancel
                    return;
                }
                // force the exception to be thrown asyncronously to avoid any try/catch blocks
                //
                Promise._doneHandler(value);
            },
            then: function ErrorPromise_then(unused, onError) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.then">
                /// <summary locid="WinJS.PromiseStateMachine.then">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The value is passed as the single argument. If the value is null, the value is returned.
                /// The value returned from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while this function is being executed, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function becomes the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
                /// The promise whose value is the result of executing the complete or
                /// error function.
                /// </returns>
                /// </signature>

                // If the promise is already in a error state and no error handler is provided
                // we optimize by simply returning the promise instead of creating a new one.
                //
                if (!onError) { return this; }
                var result;
                var value = this._value;
                try {
                    if (!onError.handlesOnError) {
                        callonerror(null, value, detailsForHandledError, this, onError);
                    }
                    result = new CompletePromise(onError(value));
                } catch (ex) {
                    // If the value throw from the error handler is the same as the value
                    // provided to the error handler then there is no need for a new promise.
                    //
                    if (ex === value) {
                        result = this;
                    } else {
                        result = new ExceptionPromise(ex);
                    }
                }
                return result;
            }
        }, {
            supportedForProcessing: false
        }
    );

    var ExceptionPromise = _Base.Class.derive(ErrorPromise,
        function ExceptionPromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.exceptionPromise))) {
                this._stack = Promise._getStack();
            }

            this._value = value;
            callonerror(this, value, detailsForException);
        }, {
            /* empty */
        }, {
            supportedForProcessing: false
        }
    );

    var CompletePromise = _Base.Class.define(
        function CompletePromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.completePromise))) {
                this._stack = Promise._getStack();
            }

            if (value && typeof value === "object" && typeof value.then === "function") {
                var result = new ThenPromise(null);
                result._setCompleteValue(value);
                return result;
            }
            this._value = value;
        }, {
            cancel: function () {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
                /// <summary locid="WinJS.PromiseStateMachine.cancel">
                /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
                /// already been fulfilled and cancellation is supported, the promise enters
                /// the error state with a value of Error("Canceled").
                /// </summary>
                /// </signature>
            },
            done: function CompletePromise_done(onComplete) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.done">
                /// <summary locid="WinJS.PromiseStateMachine.done">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                ///
                /// After the handlers have finished executing, this function throws any error that would have been returned
                /// from then() as a promise in the error state.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The fulfilled value is passed as the single argument. If the value is null,
                /// the fulfilled value is returned. The value returned
                /// from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while executing the function, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function is the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
                /// the function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// </signature>
                if (!onComplete) { return; }
                try {
                    var result = onComplete(this._value);
                    if (result && typeof result === "object" && typeof result.done === "function") {
                        result.done();
                    }
                } catch (ex) {
                    // force the exception to be thrown asynchronously to avoid any try/catch blocks
                    Promise._doneHandler(ex);
                }
            },
            then: function CompletePromise_then(onComplete) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.then">
                /// <summary locid="WinJS.PromiseStateMachine.then">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The value is passed as the single argument. If the value is null, the value is returned.
                /// The value returned from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while this function is being executed, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function becomes the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
                /// The promise whose value is the result of executing the complete or
                /// error function.
                /// </returns>
                /// </signature>
                try {
                    // If the value returned from the completion handler is the same as the value
                    // provided to the completion handler then there is no need for a new promise.
                    //
                    var newValue = onComplete ? onComplete(this._value) : this._value;
                    return newValue === this._value ? this : new CompletePromise(newValue);
                } catch (ex) {
                    return new ExceptionPromise(ex);
                }
            }
        }, {
            supportedForProcessing: false
        }
    );

    //
    // Promise is the user-creatable WinJS.Promise object.
    //

    function timeout(timeoutMS) {
        var id;
        return new Promise(
            function (c) {
                if (timeoutMS) {
                    id = _Global.setTimeout(c, timeoutMS);
                } else {
                    _BaseCoreUtils._setImmediate(c);
                }
            },
            function () {
                if (id) {
                    _Global.clearTimeout(id);
                }
            }
        );
    }

    function timeoutWithPromise(timeout, promise) {
        var cancelPromise = function () { promise.cancel(); };
        var cancelTimeout = function () { timeout.cancel(); };
        timeout.then(cancelPromise);
        promise.then(cancelTimeout, cancelTimeout);
        return promise;
    }

    var staticCanceledPromise;

    var Promise = _Base.Class.derive(PromiseStateMachine,
        function Promise_ctor(init, oncancel) {
            /// <signature helpKeyword="WinJS.Promise">
            /// <summary locid="WinJS.Promise">
            /// A promise provides a mechanism to schedule work to be done on a value that
            /// has not yet been computed. It is a convenient abstraction for managing
            /// interactions with asynchronous APIs.
            /// </summary>
            /// <param name="init" type="Function" locid="WinJS.Promise_p:init">
            /// The function that is called during construction of the  promise. The function
            /// is given three arguments (complete, error, progress). Inside this function
            /// you should add event listeners for the notifications supported by this value.
            /// </param>
            /// <param name="oncancel" optional="true" locid="WinJS.Promise_p:oncancel">
            /// The function to call if a consumer of this promise wants
            /// to cancel its undone work. Promises are not required to
            /// support cancellation.
            /// </param>
            /// </signature>

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.promise))) {
                this._stack = Promise._getStack();
            }

            this._oncancel = oncancel;
            this._setState(state_created);
            this._run();

            try {
                var complete = this._completed.bind(this);
                var error = this._error.bind(this);
                var progress = this._progress.bind(this);
                init(complete, error, progress);
            } catch (ex) {
                this._setExceptionValue(ex);
            }
        }, {
            _oncancel: null,

            _cancelAction: function () {
                if (this._oncancel) {
                    try { this._oncancel(); } catch (ex) { }
                }
            },
            _cleanupAction: function () { this._oncancel = null; }
        }, {

            addEventListener: function Promise_addEventListener(eventType, listener, capture) {
                /// <signature helpKeyword="WinJS.Promise.addEventListener">
                /// <summary locid="WinJS.Promise.addEventListener">
                /// Adds an event listener to the control.
                /// </summary>
                /// <param name="eventType" locid="WinJS.Promise.addEventListener_p:eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name="listener" locid="WinJS.Promise.addEventListener_p:listener">
                /// The listener to invoke when the event is raised.
                /// </param>
                /// <param name="capture" locid="WinJS.Promise.addEventListener_p:capture">
                /// Specifies whether or not to initiate capture.
                /// </param>
                /// </signature>
                promiseEventListeners.addEventListener(eventType, listener, capture);
            },
            any: function Promise_any(values) {
                /// <signature helpKeyword="WinJS.Promise.any">
                /// <summary locid="WinJS.Promise.any">
                /// Returns a promise that is fulfilled when one of the input promises
                /// has been fulfilled.
                /// </summary>
                /// <param name="values" type="Array" locid="WinJS.Promise.any_p:values">
                /// An array that contains promise objects or objects whose property
                /// values include promise objects.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.any_returnValue">
                /// A promise that on fulfillment yields the value of the input (complete or error).
                /// </returns>
                /// </signature>
                return new Promise(
                    function (complete, error) {
                        var keys = Object.keys(values);
                        if (keys.length === 0) {
                            complete();
                        }
                        var canceled = 0;
                        keys.forEach(function (key) {
                            Promise.as(values[key]).then(
                                function () { complete({ key: key, value: values[key] }); },
                                function (e) {
                                    if (e instanceof Error && e.name === canceledName) {
                                        if ((++canceled) === keys.length) {
                                            complete(Promise.cancel);
                                        }
                                        return;
                                    }
                                    error({ key: key, value: values[key] });
                                }
                            );
                        });
                    },
                    function () {
                        var keys = Object.keys(values);
                        keys.forEach(function (key) {
                            var promise = Promise.as(values[key]);
                            if (typeof promise.cancel === "function") {
                                promise.cancel();
                            }
                        });
                    }
                );
            },
            as: function Promise_as(value) {
                /// <signature helpKeyword="WinJS.Promise.as">
                /// <summary locid="WinJS.Promise.as">
                /// Returns a promise. If the object is already a promise it is returned;
                /// otherwise the object is wrapped in a promise.
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.as_p:value">
                /// The value to be treated as a promise.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.as_returnValue">
                /// A promise.
                /// </returns>
                /// </signature>
                if (value && typeof value === "object" && typeof value.then === "function") {
                    return value;
                }
                return new CompletePromise(value);
            },
            /// <field type="WinJS.Promise" helpKeyword="WinJS.Promise.cancel" locid="WinJS.Promise.cancel">
            /// Canceled promise value, can be returned from a promise completion handler
            /// to indicate cancelation of the promise chain.
            /// </field>
            cancel: {
                get: function () {
                    return (staticCanceledPromise = staticCanceledPromise || new ErrorPromise(new _ErrorFromName(canceledName)));
                }
            },
            dispatchEvent: function Promise_dispatchEvent(eventType, details) {
                /// <signature helpKeyword="WinJS.Promise.dispatchEvent">
                /// <summary locid="WinJS.Promise.dispatchEvent">
                /// Raises an event of the specified type and properties.
                /// </summary>
                /// <param name="eventType" locid="WinJS.Promise.dispatchEvent_p:eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name="details" locid="WinJS.Promise.dispatchEvent_p:details">
                /// The set of additional properties to be attached to the event object.
                /// </param>
                /// <returns type="Boolean" locid="WinJS.Promise.dispatchEvent_returnValue">
                /// Specifies whether preventDefault was called on the event.
                /// </returns>
                /// </signature>
                return promiseEventListeners.dispatchEvent(eventType, details);
            },
            is: function Promise_is(value) {
                /// <signature helpKeyword="WinJS.Promise.is">
                /// <summary locid="WinJS.Promise.is">
                /// Determines whether a value fulfills the promise contract.
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.is_p:value">
                /// A value that may be a promise.
                /// </param>
                /// <returns type="Boolean" locid="WinJS.Promise.is_returnValue">
                /// true if the specified value is a promise, otherwise false.
                /// </returns>
                /// </signature>
                return value && typeof value === "object" && typeof value.then === "function";
            },
            join: function Promise_join(values) {
                /// <signature helpKeyword="WinJS.Promise.join">
                /// <summary locid="WinJS.Promise.join">
                /// Creates a promise that is fulfilled when all the values are fulfilled.
                /// </summary>
                /// <param name="values" type="Object" locid="WinJS.Promise.join_p:values">
                /// An object whose fields contain values, some of which may be promises.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.join_returnValue">
                /// A promise whose value is an object with the same field names as those of the object in the values parameter, where
                /// each field value is the fulfilled value of a promise.
                /// </returns>
                /// </signature>
                return new Promise(
                    function (complete, error, progress) {
                        var keys = Object.keys(values);
                        var errors = Array.isArray(values) ? [] : {};
                        var results = Array.isArray(values) ? [] : {};
                        var undefineds = 0;
                        var pending = keys.length;
                        var argDone = function (key) {
                            if ((--pending) === 0) {
                                var errorCount = Object.keys(errors).length;
                                if (errorCount === 0) {
                                    complete(results);
                                } else {
                                    var canceledCount = 0;
                                    keys.forEach(function (key) {
                                        var e = errors[key];
                                        if (e instanceof Error && e.name === canceledName) {
                                            canceledCount++;
                                        }
                                    });
                                    if (canceledCount === errorCount) {
                                        complete(Promise.cancel);
                                    } else {
                                        error(errors);
                                    }
                                }
                            } else {
                                progress({ Key: key, Done: true });
                            }
                        };
                        keys.forEach(function (key) {
                            var value = values[key];
                            if (value === undefined) {
                                undefineds++;
                            } else {
                                Promise.then(value,
                                    function (value) { results[key] = value; argDone(key); },
                                    function (value) { errors[key] = value; argDone(key); }
                                );
                            }
                        });
                        pending -= undefineds;
                        if (pending === 0) {
                            complete(results);
                            return;
                        }
                    },
                    function () {
                        Object.keys(values).forEach(function (key) {
                            var promise = Promise.as(values[key]);
                            if (typeof promise.cancel === "function") {
                                promise.cancel();
                            }
                        });
                    }
                );
            },
            removeEventListener: function Promise_removeEventListener(eventType, listener, capture) {
                /// <signature helpKeyword="WinJS.Promise.removeEventListener">
                /// <summary locid="WinJS.Promise.removeEventListener">
                /// Removes an event listener from the control.
                /// </summary>
                /// <param name='eventType' locid="WinJS.Promise.removeEventListener_eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name='listener' locid="WinJS.Promise.removeEventListener_listener">
                /// The listener to remove.
                /// </param>
                /// <param name='capture' locid="WinJS.Promise.removeEventListener_capture">
                /// Specifies whether or not to initiate capture.
                /// </param>
                /// </signature>
                promiseEventListeners.removeEventListener(eventType, listener, capture);
            },
            supportedForProcessing: false,
            then: function Promise_then(value, onComplete, onError, onProgress) {
                /// <signature helpKeyword="WinJS.Promise.then">
                /// <summary locid="WinJS.Promise.then">
                /// A static version of the promise instance method then().
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.then_p:value">
                /// the value to be treated as a promise.
                /// </param>
                /// <param name="onComplete" type="Function" locid="WinJS.Promise.then_p:complete">
                /// The function to be called if the promise is fulfilled with a value.
                /// If it is null, the promise simply
                /// returns the value. The value is passed as the single argument.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.then_p:error">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument.
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.then_p:progress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.then_returnValue">
                /// A promise whose value is the result of executing the provided complete function.
                /// </returns>
                /// </signature>
                return Promise.as(value).then(onComplete, onError, onProgress);
            },
            thenEach: function Promise_thenEach(values, onComplete, onError, onProgress) {
                /// <signature helpKeyword="WinJS.Promise.thenEach">
                /// <summary locid="WinJS.Promise.thenEach">
                /// Performs an operation on all the input promises and returns a promise
                /// that has the shape of the input and contains the result of the operation
                /// that has been performed on each input.
                /// </summary>
                /// <param name="values" locid="WinJS.Promise.thenEach_p:values">
                /// A set of values (which could be either an array or an object) of which some or all are promises.
                /// </param>
                /// <param name="onComplete" type="Function" locid="WinJS.Promise.thenEach_p:complete">
                /// The function to be called if the promise is fulfilled with a value.
                /// If the value is null, the promise returns the value.
                /// The value is passed as the single argument.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:error">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument.
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:progress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.thenEach_returnValue">
                /// A promise that is the result of calling Promise.join on the values parameter.
                /// </returns>
                /// </signature>
                var result = Array.isArray(values) ? [] : {};
                Object.keys(values).forEach(function (key) {
                    result[key] = Promise.as(values[key]).then(onComplete, onError, onProgress);
                });
                return Promise.join(result);
            },
            timeout: function Promise_timeout(time, promise) {
                /// <signature helpKeyword="WinJS.Promise.timeout">
                /// <summary locid="WinJS.Promise.timeout">
                /// Creates a promise that is fulfilled after a timeout.
                /// </summary>
                /// <param name="timeout" type="Number" optional="true" locid="WinJS.Promise.timeout_p:timeout">
                /// The timeout period in milliseconds. If this value is zero or not specified
                /// setImmediate is called, otherwise setTimeout is called.
                /// </param>
                /// <param name="promise" type="Promise" optional="true" locid="WinJS.Promise.timeout_p:promise">
                /// A promise that will be canceled if it doesn't complete before the
                /// timeout has expired.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.timeout_returnValue">
                /// A promise that is completed asynchronously after the specified timeout.
                /// </returns>
                /// </signature>
                var to = timeout(time);
                return promise ? timeoutWithPromise(to, promise) : to;
            },
            wrap: function Promise_wrap(value) {
                /// <signature helpKeyword="WinJS.Promise.wrap">
                /// <summary locid="WinJS.Promise.wrap">
                /// Wraps a non-promise value in a promise. You can use this function if you need
                /// to pass a value to a function that requires a promise.
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.wrap_p:value">
                /// Some non-promise value to be wrapped in a promise.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.wrap_returnValue">
                /// A promise that is successfully fulfilled with the specified value
                /// </returns>
                /// </signature>
                return new CompletePromise(value);
            },
            wrapError: function Promise_wrapError(error) {
                /// <signature helpKeyword="WinJS.Promise.wrapError">
                /// <summary locid="WinJS.Promise.wrapError">
                /// Wraps a non-promise error value in a promise. You can use this function if you need
                /// to pass an error to a function that requires a promise.
                /// </summary>
                /// <param name="error" locid="WinJS.Promise.wrapError_p:error">
                /// A non-promise error value to be wrapped in a promise.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.wrapError_returnValue">
                /// A promise that is in an error state with the specified value.
                /// </returns>
                /// </signature>
                return new ErrorPromise(error);
            },

            _veryExpensiveTagWithStack: {
                get: function () { return tagWithStack; },
                set: function (value) { tagWithStack = value; }
            },
            _veryExpensiveTagWithStack_tag: tag,
            _getStack: function () {
                if (_Global.Debug && _Global.Debug.debuggerEnabled) {
                    try { throw new Error(); } catch (e) { return e.stack; }
                }
            },

            _cancelBlocker: function Promise__cancelBlocker(input) {
                //
                // Returns a promise which on cancelation will still result in downstream cancelation while
                //  protecting the promise 'input' from being  canceled which has the effect of allowing
                //  'input' to be shared amoung various consumers.
                //
                if (!Promise.is(input)) {
                    return Promise.wrap(input);
                }
                var complete;
                var error;
                var output = new Promise(
                    function (c, e) {
                        complete = c;
                        error = e;
                    },
                    function () {
                        complete = null;
                        error = null;
                    }
                );
                input.then(
                    function (v) { complete && complete(v); },
                    function (e) { error && error(e); }
                );
                return output;
            },

        }
    );
    Object.defineProperties(Promise, _Events.createEventProperties(errorET));

    Promise._doneHandler = function (value) {
        _BaseCoreUtils._setImmediate(function Promise_done_rethrow() {
            throw value;
        });
    };

    return {
        PromiseStateMachine: PromiseStateMachine,
        Promise: Promise,
        state_created: state_created
    };
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Promise',[
    './Core/_Base',
    './Promise/_StateMachine'
    ], function promiseInit( _Base, _StateMachine) {
    "use strict";

    _Base.Namespace.define("WinJS", {
        Promise: _StateMachine.Promise
    });

    return _StateMachine.Promise;
});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Scheduler',[
    'exports',
    './Core/_Global',
    './Core/_Base',
    './Core/_ErrorFromName',
    './Core/_Log',
    './Core/_Resources',
    './Core/_Trace',
    './Core/_WriteProfilerMark',
    './Promise'
    ], function schedulerInit(exports, _Global, _Base, _ErrorFromName, _Log, _Resources, _Trace, _WriteProfilerMark, Promise) {
    "use strict";

    function linkedListMixin(name) {
        var mixin = {};
        var PREV = "_prev" + name;
        var NEXT = "_next" + name;
        mixin["_remove" + name] = function () {
            // Assumes we always have a static head and tail.
            //
            var prev = this[PREV];
            var next = this[NEXT];
            // PREV <-> NEXT
            //
            next && (next[PREV] = prev);
            prev && (prev[NEXT] = next);
            // null <- this -> null
            //
            this[PREV] = null;
            this[NEXT] = null;
        };
        mixin["_insert" + name + "Before"] = function (node) {
            var prev = this[PREV];
            // PREV -> node -> this
            //
            prev && (prev[NEXT] = node);
            node[NEXT] = this;
            // PREV <- node <- this
            //
            node[PREV] = prev;
            this[PREV] = node;

            return node;
        };
        mixin["_insert" + name + "After"] = function (node) {
            var next = this[NEXT];
            // this -> node -> NEXT
            //
            this[NEXT] = node;
            node[NEXT] = next;
            // this <- node <- NEXT
            //
            node[PREV] = this;
            next && (next[PREV] = node);

            return node;
        };
        return mixin;
    }

    _Base.Namespace.define("WinJS.Utilities", {

        _linkedListMixin: linkedListMixin

    });

    var strings = {
        get jobInfoIsNoLongerValid() { return "The job info object can only be used while the job is running"; }
    };

    //
    // Profiler mark helpers
    //
    // markerType must be one of the following: info, StartTM, StopTM
    //

    function profilerMarkArgs(arg0, arg1, arg2) {
        if (arg2 !== undefined) {
            return "(" + arg0 + ";" + arg1 + ";" + arg2 + ")";
        } else if (arg1 !== undefined) {
            return "(" + arg0 + ";" + arg1 + ")";
        } else if (arg0 !== undefined) {
            return "(" + arg0 + ")";
        } else {
            return "";
        }
    }

    function schedulerProfilerMark(operation, markerType, arg0, arg1) {
        _WriteProfilerMark(
            "WinJS.Scheduler:" + operation +
            profilerMarkArgs(arg0, arg1) +
            "," + markerType
        );
    }

    function jobProfilerMark(job, operation, markerType, arg0, arg1) {
        var argProvided = job.name || arg0 !== undefined || arg1 !== undefined;

        _WriteProfilerMark(
            "WinJS.Scheduler:" + operation + ":" + job.id +
            (argProvided ? profilerMarkArgs(job.name, arg0, arg1) : "") +
            "," + markerType
        );
    }

    //
    // Job type. This cannot be instantiated by developers and is instead handed back by the scheduler
    //  schedule method. Its public interface is what is used when interacting with a job.
    //

    var JobNode = _Base.Class.define(function (id, work, priority, context, name, asyncOpID) {
        this._id = id;
        this._work = work;
        this._context = context;
        this._name = name;
        this._asyncOpID = asyncOpID;
        this._setPriority(priority);
        this._setState(state_created);
        jobProfilerMark(this, "job-scheduled", "info");
    }, {

        /// <field type="Boolean" locid="WinJS.Utilities.Scheduler._JobNode.completed" helpKeyword="WinJS.Utilities.Scheduler._JobNode.completed">
        /// Gets a value that indicates whether the job has completed. This value is true if job has run to completion
        /// and false if it hasn't yet run or was canceled.
        /// </field>
        completed: {
            get: function () { return !!this._state.completed; }
        },

        /// <field type="Number" locid="WinJS.Utilities.Scheduler._JobNode.id" helpKeyword="WinJS.Utilities.Scheduler._JobNode.id">
        /// Gets the unique identifier for this job.
        /// </field>
        id: {
            get: function () { return this._id; }
        },

        /// <field type="String" locid="WinJS.Utilities.Scheduler._JobNode.name" helpKeyword="WinJS.Utilities.Scheduler._JobNode.name">
        /// Gets or sets a string that specifies the diagnostic name for this job.
        /// </field>
        name: {
            get: function () { return this._name; },
            set: function (value) { this._name = value; }
        },

        /// <field type="WinJS.Utilities.Scheduler._OwnerToken" locid="WinJS.Utilities.Scheduler._JobNode.owner" helpKeyword="WinJS.Utilities.Scheduler._JobNode.owner">
        /// Gets an owner token for the job. You can use this owner token's cancelAll method to cancel related jobs.
        /// </field>
        owner: {
            get: function () { return this._owner; },
            set: function (value) {
                this._owner && this._owner._remove(this);
                this._owner = value;
                this._owner && this._owner._add(this);
            }
        },

        /// <field type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler._JobNode.priority" helpKeyword="WinJS.Utilities.Scheduler._JobNode.priority">
        /// Gets or sets the priority at which this job is executed by the scheduler.
        /// </field>
        priority: {
            get: function () { return this._priority; },
            set: function (value) {
                value = clampPriority(value);
                this._state.setPriority(this, value);
            }
        },

        cancel: function () {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobNode.cancel">
            /// <summary locid="WinJS.Utilities.Scheduler._JobNode.cancel">Cancels the job.</summary>
            /// </signature>
            this._state.cancel(this);
        },

        pause: function () {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobNode.pause">
            /// <summary locid="WinJS.Utilities.Scheduler._JobNode.pause">Pauses the job.</summary>
            /// </signature>
            this._state.pause(this);
        },

        resume: function () {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobNode.resume">
            /// <summary locid="WinJS.Utilities.Scheduler._JobNode.resume">Resumes the job if it's been paused.</summary>
            /// </signature>
            this._state.resume(this);
        },

        _execute: function (shouldYield) {
            this._state.execute(this, shouldYield);
        },

        _executeDone: function (result) {
            return this._state.executeDone(this, result);
        },

        _blockedDone: function (result) {
            return this._state.blockedDone(this, result);
        },

        _setPriority: function (value) {
            if (+this._priority === this._priority && this._priority !== value) {
                jobProfilerMark(this, "job-priority-changed", "info",
                    markerFromPriority(this._priority).name,
                    markerFromPriority(value).name);
            }
            this._priority = value;
        },

        _setState: function (state, arg0, arg1) {
            if (this._state) {
                _Log.log && _Log.log("Transitioning job (" + this.id + ") from: " + this._state.name + " to: " + state.name, "winjs scheduler", "log");
            }
            this._state = state;
            this._state.enter(this, arg0, arg1);
        },

    });
    _Base.Class.mix(JobNode, linkedListMixin("Job"));

    var YieldPolicy = {
        complete: 1,
        continue: 2,
        block: 3,
    };

    //
    // JobInfo object is passed to a work item when it is executed and allows the work to ask whether it
    //  should cooperatively yield and in that event provide a continuation work function to run the
    //  next time this job is scheduled. The JobInfo object additionally allows access to the job itself
    //  and the ability to provide a Promise for a future continuation work function in order to have
    //  jobs easily block on async work.
    //

    var JobInfo = _Base.Class.define(function (shouldYield, job) {
        this._job = job;
        this._result = null;
        this._yieldPolicy = YieldPolicy.complete;
        this._shouldYield = shouldYield;
    }, {

        /// <field type="WinJS.Utilities.Scheduler._JobNode" locid="WinJS.Utilities.Scheduler._JobInfo.job" helpKeyword="WinJS.Utilities.Scheduler._JobInfo.job">
        /// The job instance for which the work is currently being executed.
        /// </field>
        job: {
            get: function () {
                this._throwIfDisabled();
                return this._job;
            }
        },

        /// <field type="Boolean" locid="WinJS.Utilities.Scheduler._JobInfo.shouldYield" helpKeyword="WinJS.Utilities.Scheduler._JobInfo.shouldYield">
        /// A boolean which will become true when the work item is requested to cooperatively yield by the scheduler.
        /// </field>
        shouldYield: {
            get: function () {
                this._throwIfDisabled();
                return this._shouldYield();
            }
        },

        setPromise: function (promise) {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobInfo.setPromise">
            /// <summary locid="WinJS.Utilities.Scheduler._JobInfo.setPromise">
            /// Called when the  work item is blocked on asynchronous work.
            /// The scheduler waits for the specified Promise to complete before rescheduling the job.
            /// </summary>
            /// <param name="promise" type="WinJS.Promise" locid="WinJS.Utilities.Scheduler._JobInfo.setPromise_p:promise">
            /// A Promise value which, when completed, provides a work item function to be re-scheduled.
            /// </param>
            /// </signature>
            this._throwIfDisabled();
            this._result = promise;
            this._yieldPolicy = YieldPolicy.block;
        },

        setWork: function (work) {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobInfo.setWork">
            /// <summary locid="WinJS.Utilities.Scheduler._JobInfo.setWork">
            /// Called  when the work item is cooperatively yielding to the scheduler and has more work to complete in the future.
            /// Use this method to schedule additonal work for when the work item is about to yield.
            /// </summary>
            /// <param name="work" type="Function" locid="WinJS.Utilities.Scheduler._JobInfo.setWork_p:work">
            /// The work function which will be re-scheduled.
            /// </param>
            /// </signature>
            this._throwIfDisabled();
            this._result = work;
            this._yieldPolicy = YieldPolicy.continue;
        },

        _disablePublicApi: function () {
            // _disablePublicApi should be called as soon as the job yields. This
            //  says that the job info object should no longer be used by the
            //  job and if the job tries to use it, job info will throw.
            //
            this._publicApiDisabled = true;
        },

        _throwIfDisabled: function () {
            if (this._publicApiDisabled) {
                throw new _ErrorFromName("WinJS.Utilities.Scheduler.JobInfoIsNoLongerValid", strings.jobInfoIsNoLongerValid);
            }
        }

    });

    //
    // Owner type. Made available to developers through the createOwnerToken method.
    //  Allows cancelation of jobs in bulk.
    //

    var OwnerToken = _Base.Class.define(function OwnerToken_ctor() {
        this._jobs = {};
    }, {
        cancelAll: function OwnerToken_cancelAll() {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._OwnerToken.cancelAll">
            /// <summary locid="WinJS.Utilities.Scheduler._OwnerToken.cancelAll">
            /// Cancels all jobs that are associated with this owner token.
            /// </summary>
            /// </signature>
            var jobs = this._jobs,
                jobIds = Object.keys(jobs);
            this._jobs = {};

            for (var i = 0, len = jobIds.length; i < len; i++) {
                jobs[jobIds[i]].cancel();
            }
        },

        _add: function OwnerToken_add(job) {
            this._jobs[job.id] = job;
        },

        _remove: function OwnerToken_remove(job) {
            delete this._jobs[job.id];
        }
    });

    function _() {
        // Noop function, used in the various states to indicate that they don't support a given
        // message. Named with the somewhat cute name '_' because it reads really well in the states.
        //
        return false;
    }
    function illegal(job) {
        /*jshint validthis: true */
        throw "Illegal call by job(" + job.id + ") in state: " + this.name;
    }

    //
    // Scheduler job state machine.
    //
    // A job normally goes through a lifecycle which is created -> scheduled -> running -> complete. The
    //  Scheduler decides when to transition a job from scheduled to running based on its policies and
    //  the other work which is scheduled.
    //
    // Additionally there are various operations which can be performed on a job which will change its
    //  state like: cancel, pause, resume and setting the job's priority.
    //
    // Additionally when in the running state a job may either cooperatively yield, or block.
    //
    // The job state machine accounts for these various states and interactions.
    //

    var State = _Base.Class.define(function (name) {
        this.name = name;
        this.enter = illegal;
        this.execute = illegal;
        this.executeDone = illegal;
        this.blockedDone = illegal;
        this.cancel = illegal;
        this.pause = illegal;
        this.resume = illegal;
        this.setPriority = illegal;
    });

    var state_created = new State("created"),                                   // -> scheduled
        state_scheduled = new State("scheduled"),                               // -> running | canceled | paused
        state_paused = new State("paused"),                                     // -> canceled | scheduled
        state_canceled = new State("canceled"),                                 // -> .
        state_running = new State("running"),                                   // -> cooperative_yield | blocked | complete | running_canceled | running_paused
        state_running_paused = new State("running_paused"),                     // -> cooperative_yield_paused | blocked_paused | complete | running_canceled | running_resumed
        state_running_resumed = new State("running_resumed"),                   // -> cooperative_yield | blocked | complete | running_canceled | running_paused
        state_running_canceled = new State("running_canceled"),                 // -> canceled | running_canceled_blocked
        state_running_canceled_blocked = new State("running_canceled_blocked"), // -> canceled
        state_cooperative_yield = new State("cooperative_yield"),               // -> scheduled
        state_cooperative_yield_paused = new State("cooperative_yield_paused"), // -> paused
        state_blocked = new State("blocked"),                                   // -> blocked_waiting
        state_blocked_waiting = new State("blocked_waiting"),                   // -> cooperative_yield | complete | blocked_canceled | blocked_paused_waiting
        state_blocked_paused = new State("blocked_paused"),                     // -> blocked_paused_waiting
        state_blocked_paused_waiting = new State("blocked_paused_waiting"),     // -> cooperative_yield_paused | complete | blocked_canceled | blocked_waiting
        state_blocked_canceled = new State("blocked_canceled"),                 // -> canceled
        state_complete = new State("complete");                                 // -> .

    // A given state may include implementations for the following operations:
    //
    //  - enter(job, arg0, arg1)
    //  - execute(job, shouldYield)
    //  - executeDone(job, result) --> next state
    //  - blockedDone(job, result, initialPriority)
    //  - cancel(job)
    //  - pause(job)
    //  - resume(job)
    //  - setPriority(job, priority)
    //
    // Any functions which are not implemented are illegal in that state.
    // Any functions which have an implementation of _ are a nop in that state.
    //

    // Helper which yields a function that transitions to the specified state
    //
    function setState(state) {
        return function (job, arg0, arg1) {
            job._setState(state, arg0, arg1);
        };
    }

    // Helper which sets the priority of a job.
    //
    function changePriority(job, priority) {
        job._setPriority(priority);
    }

    // Created
    //
    state_created.enter = function (job) {
        addJobAtTailOfPriority(job, job.priority);
        job._setState(state_scheduled);
    };

    // Scheduled
    //
    state_scheduled.enter = function () {
        startRunning();
    };
    state_scheduled.execute = setState(state_running);
    state_scheduled.cancel = setState(state_canceled);
    state_scheduled.pause = setState(state_paused);
    state_scheduled.resume = _;
    state_scheduled.setPriority = function (job, priority) {
        if (job.priority !== priority) {
            job._setPriority(priority);
            job.pause();
            job.resume();
        }
    };

    // Paused
    //
    state_paused.enter = function (job) {
        jobProfilerMark(job, "job-paused", "info");
        job._removeJob();
    };
    state_paused.cancel = setState(state_canceled);
    state_paused.pause = _;
    state_paused.resume = function (job) {
        jobProfilerMark(job, "job-resumed", "info");
        addJobAtTailOfPriority(job, job.priority);
        job._setState(state_scheduled);
    };
    state_paused.setPriority = changePriority;

    // Canceled
    //
    state_canceled.enter = function (job) {
        jobProfilerMark(job, "job-canceled", "info");
        _Trace._traceAsyncOperationCompleted(job._asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_CANCELED);
        job._removeJob();
        job._work = null;
        job._context = null;
        job.owner = null;
    };
    state_canceled.cancel = _;
    state_canceled.pause = _;
    state_canceled.resume = _;
    state_canceled.setPriority = _;

    // Running
    //
    state_running.enter = function (job, shouldYield) {
        // Remove the job from the list in case it throws an exception, this means in the
        //  yield case we have to add it back.
        //
        job._removeJob();

        var priority = job.priority;
        var work = job._work;
        var context = job._context;

        // Null out the work and context so they aren't leaked if the job throws an exception.
        //
        job._work = null;
        job._context = null;

        var jobInfo = new JobInfo(shouldYield, job);

        _Trace._traceAsyncCallbackStarting(job._asyncOpID);
        try {
            MSApp.execAtPriority(function () {
                work.call(context, jobInfo);
            }, toWwaPriority(priority));
        } finally {
            _Trace._traceAsyncCallbackCompleted();
            jobInfo._disablePublicApi();
        }

        // Restore the context in case it is needed due to yielding or blocking.
        //
        job._context = context;

        var targetState = job._executeDone(jobInfo._yieldPolicy);

        job._setState(targetState, jobInfo._result, priority);
    };
    state_running.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield;
            case YieldPolicy.block:
                return state_blocked;
        }
    };
    state_running.cancel = function (job) {
        // Interaction with the singleton scheduler. The act of canceling a job pokes the scheduler
        //  and tells it to start asking the job to yield.
        //
        immediateYield = true;
        job._setState(state_running_canceled);
    };
    state_running.pause = function (job) {
        // Interaction with the singleton scheduler. The act of pausing a job pokes the scheduler
        //  and tells it to start asking the job to yield.
        //
        immediateYield = true;
        job._setState(state_running_paused);
    };
    state_running.resume = _;
    state_running.setPriority = changePriority;

    // Running paused
    //
    state_running_paused.enter = _;
    state_running_paused.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield_paused;
            case YieldPolicy.block:
                return state_blocked_paused;
        }
    };
    state_running_paused.cancel = setState(state_running_canceled);
    state_running_paused.pause = _;
    state_running_paused.resume = setState(state_running_resumed);
    state_running_paused.setPriority = changePriority;

    // Running resumed
    //
    state_running_resumed.enter = _;
    state_running_resumed.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield;
            case YieldPolicy.block:
                return state_blocked;
        }
    };
    state_running_resumed.cancel = setState(state_running_canceled);
    state_running_resumed.pause = setState(state_running_paused);
    state_running_resumed.resume = _;
    state_running_resumed.setPriority = changePriority;

    // Running canceled
    //
    state_running_canceled.enter = _;
    state_running_canceled.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
            case YieldPolicy.continue:
                return state_canceled;
            case YieldPolicy.block:
                return state_running_canceled_blocked;
        }
    };
    state_running_canceled.cancel = _;
    state_running_canceled.pause = _;
    state_running_canceled.resume = _;
    state_running_canceled.setPriority = _;

    // Running canceled -> blocked
    //
    state_running_canceled_blocked.enter = function (job, work) {
        work.cancel();
        job._setState(state_canceled);
    };

    // Cooperative yield
    //
    state_cooperative_yield.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-yielded", "info");
        if (initialPriority === job.priority) {
            addJobAtHeadOfPriority(job, job.priority);
        } else {
            addJobAtTailOfPriority(job, job.priority);
        }
        job._work = work;
        job._setState(state_scheduled);
    };

    // Cooperative yield paused
    //
    state_cooperative_yield_paused.enter = function (job, work) {
        jobProfilerMark(job, "job-yielded", "info");
        job._work = work;
        job._setState(state_paused);
    };

    // Blocked
    //
    state_blocked.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-blocked", "StartTM");
        job._work = work;
        job._setState(state_blocked_waiting);

        // Sign up for a completion from the provided promise, after the completion occurs
        //  transition from the current state at the completion time to the target state
        //  depending on the completion value.
        //
        work.done(
            function (newWork) {
                jobProfilerMark(job, "job-blocked", "StopTM");
                var targetState = job._blockedDone(newWork);
                job._setState(targetState, newWork, initialPriority);
            },
            function (error) {
                if (!(error && error.name === "Canceled")) {
                    jobProfilerMark(job, "job-error", "info");
                }
                jobProfilerMark(job, "job-blocked", "StopTM");
                job._setState(state_canceled);
                return Promise.wrapError(error);
            }
        );
    };

    // Blocked waiting
    //
    state_blocked_waiting.enter = _;
    state_blocked_waiting.blockedDone = function (job, result) {
        if (typeof result === "function") {
            return state_cooperative_yield;
        } else {
            return state_complete;
        }
    };
    state_blocked_waiting.cancel = setState(state_blocked_canceled);
    state_blocked_waiting.pause = setState(state_blocked_paused_waiting);
    state_blocked_waiting.resume = _;
    state_blocked_waiting.setPriority = changePriority;

    // Blocked paused
    //
    state_blocked_paused.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-blocked", "StartTM");
        job._work = work;
        job._setState(state_blocked_paused_waiting);

        // Sign up for a completion from the provided promise, after the completion occurs
        //  transition from the current state at the completion time to the target state
        //  depending on the completion value.
        //
        work.done(
            function (newWork) {
                jobProfilerMark(job, "job-blocked", "StopTM");
                var targetState = job._blockedDone(newWork);
                job._setState(targetState, newWork, initialPriority);
            },
            function (error) {
                if (!(error && error.name === "Canceled")) {
                    jobProfilerMark(job, "job-error", "info");
                }
                jobProfilerMark(job, "job-blocked", "StopTM");
                job._setState(state_canceled);
                return Promise.wrapError(error);
            }
        );
    };

    // Blocked paused waiting
    //
    state_blocked_paused_waiting.enter = _;
    state_blocked_paused_waiting.blockedDone = function (job, result) {
        if (typeof result === "function") {
            return state_cooperative_yield_paused;
        } else {
            return state_complete;
        }
    };
    state_blocked_paused_waiting.cancel = setState(state_blocked_canceled);
    state_blocked_paused_waiting.pause = _;
    state_blocked_paused_waiting.resume = setState(state_blocked_waiting);
    state_blocked_paused_waiting.setPriority = changePriority;

    // Blocked canceled
    //
    state_blocked_canceled.enter = function (job) {
        // Cancel the outstanding promise and then eventually it will complete, presumably with a 'canceled'
        //  error at which point we will transition to the canceled state.
        //
        job._work.cancel();
        job._work = null;
    };
    state_blocked_canceled.blockedDone = function () {
        return state_canceled;
    };
    state_blocked_canceled.cancel = _;
    state_blocked_canceled.pause = _;
    state_blocked_canceled.resume = _;
    state_blocked_canceled.setPriority = _;

    // Complete
    //
    state_complete.completed = true;
    state_complete.enter = function (job) {
        _Trace._traceAsyncOperationCompleted(job._asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_SUCCESS);
        job._work = null;
        job._context = null;
        job.owner = null;
        jobProfilerMark(job, "job-completed", "info");
    };
    state_complete.cancel = _;
    state_complete.pause = _;
    state_complete.resume = _;
    state_complete.setPriority = _;

    // Private Priority marker node in the Job list. The marker nodes are linked both into the job
    //  list and a separate marker list. This is used so that jobs can be easily added into a given
    //  priority level by simply traversing to the next marker in the list and inserting before it.
    //
    // Markers may either be "static" or "dynamic". Static markers are the set of things which are
    //  named and are always in the list, they may exist with or without jobs at their priority
    //  level. Dynamic markers are added as needed.
    //
    // @NOTE: Dynamic markers are NYI
    //
    var MarkerNode = _Base.Class.define(function (priority, name) {
        this.priority = priority;
        this.name = name;
    }, {

        // NYI
        //
        //dynamic: {
        //    get: function () { return !this.name; }
        //},

    });
    _Base.Class.mix(MarkerNode, linkedListMixin("Job"), linkedListMixin("Marker"));

    //
    // Scheduler state
    //

    // Unique ID per job.
    //
    var globalJobId = 0;

    // Unique ID per drain request.
    var globalDrainId = 0;

    // Priority is: -15 ... 0 ... 15 where that maps to: 'min' ... 'normal' ... 'max'
    //
    var MIN_PRIORITY = -15;
    var MAX_PRIORITY = 15;

    // Named priorities
    //
    var Priority = {
        max: 15,
        high: 13,
        aboveNormal: 9,
        normal: 0,
        belowNormal: -9,
        idle: -13,
        min: -15,
    };

    // Definition of the priorities, named have static markers.
    //
    var priorities = [
        new MarkerNode(15, "max"),          // Priority.max
        new MarkerNode(14, "14"),
        new MarkerNode(13, "high"),         // Priority.high
        new MarkerNode(12, "12"),
        new MarkerNode(11, "11"),
        new MarkerNode(10, "10"),
        new MarkerNode(9, "aboveNormal"),   // Priority.aboveNormal
        new MarkerNode(8, "8"),
        new MarkerNode(7, "7"),
        new MarkerNode(6, "6"),
        new MarkerNode(5, "5"),
        new MarkerNode(4, "4"),
        new MarkerNode(3, "3"),
        new MarkerNode(2, "2"),
        new MarkerNode(1, "1"),
        new MarkerNode(0, "normal"),        // Priority.normal
        new MarkerNode(-1, "-1"),
        new MarkerNode(-2, "-2"),
        new MarkerNode(-3, "-3"),
        new MarkerNode(-4, "-4"),
        new MarkerNode(-5, "-5"),
        new MarkerNode(-6, "-6"),
        new MarkerNode(-7, "-7"),
        new MarkerNode(-8, "-8"),
        new MarkerNode(-9, "belowNormal"),  // Priority.belowNormal
        new MarkerNode(-10, "-10"),
        new MarkerNode(-11, "-11"),
        new MarkerNode(-12, "-12"),
        new MarkerNode(-13, "idle"),        // Priority.idle
        new MarkerNode(-14, "-14"),
        new MarkerNode(-15, "min"),         // Priority.min
        new MarkerNode(-16, "<TAIL>")
    ];

    function dumpList(type, reverse) {
        function dumpMarker(marker, pos) {
            _Log.log && _Log.log(pos + ": MARKER: " + marker.name, "winjs scheduler", "log");
        }
        function dumpJob(job, pos) {
            _Log.log && _Log.log(pos + ": JOB(" + job.id + "): state: " + (job._state ? job._state.name : "") + (job.name ? ", name: " + job.name : ""), "winjs scheduler", "log");
        }
        _Log.log && _Log.log("highWaterMark: " + highWaterMark, "winjs scheduler", "log");
        var pos = 0;
        var head = reverse ? priorities[priorities.length - 1] : priorities[0];
        var current = head;
        do {
            if (current instanceof MarkerNode) {
                dumpMarker(current, pos);
            }
            if (current instanceof JobNode) {
                dumpJob(current, pos);
            }
            pos++;
            current = reverse ? current["_prev" + type] : current["_next" + type];
        } while (current);
    }

    function retrieveState() {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.retrieveState">
        /// <summary locid="WinJS.Utilities.Scheduler.retrieveState">
        /// Returns a string representation of the scheduler's state for diagnostic
        /// purposes. The jobs and drain requests are displayed in the order in which
        /// they are currently expected to be processed. The current job and drain
        /// request are marked by an asterisk.
        /// </summary>
        /// </signature>
        var output = "";

        function logJob(job, isRunning) {
            output +=
                "    " + (isRunning ? "*" : " ") +
                "id: " + job.id +
                ", priority: " + markerFromPriority(job.priority).name +
                (job.name ? ", name: " + job.name : "") +
                "\n";
        }

        output += "Jobs:\n";
        var current = markerFromPriority(highWaterMark);
        var jobCount = 0;
        if (runningJob) {
            logJob(runningJob, true);
            jobCount++;
        }
        while (current.priority >= Priority.min) {
            if (current instanceof JobNode) {
                logJob(current, false);
                jobCount++;
            }
            current = current._nextJob;
        }
        if (jobCount === 0) {
            output += "     None\n";
        }

        output += "Drain requests:\n";
        for (var i = 0, len = drainQueue.length; i < len; i++) {
            output +=
                "    " + (i === 0 ? "*" : " ") +
                "priority: " + markerFromPriority(drainQueue[i].priority).name +
                ", name: " + drainQueue[i].name +
                "\n";
        }
        if (drainQueue.length === 0) {
            output += "     None\n";
        }

        return output;
    }

    function isEmpty() {
        var current = priorities[0];
        do {
            if (current instanceof JobNode) {
                return false;
            }
            current = current._nextJob;
        } while (current);

        return true;
    }

    // The WWA priority at which the pump is currently scheduled on the WWA scheduler.
    //  null when the pump is not scheduled.
    //
    var scheduledWwaPriority = null;

    // Whether the scheduler pump is currently on the stack
    //
    var pumping;
    // What priority is currently being pumped
    //
    var pumpingPriority;

    // A reference to the job object that is currently running.
    //  null when no job is running.
    //
    var runningJob = null;

    // Whether we are using the WWA scheduler.
    //
    var usingWwaScheduler = !!(_Global.MSApp && _Global.MSApp.execAtPriority);

    // Queue of drain listeners
    //
    var drainQueue = [];

    // Bit indicating that we should yield immediately
    //
    var immediateYield;

    // time slice for scheduler
    //
    var TIME_SLICE = 30;

    // high-water-mark is maintained any time priorities are adjusted, new jobs are
    //  added or the scheduler pumps itself down through a priority marker. The goal
    //  of the high-water-mark is to be a fast check as to whether a job may exist
    //  at a higher priority level than we are currently at. It may be wrong but it
    //  may only be wrong by being higher than the current highest priority job, not
    //  lower as that would cause the system to pump things out of order.
    //
    var highWaterMark = Priority.min;

    //
    // Initialize the scheduler
    //

    // Wire up the markers
    //
    priorities.reduce(function (prev, current) {
        if (prev) {
            prev._insertJobAfter(current);
            prev._insertMarkerAfter(current);
        }
        return current;
    });

    //
    // Draining mechanism
    //
    // For each active drain request, there is a unique drain listener in the
    //  drainQueue. Requests are processed in FIFO order. The scheduler is in
    //  drain mode precisely when the drainQueue is non-empty.
    //

    // Returns priority of the current drain request
    //
    function currentDrainPriority() {
        return drainQueue.length === 0 ? null : drainQueue[0].priority;
    }

    function drainStarting(listener) {
        schedulerProfilerMark("drain", "StartTM", listener.name, markerFromPriority(listener.priority).name);
    }
    function drainStopping(listener, canceled) {
        if (canceled) {
            schedulerProfilerMark("drain-canceled", "info", listener.name, markerFromPriority(listener.priority).name);
        }
        schedulerProfilerMark("drain", "StopTM", listener.name, markerFromPriority(listener.priority).name);
    }

    function addDrainListener(priority, complete, name) {
        drainQueue.push({ priority: priority, complete: complete, name: name });
        if (drainQueue.length === 1) {
            drainStarting(drainQueue[0]);
            if (priority > highWaterMark) {
                highWaterMark = priority;
                immediateYield = true;
            }
        }
    }

    function removeDrainListener(complete, canceled) {
        var i,
            len = drainQueue.length;

        for (i = 0; i < len; i++) {
            if (drainQueue[i].complete === complete) {
                if (i === 0) {
                    drainStopping(drainQueue[0], canceled);
                    drainQueue[1] && drainStarting(drainQueue[1]);
                }
                drainQueue.splice(i, 1);
                break;
            }
        }
    }

    // Notifies and removes the current drain listener
    //
    function notifyCurrentDrainListener() {
        var listener = drainQueue.shift();

        if (listener) {
            drainStopping(listener);
            drainQueue[0] && drainStarting(drainQueue[0]);
            listener.complete();
        }
    }

    // Notifies all drain listeners which are at a priority > highWaterMark.
    //  Returns whether or not any drain listeners were notified. This
    //  function sets pumpingPriority and reads highWaterMark. Note that
    //  it may call into user code which may call back into the scheduler.
    //
    function notifyDrainListeners() {
        var notifiedSomebody = false;
        if (!!drainQueue.length) {
            // As we exhaust priority levels, notify the appropriate drain listeners.
            //
            var drainPriority = currentDrainPriority();
            while (+drainPriority === drainPriority && drainPriority > highWaterMark) {
                pumpingPriority = drainPriority;
                notifyCurrentDrainListener();
                notifiedSomebody = true;
                drainPriority = currentDrainPriority();
            }
        }
        return notifiedSomebody;
    }

    //
    // Interfacing with the WWA Scheduler
    //

    // The purpose of yielding to the host is to give the host the opportunity to do some work.
    // setImmediate has this guarantee built-in so we prefer that. Otherwise, we do setTimeout 16
    // which should give the host a decent amount of time to do work.
    //
    var scheduleWithHost = _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (callback) {
        _Global.setTimeout(callback, 16);
    };

    // Stubs for the parts of the WWA scheduler APIs that we use. These stubs are
    //  used in contexts where the WWA scheduler is not available.
    //
    var MSAppStubs = {
        execAsyncAtPriority: function (callback, priority) {
            // If it's a high priority callback then we additionally schedule using setTimeout(0)
            //
            if (priority === MSApp.HIGH) {
                _Global.setTimeout(callback, 0);
            }
            // We always schedule using setImmediate
            //
            scheduleWithHost(callback);
        },

        execAtPriority: function (callback) {
            return callback();
        },

        getCurrentPriority: function () {
            return MSAppStubs.NORMAL;
        },

        isTaskScheduledAtPriorityOrHigher: function () {
            return false;
        },

        HIGH: "high",
        NORMAL: "normal",
        IDLE: "idle"
    };

    var MSApp = (usingWwaScheduler ? _Global.MSApp : MSAppStubs);

    function toWwaPriority(winjsPriority) {
        if (winjsPriority >= Priority.aboveNormal + 1) { return MSApp.HIGH; }
        if (winjsPriority >= Priority.belowNormal) { return MSApp.NORMAL; }
        return MSApp.IDLE;
    }

    var wwaPriorityToInt = {};
    wwaPriorityToInt[MSApp.IDLE] = 1;
    wwaPriorityToInt[MSApp.NORMAL] = 2;
    wwaPriorityToInt[MSApp.HIGH] = 3;

    function isEqualOrHigherWwaPriority(priority1, priority2) {
        return wwaPriorityToInt[priority1] >= wwaPriorityToInt[priority2];
    }

    function isHigherWwaPriority(priority1, priority2) {
        return wwaPriorityToInt[priority1] > wwaPriorityToInt[priority2];
    }

    function wwaTaskScheduledAtPriorityHigherThan(wwaPriority) {
        switch (wwaPriority) {
            case MSApp.HIGH:
                return false;
            case MSApp.NORMAL:
                return MSApp.isTaskScheduledAtPriorityOrHigher(MSApp.HIGH);
            case MSApp.IDLE:
                return MSApp.isTaskScheduledAtPriorityOrHigher(MSApp.NORMAL);
        }
    }

    //
    // Mechanism for the scheduler
    //

    function addJobAtHeadOfPriority(node, priority) {
        var marker = markerFromPriority(priority);
        if (marker.priority > highWaterMark) {
            highWaterMark = marker.priority;
            immediateYield = true;
        }
        marker._insertJobAfter(node);
    }

    function addJobAtTailOfPriority(node, priority) {
        var marker = markerFromPriority(priority);
        if (marker.priority > highWaterMark) {
            highWaterMark = marker.priority;
            immediateYield = true;
        }
        marker._nextMarker._insertJobBefore(node);
    }

    function clampPriority(priority) {
        priority = priority | 0;
        priority = Math.max(priority, MIN_PRIORITY);
        priority = Math.min(priority, MAX_PRIORITY);
        return priority;
    }

    function markerFromPriority(priority) {
        priority = clampPriority(priority);

        // The priority skip list is from high -> idle, add the offset and then make it positive.
        //
        return priorities[-1 * (priority - MAX_PRIORITY)];
    }

    // Performance.now is not defined in web workers.
    //
    var now = (_Global.performance && _Global.performance.now && _Global.performance.now.bind(_Global.performance)) || Date.now.bind(Date);

    // Main scheduler pump.
    //
    function run(scheduled) {
        pumping = true;
        schedulerProfilerMark("timeslice", "StartTM");
        var didWork;
        var ranJobSuccessfully = true;
        var current;
        var lastLoggedPriority;
        var timesliceExhausted = false;
        var yieldForPriorityBoundary = false;

        // Reset per-run state
        //
        immediateYield = false;

        try {
            var start = now();
            var end = start + TIME_SLICE;

            // Yielding policy
            //
            // @TODO, should we have a different scheduler policy when the debugger is attached. Today if you
            //  break in user code we will generally yield immediately after that job due to the fact that any
            //  breakpoint will take longer than TIME_SLICE to process.
            //

            var shouldYield = function () {
                timesliceExhausted = false;
                if (immediateYield) { return true; }
                if (wwaTaskScheduledAtPriorityHigherThan(toWwaPriority(highWaterMark))) { return true; }
                if (!!drainQueue.length) { return false; }
                if (now() > end) {
                    timesliceExhausted = true;
                    return true;
                }
                return false;
            };

            // Run until we run out of jobs or decide it is time to yield
            //
            while (highWaterMark >= Priority.min && !shouldYield() && !yieldForPriorityBoundary) {

                didWork = false;
                current = markerFromPriority(highWaterMark)._nextJob;
                do {
                    // Record the priority currently being pumped
                    //
                    pumpingPriority = current.priority;

                    if (current instanceof JobNode) {
                        if (lastLoggedPriority !== current.priority) {
                            if (+lastLoggedPriority === lastLoggedPriority) {
                                schedulerProfilerMark("priority", "StopTM", markerFromPriority(lastLoggedPriority).name);
                            }
                            schedulerProfilerMark("priority", "StartTM", markerFromPriority(current.priority).name);
                            lastLoggedPriority = current.priority;
                        }

                        // Important that we update this state before calling execute because the
                        //  job may throw an exception and we don't want to stall the queue.
                        //
                        didWork = true;
                        ranJobSuccessfully = false;
                        runningJob = current;
                        jobProfilerMark(runningJob, "job-running", "StartTM", markerFromPriority(pumpingPriority).name);
                        current._execute(shouldYield);
                        jobProfilerMark(runningJob, "job-running", "StopTM", markerFromPriority(pumpingPriority).name);
                        runningJob = null;
                        ranJobSuccessfully = true;
                    } else {
                        // As we pass marker nodes update our high water mark. It's important to do
                        //  this before notifying drain listeners because they may schedule new jobs
                        //  which will affect the highWaterMark.
                        //
                        var wwaPrevHighWaterMark = toWwaPriority(highWaterMark);
                        highWaterMark = current.priority;

                        didWork = notifyDrainListeners();

                        var wwaHighWaterMark = toWwaPriority(highWaterMark);
                        if (isHigherWwaPriority(wwaPrevHighWaterMark, wwaHighWaterMark) &&
                                (!usingWwaScheduler || MSApp.isTaskScheduledAtPriorityOrHigher(wwaHighWaterMark))) {
                            // Timeslice is moving to a lower WWA priority and the host
                            //  has equally or more important work to do. Time to yield.
                            //
                            yieldForPriorityBoundary = true;
                        }
                    }

                    current = current._nextJob;

                    // When didWork is true we exit the loop because:
                    //  - We've called into user code which may have modified the
                    //    scheduler's queue. We need to restart at the high water mark.
                    //  - We need to check if it's time for the scheduler to yield.
                    //
                } while (current && !didWork && !yieldForPriorityBoundary && !wwaTaskScheduledAtPriorityHigherThan(toWwaPriority(highWaterMark)));

                // Reset per-item state
                //
                immediateYield = false;

            }

        } finally {
            runningJob = null;

            // If a job was started and did not run to completion due to an exception
            //  we should transition it to a terminal state.
            //
            if (!ranJobSuccessfully) {
                jobProfilerMark(current, "job-error", "info");
                jobProfilerMark(current, "job-running", "StopTM", markerFromPriority(pumpingPriority).name);
                current.cancel();
            }

            if (+lastLoggedPriority === lastLoggedPriority) {
                schedulerProfilerMark("priority", "StopTM", markerFromPriority(lastLoggedPriority).name);
            }
            // Update high water mark to be the priority of the highest priority job.
            //
            var foundAJob = false;
            while (highWaterMark >= Priority.min && !foundAJob) {

                didWork = false;
                current = markerFromPriority(highWaterMark)._nextJob;
                do {

                    if (current instanceof JobNode) {
                        // We found a job. High water mark is now set to the priority
                        //  of this job.
                        //
                        foundAJob = true;
                    } else {
                        // As we pass marker nodes update our high water mark. It's important to do
                        //  this before notifying drain listeners because they may schedule new jobs
                        //  which will affect the highWaterMark.
                        //
                        highWaterMark = current.priority;

                        didWork = notifyDrainListeners();
                    }

                    current = current._nextJob;

                    // When didWork is true we exit the loop because:
                    //  - We've called into user code which may have modified the
                    //    scheduler's queue. We need to restart at the high water mark.
                    //
                } while (current && !didWork && !foundAJob);
            }

            var reasonForYielding;
            if (!ranJobSuccessfully) {
                reasonForYielding = "job error";
            } else if (timesliceExhausted) {
                reasonForYielding = "timeslice exhausted";
            } else if (highWaterMark < Priority.min) {
                reasonForYielding = "jobs exhausted";
            } else if (yieldForPriorityBoundary) {
                reasonForYielding = "reached WWA priority boundary";
            } else {
                reasonForYielding = "WWA host work";
            }

            // If this was a scheduled call to the pump, then the pump is no longer
            //  scheduled to be called and we should clear its scheduled priority.
            //
            if (scheduled) {
                scheduledWwaPriority = null;
            }

            // If the high water mark has not reached the end of the queue then
            //  we re-queue in order to see if there are more jobs to run.
            //
            pumping = false;
            if (highWaterMark >= Priority.min) {
                startRunning();
            }
            schedulerProfilerMark("yielding", "info", reasonForYielding);
            schedulerProfilerMark("timeslice", "StopTM");
        }
    }

    // When we schedule the pump we assign it a version. When we start executing one we check
    //  to see what the max executed version is. If we have superseded it then we skip the call.
    //
    var scheduledVersion = 0;
    var executedVersion = 0;

    function startRunning(priority) {
        if (+priority !== priority) {
            priority = highWaterMark;
        }
        var priorityWwa = toWwaPriority(priority);

        // Don't schedule the pump while pumping. The pump will be scheduled
        //  immediately before yielding if necessary.
        //
        if (pumping) {
            return;
        }

        // If the pump is already scheduled at priority or higher, then there
        //  is no need to schedule the pump again.
        // However, when we're not using the WWA scheduler, we fallback to immediate/timeout
        //  which do not have a notion of priority. In this case, if the pump is scheduled,
        //  there is no need to schedule another pump.
        //
        if (scheduledWwaPriority && (!usingWwaScheduler || isEqualOrHigherWwaPriority(scheduledWwaPriority, priorityWwa))) {
            return;
        }
        var current = ++scheduledVersion;
        var runner = function () {
            if (executedVersion < current) {
                executedVersion = scheduledVersion;
                run(true);
            }
        };

        MSApp.execAsyncAtPriority(runner, priorityWwa);
        scheduledWwaPriority = priorityWwa;
    }

    function requestDrain(priority, name) {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.requestDrain">
        /// <summary locid="WinJS.Utilities.Scheduler.requestDrain">
        /// Runs jobs in the scheduler without timeslicing until all jobs at the
        /// specified priority and higher have executed.
        /// </summary>
        /// <param name="priority" isOptional="true" type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler.requestDrain_p:priority">
        /// The priority to which the scheduler should drain. The default is Priority.min, which drains all jobs in the queue.
        /// </param>
        /// <param name="name" isOptional="true" type="String" locid="WinJS.Utilities.Scheduler.requestDrain_p:name">
        /// An optional description of the drain request for diagnostics.
        /// </param>
        /// <returns type="WinJS.Promise" locid="WinJS.Utilities.Scheduler.requestDrain_returnValue">
        /// A promise which completes when the drain has finished. Canceling this
        /// promise cancels the drain request. This promise will never enter an error state.
        /// </returns>
        /// </signature>

        var id = globalDrainId++;
        if (name === undefined) {
            name = "Drain Request " + id;
        }
        priority = (+priority === priority) ? priority : Priority.min;
        priority = clampPriority(priority);

        var complete;
        var promise = new Promise(function (c) {
            complete = c;
            addDrainListener(priority, complete, name);
        }, function () {
            removeDrainListener(complete, true);
        });

        if (!pumping) {
            startRunning();
        }

        return promise;
    }

    function execHigh(callback) {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.execHigh">
        /// <summary locid="WinJS.Utilities.Scheduler.execHigh">
        /// Runs the specified callback in a high priority context.
        /// </summary>
        /// <param name="callback" type="Function" locid="WinJS.Utilities.Scheduler.execHigh_p:callback">
        /// The callback to run in a high priority context.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.Scheduler.execHigh_returnValue">
        /// The return value of the callback.
        /// </returns>
        /// </signature>

        return MSApp.execAtPriority(callback, MSApp.HIGH);
    }

    function createOwnerToken() {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.createOwnerToken">
        /// <summary locid="WinJS.Utilities.Scheduler.createOwnerToken">
        /// Creates and returns a new owner token which can be set to the owner property of one or more jobs.
        /// It can then be used to cancel all jobs it "owns".
        /// </summary>
        /// <returns type="WinJS.Utilities.Scheduler._OwnerToken" locid="WinJS.Utilities.Scheduler.createOwnerToken_returnValue">
        /// The new owner token. You can use this token to control jobs that it owns.
        /// </returns>
        /// </signature>

        return new OwnerToken();
    }

    function schedule(work, priority, thisArg, name) {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.schedule">
        /// <summary locid="WinJS.Utilities.Scheduler.schedule">
        /// Schedules the specified function to execute asynchronously.
        /// </summary>
        /// <param name="work" type="Function" locid="WinJS.Utilities.Scheduler.schedule_p:work">
        /// A function that represents the work item to be scheduled. When called the work item will receive as its first argument
        /// a JobInfo object which allows the work item to ask the scheduler if it should yield cooperatively and if so allows the
        /// work item to either provide a function to be run as a continuation or a WinJS.Promise which will when complete
        /// provide a function to run as a continuation.
        /// </param>
        /// <param name="priority" isOptional="true" type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler.schedule_p:priority">
        /// The priority at which to schedule the work item. The default value is Priority.normal.
        /// </param>
        /// <param name="thisArg" isOptional="true" type="Object" locid="WinJS.Utilities.Scheduler.schedule_p:thisArg">
        /// A 'this' instance to be bound into the work item. The default value is null.
        /// </param>
        /// <param name="name" isOptional="true" type="String" locid="WinJS.Utilities.Scheduler.schedule_p:name">
        /// A description of the work item for diagnostics. The default value is an empty string.
        /// </param>
        /// <returns type="WinJS.Utilities.Scheduler._JobNode" locid="WinJS.Utilities.Scheduler.schedule_returnValue">
        /// The Job instance which represents this work item.
        /// </returns>
        /// </signature>

        priority = priority || Priority.normal;
        thisArg = thisArg || null;
        var jobId = ++globalJobId;
        var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Utilities.Scheduler.schedule: " + jobId + profilerMarkArgs(name));
        name = name || "";
        return new JobNode(jobId, work, priority, thisArg, name, asyncOpID);
    }

    function getCurrentPriority() {
        if (pumping) {
            return pumpingPriority;
        } else {
            switch (MSApp.getCurrentPriority()) {
                case MSApp.HIGH: return Priority.high;
                case MSApp.NORMAL: return Priority.normal;
                case MSApp.IDLE: return Priority.idle;
            }
        }
    }

    function makeSchedulePromise(priority) {
        return function (promiseValue, jobName) {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler.schedulePromise">
            /// <summary locid="WinJS.Utilities.Scheduler.schedulePromise">
            /// Schedules a job to complete a returned Promise.
            /// There are four versions of this method for different commonly used priorities: schedulePromiseHigh,
            /// schedulePromiseAboveNormal, schedulePromiseNormal, schedulePromiseBelowNormal,
            /// and schedulePromiseIdle.
            /// Example usage which shows how to
            /// ensure that the last link in a promise chain is run on the scheduler at high priority:
            /// asyncOp().then(Scheduler.schedulePromiseHigh).then(function (valueOfAsyncOp) { });
            /// </summary>
            /// <param name="promiseValue" isOptional="true" type="Object" locid="WinJS.Utilities.Scheduler.schedulePromise_p:promiseValue">
            /// The value with which the returned promise will complete.
            /// </param>
            /// <param name="jobName" isOptional="true" type="String" locid="WinJS.Utilities.Scheduler.schedulePromise_p:jobName">
            /// A string that describes the job for diagnostic purposes.
            /// </param>
            /// <returns type="WinJS.Promise" locid="WinJS.Utilities.Scheduler.schedulePromise_returnValue">
            /// A promise which completes within a job of the desired priority.
            /// </returns>
            /// </signature>
            var job;
            return new Promise(
                function (c) {
                    job = schedule(function schedulePromise() {
                        c(promiseValue);
                    }, priority, null, jobName);
                },
                function () {
                    job.cancel();
                }
            );
        };
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities.Scheduler", {

        Priority: Priority,

        schedule: schedule,

        createOwnerToken: createOwnerToken,

        execHigh: execHigh,

        requestDrain: requestDrain,

        /// <field type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler.currentPriority" helpKeyword="WinJS.Utilities.Scheduler.currentPriority">
        /// Gets the current priority at which the caller is executing.
        /// </field>
        currentPriority: {
            get: getCurrentPriority
        },

        // Promise helpers
        //
        schedulePromiseHigh: makeSchedulePromise(Priority.high),
        schedulePromiseAboveNormal: makeSchedulePromise(Priority.aboveNormal),
        schedulePromiseNormal: makeSchedulePromise(Priority.normal),
        schedulePromiseBelowNormal: makeSchedulePromise(Priority.belowNormal),
        schedulePromiseIdle: makeSchedulePromise(Priority.idle),

        retrieveState: retrieveState,

        _JobNode: JobNode,

        _JobInfo: JobInfo,

        _OwnerToken: OwnerToken,

        _dumpList: dumpList,

        _isEmpty: {
            get: isEmpty
        },

        // The properties below are used for testing.
        //

        _usingWwaScheduler: {
            get: function () {
                return usingWwaScheduler;
            },
            set: function (value) {
                usingWwaScheduler = value;
                MSApp = (usingWwaScheduler ? _Global.MSApp : MSAppStubs);
            }
        },

        _MSApp: {
            get: function () {
                return MSApp;
            },
            set: function (value) {
                MSApp = value;
            }
        },

        _TIME_SLICE: TIME_SLICE

    });

});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/ControlProcessor/_OptionsLexer',[
    'exports',
    '../Core/_Base'
    ], function optionsLexerInit(exports, _Base) {
    "use strict";

    /*

Lexical grammar is defined in ECMA-262-5, section 7.

Lexical productions used in this grammar defined in ECMA-262-5:

Production          Section
--------------------------------
Identifier          7.6
NullLiteral         7.8.1
BooleanLiteral      7.8.2
NumberLiteral       7.8.3
StringLiteral       7.8.4

*/

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _optionsLexer: _Base.Namespace._lazy(function () {

            var tokenType = {
                leftBrace: 1,           // {
                rightBrace: 2,          // }
                leftBracket: 3,         // [
                rightBracket: 4,        // ]
                separator: 5,           // ECMA-262-5, 7.2
                colon: 6,               // :
                semicolon: 7,           // ;
                comma: 8,               // ,
                dot: 9,                 // .
                nullLiteral: 10,        // ECMA-262-5, 7.8.1 (null)
                trueLiteral: 11,        // ECMA-262-5, 7.8.2 (true)
                falseLiteral: 12,       // ECMA-262-5, 7.8.2 (false)
                numberLiteral: 13,      // ECMA-262-5, 7.8.3
                stringLiteral: 14,      // ECMA-262-5, 7.8.4
                identifier: 15,         // ECMA-262-5, 7.6
                reservedWord: 16,
                thisKeyword: 17,
                leftParentheses: 18,    // (
                rightParentheses: 19,   // )
                eof: 20,
                error: 21
            };
            // debugging - this costs something like 20%
            //
            //Object.keys(tokenType).forEach(function (key) {
            //    tokenType[key] = key.toString();
            //});
            var tokens = {
                leftBrace: { type: tokenType.leftBrace, length: 1 },
                rightBrace: { type: tokenType.rightBrace, length: 1 },
                leftBracket: { type: tokenType.leftBracket, length: 1 },
                rightBracket: { type: tokenType.rightBracket, length: 1 },
                colon: { type: tokenType.colon, length: 1 },
                semicolon: { type: tokenType.semicolon, length: 1 },
                comma: { type: tokenType.comma, length: 1 },
                dot: { type: tokenType.dot, length: 1 },
                nullLiteral: { type: tokenType.nullLiteral, length: 4, value: null, keyword: true },
                trueLiteral: { type: tokenType.trueLiteral, length: 4, value: true, keyword: true },
                falseLiteral: { type: tokenType.falseLiteral, length: 5, value: false, keyword: true },
                thisKeyword: { type: tokenType.thisKeyword, length: 4, value: "this", keyword: true },
                leftParentheses: { type: tokenType.leftParentheses, length: 1 },
                rightParentheses: { type: tokenType.rightParentheses, length: 1 },
                eof: { type: tokenType.eof, length: 0 }
            };

            function reservedWord(word) {
                return { type: tokenType.reservedWord, value: word, length: word.length, keyword: true };
            }
            function reservedWordLookup(identifier) {
                // Moving from a simple object literal lookup for reserved words to this
                // switch was worth a non-trivial performance increase (5-7%) as this path
                // gets taken for any identifier.
                //
                switch (identifier.charCodeAt(0)) {
                    case /*b*/98:
                        switch (identifier) {
                            case 'break':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*c*/99:
                        switch (identifier) {
                            case 'case':
                            case 'catch':
                            case 'class':
                            case 'const':
                            case 'continue':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*d*/100:
                        switch (identifier) {
                            case 'debugger':
                            case 'default':
                            case 'delete':
                            case 'do':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*e*/101:
                        switch (identifier) {
                            case 'else':
                            case 'enum':
                            case 'export':
                            case 'extends':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*f*/102:
                        switch (identifier) {
                            case 'false':
                                return tokens.falseLiteral;

                            case 'finally':
                            case 'for':
                            case 'function':
                                return reservedWord(identifier);
                        }

                        break;
                    case /*i*/105:
                        switch (identifier) {
                            case 'if':
                            case 'import':
                            case 'in':
                            case 'instanceof':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*n*/110:
                        switch (identifier) {
                            case 'null':
                                return tokens.nullLiteral;

                            case 'new':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*r*/114:
                        switch (identifier) {
                            case 'return':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*s*/115:
                        switch (identifier) {
                            case 'super':
                            case 'switch':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*t*/116:
                        switch (identifier) {
                            case 'true':
                                return tokens.trueLiteral;

                            case 'this':
                                return tokens.thisKeyword;

                            case 'throw':
                            case 'try':
                            case 'typeof':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*v*/118:
                        switch (identifier) {
                            case 'var':
                            case 'void':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*w*/119:
                        switch (identifier) {
                            case 'while':
                            case 'with':
                                return reservedWord(identifier);
                        }
                        break;
                }
                return;
            }

            var lexer = (function () {
                function isIdentifierStartCharacter(code, text, offset, limit) {
                    // The ES5 spec decalares that identifiers consist of a bunch of unicode classes, without
                    // WinRT support for determining unicode class membership we are looking at 2500+ lines of
                    // javascript code to encode the relevant class tables. Instead we look for everything
                    // which is legal and < 0x7f, we exclude whitespace and line terminators, and then accept
                    // everything > 0x7f.
                    //
                    // Here's the ES5 production:
                    //
                    //  Lu | Ll | Lt | Lm | Lo | Nl
                    //  $
                    //  _
                    //  \ UnicodeEscapeSequence
                    //
                    switch (code) {
                        case (code >= /*a*/97 && code <= /*z*/122) && code:
                        case (code >= /*A*/65 && code <= /*Z*/90) && code:
                        case /*$*/36:
                        case /*_*/95:
                            return true;

                        case isWhitespace(code) && code:
                        case isLineTerminator(code) && code:
                            return false;

                        case (code > 0x7f) && code:
                            return true;

                        case /*\*/92:
                            if (offset + 4 < limit) {
                                if (text.charCodeAt(offset) === /*u*/117 &&
                                    isHexDigit(text.charCodeAt(offset + 1)) &&
                                    isHexDigit(text.charCodeAt(offset + 2)) &&
                                    isHexDigit(text.charCodeAt(offset + 3)) &&
                                    isHexDigit(text.charCodeAt(offset + 4))) {
                                    return true;
                                }
                            }
                            return false;

                        default:
                            return false;
                    }
                }
                /*
        // Hand-inlined into readIdentifierPart
        function isIdentifierPartCharacter(code) {
        // See comment in isIdentifierStartCharacter.
        //
        // Mn | Mc | Nd | Pc
        // <ZWNJ> | <ZWJ>
        //
        switch (code) {
        case isIdentifierStartCharacter(code) && code:
        case isDecimalDigit(code) && code:
        return true;

        default:
        return false;
        }
        }
        */
                function readIdentifierPart(text, offset, limit) {
                    var hasEscape = false;
                    while (offset < limit) {
                        var code = text.charCodeAt(offset);
                        switch (code) {
                            //case isIdentifierStartCharacter(code) && code:
                            case (code >= /*a*/97 && code <= /*z*/122) && code:
                            case (code >= /*A*/65 && code <= /*Z*/90) && code:
                            case /*$*/36:
                            case /*_*/95:
                                break;

                            case isWhitespace(code) && code:
                            case isLineTerminator(code) && code:
                                return hasEscape ? -offset : offset;

                            case (code > 0x7f) && code:
                                break;

                                //case isDecimalDigit(code) && code:
                            case (code >= /*0*/48 && code <= /*9*/57) && code:
                                break;

                            case /*\*/92:
                                if (offset + 5 < limit) {
                                    if (text.charCodeAt(offset + 1) === /*u*/117 &&
                                        isHexDigit(text.charCodeAt(offset + 2)) &&
                                        isHexDigit(text.charCodeAt(offset + 3)) &&
                                        isHexDigit(text.charCodeAt(offset + 4)) &&
                                        isHexDigit(text.charCodeAt(offset + 5))) {
                                        offset += 5;
                                        hasEscape = true;
                                        break;
                                    }
                                }
                                return hasEscape ? -offset : offset;

                            default:
                                return hasEscape ? -offset : offset;
                        }
                        offset++;
                    }
                    return hasEscape ? -offset : offset;
                }
                function readIdentifierToken(text, offset, limit) {
                    var startOffset = offset;
                    offset = readIdentifierPart(text, offset, limit);
                    var hasEscape = false;
                    if (offset < 0) {
                        offset = -offset;
                        hasEscape = true;
                    }
                    var identifier = text.substr(startOffset, offset - startOffset);
                    if (hasEscape) {
                        identifier = "" + JSON.parse('"' + identifier + '"');
                    }
                    var wordToken = reservedWordLookup(identifier);
                    if (wordToken) {
                        return wordToken;
                    }
                    return {
                        type: tokenType.identifier,
                        length: offset - startOffset,
                        value: identifier
                    };
                }
                function isHexDigit(code) {
                    switch (code) {
                        case (code >= /*0*/48 && code <= /*9*/57) && code:
                        case (code >= /*a*/97 && code <= /*f*/102) && code:
                        case (code >= /*A*/65 && code <= /*F*/70) && code:
                            return true;

                        default:
                            return false;
                    }
                }
                function readHexIntegerLiteral(text, offset, limit) {
                    while (offset < limit && isHexDigit(text.charCodeAt(offset))) {
                        offset++;
                    }
                    return offset;
                }
                function isDecimalDigit(code) {
                    switch (code) {
                        case (code >= /*0*/48 && code <= /*9*/57) && code:
                            return true;

                        default:
                            return false;
                    }
                }
                function readDecimalDigits(text, offset, limit) {
                    while (offset < limit && isDecimalDigit(text.charCodeAt(offset))) {
                        offset++;
                    }
                    return offset;
                }
                function readDecimalLiteral(text, offset, limit) {
                    offset = readDecimalDigits(text, offset, limit);
                    if (offset < limit && text.charCodeAt(offset) === /*.*/46 && offset + 1 < limit && isDecimalDigit(text.charCodeAt(offset + 1))) {
                        offset = readDecimalDigits(text, offset + 2, limit);
                    }
                    if (offset < limit) {
                        var code = text.charCodeAt(offset);
                        if (code === /*e*/101 || code === /*E*/69) {
                            var tempOffset = offset + 1;
                            if (tempOffset < limit) {
                                code = text.charCodeAt(tempOffset);
                                if (code === /*+*/43 || code === /*-*/45) {
                                    tempOffset++;
                                }
                                offset = readDecimalDigits(text, tempOffset, limit);
                            }
                        }
                    }
                    return offset;
                }
                function readDecimalLiteralToken(text, start, offset, limit) {
                    var offset = readDecimalLiteral(text, offset, limit);
                    var length = offset - start;
                    return {
                        type: tokenType.numberLiteral,
                        length: length,
                        value: +text.substr(start, length)
                    };
                }
                function isLineTerminator(code) {
                    switch (code) {
                        case 0x000A:    // line feed
                        case 0x000D:    // carriage return
                        case 0x2028:    // line separator
                        case 0x2029:    // paragraph separator
                            return true;

                        default:
                            return false;
                    }
                }
                function readStringLiteralToken(text, offset, limit) {
                    var startOffset = offset;
                    var quoteCharCode = text.charCodeAt(offset);
                    var hasEscape = false;
                    offset++;
                    while (offset < limit && !isLineTerminator(text.charCodeAt(offset))) {
                        if (offset + 1 < limit && text.charCodeAt(offset) === /*\*/92) {
                            hasEscape = true;

                            switch (text.charCodeAt(offset + 1)) {
                                case quoteCharCode:
                                case 0x005C:    // \
                                case 0x000A:    // line feed
                                case 0x2028:    // line separator
                                case 0x2029:    // paragraph separator
                                    offset += 2;
                                    continue;

                                case 0x000D:    // carriage return
                                    if (offset + 2 < limit && text.charCodeAt(offset + 2) === 0x000A) {
                                        // Skip \r\n
                                        offset += 3;
                                    } else {
                                        offset += 2;
                                    }
                                    continue;
                            }
                        }
                        offset++;
                        if (text.charCodeAt(offset - 1) === quoteCharCode) {
                            break;
                        }
                    }
                    var length = offset - startOffset;
                    // If we don't have a terminating quote go through the escape path.
                    hasEscape = hasEscape || length === 1 || text.charCodeAt(offset - 1) !== quoteCharCode;
                    var stringValue;
                    if (hasEscape) {
                        stringValue = eval(text.substr(startOffset, length)); // jshint ignore:line
                    } else {
                        stringValue = text.substr(startOffset + 1, length - 2);
                    }
                    return {
                        type: tokenType.stringLiteral,
                        length: length,
                        value: stringValue
                    };
                }
                function isWhitespace(code) {
                    switch (code) {
                        case 0x0009:    // tab
                        case 0x000B:    // vertical tab
                        case 0x000C:    // form feed
                        case 0x0020:    // space
                        case 0x00A0:    // no-breaking space
                        case 0xFEFF:    // BOM
                            return true;

                            // There are no category Zs between 0x00A0 and 0x1680.
                            //
                        case (code < 0x1680) && code:
                            return false;

                            // Unicode category Zs
                            //
                        case 0x1680:
                        case 0x180e:
                        case (code >= 0x2000 && code <= 0x200a) && code:
                        case 0x202f:
                        case 0x205f:
                        case 0x3000:
                            return true;

                        default:
                            return false;
                    }
                }
                // Hand-inlined isWhitespace.
                function readWhitespace(text, offset, limit) {
                    while (offset < limit) {
                        var code = text.charCodeAt(offset);
                        switch (code) {
                            case 0x0009:    // tab
                            case 0x000B:    // vertical tab
                            case 0x000C:    // form feed
                            case 0x0020:    // space
                            case 0x00A0:    // no-breaking space
                            case 0xFEFF:    // BOM
                                break;

                                // There are no category Zs between 0x00A0 and 0x1680.
                                //
                            case (code < 0x1680) && code:
                                return offset;

                                // Unicode category Zs
                                //
                            case 0x1680:
                            case 0x180e:
                            case (code >= 0x2000 && code <= 0x200a) && code:
                            case 0x202f:
                            case 0x205f:
                            case 0x3000:
                                break;

                            default:
                                return offset;
                        }
                        offset++;
                    }
                    return offset;
                }
                function lex(result, text, offset, limit) {
                    while (offset < limit) {
                        var startOffset = offset;
                        var code = text.charCodeAt(offset++);
                        var token;
                        switch (code) {
                            case isWhitespace(code) && code:
                            case isLineTerminator(code) && code:
                                offset = readWhitespace(text, offset, limit);
                                token = { type: tokenType.separator, length: offset - startOffset };
                                // don't include whitespace in the token stream.
                                continue;

                            case /*"*/34:
                            case /*'*/39:
                                token = readStringLiteralToken(text, offset - 1, limit);
                                break;

                            case /*(*/40:
                                token = tokens.leftParentheses;
                                break;

                            case /*)*/41:
                                token = tokens.rightParentheses;
                                break;

                            case /*+*/43:
                            case /*-*/45:
                                if (offset < limit) {
                                    var afterSign = text.charCodeAt(offset);
                                    if (afterSign === /*.*/46) {
                                        var signOffset = offset + 1;
                                        if (signOffset < limit && isDecimalDigit(text.charCodeAt(signOffset))) {
                                            token = readDecimalLiteralToken(text, startOffset, signOffset, limit);
                                            break;
                                        }
                                    } else if (isDecimalDigit(afterSign)) {
                                        token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                        break;
                                    }
                                }
                                token = { type: tokenType.error, length: offset - startOffset, value: text.substring(startOffset, offset) };
                                break;

                            case /*,*/44:
                                token = tokens.comma;
                                break;

                            case /*.*/46:
                                token = tokens.dot;
                                if (offset < limit && isDecimalDigit(text.charCodeAt(offset))) {
                                    token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                }
                                break;

                            case /*0*/48:
                                var ch2 = (offset < limit ? text.charCodeAt(offset) : 0);
                                if (ch2 === /*x*/120 || ch2 === /*X*/88) {
                                    var hexOffset = readHexIntegerLiteral(text, offset + 1, limit);
                                    token = {
                                        type: tokenType.numberLiteral,
                                        length: hexOffset - startOffset,
                                        value: +text.substr(startOffset, hexOffset - startOffset)
                                    };
                                } else {
                                    token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                }
                                break;

                            case (code >= /*1*/49 && code <= /*9*/57) && code:
                                token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                break;

                            case /*:*/58:
                                token = tokens.colon;
                                break;

                            case /*;*/59:
                                token = tokens.semicolon;
                                break;

                            case /*[*/91:
                                token = tokens.leftBracket;
                                break;

                            case /*]*/93:
                                token = tokens.rightBracket;
                                break;

                            case /*{*/123:
                                token = tokens.leftBrace;
                                break;

                            case /*}*/125:
                                token = tokens.rightBrace;
                                break;

                            default:
                                if (isIdentifierStartCharacter(code, text, offset, limit)) {
                                    token = readIdentifierToken(text, offset - 1, limit);
                                    break;
                                }
                                token = { type: tokenType.error, length: offset - startOffset, value: text.substring(startOffset, offset) };
                                break;
                        }

                        offset += (token.length - 1);
                        result.push(token);
                    }
                }
                return function (text) {
                    var result = [];
                    lex(result, text, 0, text.length);
                    result.push(tokens.eof);
                    return result;
                };
            })();
            lexer.tokenType = tokenType;
            return lexer;
        })
    });
});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/ControlProcessor/_OptionsParser',[
    'exports',
    '../Core/_Base',
    '../Core/_BaseUtils',
    '../Core/_ErrorFromName',
    '../Core/_Resources',
    './_OptionsLexer'
    ], function optionsParserInit(exports, _Base, _BaseUtils, _ErrorFromName, _Resources, _OptionsLexer) {
    "use strict";

    var strings = {
        get invalidOptionsRecord() { return "Invalid options record: '{0}', expected to be in the format of an object literal. {1}"; },
        get unexpectedTokenExpectedToken() { return "Unexpected token: {0}, expected token: {1}, at offset {2}"; },
        get unexpectedTokenExpectedTokens() { return "Unexpected token: {0}, expected one of: {1}, at offset {2}"; },
        get unexpectedTokenGeneric() { return "Unexpected token: {0}, at offset {1}"; },
    };

    /*
    Notation is described in ECMA-262-5 (ECMAScript Language Specification, 5th edition) section 5.

    Lexical grammar is defined in ECMA-262-5, section 7.

    Lexical productions used in this grammar defined in ECMA-262-5:

        Production          Section
        --------------------------------
        Identifier          7.6
        NullLiteral         7.8.1
        BooleanLiteral      7.8.2
        NumberLiteral       7.8.3
        StringLiteral       7.8.4

    Syntactic grammar for the value of the data-win-options attribute.

        OptionsLiteral:
            ObjectLiteral

        ObjectLiteral:
            { }
            { ObjectProperties }
            { ObjectProperties , }

        ObjectProperties:
            ObjectProperty
            ObjectProperties, ObjectProperty

        ObjectProperty:
            PropertyName : Value

        PropertyName:                       (from ECMA-262-6, 11.1.5)
            StringLiteral
            NumberLiteral
            Identifier

        ArrayLiteral:
            [ ]
            [ Elision ]
            [ ArrayElements ]
            [ ArrayElements , ]
            [ ArrayElements , Elision ]

        ArrayElements:
            Value
            Elision Value
            ArrayElements , Value
            ArrayElements , Elision Value

        Elision:
            ,
            Elision ,

        Value:
            NullLiteral
            NumberLiteral
            BooleanLiteral
            StringLiteral
            ArrayLiteral
            ObjectLiteral
            IdentifierExpression
            ObjectQueryExpression

        AccessExpression:
            [ Value ]
            . Identifier

        AccessExpressions:
            AccessExpression
            AccessExpressions AccessExpression

        IdentifierExpression:
            Identifier
            Identifier AccessExpressions

        ObjectQueryExpression:
            Identifier ( StringLiteral )
            Identifier ( StringLiteral ) AccessExpressions


    NOTE: We have factored the above grammar to allow the infrastructure to be used
          by the BindingInterpreter as well. The BaseInterpreter does NOT provide an
          implementation of _evaluateValue(), this is expected to be provided by the
          derived class since right now the two have different grammars for Value

        AccessExpression:
            [ Value ]
            . Identifier

        AccessExpressions:
            AccessExpression
            AccessExpressions AccessExpression

        Identifier:
            Identifier                      (from ECMA-262-6, 7.6)

        IdentifierExpression:
            Identifier
            Identifier AccessExpressions

        Value:
            *** Provided by concrete interpreter ***

*/

    function illegal() {
        throw "Illegal";
    }

    var imports = _Base.Namespace.defineWithParent(null, null, {
        lexer: _Base.Namespace._lazy(function () {
            return _OptionsLexer._optionsLexer;
        }),
        tokenType: _Base.Namespace._lazy(function () {
            return _OptionsLexer._optionsLexer.tokenType;
        }),
    });

    var requireSupportedForProcessing = _BaseUtils.requireSupportedForProcessing;

    function tokenTypeName(type) {
        var keys = Object.keys(imports.tokenType);
        for (var i = 0, len = keys.length; i < len; i++) {
            if (type === imports.tokenType[keys[i]]) {
                return keys[i];
            }
        }
        return "<unknown>";
    }

    var local = _Base.Namespace.defineWithParent(null, null, {

        BaseInterpreter: _Base.Namespace._lazy(function () {
            return _Base.Class.define(null, {
                _error: function (message) {
                    throw new _ErrorFromName("WinJS.UI.ParseError", message);
                },
                _currentOffset: function () {
                    var p = this._pos;
                    var offset = 0;
                    for (var i = 0; i < p; i++) {
                        offset += this._tokens[i].length;
                    }
                    return offset;
                },
                _evaluateAccessExpression: function (value) {
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                            this._read();
                            switch (this._current.type) {
                                case imports.tokenType.identifier:
                                case this._current.keyword && this._current.type:
                                    var id = this._current.value;
                                    this._read();
                                    return value[id];

                                default:
                                    this._unexpectedToken(imports.tokenType.identifier, imports.tokenType.reservedWord);
                                    break;
                            }
                            return;

                        case imports.tokenType.leftBracket:
                            this._read();
                            var index = this._evaluateValue();
                            this._read(imports.tokenType.rightBracket);
                            return value[index];

                            // default: is unreachable because all the callers are conditional on
                            // the next token being either a . or {
                            //
                    }
                },
                _evaluateAccessExpressions: function (value) {
                    while (true) {
                        switch (this._current.type) {
                            case imports.tokenType.dot:
                            case imports.tokenType.leftBracket:
                                value = this._evaluateAccessExpression(value);
                                break;

                            default:
                                return value;
                        }
                    }
                },
                _evaluateIdentifier: function (nested, value) {
                    var id = this._readIdentifier();
                    value = nested ? value[id] : this._context[id];
                    return value;
                },
                _evaluateIdentifierExpression: function () {
                    var value = this._evaluateIdentifier(false);

                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            return this._evaluateAccessExpressions(value);
                        default:
                            return value;
                    }
                },
                _initialize: function (tokens, originalSource, context, functionContext) {
                    this._originalSource = originalSource;
                    this._tokens = tokens;
                    this._context = context;
                    this._functionContext = functionContext;
                    this._pos = 0;
                    this._current = this._tokens[0];
                },
                _read: function (expected) {
                    if (expected && this._current.type !== expected) {
                        this._unexpectedToken(expected);
                    }
                    if (this._current !== imports.tokenType.eof) {
                        this._current = this._tokens[++this._pos];
                    }
                },
                _peek: function (expected) {
                    if (expected && this._current.type !== expected) {
                        return;
                    }
                    if (this._current !== imports.tokenType.eof) {
                        return this._tokens[this._pos + 1];
                    }
                },
                _readAccessExpression: function (parts) {
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                            this._read();
                            switch (this._current.type) {
                                case imports.tokenType.identifier:
                                case this._current.keyword && this._current.type:
                                    parts.push(this._current.value);
                                    this._read();
                                    break;

                                default:
                                    this._unexpectedToken(imports.tokenType.identifier, imports.tokenType.reservedWord);
                                    break;
                            }
                            return;

                        case imports.tokenType.leftBracket:
                            this._read();
                            parts.push(this._evaluateValue());
                            this._read(imports.tokenType.rightBracket);
                            return;

                            // default: is unreachable because all the callers are conditional on
                            // the next token being either a . or {
                            //
                    }
                },
                _readAccessExpressions: function (parts) {
                    while (true) {
                        switch (this._current.type) {
                            case imports.tokenType.dot:
                            case imports.tokenType.leftBracket:
                                this._readAccessExpression(parts);
                                break;

                            default:
                                return;
                        }
                    }
                },
                _readIdentifier: function () {
                    var id = this._current.value;
                    this._read(imports.tokenType.identifier);
                    return id;
                },
                _readIdentifierExpression: function () {
                    var parts = [];
                    if (this._peek(imports.tokenType.thisKeyword) && parts.length === 0) {
                        this._read();
                    } else {
                        parts.push(this._readIdentifier());
                    }

                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            this._readAccessExpressions(parts);
                            break;
                    }

                    return parts;
                },
                _unexpectedToken: function (expected) {
                    var unexpected = (this._current.type === imports.tokenType.error ? "'" + this._current.value + "'" : tokenTypeName(this._current.type));
                    if (expected) {
                        if (arguments.length === 1) {
                            expected = tokenTypeName(expected);
                            this._error(_Resources._formatString(strings.unexpectedTokenExpectedToken, unexpected, expected, this._currentOffset()));
                        } else {
                            var names = [];
                            for (var i = 0, len = arguments.length; i < len; i++) {
                                names.push(tokenTypeName(arguments[i]));
                            }
                            expected = names.join(", ");
                            this._error(_Resources._formatString(strings.unexpectedTokenExpectedTokens, unexpected, expected, this._currentOffset()));
                        }
                    } else {
                        this._error(_Resources._formatString(strings.unexpectedTokenGeneric, unexpected, this._currentOffset()));
                    }
                }
            }, {
                supportedForProcessing: false,
            });
        }),

        OptionsInterpreter: _Base.Namespace._lazy(function () {
            return _Base.Class.derive(local.BaseInterpreter, function (tokens, originalSource, context, functionContext) {
                this._initialize(tokens, originalSource, context, functionContext);
            }, {
                _error: function (message) {
                    throw new _ErrorFromName("WinJS.UI.ParseError", _Resources._formatString(strings.invalidOptionsRecord, this._originalSource, message));
                },
                _evaluateArrayLiteral: function () {
                    var a = [];
                    this._read(imports.tokenType.leftBracket);
                    this._readArrayElements(a);
                    this._read(imports.tokenType.rightBracket);
                    return a;
                },
                _evaluateObjectLiteral: function () {
                    var o = {};
                    this._read(imports.tokenType.leftBrace);
                    this._readObjectProperties(o);
                    this._tryReadComma();
                    this._read(imports.tokenType.rightBrace);
                    return o;
                },
                _evaluateOptionsLiteral: function () {
                    var value = this._evaluateValue();
                    if (this._current.type !== imports.tokenType.eof) {
                        this._unexpectedToken(imports.tokenType.eof);
                    }
                    return value;
                },
                _peekValue: function () {
                    switch (this._current.type) {
                        case imports.tokenType.falseLiteral:
                        case imports.tokenType.nullLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.trueLiteral:
                        case imports.tokenType.numberLiteral:
                        case imports.tokenType.leftBrace:
                        case imports.tokenType.leftBracket:
                        case imports.tokenType.identifier:
                            return true;
                        default:
                            return false;
                    }
                },
                _evaluateValue: function () {
                    switch (this._current.type) {
                        case imports.tokenType.falseLiteral:
                        case imports.tokenType.nullLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.trueLiteral:
                        case imports.tokenType.numberLiteral:
                            var value = this._current.value;
                            this._read();
                            return value;

                        case imports.tokenType.leftBrace:
                            return this._evaluateObjectLiteral();

                        case imports.tokenType.leftBracket:
                            return this._evaluateArrayLiteral();

                        case imports.tokenType.identifier:
                            if (this._peek(imports.tokenType.identifier).type === imports.tokenType.leftParentheses) {
                                return requireSupportedForProcessing(this._evaluateObjectQueryExpression());
                            }
                            return requireSupportedForProcessing(this._evaluateIdentifierExpression());

                        default:
                            this._unexpectedToken(imports.tokenType.falseLiteral, imports.tokenType.nullLiteral, imports.tokenType.stringLiteral,
                                imports.tokenType.trueLiteral, imports.tokenType.numberLiteral, imports.tokenType.leftBrace, imports.tokenType.leftBracket,
                                imports.tokenType.identifier);
                            break;
                    }
                },
                _tryReadElement: function (a) {
                    if (this._peekValue()) {
                        a.push(this._evaluateValue());
                        return true;
                    } else {
                        return false;
                    }
                },
                _tryReadComma: function () {
                    if (this._peek(imports.tokenType.comma)) {
                        this._read();
                        return true;
                    }
                    return false;
                },
                _tryReadElision: function (a) {
                    var found = false;
                    while (this._tryReadComma()) {
                        a.push(undefined);
                        found = true;
                    }
                    return found;
                },
                _readArrayElements: function (a) {
                    while (!this._peek(imports.tokenType.rightBracket)) {
                        var elision = this._tryReadElision(a);
                        var element = this._tryReadElement(a);
                        var comma = this._peek(imports.tokenType.comma);
                        if (element && comma) {
                            // if we had a element followed by a comma, eat the comma and try to read the next element
                            this._read();
                        } else if (element || elision) {
                            // if we had a element without a trailing comma or if all we had were commas we're done
                            break;
                        } else {
                            // if we didn't have a element or elision then we are done and in error
                            this._unexpectedToken(imports.tokenType.falseLiteral, imports.tokenType.nullLiteral, imports.tokenType.stringLiteral,
                                imports.tokenType.trueLiteral, imports.tokenType.numberLiteral, imports.tokenType.leftBrace, imports.tokenType.leftBracket,
                                imports.tokenType.identifier);
                            break;
                        }
                    }
                },
                _readObjectProperties: function (o) {
                    while (!this._peek(imports.tokenType.rightBrace)) {
                        var property = this._tryReadObjectProperty(o);
                        var comma = this._peek(imports.tokenType.comma);
                        if (property && comma) {
                            // if we had a property followed by a comma, eat the comma and try to read the next property
                            this._read();
                        } else if (property) {
                            // if we had a property without a trailing comma we're done
                            break;
                        } else {
                            // if we didn't have a property then we are done and in error
                            this._unexpectedToken(imports.tokenType.numberLiteral, imports.tokenType.stringLiteral, imports.tokenType.identifier);
                            break;
                        }
                    }
                },
                _tryReadObjectProperty: function (o) {
                    switch (this._current.type) {
                        case imports.tokenType.numberLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.identifier:
                        case this._current.keyword && this._current.type:
                            var propertyName = this._current.value;
                            this._read();
                            this._read(imports.tokenType.colon);
                            o[propertyName] = this._evaluateValue();
                            return true;

                        default:
                            return false;
                    }
                },
                _failReadObjectProperty: function () {
                    this._unexpectedToken(imports.tokenType.numberLiteral, imports.tokenType.stringLiteral, imports.tokenType.identifier, imports.tokenType.reservedWord);
                },
                _evaluateObjectQueryExpression: function () {
                    var functionName = this._current.value;
                    this._read(imports.tokenType.identifier);
                    this._read(imports.tokenType.leftParentheses);
                    var queryExpression = this._current.value;
                    this._read(imports.tokenType.stringLiteral);
                    this._read(imports.tokenType.rightParentheses);

                    var value = requireSupportedForProcessing(this._functionContext[functionName])(queryExpression);
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            return this._evaluateAccessExpressions(value);

                        default:
                            return value;
                    }
                },
                run: function () {
                    return this._evaluateOptionsLiteral();
                }
            }, {
                supportedForProcessing: false,
            });
        }),

        OptionsParser: _Base.Namespace._lazy(function () {
            return _Base.Class.derive(local.OptionsInterpreter, function (tokens, originalSource) {
                this._initialize(tokens, originalSource);
            }, {
                // When parsing it is illegal to get to any of these "evaluate" RHS productions because
                //  we will always instead go to the "read" version
                //
                _evaluateAccessExpression: illegal,
                _evaluateAccessExpressions: illegal,
                _evaluateIdentifier: illegal,
                _evaluateIdentifierExpression: illegal,
                _evaluateObjectQueryExpression: illegal,

                _evaluateValue: function () {
                    switch (this._current.type) {
                        case imports.tokenType.falseLiteral:
                        case imports.tokenType.nullLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.trueLiteral:
                        case imports.tokenType.numberLiteral:
                            var value = this._current.value;
                            this._read();
                            return value;

                        case imports.tokenType.leftBrace:
                            return this._evaluateObjectLiteral();

                        case imports.tokenType.leftBracket:
                            return this._evaluateArrayLiteral();

                        case imports.tokenType.identifier:
                            if (this._peek(imports.tokenType.identifier).type === imports.tokenType.leftParentheses) {
                                return this._readObjectQueryExpression();
                            }
                            return this._readIdentifierExpression();

                        default:
                            this._unexpectedToken(imports.tokenType.falseLiteral, imports.tokenType.nullLiteral, imports.tokenType.stringLiteral,
                                imports.tokenType.trueLiteral, imports.tokenType.numberLiteral, imports.tokenType.leftBrace, imports.tokenType.leftBracket,
                                imports.tokenType.identifier);
                            break;
                    }
                },

                _readIdentifierExpression: function () {
                    var parts = local.BaseInterpreter.prototype._readIdentifierExpression.call(this);
                    return new IdentifierExpression(parts);
                },
                _readObjectQueryExpression: function () {
                    var functionName = this._current.value;
                    this._read(imports.tokenType.identifier);
                    this._read(imports.tokenType.leftParentheses);
                    var queryExpressionLiteral = this._current.value;
                    this._read(imports.tokenType.stringLiteral);
                    this._read(imports.tokenType.rightParentheses);

                    var call = new CallExpression(functionName, queryExpressionLiteral);
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            var parts = [call];
                            this._readAccessExpressions(parts);
                            return new IdentifierExpression(parts);

                        default:
                            return call;
                    }
                },
            }, {
                supportedForProcessing: false,
            });
        })

    });

    var parser = function (text, context, functionContext) {
        var tokens = imports.lexer(text);
        var interpreter = new local.OptionsInterpreter(tokens, text, context || {}, functionContext || {});
        return interpreter.run();
    };
    Object.defineProperty(parser, "_BaseInterpreter", { get: function () { return local.BaseInterpreter; } });

    var parser2 = function (text) {
        var tokens = imports.lexer(text);
        var parser = new local.OptionsParser(tokens, text);
        return parser.run();
    };

    // Consumers of parser2 need to be able to see the AST for RHS expression in order to emit
    //  code representing these portions of the options record
    //
    var CallExpression = _Base.Class.define(function (target, arg0Value) {
        this.target = target;
        this.arg0Value = arg0Value;
    });
    CallExpression.supportedForProcessing = false;

    var IdentifierExpression = _Base.Class.define(function (parts) {
        this.parts = parts;
    });
    IdentifierExpression.supportedForProcessing = false;

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {

        // This is the mis-named interpreter version of the options record processor.
        //
        optionsParser: parser,

        // This is the actual parser version of the options record processor.
        //
        _optionsParser: parser2,
        _CallExpression: CallExpression,
        _IdentifierExpression: IdentifierExpression,

    });

});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/ControlProcessor',[
    'exports',
    './Core/_Global',
    './Core/_Base',
    './Core/_BaseUtils',
    './Core/_Log',
    './Core/_Resources',
    './Core/_WriteProfilerMark',
    './ControlProcessor/_OptionsParser',
    './Promise',
    './Utilities/_ElementUtilities'
    ], function declarativeControlsInit(exports, _Global, _Base, _BaseUtils, _Log, _Resources, _WriteProfilerMark, _OptionsParser, Promise, _ElementUtilities) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    var strings = {
        get errorActivatingControl() { return "Error activating control: {0}"; },
    };

    var markSupportedForProcessing = _BaseUtils.markSupportedForProcessing;
    var requireSupportedForProcessing = _BaseUtils.requireSupportedForProcessing;
    var processedAllCalled = false;

    function createSelect(element) {
        var result = function select(selector) {
            /// <signature helpKeyword="WinJS.UI.select.createSelect">
            /// <summary locid="WinJS.UI.select.createSelect">
            /// Walks the DOM tree from the given  element to the root of the document, whenever
            /// a selector scope is encountered select performs a lookup within that scope for
            /// the given selector string. The first matching element is returned.
            /// </summary>
            /// <param name="selector" type="String" locid="WinJS.UI.select.createSelect_p:selector">The selector string.</param>
            /// <returns type="HTMLElement" domElement="true" locid="WinJS.UI.select.createSelect_returnValue">The target element, if found.</returns>
            /// </signature>
            var current = element;
            var selected;
            while (current) {
                if (current.msParentSelectorScope) {
                    var scope = current.parentNode;
                    if (scope) {
                        selected = _ElementUtilities._matchesSelector(scope, selector) ? scope : scope.querySelector(selector);
                        if (selected) {
                            break;
                        }
                    }
                }
                current = current.parentNode;
            }

            return selected || _Global.document.querySelector(selector);
        };
        return markSupportedForProcessing(result);
    }

    function activate(element, Handler) {
        return new Promise(function activate2(complete, error) {
            try {
                var options;
                var optionsAttribute = element.getAttribute("data-win-options");
                if (optionsAttribute) {
                    options = _OptionsParser.optionsParser(optionsAttribute, _Global, {
                        select: createSelect(element)
                    });
                }

                var ctl;
                var count = 1;

                // handler is required to call complete if it takes that parameter
                //
                if (Handler.length > 2) {
                    count++;
                }
                var checkComplete = function checkComplete() {
                    count--;
                    if (count === 0) {
                        element.winControl = element.winControl || ctl;
                        complete(ctl);
                    }
                };

                // async exceptions from the handler get dropped on the floor...
                //
                ctl = new Handler(element, options, checkComplete);
                checkComplete();
            }
            catch (err) {
                _Log.log && _Log.log(_Resources._formatString(strings.errorActivatingControl, err && err.message), "winjs controls", "error");
                error(err);
            }
        });
    }

    function processAllImpl(rootElement, skipRootElement) {
        return new Promise(function processAllImpl2(complete, error) {
            _WriteProfilerMark("WinJS.UI:processAll,StartTM");
            rootElement = rootElement || _Global.document.body;
            var pending = 0;
            var selector = "[data-win-control]";
            var allElements = rootElement.querySelectorAll(selector);
            var elements = [];
            if (!skipRootElement && getControlHandler(rootElement)) {
                elements.push(rootElement);
            }
            for (var i = 0, len = allElements.length; i < len; i++) {
                elements.push(allElements[i]);
            }

            // bail early if there is nothing to process
            //
            if (elements.length === 0) {
                _WriteProfilerMark("WinJS.UI:processAll,StopTM");
                complete(rootElement);
                return;
            }

            var checkAllComplete = function () {
                pending = pending - 1;
                if (pending < 0) {
                    _WriteProfilerMark("WinJS.UI:processAll,StopTM");
                    complete(rootElement);
                }
            };

            // First go through and determine which elements to activate
            //
            var controls = new Array(elements.length);
            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[i];
                var control;
                var instance = element.winControl;
                if (instance) {
                    control = instance.constructor;
                    // already activated, don't need to add to controls array
                } else {
                    controls[i] = control = getControlHandler(element);
                }
                if (control && control.isDeclarativeControlContainer) {
                    i += element.querySelectorAll(selector).length;
                }
            }

            // Now go through and activate those
            //
            _WriteProfilerMark("WinJS.UI:processAllActivateControls,StartTM");
            for (var i = 0, len = elements.length; i < len; i++) {
                var ctl = controls[i];
                var element = elements[i];
                if (ctl && !element.winControl) {
                    pending++;
                    activate(element, ctl).then(checkAllComplete, function (e) {
                        _WriteProfilerMark("WinJS.UI:processAll,StopTM");
                        error(e);
                    });

                    if (ctl.isDeclarativeControlContainer && typeof ctl.isDeclarativeControlContainer === "function") {
                        var idcc = requireSupportedForProcessing(ctl.isDeclarativeControlContainer);
                        idcc(element.winControl, processAll);
                    }
                }
            }
            _WriteProfilerMark("WinJS.UI:processAllActivateControls,StopTM");

            checkAllComplete();
        });
    }

    function getControlHandler(element) {
        if (element.getAttribute) {
            var evaluator = element.getAttribute("data-win-control");
            if (evaluator) {
                return _BaseUtils._getMemberFiltered(evaluator.trim(), _Global, requireSupportedForProcessing);
            }
        }
    }

    function scopedSelect(selector, element) {
        /// <signature helpKeyword="WinJS.UI.scopedSelect">
        /// <summary locid="WinJS.UI.scopedSelect">
        /// Walks the DOM tree from the given  element to the root of the document, whenever
        /// a selector scope is encountered select performs a lookup within that scope for
        /// the given selector string. The first matching element is returned.
        /// </summary>
        /// <param name="selector" type="String" locid="WinJS.UI.scopedSelect_p:selector">The selector string.</param>
        /// <returns type="HTMLElement" domElement="true" locid="WinJS.UI.scopedSelect_returnValue">The target element, if found.</returns>
        /// </signature>
        return createSelect(element)(selector);
    }

    function processAll(rootElement, skipRoot) {
        /// <signature helpKeyword="WinJS.UI.processAll">
        /// <summary locid="WinJS.UI.processAll">
        /// Applies declarative control binding to all elements, starting at the specified root element.
        /// </summary>
        /// <param name="rootElement" type="Object" domElement="true" locid="WinJS.UI.processAll_p:rootElement">
        /// The element at which to start applying the binding. If this parameter is not specified, the binding is applied to the entire document.
        /// </param>
        /// <param name="skipRoot" type="Boolean" optional="true" locid="WinJS.UI.processAll_p:skipRoot">
        /// If true, the elements to be bound skip the specified root element and include only the children.
        /// </param>
        /// <returns type="WinJS.Promise" locid="WinJS.UI.processAll_returnValue">
        /// A promise that is fulfilled when binding has been applied to all the controls.
        /// </returns>
        /// </signature>
        if (!processedAllCalled) {
            return _BaseUtils.ready().then(function () {
                processedAllCalled = true;
                return processAllImpl(rootElement, skipRoot);
            });
        } else {
            return processAllImpl(rootElement, skipRoot);
        }
    }

    function process(element) {
        /// <signature helpKeyword="WinJS.UI.process">
        /// <summary locid="WinJS.UI.process">
        /// Applies declarative control binding to the specified element.
        /// </summary>
        /// <param name="element" type="Object" domElement="true" locid="WinJS.UI.process_p:element">
        /// The element to bind.
        /// </param>
        /// <returns type="WinJS.Promise" locid="WinJS.UI.process_returnValue">
        /// A promise that is fulfilled after the control is activated. The value of the
        /// promise is the control that is attached to element.
        /// </returns>
        /// </signature>

        if (element && element.winControl) {
            return Promise.as(element.winControl);
        }
        var handler = getControlHandler(element);
        if (!handler) {
            return Promise.as(); // undefined, no handler
        } else {
            return activate(element, handler);
        }
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        scopedSelect: scopedSelect,
        processAll: processAll,
        process: process
    });
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/_Signal',[
    './Core/_Base',
    './Promise/_StateMachine'
    ], function signalInit(_Base, _StateMachine) {
    "use strict";

    var SignalPromise = _Base.Class.derive(_StateMachine.PromiseStateMachine,
        function (cancel) {
            this._oncancel = cancel;
            this._setState(_StateMachine.state_created);
            this._run();
        }, {
            _cancelAction: function () { this._oncancel && this._oncancel(); },
            _cleanupAction: function () { this._oncancel = null; }
        }, {
            supportedForProcessing: false
        }
    );

    var Signal = _Base.Class.define(
        function Signal_ctor(oncancel) {
            this._promise = new SignalPromise(oncancel);
        }, {
            promise: {
                get: function () { return this._promise; }
            },

            cancel: function Signal_cancel() {
                this._promise.cancel();
            },
            complete: function Signal_complete(value) {
                this._promise._completed(value);
            },
            error: function Signal_error(value) {
                this._promise._error(value);
            },
            progress: function Signal_progress(value) {
                this._promise._progress(value);
            }
        }, {
            supportedForProcessing: false,
        }
    );

    _Base.Namespace.define("WinJS", {
        _Signal: Signal
    });

    return Signal;
});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_Control',[
    'exports',
    '../Core/_Global',
    '../Core/_Base'
    ], function controlInit(exports, _Global, _Base) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    function setOptions(control, options) {
        /// <signature helpKeyword="WinJS.UI.DOMEventMixin.setOptions">
        /// <summary locid="WinJS.UI.DOMEventMixin.setOptions">
        /// Adds the set of declaratively specified options (properties and events) to the specified control.
        /// If name of the options property begins with "on", the property value is a function and the control
        /// supports addEventListener. The setOptions method calls the addEventListener method on the control.
        /// </summary>
        /// <param name="control" type="Object" domElement="false" locid="WinJS.UI.DOMEventMixin.setOptions_p:control">
        /// The control on which the properties and events are to be applied.
        /// </param>
        /// <param name="options" type="Object" domElement="false" locid="WinJS.UI.DOMEventMixin.setOptions_p:options">
        /// The set of options that are specified declaratively.
        /// </param>
        /// </signature>
        _setOptions(control, options);
    }

    function _setOptions(control, options, eventsOnly) {
        if (typeof options === "object") {
            var keys = Object.keys(options);
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                var value = options[key];
                if (key.length > 2) {
                    var ch1 = key[0];
                    var ch2 = key[1];
                    if ((ch1 === 'o' || ch1 === 'O') && (ch2 === 'n' || ch2 === 'N')) {
                        if (typeof value === "function") {
                            if (control.addEventListener) {
                                control.addEventListener(key.substr(2), value);
                                continue;
                            }
                        }
                    }
                }

                if (!eventsOnly) {
                    control[key] = value;
                }
            }
        }
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        DOMEventMixin: _Base.Namespace._lazy(function () {
            return {
                _domElement: null,

                addEventListener: function (type, listener, useCapture) {
                    /// <signature helpKeyword="WinJS.UI.DOMEventMixin.addEventListener">
                    /// <summary locid="WinJS.UI.DOMEventMixin.addEventListener">
                    /// Adds an event listener to the control.
                    /// </summary>
                    /// <param name="type" type="String" locid="WinJS.UI.DOMEventMixin.addEventListener_p:type">
                    /// The type (name) of the event.
                    /// </param>
                    /// <param name="listener" type="Function" locid="WinJS.UI.DOMEventMixin.addEventListener_p:listener">
                    /// The listener to invoke when the event gets raised.
                    /// </param>
                    /// <param name="useCapture" type="Boolean" locid="WinJS.UI.DOMEventMixin.addEventListener_p:useCapture">
                    /// true to initiate capture; otherwise, false.
                    /// </param>
                    /// </signature>
                    (this.element || this._domElement).addEventListener(type, listener, useCapture || false);
                },
                dispatchEvent: function (type, eventProperties) {
                    /// <signature helpKeyword="WinJS.UI.DOMEventMixin.dispatchEvent">
                    /// <summary locid="WinJS.UI.DOMEventMixin.dispatchEvent">
                    /// Raises an event of the specified type, adding the specified additional properties.
                    /// </summary>
                    /// <param name="type" type="String" locid="WinJS.UI.DOMEventMixin.dispatchEvent_p:type">
                    /// The type (name) of the event.
                    /// </param>
                    /// <param name="eventProperties" type="Object" locid="WinJS.UI.DOMEventMixin.dispatchEvent_p:eventProperties">
                    /// The set of additional properties to be attached to the event object when the event is raised.
                    /// </param>
                    /// <returns type="Boolean" locid="WinJS.UI.DOMEventMixin.dispatchEvent_returnValue">
                    /// true if preventDefault was called on the event, otherwise false.
                    /// </returns>
                    /// </signature>
                    var eventValue = _Global.document.createEvent("Event");
                    eventValue.initEvent(type, false, false);
                    eventValue.detail = eventProperties;
                    if (typeof eventProperties === "object") {
                        Object.keys(eventProperties).forEach(function (key) {
                            eventValue[key] = eventProperties[key];
                        });
                    }
                    return (this.element || this._domElement).dispatchEvent(eventValue);
                },
                removeEventListener: function (type, listener, useCapture) {
                    /// <signature helpKeyword="WinJS.UI.DOMEventMixin.removeEventListener">
                    /// <summary locid="WinJS.UI.DOMEventMixin.removeEventListener">
                    /// Removes an event listener from the control.
                    /// </summary>
                    /// <param name="type" type="String" locid="WinJS.UI.DOMEventMixin.removeEventListener_p:type">
                    /// The type (name) of the event.
                    /// </param>
                    /// <param name="listener" type="Function" locid="WinJS.UI.DOMEventMixin.removeEventListener_p:listener">
                    /// The listener to remove.
                    /// </param>
                    /// <param name="useCapture" type="Boolean" locid="WinJS.UI.DOMEventMixin.removeEventListener_p:useCapture">
                    /// true to initiate capture; otherwise, false.
                    /// </param>
                    /// </signature>
                    (this.element || this._domElement).removeEventListener(type, listener, useCapture || false);
                }
            };
        }),

        setOptions: setOptions,

        _setOptions: _setOptions
    });

});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_ElementUtilities',[
    'exports',
    '../Core/_Global',
    '../Core/_Base',
    '../Core/_BaseUtils',
    '../Promise',
    '../Scheduler'
], function elementUtilities(exports, _Global, _Base, _BaseUtils, Promise, Scheduler) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    var _zoomToDuration = 167;

    function removeEmpties(arr) {
        var len = arr.length;
        for (var i = len - 1; i >= 0; i--) {
            if (!arr[i]) {
                arr.splice(i, 1);
                len--;
            }
        }
        return len;
    }

    function getClassName(e) {
        var name = e.className || "";
        if (typeof (name) === "string") {
            return name;
        } else {
            return name.baseVal || "";
        }
    }
    function setClassName(e, value) {
        // SVG elements (which use e.className.baseVal) are never undefined,
        // so this logic makes the comparison a bit more compact.
        //
        var name = e.className || "";
        if (typeof (name) === "string") {
            e.className = value;
        } else {
            e.className.baseVal = value;
        }
        return e;
    }
    function addClass(e, name) {
        /// <signature helpKeyword="WinJS.Utilities.addClass">
        /// <summary locid="WinJS.Utilities.addClass">
        /// Adds the specified class(es) to the specified element. Multiple classes can be added using space delimited names.
        /// </summary>
        /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.addClass_p:e">
        /// The element to which to add the class.
        /// </param>
        /// <param name="name" type="String" locid="WinJS.Utilities.addClass_p:name">
        /// The name of the class to add, multiple classes can be added using space delimited names
        /// </param>
        /// <returns type="HTMLElement" locid="WinJS.Utilities.addClass_returnValue">
        /// The element.
        /// </returns>
        /// </signature>
        if (e.classList) {
            // Fastpath: adding a single class, no need to string split the argument
            if (name.indexOf(" ") < 0) {
                e.classList.add(name);
            } else {
                var namesToAdd = name.split(" ");
                removeEmpties(namesToAdd);

                for (var i = 0, len = namesToAdd.length; i < len; i++) {
                    e.classList.add(namesToAdd[i]);
                }
            }
            return e;
        } else {
            var className = getClassName(e);
            var names = className.split(" ");
            var l = removeEmpties(names);
            var toAdd;

            // we have a fast path for the common case of a single name in the class name
            //
            if (name.indexOf(" ") >= 0) {
                var namesToAdd = name.split(" ");
                removeEmpties(namesToAdd);
                for (var i = 0; i < l; i++) {
                    var found = namesToAdd.indexOf(names[i]);
                    if (found >= 0) {
                        namesToAdd.splice(found, 1);
                    }
                }
                if (namesToAdd.length > 0) {
                    toAdd = namesToAdd.join(" ");
                }
            } else {
                var saw = false;
                for (var i = 0; i < l; i++) {
                    if (names[i] === name) {
                        saw = true;
                        break;
                    }
                }
                if (!saw) { toAdd = name; }

            }
            if (toAdd) {
                if (l > 0 && names[0].length > 0) {
                    setClassName(e, className + " " + toAdd);
                } else {
                    setClassName(e, toAdd);
                }
            }
            return e;
        }
    }
    function removeClass(e, name) {
        /// <signature helpKeyword="WinJS.Utilities.removeClass">
        /// <summary locid="WinJS.Utilities.removeClass">
        /// Removes the specified class from the specified element.
        /// </summary>
        /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.removeClass_p:e">
        /// The element from which to remove the class.
        /// </param>
        /// <param name="name" type="String" locid="WinJS.Utilities.removeClass_p:name">
        /// The name of the class to remove.
        /// </param>
        /// <returns type="HTMLElement" locid="WinJS.Utilities.removeClass_returnValue">
        /// The element.
        /// </returns>
        /// </signature>
        if (e.classList) {

            // Fastpath: Nothing to remove
            if (e.classList.length === 0) {
                return e;
            }
            var namesToRemove = name.split(" ");
            removeEmpties(namesToRemove);

            for (var i = 0, len = namesToRemove.length; i < len; i++) {
                e.classList.remove(namesToRemove[i]);
            }
            return e;
        } else {
            var original = getClassName(e);
            var namesToRemove;
            var namesToRemoveLen;

            if (name.indexOf(" ") >= 0) {
                namesToRemove = name.split(" ");
                namesToRemoveLen = removeEmpties(namesToRemove);
            } else {
                // early out for the case where you ask to remove a single
                // name and that name isn't found.
                //
                if (original.indexOf(name) < 0) {
                    return e;
                }
                namesToRemove = [name];
                namesToRemoveLen = 1;
            }
            var removed;
            var names = original.split(" ");
            var namesLen = removeEmpties(names);

            for (var i = namesLen - 1; i >= 0; i--) {
                if (namesToRemove.indexOf(names[i]) >= 0) {
                    names.splice(i, 1);
                    removed = true;
                }
            }

            if (removed) {
                setClassName(e, names.join(" "));
            }
            return e;
        }
    }
    function toggleClass(e, name) {
        /// <signature helpKeyword="WinJS.Utilities.toggleClass">
        /// <summary locid="WinJS.Utilities.toggleClass">
        /// Toggles (adds or removes) the specified class on the specified element.
        /// If the class is present, it is removed; if it is absent, it is added.
        /// </summary>
        /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.toggleClass_p:e">
        /// The element on which to toggle the class.
        /// </param>
        /// <param name="name" type="String" locid="WinJS.Utilities.toggleClass_p:name">
        /// The name of the class to toggle.
        /// </param>
        /// <returns type="HTMLElement" locid="WinJS.Utilities.toggleClass_returnValue">
        /// The element.
        /// </returns>
        /// </signature>
        if (e.classList) {
            e.classList.toggle(name);
            return e;
        } else {
            var className = getClassName(e);
            var names = className.trim().split(" ");
            var l = names.length;
            var found = false;
            for (var i = 0; i < l; i++) {
                if (names[i] === name) {
                    found = true;
                }
            }
            if (!found) {
                if (l > 0 && names[0].length > 0) {
                    setClassName(e, className + " " + name);
                } else {
                    setClassName(e, className + name);
                }
            } else {
                setClassName(e, names.reduce(function (r, e) {
                    if (e === name) {
                        return r;
                    } else if (r && r.length > 0) {
                        return r + " " + e;
                    } else {
                        return e;
                    }
                }, ""));
            }
            return e;
        }
    }

    // Only set the attribute if its value has changed
    function setAttribute(element, attribute, value) {
        if (element.getAttribute(attribute) !== "" + value) {
            element.setAttribute(attribute, value);
        }
    }

    function _clamp(value, lowerBound, upperBound, defaultValue) {
        var n = Math.max(lowerBound, Math.min(upperBound, +value));
        return n === 0 ? 0 : n || Math.max(lowerBound, Math.min(upperBound, defaultValue));
    }
    var _pixelsRE = /^-?\d+\.?\d*(px)?$/i;
    var _numberRE = /^-?\d+/i;
    function convertToPixels(element, value) {
        /// <signature helpKeyword="WinJS.Utilities.convertToPixels">
        /// <summary locid="WinJS.Utilities.convertToPixels">
        /// Converts a CSS positioning string for the specified element to pixels.
        /// </summary>
        /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.convertToPixels_p:element">
        /// The element.
        /// </param>
        /// <param name="value" type="String" locid="WinJS.Utilities.convertToPixels_p:value">
        /// The CSS positioning string.
        /// </param>
        /// <returns type="Number" locid="WinJS.Utilities.convertToPixels_returnValue">
        /// The number of pixels.
        /// </returns>
        /// </signature>
        if (!_pixelsRE.test(value) && _numberRE.test(value)) {
            var previousValue = element.style.left;

            element.style.left = value;
            value = element.style.pixelLeft;

            element.style.left = previousValue;

            return value;
        } else {
            return Math.round(parseFloat(value)) || 0;
        }
    }
    function getDimension(element, property) {
        return convertToPixels(element, _Global.getComputedStyle(element, null)[property]);
    }

    var _MSGestureEvent = _Global.MSGestureEvent || {
        MSGESTURE_FLAG_BEGIN: 1,
        MSGESTURE_FLAG_CANCEL: 4,
        MSGESTURE_FLAG_END: 2,
        MSGESTURE_FLAG_INERTIA: 8,
        MSGESTURE_FLAG_NONE: 0
    };

    var _MSManipulationEvent = _Global.MSManipulationEvent || {
        MS_MANIPULATION_STATE_ACTIVE: 1,
        MS_MANIPULATION_STATE_CANCELLED: 6,
        MS_MANIPULATION_STATE_COMMITTED: 7,
        MS_MANIPULATION_STATE_DRAGGING: 5,
        MS_MANIPULATION_STATE_INERTIA: 2,
        MS_MANIPULATION_STATE_PRESELECT: 3,
        MS_MANIPULATION_STATE_SELECTING: 4,
        MS_MANIPULATION_STATE_STOPPED: 0
    };

    var _MSPointerEvent = _Global.MSPointerEvent || {
        MSPOINTER_TYPE_TOUCH: "touch",
        MSPOINTER_TYPE_PEN: "pen",
        MSPOINTER_TYPE_MOUSE: "mouse",
    };

    // Helpers for managing element._eventsMap for custom events
    //

    function addListenerToEventMap(element, type, listener, useCapture, data) {
        var eventNameLowercase = type.toLowerCase();
        if (!element._eventsMap) {
            element._eventsMap = {};
        }
        if (!element._eventsMap[eventNameLowercase]) {
            element._eventsMap[eventNameLowercase] = [];
        }
        element._eventsMap[eventNameLowercase].push({
            listener: listener,
            useCapture: useCapture,
            data: data
        });
    }

    function removeListenerFromEventMap(element, type, listener, useCapture) {
        var eventNameLowercase = type.toLowerCase();
        var mappedEvents = element._eventsMap && element._eventsMap[eventNameLowercase];
        if (mappedEvents) {
            for (var i = mappedEvents.length - 1; i >= 0; i--) {
                var mapping = mappedEvents[i];
                if (mapping.listener === listener && (!!useCapture === !!mapping.useCapture)) {
                    mappedEvents.splice(i, 1);
                    return mapping;
                }
            }
        }
        return null;
    }

    function lookupListeners(element, type) {
        var eventNameLowercase = type.toLowerCase();
        return element._eventsMap && element._eventsMap[eventNameLowercase] && element._eventsMap[eventNameLowercase].slice(0) || [];
    }

    // Custom focusin/focusout events
    // Generally, use these instead of using the browser's blur/focus/focusout/focusin events directly.
    // However, this doesn't support the window object. If you need to listen to focus events on the window,
    // use the browser's events directly.
    //

    function bubbleEvent(element, type, eventObject) {
        while (element) {
            var handlers = lookupListeners(element, type);
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i].listener.call(element, eventObject);
            }

            element = element.parentNode;
        }
    }

    function prepareFocusEvent(eventObject) {
        // If an iframe is involved, then relatedTarget should be null.
        if (eventObject.relatedTarget && eventObject.relatedTarget.tagName === "IFRAME" ||
                eventObject.target && eventObject.target.tagName === "IFRAME") {
            eventObject.relatedTarget = null;
        }

        return eventObject;
    }

    var activeElement = null;
    _Global.addEventListener("blur", function () {
        // Fires focusout when focus move to another window or into an iframe.
        var previousActiveElement = activeElement;
        if (previousActiveElement) {
            bubbleEvent(previousActiveElement, "focusout", prepareFocusEvent({
                type: "focusout",
                target: previousActiveElement,
                relatedTarget: null
            }));
        }
        activeElement = null;
    });

    _Global.document.documentElement.addEventListener("focus", function (eventObject) {
        var previousActiveElement = activeElement;
        activeElement = eventObject.target;
        if (previousActiveElement) {
            bubbleEvent(previousActiveElement, "focusout", prepareFocusEvent({
                type: "focusout",
                target: previousActiveElement,
                relatedTarget: activeElement
            }));
        }
        if (activeElement) {
            bubbleEvent(activeElement, "focusin", prepareFocusEvent({
                type: "focusin",
                target: activeElement,
                relatedTarget: previousActiveElement
            }));
        }
    }, true);

    function registerBubbleListener(element, type, listener, useCapture) {
        if (useCapture) {
            throw "This custom WinJS event only supports bubbling";
        }
        addListenerToEventMap(element, type, listener, useCapture);
    }

    // Custom pointer events
    //

    // Sets the properties in *overrideProperties* on the object. Delegates all other
    // property accesses to *eventObject*.
    //
    // The purpose of PointerEventProxy is that it allows us to customize properties on
    // an eventObject despite those properties being unwritable and unconfigurable.
    var PointerEventProxy = function (eventObject, overrideProperties) {
        overrideProperties = overrideProperties || {};
        this.__eventObject = eventObject;
        var that = this;
        Object.keys(overrideProperties).forEach(function (propertyName) {
            Object.defineProperty(that, propertyName, {
                value: overrideProperties[propertyName]
            });
        });
    };

    // Define PointerEventProxy properties which should be delegated to the original eventObject.
    [
        "altKey", "AT_TARGET", "bubbles", "BUBBLING_PHASE", "button", "buttons",
        "cancelable", "cancelBubble", "CAPTURING_PHASE", "clientX", "clientY",
        "ctrlKey", "currentTarget", "defaultPrevented", "detail", "eventPhase",
        "fromElement", "getModifierState", "height", "hwTimestamp", "initEvent",
        "initMouseEvent", "initPointerEvent", "initUIEvent", "isPrimary", "isTrusted",
        "layerX", "layerY", "metaKey", "offsetX", "offsetY", "pageX", "pageY",
        "pointerId", "pointerType", "pressure", "preventDefault", "relatedTarget",
        "rotation", "screenX", "screenY", "shiftKey", "srcElement", "stopImmediatePropagation",
        "stopPropagation", "target", "tiltX", "tiltY", "timeStamp", "toElement", "type",
        "view", "which", "width", "x", "y", "_normalizedType", "_fakedBySemanticZoom"
    ].forEach(function (propertyName) {
        Object.defineProperty(PointerEventProxy.prototype, propertyName, {
            get: function () {
                var value = this.__eventObject[propertyName];
                return typeof value === "function" ? value.bind(this.__eventObject) : value;
            },
            configurable: true
        });
    });

    function touchEventTranslator(callback, eventObject) {
        var changedTouches = eventObject.changedTouches,
            retVal = null;

        if (!changedTouches) {
            return retVal;
        }

        for (var i = 0, len = changedTouches.length; i < len; i++) {
            var touchObject = changedTouches[i];
            var pointerEventObject = new PointerEventProxy(eventObject, {
                pointerType: _MSPointerEvent.MSPOINTER_TYPE_TOUCH,
                pointerId: touchObject.identifier,
                screenX: touchObject.screenX,
                screenY: touchObject.screenY,
                clientX: touchObject.clientX,
                clientY: touchObject.clientY,
                radiusX: touchObject.radiusX,
                radiusY: touchObject.radiusY,
                rotationAngle: touchObject.rotationAngle,
                force: touchObject.force,
                _currentTouch: touchObject
            });
            var newRetVal = callback(pointerEventObject);
            retVal = retVal || newRetVal;
        }
        return retVal;
    }

    function mouseEventTranslator(callback, eventObject) {
        eventObject.pointerType = _MSPointerEvent.MSPOINTER_TYPE_MOUSE;
        eventObject.pointerId = -1;
        return callback(eventObject);
    }

    function mspointerEventTranslator(callback, eventObject) {
        return callback(eventObject);
    }

    var eventTranslations = {
        pointerdown: {
            touch: "touchstart",
            mspointer: "MSPointerDown",
            mouse: "mousedown"
        },
        pointerup: {
            touch: "touchend",
            mspointer: "MSPointerUp",
            mouse: "mouseup"
        },
        pointermove: {
            touch: "touchmove",
            mspointer: "MSPointerMove",
            mouse: "mousemove"
        },
        pointerenter: {
            touch: "touchenter",
            mspointer: "MSPointerEnter",
            mouse: "mouseenter"
        },
        pointerover: {
            touch: null,
            mspointer: "MSPointerOver",
            mouse: "mouseover"
        },
        pointerout: {
            touch: "touchleave",
            mspointer: "MSPointerOut",
            mouse: "mouseout"
        },
        pointercancel: {
            touch: "touchcancel",
            mspointer: "MSPointerCancel",
            mouse: null
        }
    };

    function registerPointerEvent(element, type, callback, capture) {
        var eventNameLowercase = type.toLowerCase();

        var mouseWrapper,
            touchWrapper,
            mspointerWrapper;
        var translations = eventTranslations[eventNameLowercase];

        // Browsers fire a touch event and then a mouse event when the input is touch. touchHandled is used to prevent invoking the pointer callback twice.
        var touchHandled;

        // If we are in IE10, we should use MSPointer as it provides a better interface than touch events
        if (_Global.MSPointerEvent) {
            mspointerWrapper = function (eventObject) {
                eventObject._normalizedType = eventNameLowercase;
                touchHandled = true;
                return mspointerEventTranslator(callback, eventObject);
            };
            element.addEventListener(translations.mspointer, mspointerWrapper, capture);
        } else {
            // Otherwise, use a mouse and touch event
            if (translations.mouse) {
                mouseWrapper = function (eventObject) {
                    eventObject._normalizedType = eventNameLowercase;
                    if (!touchHandled) {
                        return mouseEventTranslator(callback, eventObject);
                    }
                    touchHandled = false;
                };
                element.addEventListener(translations.mouse, mouseWrapper, capture);
            }
            if (translations.touch) {
                touchWrapper = function (eventObject) {
                    eventObject._normalizedType = eventNameLowercase;
                    touchHandled = true;
                    return touchEventTranslator(callback, eventObject);
                };
                element.addEventListener(translations.touch, touchWrapper, capture);
            }
        }

        addListenerToEventMap(element, type, callback, capture, {
            mouseWrapper: mouseWrapper,
            touchWrapper: touchWrapper,
            mspointerWrapper: mspointerWrapper
        });
    }

    function unregisterPointerEvent(element, type, callback, capture) {
        var eventNameLowercase = type.toLowerCase();

        var mapping = removeListenerFromEventMap(element, type, callback, capture);
        if (mapping) {
            var translations = eventTranslations[eventNameLowercase];
            if (mapping.data.mouseWrapper) {
                element.removeEventListener(translations.mouse, mapping.data.mouseWrapper, capture);
            }
            if (mapping.data.touchWrapper) {
                element.removeEventListener(translations.touch, mapping.data.touchWrapper, capture);
            }
            if (mapping.data.mspointerWrapper) {
                element.removeEventListener(translations.mspointer, mapping.data.mspointerWrapper, capture);
            }
        }
    }

    // Custom events dispatch table. Event names should be lowercased.
    //

    var customEvents = {
        focusout: {
            register: registerBubbleListener,
            unregister: removeListenerFromEventMap
        },
        focusin: {
            register: registerBubbleListener,
            unregister: removeListenerFromEventMap
        }
    };
    if (!_Global.PointerEvent) {
        var pointerEventEntry = {
            register: registerPointerEvent,
            unregister: unregisterPointerEvent
        };

        customEvents.pointerdown = pointerEventEntry;
        customEvents.pointerup = pointerEventEntry;
        customEvents.pointermove = pointerEventEntry;
        customEvents.pointerenter = pointerEventEntry;
        customEvents.pointerover = pointerEventEntry;
        customEvents.pointerout = pointerEventEntry;
        customEvents.pointercancel = pointerEventEntry;
    }

    // The MutationObserverShim only supports the following configuration:
    //  attributes
    //  attributeFilter
    var MutationObserverShim = _Base.Class.define(
        function MutationObserverShim_ctor(callback) {
            this._callback = callback;
            this._toDispose = [];
            this._attributeFilter = [];
            this._scheduled = false;
            this._pendingChanges = [];
            this._observerCount = 0;
            this._handleCallback = this._handleCallback.bind(this);
            this._targetElements = [];
        },
        {
            observe: function MutationObserverShim_observe(element, configuration) {
                if (this._targetElements.indexOf(element) === -1) {
                    this._targetElements.push(element);
                }
                this._observerCount++;
                if (configuration.attributes) {
                    this._addRemovableListener(element, "DOMAttrModified", this._handleCallback);
                }
                if (configuration.attributeFilter) {
                    this._attributeFilter = configuration.attributeFilter;
                }
            },
            disconnect: function MutationObserverShim_disconnect() {
                this._observerCount = 0;
                this._targetElements = [];
                this._toDispose.forEach(function (disposeFunc) {
                    disposeFunc();
                });
            },
            _addRemovableListener: function MutationObserverShim_addRemovableListener(target, event, listener) {
                target.addEventListener(event, listener);
                this._toDispose.push(function () {
                    target.removeEventListener(event, listener);
                });
            },
            _handleCallback: function MutationObserverShim_handleCallback(evt) {

                // prevent multiple events from firing when nesting observers
                evt.stopPropagation();

                if (this._attributeFilter.length && this._attributeFilter.indexOf(evt.attrName) === -1) {
                    return;
                }

                // subtree:true is not currently supported
                if (this._targetElements.indexOf(evt.target) === -1) {
                    return;
                }

                var attrName = evt.attrName;

                // DOM mutation events use different naming for this attribute
                if (attrName === 'tabindex') {
                    attrName = 'tabIndex';
                }

                this._pendingChanges.push({
                    type: 'attributes',
                    target: evt.target,
                    attributeName: attrName
                });

                if (this._observerCount === 1) {
                    this._dispatchEvent();
                } else if (this._scheduled === false) {
                    this._scheduled = true;
                    _BaseUtils._setImmediate(this._dispatchEvent.bind(this));
                }

            },
            _dispatchEvent: function MutationObserverShim_dispatchEvent() {
                try {
                    this._callback(this._pendingChanges);
                }
                finally {
                    this._pendingChanges = [];
                    this._scheduled = false;
                }
            }
        },
        {
            _isShim: true
        }
    );

    var _MutationObserver = _Global.MutationObserver || MutationObserverShim;

    // Lazily init singleton on first access.
    var _resizeNotifier = null;

    // Class to provide a global listener for window.onresize events.
    // This keeps individual elements from having to listen to window.onresize
    // and having to dispose themselves to avoid leaks.
    var ResizeNotifier = _Base.Class.define(
        function ElementResizer_ctor() {
            _Global.addEventListener("resize", this._handleResize.bind(this));
        },
        {
            subscribe: function ElementResizer_subscribe(element, handler) {
                element.addEventListener(this._resizeEvent, handler);
                addClass(element, this._resizeClass);
            },
            unsubscribe: function ElementResizer_unsubscribe(element, handler) {
                removeClass(element, this._resizeClass);
                element.removeEventListener(this._resizeEvent, handler);
            },
            _handleResize: function ElementResizer_handleResize() {
                var resizables = _Global.document.querySelectorAll('.' + this._resizeClass);
                var length = resizables.length;
                for (var i = 0; i < length; i++) {
                    var event = _Global.document.createEvent("Event");
                    event.initEvent(this._resizeEvent, false, true);
                    resizables[i].dispatchEvent(event);
                }
            },
            _resizeClass: { get: function () { return 'win-element-resize'; } },
            _resizeEvent: { get: function () { return 'WinJSElementResize'; } }
        }
    );


    var GlobalListener = new (_Base.Class.define(
        function GlobalListener_ctor() {
            this.capture = {};
            this.bubble = {};
        },
        {
            addEventListener: function GlobalListener_addEventListener(element, name, listener, capture) {
                name = name.toLowerCase();
                var handlers = this._getHandlers(capture);
                var handler = handlers[name];

                if (!handler) {
                    handler = this._getListener(name, capture);
                    handler.refCount = 0;
                    handlers[name] = handler;

                    exports._addEventListener(_Global, name, handler, capture);
                }

                handler.refCount++;
                element.addEventListener(this._getEventName(name, capture), listener);
                addClass(element, this._getClassName(name, capture));
            },
            removeEventListener: function GlobalListener_removeEventListener(element, name, listener, capture) {
                name = name.toLowerCase();
                var handlers = this._getHandlers(capture);
                var handler = handlers[name];

                if (handler) {
                    handler.refCount--;
                    if (handler.refCount === 0) {
                        exports._removeEventListener(_Global, name, handler, capture);
                        delete handlers[name];
                    }

                }

                removeClass(element, this._getClassName(name, capture));
                element.removeEventListener(this._getEventName(name, capture), listener);
            },

            _getHandlers: function GlobalListener_getHandlers(capture) {
                if (capture) {
                    return this.capture;
                } else {
                    return this.bubble;
                }
            },

            _getClassName: function GlobalListener_getClassName(name, capture) {
                var captureSuffix = capture ? 'capture' : 'bubble';
                return 'win-global-event-' + name + captureSuffix;
            },

            _getEventName: function GlobalListener_getEventName(name, capture) {
                var captureSuffix = capture ? 'capture' : 'bubble';
                return 'WinJSGlobalEvent-' + name + captureSuffix;
            },

            _getListener: function GlobalListener_getListener(name, capture) {
                var listener = function GlobalListener_generatedListener(ev) {

                    var targets = _Global.document.querySelectorAll('.' + this._getClassName(name, capture));
                    var length = targets.length;
                    for (var i = 0; i < length; i++) {
                        var event = _Global.document.createEvent("Event");
                        event.initEvent(this._getEventName(name, capture), false, true);
                        event.detail = { originalEvent: ev };
                        targets[i].dispatchEvent(event);
                    }
                };

                return listener.bind(this);
            }
        }
    ))();

    var determinedRTLEnvironment = false,
        usingWebkitScrollCoordinates = false,
        usingFirefoxScrollCoordinates = false;
    function determineRTLEnvironment() {
        var element = _Global.document.createElement("div");
        element.style.direction = "rtl";
        element.innerHTML = "" +
            "<div style='width: 100px; height: 100px; overflow: scroll; visibility:hidden'>" +
                "<div style='width: 10000px; height: 100px;'></div>" +
            "</div>";
        _Global.document.body.appendChild(element);
        var elementScroller = element.firstChild;
        if (elementScroller.scrollLeft > 0) {
            usingWebkitScrollCoordinates = true;
        }
        elementScroller.scrollLeft += 100;
        if (elementScroller.scrollLeft === 0) {
            usingFirefoxScrollCoordinates = true;
        }
        _Global.document.body.removeChild(element);
        determinedRTLEnvironment = true;
    }

    function getAdjustedScrollPosition(element) {
        var computedStyle = _Global.getComputedStyle(element),
            scrollLeft = element.scrollLeft;
        if (computedStyle.direction === "rtl") {
            if (!determinedRTLEnvironment) {
                determineRTLEnvironment();
            }
            if (usingWebkitScrollCoordinates) {
                scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
            }
            scrollLeft = Math.abs(scrollLeft);
        }

        return {
            scrollLeft: scrollLeft,
            scrollTop: element.scrollTop
        };
    }

    function setAdjustedScrollPosition(element, scrollLeft, scrollTop) {
        if (scrollLeft !== undefined) {
            var computedStyle = _Global.getComputedStyle(element);
            if (computedStyle.direction === "rtl") {
                if (!determinedRTLEnvironment) {
                    determineRTLEnvironment();
                }
                if (usingFirefoxScrollCoordinates) {
                    scrollLeft = -scrollLeft;
                } else if (usingWebkitScrollCoordinates) {
                    scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
                }
            }
            element.scrollLeft = scrollLeft;
        }

        if (scrollTop !== undefined) {
            element.scrollTop = scrollTop;
        }
    }

    function getScrollPosition(element) {
        /// <signature helpKeyword="WinJS.Utilities.getScrollPosition">
        /// <summary locid="WinJS.Utilities.getScrollPosition">
        /// Gets the scrollLeft and scrollTop of the specified element, adjusting the scrollLeft to change from browser specific coordinates to logical coordinates when in RTL.
        /// </summary>
        /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.Utilities.getScrollPosition_p:element">
        /// The element.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.getScrollPosition_returnValue">
        /// An object with two properties: scrollLeft and scrollTop
        /// </returns>
        /// </signature>
        return getAdjustedScrollPosition(element);
    }

    function setScrollPosition(element, position) {
        /// <signature helpKeyword="WinJS.Utilities.setScrollPosition">
        /// <summary locid="WinJS.Utilities.setScrollPosition">
        /// Sets the scrollLeft and scrollTop of the specified element, changing the scrollLeft from logical coordinates to browser-specific coordinates when in RTL.
        /// </summary>
        /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.Utilities.setScrollPosition_p:element">
        /// The element.
        /// </param>
        /// <param name="position" type="Object" domElement="true" locid="WinJS.Utilities.setScrollPosition_p:position">
        /// The element.
        /// </param>
        /// </signature>
        position = position || {};
        setAdjustedScrollPosition(element, position.scrollLeft, position.scrollTop);
    }

    // navigator.msManipulationViewsEnabled tells us whether snap points work or not regardless of whether the style properties exist, however,
    // on Phone WWAs, this check returns false even though snap points are supported. To work around this bug, we check for the presence of
    // 'MSAppHost' in the user agent string which indicates that we are in a WWA environment; all WWA environments support snap points.
    var supportsSnapPoints = _Global.navigator.msManipulationViewsEnabled || _Global.navigator.userAgent.indexOf("MSAppHost") >= 0;
    var supportsTouchDetection = !!(_Global.MSPointerEvent || _Global.TouchEvent);

    var uniqueElementIDCounter = 0;

    function uniqueID(e) {
        if (!(e.uniqueID || e._uniqueID)) {
            e._uniqueID = "element__" + (++uniqueElementIDCounter);
        }

        return e.uniqueID || e._uniqueID;
    }

    function ensureId(element) {
        if (!element.id) {
            element.id = uniqueID(element);
        }
    }

    function _getCursorPos(eventObject) {
        var docElement = _Global.document.documentElement;
        var docScrollPos = getScrollPosition(docElement);

        return {
            left: eventObject.clientX + (_Global.document.body.dir === "rtl" ? -docScrollPos.scrollLeft : docScrollPos.scrollLeft),
            top: eventObject.clientY + docElement.scrollTop
        };
    }

    function _getElementsByClasses(parent, classes) {
        var retVal = [];

        for (var i = 0, len = classes.length; i < len; i++) {
            var element = parent.querySelector("." + classes[i]);
            if (element) {
                retVal.push(element);
            }
        }
        return retVal;
    }

    var _selectionPartsSelector = ".win-selectionborder, .win-selectionbackground, .win-selectioncheckmark, .win-selectioncheckmarkbackground";
    var _dataKey = "_msDataKey";
    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        _dataKey: _dataKey,

        _supportsSnapPoints: {
            get: function () {
                return supportsSnapPoints;
            }
        },

        _supportsTouchDetection: {
            get: function () {
                return supportsTouchDetection;
            }
        },

        _uniqueID: uniqueID,

        _ensureId: ensureId,

        _clamp: _clamp,

        _getCursorPos: _getCursorPos,

        _getElementsByClasses: _getElementsByClasses,

        _createGestureRecognizer: function () {
            if (_Global.MSGesture) {
                return new _Global.MSGesture();
            }

            var doNothing = function () {
            };
            return {
                addEventListener: doNothing,
                removeEventListener: doNothing,
                addPointer: doNothing,
                stop: doNothing
            };
        },

        _supportsTouchActionCrossSlide: {
            get: function () {
                if (this._supportsTouchActionCrossSlideValue === undefined) {
                    this._supportsTouchActionCrossSlideValue = false;
                    var touchActionStyle = _BaseUtils._browserStyleEquivalents["touch-action"];
                    if (touchActionStyle) {
                        var div = _Global.document.createElement("div");
                        div.style.touchAction = "cross-slide-x";
                        _Global.document.body.appendChild(div);
                        this._supportsTouchActionCrossSlideValue = _Global.getComputedStyle(div).touchAction === "cross-slide-x";
                        _Global.document.body.removeChild(div);
                    }
                }
                return this._supportsTouchActionCrossSlideValue;
            }
        },

        _MSGestureEvent: _MSGestureEvent,
        _MSManipulationEvent: _MSManipulationEvent,

        _elementsFromPoint: function (x, y) {
            if (_Global.document.msElementsFromPoint) {
                return _Global.document.msElementsFromPoint(x, y);
            } else {
                var element = _Global.document.elementFromPoint(x, y);
                return element ? [element] : null;
            }
        },

        _matchesSelector: function _matchesSelector(element, selectorString) {
            var matchesSelector = element.matches
                    || element.msMatchesSelector
                    || element.mozMatchesSelector
                    || element.webkitMatchesSelector;
            return matchesSelector.call(element, selectorString);
        },

        _selectionPartsSelector: _selectionPartsSelector,

        _isSelectionRendered: function _isSelectionRendered(itemBox) {
            // The tree is changed at pointerDown but _selectedClass is added only when the user drags an item below the selection threshold so checking for _selectedClass is not reliable.
            return itemBox.querySelectorAll(_selectionPartsSelector).length > 0;
        },

        _addEventListener: function _addEventListener(element, type, listener, useCapture) {
            var eventNameLower = type && type.toLowerCase();
            var entry = customEvents[eventNameLower];
            var equivalentEvent = _BaseUtils._browserEventEquivalents[type];
            if (entry) {
                entry.register(element, type, listener, useCapture);
            } else if (equivalentEvent) {
                element.addEventListener(equivalentEvent, listener, useCapture);
            } else {
                element.addEventListener(type, listener, useCapture);
            }
        },

        _removeEventListener: function _removeEventListener(element, type, listener, useCapture) {
            var eventNameLower = type && type.toLowerCase();
            var entry = customEvents[eventNameLower];
            var equivalentEvent = _BaseUtils._browserEventEquivalents[type];
            if (entry) {
                entry.unregister(element, type, listener, useCapture);
            } else if (equivalentEvent) {
                element.removeEventListener(equivalentEvent, listener, useCapture);
            } else {
                element.removeEventListener(type, listener, useCapture);
            }
        },

        _initEventImpl: function (initType, event, eventType) {
            eventType = eventType.toLowerCase();
            var mapping = eventTranslations[eventType];
            if (mapping) {
                switch (initType.toLowerCase()) {
                    case "pointer":
                        arguments[2] = mapping.mspointer;
                        break;

                    default:
                        arguments[2] = mapping[initType.toLowerCase()];
                        break;
                }
            }
            event["init" + initType + "Event"].apply(event, Array.prototype.slice.call(arguments, 2));
        },

        _initMouseEvent: function (event) {
            this._initEventImpl.apply(this, ["Mouse", event].concat(Array.prototype.slice.call(arguments, 1)));
        },

        _initPointerEvent: function (event) {
            this._initEventImpl.apply(this, ["Pointer", event].concat(Array.prototype.slice.call(arguments, 1)));
        },

        _PointerEventProxy: PointerEventProxy,

        _bubbleEvent: bubbleEvent,

        _setPointerCapture: function (element, pointerId) {
            if (element.setPointerCapture) {
                element.setPointerCapture(pointerId);
            }
        },

        _releasePointerCapture: function (element, pointerId) {
            if (element.releasePointerCapture) {
                element.releasePointerCapture(pointerId);
            }
        },

        _MSPointerEvent: _MSPointerEvent,

        _zoomToDuration: _zoomToDuration,

        _zoomTo: function _zoomTo(element, args) {
            if (element.msZoomTo) {
                element.msZoomTo(args);
            } else {
                // Schedule to ensure that we're not running from within an event handler. For example, if running
                // within a focus handler triggered by WinJS.Utilities._setActive, scroll position will not yet be
                // restored.
                Scheduler.schedule(function () {
                    var initialPos = getAdjustedScrollPosition(element);
                    var effectiveScrollLeft = (typeof element._zoomToDestX === "number" ? element._zoomToDestX : initialPos.scrollLeft);
                    var effectiveScrollTop = (typeof element._zoomToDestY === "number" ? element._zoomToDestY : initialPos.scrollTop);
                    var cs = _Global.getComputedStyle(element);
                    var scrollLimitX = element.scrollWidth - parseInt(cs.width, 10) - parseInt(cs.paddingLeft, 10) - parseInt(cs.paddingRight, 10);
                    var scrollLimitY = element.scrollHeight - parseInt(cs.height, 10) - parseInt(cs.paddingTop, 10) - parseInt(cs.paddingBottom, 10);

                    if (typeof args.contentX !== "number") {
                        args.contentX = effectiveScrollLeft;
                    }
                    if (typeof args.contentY !== "number") {
                        args.contentY = effectiveScrollTop;
                    }

                    var zoomToDestX = _clamp(args.contentX, 0, scrollLimitX);
                    var zoomToDestY = _clamp(args.contentY, 0, scrollLimitY);
                    if (zoomToDestX === effectiveScrollLeft && zoomToDestY === effectiveScrollTop) {
                        // Scroll position is already in the proper state. This zoomTo is a no-op.
                        return;
                    }

                    element._zoomToId = element._zoomToId || 0;
                    element._zoomToId++;
                    element._zoomToDestX = zoomToDestX;
                    element._zoomToDestY = zoomToDestY;

                    var thisZoomToId = element._zoomToId;
                    var start = _BaseUtils._now();
                    var xFactor = (element._zoomToDestX - initialPos.scrollLeft) / _zoomToDuration;
                    var yFactor = (element._zoomToDestY - initialPos.scrollTop) / _zoomToDuration;

                    var update = function () {
                        var t = _BaseUtils._now() - start;
                        if (element._zoomToId !== thisZoomToId) {
                            return;
                        } else if (t > _zoomToDuration) {
                            setAdjustedScrollPosition(element, element._zoomToDestX, element._zoomToDestY);
                            element._zoomToDestX = null;
                            element._zoomToDestY = null;
                        } else {
                            setAdjustedScrollPosition(element, initialPos.scrollLeft + t * xFactor, initialPos.scrollTop + t * yFactor);
                            _BaseUtils._requestAnimationFrame(update);
                        }
                    };

                    _BaseUtils._requestAnimationFrame(update);
                }, Scheduler.Priority.high, null, "WinJS.Utilities._zoomTo");
            }
        },

        _setActive: function _setActive(element, scroller) {
            var success = true;
            try {
                if (_Global.HTMLElement && _Global.HTMLElement.prototype.setActive) {
                    element.setActive();
                } else {
                    // We are aware the unlike setActive(), focus() will scroll to the element that gets focus. However, this is
                    // our current cross-browser solution until there is an equivalent for setActive() in other browsers.
                    //
                    // This _setActive polyfill does have limited support for preventing scrolling: via the scroller parameter, it
                    // can prevent one scroller from scrolling. This functionality is necessary in some scenarios. For example, when using
                    // _zoomTo and _setActive together.

                    var scrollLeft,
                        scrollTop;

                    if (scroller) {
                        scrollLeft = scroller.scrollLeft;
                        scrollTop = scroller.scrollTop;
                    }
                    element.focus();
                    if (scroller) {
                        scroller.scrollLeft = scrollLeft;
                        scroller.scrollTop = scrollTop;
                    }
                }
            } catch (e) {
                // setActive() raises an exception when trying to focus an invisible item. Checking visibility is non-trivial, so it's best
                // just to catch the exception and ignore it. focus() on the other hand, does not raise exceptions.
                success = false;
            }
            return success;
        },

        _MutationObserver: _MutationObserver,

        _resizeNotifier: {
            get: function () {
                if (!_resizeNotifier) {
                    _resizeNotifier = new ResizeNotifier();
                }
                return _resizeNotifier;
            }
        },

        _globalListener: GlobalListener,

        // Appends a hidden child to the given element that will listen for being added
        // to the DOM. When the hidden element is added to the DOM, it will dispatch a
        // "WinJSNodeInserted" event on the provided element.
        _addInsertedNotifier: function (element) {
            var hiddenElement = _Global.document.createElement("div");
            hiddenElement.style[_BaseUtils._browserStyleEquivalents["animation-name"].scriptName] = "WinJS-node-inserted";
            hiddenElement.style[_BaseUtils._browserStyleEquivalents["animation-duration"].scriptName] = "0.01s";
            hiddenElement.style["position"] = "absolute";
            element.appendChild(hiddenElement);

            exports._addEventListener(hiddenElement, "animationStart", function (e) {
                if (e.animationName === "WinJS-node-inserted") {
                    var e = _Global.document.createEvent("Event");
                    e.initEvent("WinJSNodeInserted", false, true);
                    element.dispatchEvent(e);
                }
            }, false);

            return hiddenElement;
        },

        // Browser agnostic method to set element flex style
        // Param is an object in the form {grow: flex-grow, shrink: flex-shrink, basis: flex-basis}
        // All fields optional
        _setFlexStyle: function (element, flexParams) {
            var styleObject = element.style;
            if (typeof flexParams.grow !== "undefined") {
                styleObject.msFlexPositive = flexParams.grow;
                styleObject.webkitFlexGrow = flexParams.grow;
                styleObject.flexGrow = flexParams.grow;
            }
            if (typeof flexParams.shrink !== "undefined") {
                styleObject.msFlexNegative = flexParams.shrink;
                styleObject.webkitFlexShrink = flexParams.shrink;
                styleObject.flexShrink = flexParams.shrink;
            }
            if (typeof flexParams.basis !== "undefined") {
                styleObject.msFlexPreferredSize = flexParams.basis;
                styleObject.webkitFlexBasis = flexParams.basis;
                styleObject.flexBasis = flexParams.basis;
            }
        },

        /// <field locid="WinJS.Utilities.Key" helpKeyword="WinJS.Utilities.Key">
        /// Defines a set of keyboard values.
        /// </field>
        Key: {
            /// <field locid="WinJS.Utilities.Key.backspace" helpKeyword="WinJS.Utilities.Key.backspace">
            /// BACKSPACE key.
            /// </field>
            backspace: 8,

            /// <field locid="WinJS.Utilities.Key.tab" helpKeyword="WinJS.Utilities.Key.tab">
            /// TAB key.
            /// </field>
            tab: 9,

            /// <field locid="WinJS.Utilities.Key.enter" helpKeyword="WinJS.Utilities.Key.enter">
            /// ENTER key.
            /// </field>
            enter: 13,

            /// <field locid="WinJS.Utilities.Key.shift" helpKeyword="WinJS.Utilities.Key.shift">
            /// Shift key.
            /// </field>
            shift: 16,

            /// <field locid="WinJS.Utilities.Key.ctrl" helpKeyword="WinJS.Utilities.Key.ctrl">
            /// CTRL key.
            /// </field>
            ctrl: 17,

            /// <field locid="WinJS.Utilities.Key.alt" helpKeyword="WinJS.Utilities.Key.alt">
            /// ALT key
            /// </field>
            alt: 18,

            /// <field locid="WinJS.Utilities.Key.pause" helpKeyword="WinJS.Utilities.Key.pause">
            /// Pause key.
            /// </field>
            pause: 19,

            /// <field locid="WinJS.Utilities.Key.capsLock" helpKeyword="WinJS.Utilities.Key.capsLock">
            /// CAPS LOCK key.
            /// </field>
            capsLock: 20,

            /// <field locid="WinJS.Utilities.Key.escape" helpKeyword="WinJS.Utilities.Key.escape">
            /// ESCAPE key.
            /// </field>
            escape: 27,

            /// <field locid="WinJS.Utilities.Key.space" helpKeyword="WinJS.Utilities.Key.space">
            /// SPACE key.
            /// </field>
            space: 32,

            /// <field locid="WinJS.Utilities.Key.pageUp" helpKeyword="WinJS.Utilities.Key.pageUp">
            /// PAGE UP key.
            /// </field>
            pageUp: 33,

            /// <field locid="WinJS.Utilities.Key.pageDown" helpKeyword="WinJS.Utilities.Key.pageDown">
            /// PAGE DOWN key.
            /// </field>
            pageDown: 34,

            /// <field locid="WinJS.Utilities.Key.end" helpKeyword="WinJS.Utilities.Key.end">
            /// END key.
            /// </field>
            end: 35,

            /// <field locid="WinJS.Utilities.Key.home" helpKeyword="WinJS.Utilities.Key.home">
            /// HOME key.
            /// </field>
            home: 36,

            /// <field locid="WinJS.Utilities.Key.leftArrow" helpKeyword="WinJS.Utilities.Key.leftArrow">
            /// Left arrow key.
            /// </field>
            leftArrow: 37,

            /// <field locid="WinJS.Utilities.Key.upArrow" helpKeyword="WinJS.Utilities.Key.upArrow">
            /// Up arrow key.
            /// </field>
            upArrow: 38,

            /// <field locid="WinJS.Utilities.Key.rightArrow" helpKeyword="WinJS.Utilities.Key.rightArrow">
            /// Right arrow key.
            /// </field>
            rightArrow: 39,

            /// <field locid="WinJS.Utilities.Key.downArrow" helpKeyword="WinJS.Utilities.Key.downArrow">
            /// Down arrow key.
            /// </field>
            downArrow: 40,

            /// <field locid="WinJS.Utilities.Key.insert" helpKeyword="WinJS.Utilities.Key.insert">
            /// INSERT key.
            /// </field>
            insert: 45,

            /// <field locid="WinJS.Utilities.Key.deleteKey" helpKeyword="WinJS.Utilities.Key.deleteKey">
            /// DELETE key.
            /// </field>
            deleteKey: 46,

            /// <field locid="WinJS.Utilities.Key.num0" helpKeyword="WinJS.Utilities.Key.num0">
            /// Number 0 key.
            /// </field>
            num0: 48,

            /// <field locid="WinJS.Utilities.Key.num1" helpKeyword="WinJS.Utilities.Key.num1">
            /// Number 1 key.
            /// </field>
            num1: 49,

            /// <field locid="WinJS.Utilities.Key.num2" helpKeyword="WinJS.Utilities.Key.num2">
            /// Number 2 key.
            /// </field>
            num2: 50,

            /// <field locid="WinJS.Utilities.Key.num3" helpKeyword="WinJS.Utilities.Key.num3">
            /// Number 3 key.
            /// </field>
            num3: 51,

            /// <field locid="WinJS.Utilities.Key.num4" helpKeyword="WinJS.Utilities.Key.num4">
            /// Number 4 key.
            /// </field>
            num4: 52,

            /// <field locid="WinJS.Utilities.Key.num5" helpKeyword="WinJS.Utilities.Key.num5">
            /// Number 5 key.
            /// </field>
            num5: 53,

            /// <field locid="WinJS.Utilities.Key.num6" helpKeyword="WinJS.Utilities.Key.num6">
            /// Number 6 key.
            /// </field>
            num6: 54,

            /// <field locid="WinJS.Utilities.Key.num7" helpKeyword="WinJS.Utilities.Key.num7">
            /// Number 7 key.
            /// </field>
            num7: 55,

            /// <field locid="WinJS.Utilities.Key.num8" helpKeyword="WinJS.Utilities.Key.num8">
            /// Number 8 key.
            /// </field>
            num8: 56,

            /// <field locid="WinJS.Utilities.Key.num9" helpKeyword="WinJS.Utilities.Key.num9">
            /// Number 9 key.
            /// </field>
            num9: 57,

            /// <field locid="WinJS.Utilities.Key.a" helpKeyword="WinJS.Utilities.Key.a">
            /// A key.
            /// </field>
            a: 65,

            /// <field locid="WinJS.Utilities.Key.b" helpKeyword="WinJS.Utilities.Key.b">
            /// B key.
            /// </field>
            b: 66,

            /// <field locid="WinJS.Utilities.Key.c" helpKeyword="WinJS.Utilities.Key.c">
            /// C key.
            /// </field>
            c: 67,

            /// <field locid="WinJS.Utilities.Key.d" helpKeyword="WinJS.Utilities.Key.d">
            /// D key.
            /// </field>
            d: 68,

            /// <field locid="WinJS.Utilities.Key.e" helpKeyword="WinJS.Utilities.Key.e">
            /// E key.
            /// </field>
            e: 69,

            /// <field locid="WinJS.Utilities.Key.f" helpKeyword="WinJS.Utilities.Key.f">
            /// F key.
            /// </field>
            f: 70,

            /// <field locid="WinJS.Utilities.Key.g" helpKeyword="WinJS.Utilities.Key.g">
            /// G key.
            /// </field>
            g: 71,

            /// <field locid="WinJS.Utilities.Key.h" helpKeyword="WinJS.Utilities.Key.h">
            /// H key.
            /// </field>
            h: 72,

            /// <field locid="WinJS.Utilities.Key.i" helpKeyword="WinJS.Utilities.Key.i">
            /// I key.
            /// </field>
            i: 73,

            /// <field locid="WinJS.Utilities.Key.j" helpKeyword="WinJS.Utilities.Key.j">
            /// J key.
            /// </field>
            j: 74,

            /// <field locid="WinJS.Utilities.Key.k" helpKeyword="WinJS.Utilities.Key.k">
            /// K key.
            /// </field>
            k: 75,

            /// <field locid="WinJS.Utilities.Key.l" helpKeyword="WinJS.Utilities.Key.l">
            /// L key.
            /// </field>
            l: 76,

            /// <field locid="WinJS.Utilities.Key.m" helpKeyword="WinJS.Utilities.Key.m">
            /// M key.
            /// </field>
            m: 77,

            /// <field locid="WinJS.Utilities.Key.n" helpKeyword="WinJS.Utilities.Key.n">
            /// N key.
            /// </field>
            n: 78,

            /// <field locid="WinJS.Utilities.Key.o" helpKeyword="WinJS.Utilities.Key.o">
            /// O key.
            /// </field>
            o: 79,

            /// <field locid="WinJS.Utilities.Key.p" helpKeyword="WinJS.Utilities.Key.p">
            /// P key.
            /// </field>
            p: 80,

            /// <field locid="WinJS.Utilities.Key.q" helpKeyword="WinJS.Utilities.Key.q">
            /// Q key.
            /// </field>
            q: 81,

            /// <field locid="WinJS.Utilities.Key.r" helpKeyword="WinJS.Utilities.Key.r">
            /// R key.
            /// </field>
            r: 82,

            /// <field locid="WinJS.Utilities.Key.s" helpKeyword="WinJS.Utilities.Key.s">
            /// S key.
            /// </field>
            s: 83,

            /// <field locid="WinJS.Utilities.Key.t" helpKeyword="WinJS.Utilities.Key.t">
            /// T key.
            /// </field>
            t: 84,

            /// <field locid="WinJS.Utilities.Key.u" helpKeyword="WinJS.Utilities.Key.u">
            /// U key.
            /// </field>
            u: 85,

            /// <field locid="WinJS.Utilities.Key.v" helpKeyword="WinJS.Utilities.Key.v">
            /// V key.
            /// </field>
            v: 86,

            /// <field locid="WinJS.Utilities.Key.w" helpKeyword="WinJS.Utilities.Key.w">
            /// W key.
            /// </field>
            w: 87,

            /// <field locid="WinJS.Utilities.Key.x" helpKeyword="WinJS.Utilities.Key.x">
            /// X key.
            /// </field>
            x: 88,

            /// <field locid="WinJS.Utilities.Key.y" helpKeyword="WinJS.Utilities.Key.y">
            /// Y key.
            /// </field>
            y: 89,

            /// <field locid="WinJS.Utilities.Key.z" helpKeyword="WinJS.Utilities.Key.z">
            /// Z key.
            /// </field>
            z: 90,

            /// <field locid="WinJS.Utilities.Key.leftWindows" helpKeyword="WinJS.Utilities.Key.leftWindows">
            /// Left Windows key.
            /// </field>
            leftWindows: 91,

            /// <field locid="WinJS.Utilities.Key.rightWindows" helpKeyword="WinJS.Utilities.Key.rightWindows">
            /// Right Windows key.
            /// </field>
            rightWindows: 92,

            /// <field locid="WinJS.Utilities.Key.menu" helpKeyword="WinJS.Utilities.Key.menu">
            /// Menu key.
            /// </field>
            menu: 93,

            /// <field locid="WinJS.Utilities.Key.numPad0" helpKeyword="WinJS.Utilities.Key.numPad0">
            /// Number pad 0 key.
            /// </field>
            numPad0: 96,

            /// <field locid="WinJS.Utilities.Key.numPad1" helpKeyword="WinJS.Utilities.Key.numPad1">
            /// Number pad 1 key.
            /// </field>
            numPad1: 97,

            /// <field locid="WinJS.Utilities.Key.numPad2" helpKeyword="WinJS.Utilities.Key.numPad2">
            /// Number pad 2 key.
            /// </field>
            numPad2: 98,

            /// <field locid="WinJS.Utilities.Key.numPad3" helpKeyword="WinJS.Utilities.Key.numPad3">
            /// Number pad 3 key.
            /// </field>
            numPad3: 99,

            /// <field locid="WinJS.Utilities.Key.numPad4" helpKeyword="WinJS.Utilities.Key.numPad4">
            /// Number pad 4 key.
            /// </field>
            numPad4: 100,

            /// <field locid="WinJS.Utilities.Key.numPad5" helpKeyword="WinJS.Utilities.Key.numPad5">
            /// Number pad 5 key.
            /// </field>
            numPad5: 101,

            /// <field locid="WinJS.Utilities.Key.numPad6" helpKeyword="WinJS.Utilities.Key.numPad6">
            /// Number pad 6 key.
            /// </field>
            numPad6: 102,

            /// <field locid="WinJS.Utilities.Key.numPad7" helpKeyword="WinJS.Utilities.Key.numPad7">
            /// Number pad 7 key.
            /// </field>
            numPad7: 103,

            /// <field locid="WinJS.Utilities.Key.numPad8" helpKeyword="WinJS.Utilities.Key.numPad8">
            /// Number pad 8 key.
            /// </field>
            numPad8: 104,

            /// <field locid="WinJS.Utilities.Key.numPad9" helpKeyword="WinJS.Utilities.Key.numPad9">
            /// Number pad 9 key.
            /// </field>
            numPad9: 105,

            /// <field locid="WinJS.Utilities.Key.multiply" helpKeyword="WinJS.Utilities.Key.multiply">
            /// Multiplication key.
            /// </field>
            multiply: 106,

            /// <field locid="WinJS.Utilities.Key.add" helpKeyword="WinJS.Utilities.Key.add">
            /// Addition key.
            /// </field>
            add: 107,

            /// <field locid="WinJS.Utilities.Key.subtract" helpKeyword="WinJS.Utilities.Key.subtract">
            /// Subtraction key.
            /// </field>
            subtract: 109,

            /// <field locid="WinJS.Utilities.Key.decimalPoint" helpKeyword="WinJS.Utilities.Key.decimalPoint">
            /// Decimal point key.
            /// </field>
            decimalPoint: 110,

            /// <field locid="WinJS.Utilities.Key.divide" helpKeyword="WinJS.Utilities.Key.divide">
            /// Division key.
            /// </field>
            divide: 111,

            /// <field locid="WinJS.Utilities.Key.F1" helpKeyword="WinJS.Utilities.Key.F1">
            /// F1 key.
            /// </field>
            F1: 112,

            /// <field locid="WinJS.Utilities.Key.F2" helpKeyword="WinJS.Utilities.Key.F2">
            /// F2 key.
            /// </field>
            F2: 113,

            /// <field locid="WinJS.Utilities.Key.F3" helpKeyword="WinJS.Utilities.Key.F3">
            /// F3 key.
            /// </field>
            F3: 114,

            /// <field locid="WinJS.Utilities.Key.F4" helpKeyword="WinJS.Utilities.Key.F4">
            /// F4 key.
            /// </field>
            F4: 115,

            /// <field locid="WinJS.Utilities.Key.F5" helpKeyword="WinJS.Utilities.Key.F5">
            /// F5 key.
            /// </field>
            F5: 116,

            /// <field locid="WinJS.Utilities.Key.F6" helpKeyword="WinJS.Utilities.Key.F6">
            /// F6 key.
            /// </field>
            F6: 117,

            /// <field locid="WinJS.Utilities.Key.F7" helpKeyword="WinJS.Utilities.Key.F7">
            /// F7 key.
            /// </field>
            F7: 118,

            /// <field locid="WinJS.Utilities.Key.F8" helpKeyword="WinJS.Utilities.Key.F8">
            /// F8 key.
            /// </field>
            F8: 119,

            /// <field locid="WinJS.Utilities.Key.F9" helpKeyword="WinJS.Utilities.Key.F9">
            /// F9 key.
            /// </field>
            F9: 120,

            /// <field locid="WinJS.Utilities.Key.F10" helpKeyword="WinJS.Utilities.Key.F10">
            /// F10 key.
            /// </field>
            F10: 121,

            /// <field locid="WinJS.Utilities.Key.F11" helpKeyword="WinJS.Utilities.Key.F11">
            /// F11 key.
            /// </field>
            F11: 122,

            /// <field locid="WinJS.Utilities.Key.F12" helpKeyword="WinJS.Utilities.Key.F12">
            /// F12 key.
            /// </field>
            F12: 123,

            /// <field locid="WinJS.Utilities.Key.numLock" helpKeyword="WinJS.Utilities.Key.numLock">
            /// NUMBER LOCK key.
            /// </field>
            numLock: 144,

            /// <field locid="WinJS.Utilities.Key.scrollLock" helpKeyword="WinJS.Utilities.Key.scrollLock">
            /// SCROLL LOCK key.
            /// </field>
            scrollLock: 145,

            /// <field locid="WinJS.Utilities.Key.browserBack" helpKeyword="WinJS.Utilities.Key.browserBack">
            /// Browser back key.
            /// </field>
            browserBack: 166,

            /// <field locid="WinJS.Utilities.Key.browserForward" helpKeyword="WinJS.Utilities.Key.browserForward">
            /// Browser forward key.
            /// </field>
            browserForward: 167,

            /// <field locid="WinJS.Utilities.Key.semicolon" helpKeyword="WinJS.Utilities.Key.semicolon">
            /// SEMICOLON key.
            /// </field>
            semicolon: 186,

            /// <field locid="WinJS.Utilities.Key.equal" helpKeyword="WinJS.Utilities.Key.equal">
            /// EQUAL key.
            /// </field>
            equal: 187,

            /// <field locid="WinJS.Utilities.Key.comma" helpKeyword="WinJS.Utilities.Key.comma">
            /// COMMA key.
            /// </field>
            comma: 188,

            /// <field locid="WinJS.Utilities.Key.dash" helpKeyword="WinJS.Utilities.Key.dash">
            /// DASH key.
            /// </field>
            dash: 189,

            /// <field locid="WinJS.Utilities.Key.period" helpKeyword="WinJS.Utilities.Key.period">
            /// PERIOD key.
            /// </field>
            period: 190,

            /// <field locid="WinJS.Utilities.Key.forwardSlash" helpKeyword="WinJS.Utilities.Key.forwardSlash">
            /// FORWARD SLASH key.
            /// </field>
            forwardSlash: 191,

            /// <field locid="WinJS.Utilities.Key.graveAccent" helpKeyword="WinJS.Utilities.Key.graveAccent">
            /// Accent grave key.
            /// </field>
            graveAccent: 192,

            /// <field locid="WinJS.Utilities.Key.openBracket" helpKeyword="WinJS.Utilities.Key.openBracket">
            /// OPEN BRACKET key.
            /// </field>
            openBracket: 219,

            /// <field locid="WinJS.Utilities.Key.backSlash" helpKeyword="WinJS.Utilities.Key.backSlash">
            /// BACKSLASH key.
            /// </field>
            backSlash: 220,

            /// <field locid="WinJS.Utilities.Key.closeBracket" helpKeyword="WinJS.Utilities.Key.closeBracket">
            /// CLOSE BRACKET key.
            /// </field>
            closeBracket: 221,

            /// <field locid="WinJS.Utilities.Key.singleQuote" helpKeyword="WinJS.Utilities.Key.singleQuote">
            /// SINGLE QUOTE key.
            /// </field>
            singleQuote: 222,

            /// <field locid="WinJS.Utilities.Key.IME" helpKeyword="WinJS.Utilities.Key.IME">
            /// Any IME input.
            /// </field>
            IME: 229
        },

        data: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.data">
            /// <summary locid="WinJS.Utilities.data">
            /// Gets the data value associated with the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.data_p:element">
            /// The element.
            /// </param>
            /// <returns type="Object" locid="WinJS.Utilities.data_returnValue">
            /// The value associated with the element.
            /// </returns>
            /// </signature>
            if (!element[_dataKey]) {
                element[_dataKey] = {};
            }
            return element[_dataKey];
        },

        hasClass: function (e, name) {
            /// <signature helpKeyword="WinJS.Utilities.hasClass">
            /// <summary locid="WinJS.Utilities.hasClass">
            /// Determines whether the specified element has the specified class.
            /// </summary>
            /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.hasClass_p:e">
            /// The element.
            /// </param>
            /// <param name="name" type="String" locid="WinJS.Utilities.hasClass_p:name">
            /// The name of the class.
            /// </param>
            /// <returns type="Boolean" locid="WinJS.Utilities.hasClass_returnValue">
            /// true if the specified element contains the specified class; otherwise, false.
            /// </returns>
            /// </signature>

            if (e.classList) {
                return e.classList.contains(name);
            } else {
                var className = getClassName(e);
                var names = className.trim().split(" ");
                var l = names.length;
                for (var i = 0; i < l; i++) {
                    if (names[i] === name) {
                        return true;
                    }
                }
                return false;
            }
        },

        addClass: addClass,

        removeClass: removeClass,

        toggleClass: toggleClass,

        _setAttribute: setAttribute,

        getRelativeLeft: function (element, parent) {
            /// <signature helpKeyword="WinJS.Utilities.getRelativeLeft">
            /// <summary locid="WinJS.Utilities.getRelativeLeft">
            /// Gets the left coordinate of the specified element relative to the specified parent.
            /// </summary>
            /// <param name="element" domElement="true" locid="WinJS.Utilities.getRelativeLeft_p:element">
            /// The element.
            /// </param>
            /// <param name="parent" domElement="true" locid="WinJS.Utilities.getRelativeLeft_p:parent">
            /// The parent element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getRelativeLeft_returnValue">
            /// The relative left coordinate.
            /// </returns>
            /// </signature>
            if (!element) {
                return 0;
            }

            var left = element.offsetLeft;
            var e = element.parentNode;
            while (e) {
                left -= e.offsetLeft;

                if (e === parent) {
                    break;
                }
                e = e.parentNode;
            }

            return left;
        },

        getRelativeTop: function (element, parent) {
            /// <signature helpKeyword="WinJS.Utilities.getRelativeTop">
            /// <summary locid="WinJS.Utilities.getRelativeTop">
            /// Gets the top coordinate of the element relative to the specified parent.
            /// </summary>
            /// <param name="element" domElement="true" locid="WinJS.Utilities.getRelativeTop_p:element">
            /// The element.
            /// </param>
            /// <param name="parent" domElement="true" locid="WinJS.Utilities.getRelativeTop_p:parent">
            /// The parent element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getRelativeTop_returnValue">
            /// The relative top coordinate.
            /// </returns>
            /// </signature>
            if (!element) {
                return 0;
            }

            var top = element.offsetTop;
            var e = element.parentNode;
            while (e) {
                top -= e.offsetTop;

                if (e === parent) {
                    break;
                }
                e = e.parentNode;
            }

            return top;
        },

        getScrollPosition: getScrollPosition,

        setScrollPosition: setScrollPosition,

        empty: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.empty">
            /// <summary locid="WinJS.Utilities.empty">
            /// Removes all the child nodes from the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.Utilities.empty_p:element">
            /// The element.
            /// </param>
            /// <returns type="HTMLElement" locid="WinJS.Utilities.empty_returnValue">
            /// The element.
            /// </returns>
            /// </signature>
            if (element.childNodes && element.childNodes.length > 0) {
                for (var i = element.childNodes.length - 1; i >= 0; i--) {
                    element.removeChild(element.childNodes.item(i));
                }
            }
            return element;
        },

        _isDOMElement: function (element) {
            return element &&
                typeof element === "object" &&
                typeof element.tagName === "string";
        },

        getContentWidth: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getContentWidth">
            /// <summary locid="WinJS.Utilities.getContentWidth">
            /// Gets the width of the content of the specified element. The content width does not include borders or padding.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getContentWidth_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getContentWidth_returnValue">
            /// The content width of the element.
            /// </returns>
            /// </signature>
            var border = getDimension(element, "borderLeftWidth") + getDimension(element, "borderRightWidth"),
                padding = getDimension(element, "paddingLeft") + getDimension(element, "paddingRight");
            return element.offsetWidth - border - padding;
        },

        getTotalWidth: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getTotalWidth">
            /// <summary locid="WinJS.Utilities.getTotalWidth">
            /// Gets the width of the element, including margins.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getTotalWidth_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getTotalWidth_returnValue">
            /// The width of the element including margins.
            /// </returns>
            /// </signature>
            var margin = getDimension(element, "marginLeft") + getDimension(element, "marginRight");
            return element.offsetWidth + margin;
        },

        getContentHeight: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getContentHeight">
            /// <summary locid="WinJS.Utilities.getContentHeight">
            /// Gets the height of the content of the specified element. The content height does not include borders or padding.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getContentHeight_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" integer="true" locid="WinJS.Utilities.getContentHeight_returnValue">
            /// The content height of the element.
            /// </returns>
            /// </signature>
            var border = getDimension(element, "borderTopWidth") + getDimension(element, "borderBottomWidth"),
                padding = getDimension(element, "paddingTop") + getDimension(element, "paddingBottom");
            return element.offsetHeight - border - padding;
        },

        getTotalHeight: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getTotalHeight">
            /// <summary locid="WinJS.Utilities.getTotalHeight">
            /// Gets the height of the element, including its margins.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getTotalHeight_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getTotalHeight_returnValue">
            /// The height of the element including margins.
            /// </returns>
            /// </signature>
            var margin = getDimension(element, "marginTop") + getDimension(element, "marginBottom");
            return element.offsetHeight + margin;
        },

        getPosition: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getPosition">
            /// <summary locid="WinJS.Utilities.getPosition">
            /// Gets the position of the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getPosition_p:element">
            /// The element.
            /// </param>
            /// <returns type="Object" locid="WinJS.Utilities.getPosition_returnValue">
            /// An object that contains the left, top, width and height properties of the element.
            /// </returns>
            /// </signature>
            var fromElement = element,
                offsetParent = element.offsetParent,
                top = element.offsetTop,
                left = element.offsetLeft;

            while ((element = element.parentNode) &&
                    element !== _Global.document.body &&
                    element !== _Global.document.documentElement) {
                top -= element.scrollTop;
                var dir = _Global.document.defaultView.getComputedStyle(element, null).direction;
                left -= dir !== "rtl" ? element.scrollLeft : -getAdjustedScrollPosition(element).scrollLeft;

                if (element === offsetParent) {
                    top += element.offsetTop;
                    left += element.offsetLeft;
                    offsetParent = element.offsetParent;
                }
            }

            return {
                left: left,
                top: top,
                width: fromElement.offsetWidth,
                height: fromElement.offsetHeight
            };
        },

        getTabIndex: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getTabIndex">
            /// <summary locid="WinJS.Utilities.getTabIndex">
            /// Gets the tabIndex of the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getTabIndex_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getTabIndex_returnValue">
            /// The tabIndex of the element. Returns -1 if the element cannot be tabbed to
            /// </returns>
            /// </signature>
            // For reference: http://www.w3.org/html/wg/drafts/html/master/single-page.html#specially-focusable
            var tabbableElementsRE = /BUTTON|COMMAND|MENUITEM|OBJECT|SELECT|TEXTAREA/;
            if (element.disabled) {
                return -1;
            }
            var tabIndex = element.getAttribute("tabindex");
            if (tabIndex === null || tabIndex === undefined) {
                var name = element.tagName;
                if (tabbableElementsRE.test(name) ||
                    (element.href && (name === "A" || name === "AREA" || name === "LINK")) ||
                    (name === "INPUT" && element.type !== "hidden") ||
                    (name === "TH" && element.sorted)) {
                    return 0;
                }
                return -1;
            }
            return parseInt(tabIndex, 10);
        },

        convertToPixels: convertToPixels,

        eventWithinElement: function (element, event) {
            /// <signature helpKeyword="WinJS.Utilities.eventWithinElement">
            /// <summary locid="WinJS.Utilities.eventWithinElement">
            /// Determines whether the specified event occurred within the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.eventWithinElement_p:element">
            /// The element.
            /// </param>
            /// <param name="event" type="Event" locid="WinJS.Utilities.eventWithinElement_p:event">
            /// The event.
            /// </param>
            /// <returns type="Boolean" locid="WinJS.Utilities.eventWithinElement_returnValue">
            /// true if the event occurred within the element; otherwise, false.
            /// </returns>
            /// </signature>
            var related = event.relatedTarget;
            if (related && related !== element) {
                return element.contains(related);
            }

            return false;
        },

        //UI Utilities
        _deprecated: function (message) {
            _Global.console && _Global.console.warn(message);
        },

        // Take a renderer which may be a function (signature: (data) => element) or a WinJS.Binding.Template
        //  and return a function with a unified synchronous contract which is:
        //
        //  (data, container) => element
        //
        // Where:
        //
        //  1) if you pass container the content will be rendered into the container and the
        //     container will be returned.
        //
        //  2) if you don't pass a container the content will be rendered and returned.
        //
        _syncRenderer: function (renderer, tagName) {
            tagName = tagName || "div";
            if (typeof renderer === "function") {
                return function (data, container) {
                    if (container) {
                        container.appendChild(renderer(data));
                        return container;
                    } else {
                        return renderer(data);
                    }
                };
            }

            var template;
            if (typeof renderer.render === "function") {
                template = renderer;
            } else if (renderer.winControl && typeof renderer.winControl.render === "function") {
                template = renderer.winControl;
            }

            return function (data, container) {
                var host = container || _Global.document.createElement(tagName);
                template.render(data, host);
                if (container) {
                    return container;
                } else {
                    // The expectation is that the creation of the DOM elements happens synchronously
                    //  and as such we steal the first child and make it the root element.
                    //
                    var element = host.firstElementChild;

                    // Because we have changed the "root" we may need to move the dispose method
                    //  created by the template to the child and do a little switcheroo on dispose.
                    //
                    if (element && host.dispose) {
                        var prev = element.dispose;
                        element.dispose = function () {
                            element.dispose = prev;
                            host.appendChild(element);
                            host.dispose();
                        };
                    }
                    return element;
                }
            };
        },


        _getLowestTabIndexInList: function Utilities_getLowestTabIndexInList(elements) {
            // Returns the lowest positive tabIndex in a list of elements.
            // Returns 0 if there are no positive tabIndices.
            var lowestTabIndex = 0;
            var elmTabIndex;
            for (var i = 0; i < elements.length; i++) {
                elmTabIndex = parseInt(elements[i].getAttribute("tabIndex"), 10);
                if ((0 < elmTabIndex)
                 && ((elmTabIndex < lowestTabIndex) || !lowestTabIndex)) {
                    lowestTabIndex = elmTabIndex;
                }
            }

            return lowestTabIndex;
        },

        _getHighestTabIndexInList: function Utilities_getHighestTabIndexInList(elements) {
            // Returns 0 if any element is explicitly set to 0. (0 is the highest tabIndex)
            // Returns the highest tabIndex in the list of elements.
            // Returns 0 if there are no positive tabIndices.
            var highestTabIndex = 0;
            var elmTabIndex;
            for (var i = 0; i < elements.length; i++) {
                elmTabIndex = parseInt(elements[i].getAttribute("tabIndex"), 10);
                if (elmTabIndex === 0) {
                    return elmTabIndex;
                } else if (highestTabIndex < elmTabIndex) {
                    highestTabIndex = elmTabIndex;
                }
            }

            return highestTabIndex;
        },

        _trySetActive: function Utilities_trySetActive(elem, scroller) {
            return this._tryFocus(elem, true, scroller);
        },

        _tryFocus: function Utilities_tryFocus(elem, useSetActive, scroller) {
            var previousActiveElement = _Global.document.activeElement;

            if (elem === previousActiveElement) {
                return true;
            }

            var simpleLogicForValidTabStop = (exports.getTabIndex(elem) >= 0);
            if (!simpleLogicForValidTabStop) {
                return false;
            }

            if (useSetActive) {
                exports._setActive(elem, scroller);
            } else {
                elem.focus();
            }

            if (previousActiveElement !== _Global.document.activeElement) {
                return true;
            }
            return false;
        },

        _setActiveFirstFocusableElement: function Utilities_setActiveFirstFocusableElement(rootEl, scroller) {
            return this._focusFirstFocusableElement(rootEl, true, scroller);
        },

        _focusFirstFocusableElement: function Utilities_focusFirstFocusableElement(rootEl, useSetActive, scroller) {
            var _elms = rootEl.getElementsByTagName("*");

            // Get the tabIndex set to the firstDiv (which is the lowest)
            var _lowestTabIndex = this._getLowestTabIndexInList(_elms);
            var _nextLowestTabIndex = 0;

            // If there are positive tabIndices, set focus to the element with the lowest tabIndex.
            // Keep trying with the next lowest tabIndex until all tabIndices have been exhausted.
            // Otherwise set focus to the first focusable element in DOM order.
            var i;
            while (_lowestTabIndex) {
                for (i = 0; i < _elms.length; i++) {
                    if (_elms[i].tabIndex === _lowestTabIndex) {
                        if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                            return true;
                        }
                    } else if ((_lowestTabIndex < _elms[i].tabIndex)
                            && ((_elms[i].tabIndex < _nextLowestTabIndex) || (_nextLowestTabIndex === 0))) {
                        // Here if _lowestTabIndex < _elms[i].tabIndex < _nextLowestTabIndex
                        _nextLowestTabIndex = _elms[i].tabIndex;
                    }
                }

                // We weren't able to set focus to anything at that tabIndex
                // If we found a higher valid tabIndex, try that now
                _lowestTabIndex = _nextLowestTabIndex;
                _nextLowestTabIndex = 0;
            }

            // Wasn't able to set focus to anything with a positive tabIndex, try everything now.
            // This is where things with tabIndex of 0 will be tried.
            for (i = 0; i < _elms.length; i++) {
                if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                    return true;
                }
            }

            return false;
        },

        _setActiveLastFocusableElement: function Utilities_setActiveLastFocusableElement(rootEl, scroller) {
            return this._focusLastFocusableElement(rootEl, true, scroller);
        },

        _focusLastFocusableElement: function Utilities_focusLastFocusableElement(rootEl, useSetActive, scroller) {
            var _elms = rootEl.getElementsByTagName("*");
            // Get the tabIndex set to the finalDiv (which is the highest)
            var _highestTabIndex = this._getHighestTabIndexInList(_elms);
            var _nextHighestTabIndex = 0;

            // Try all tabIndex 0 first. After this conditional the _highestTabIndex
            // should be equal to the highest positive tabIndex.
            var i;
            if (_highestTabIndex === 0) {
                for (i = _elms.length - 1; i >= 0; i--) {
                    if (_elms[i].tabIndex === _highestTabIndex) {
                        if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                            return true;
                        }
                    } else if (_nextHighestTabIndex < _elms[i].tabIndex) {
                        _nextHighestTabIndex = _elms[i].tabIndex;
                    }
                }

                _highestTabIndex = _nextHighestTabIndex;
                _nextHighestTabIndex = 0;
            }

            // If there are positive tabIndices, set focus to the element with the highest tabIndex.
            // Keep trying with the next highest tabIndex until all tabIndices have been exhausted.
            // Otherwise set focus to the last focusable element in DOM order.
            while (_highestTabIndex) {
                for (i = _elms.length - 1; i >= 0; i--) {
                    if (_elms[i].tabIndex === _highestTabIndex) {
                        if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                            return true;
                        }
                    } else if ((_nextHighestTabIndex < _elms[i].tabIndex) && (_elms[i].tabIndex < _highestTabIndex)) {
                        // Here if _nextHighestTabIndex < _elms[i].tabIndex < _highestTabIndex
                        _nextHighestTabIndex = _elms[i].tabIndex;
                    }
                }

                // We weren't able to set focus to anything at that tabIndex
                // If we found a lower valid tabIndex, try that now
                _highestTabIndex = _nextHighestTabIndex;
                _nextHighestTabIndex = 0;
            }

            // Wasn't able to set focus to anything with a tabIndex, try everything now
            for (i = _elms.length - 2; i > 0; i--) {
                if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                    return true;
                }
            }

            return false;
        }

    });
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_Dispose',[
    'exports',
    '../Core/_Base',
    '../Core/_WriteProfilerMark',
    './_ElementUtilities'
    ], function (exports, _Base, _WriteProfilerMark, _ElementUtilities) {
    "use strict";

    function markDisposable(element, disposeImpl) {
            /// <signature helpKeyword="WinJS.Utilities.markDisposable">
            /// <summary locid="WinJS.Utilities.markDisposable">
            /// Adds the specified dispose implementation to the specified element and marks it as disposable.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.markDisposable_p:element">
            /// The element to mark as disposable.
            /// </param>
            /// <param name="disposeImpl" type="Function" locid="WinJS.Utilities.markDisposable_p:disposeImpl">
            /// The function containing the element-specific dispose logic that will be called by the dispose function.
            /// </param>
            /// </signature>
            var disposed = false;
            _ElementUtilities.addClass(element, "win-disposable");

            var disposable = element.winControl || element;
            disposable.dispose = function () {
                if (disposed) {
                    return;
                }

                disposed = true;
                disposeSubTree(element);
                if (disposeImpl) {
                    disposeImpl();
                }
            };
        }

    function disposeSubTree(element) {
        /// <signature helpKeyword="WinJS.Utilities.disposeSubTree">
        /// <summary locid="WinJS.Utilities.disposeSubTree">
        /// Disposes all first-generation disposable elements that are descendents of the specified element.
        /// The specified element itself is not disposed.
        /// </summary>
        /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.disposeSubTree_p:element">
        /// The root element whose sub-tree is to be disposed.
        /// </param>
        /// </signature>
        if (!element) {
            return;
        }

        _WriteProfilerMark("WinJS.Utilities.disposeSubTree,StartTM");
        var query = element.querySelectorAll(".win-disposable");

        var index = 0;
        var length = query.length;
        while (index < length) {
            var disposable = query[index];
            if (disposable.winControl && disposable.winControl.dispose) {
                disposable.winControl.dispose();
            }
            if (disposable.dispose) {
                disposable.dispose();
            }

            // Skip over disposable's descendants since they are this disposable's responsibility to clean up.
            index += disposable.querySelectorAll(".win-disposable").length + 1;
        }
        _WriteProfilerMark("WinJS.Utilities.disposeSubTree,StopTM");
    }

    function _disposeElement(element) {
        // This helper should only be used for supporting dispose scenarios predating the dispose pattern.
        // The specified element should be well enough defined so we don't have to check whether it
        // a) has a disposable winControl,
        // b) is disposable itself,
        // or has disposable descendants in which case either a) or b) must have been true when designed correctly.
        if (!element) {
            return;
        }

        var disposed = false;
        if (element.winControl && element.winControl.dispose) {
            element.winControl.dispose();
            disposed = true;
        }
        if (element.dispose) {
            element.dispose();
            disposed = true;
        }

        if (!disposed) {
            disposeSubTree(element);
        }
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {

        markDisposable: markDisposable,

        disposeSubTree: disposeSubTree,

        _disposeElement: _disposeElement
    });
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_ElementListUtilities',[
    'exports',
    '../Core/_Global',
    '../Core/_Base',
    '../ControlProcessor',
    '../Promise',
    '../Utilities/_Control',
    '../Utilities/_ElementUtilities'
    ], function elementListUtilities(exports, _Global, _Base, ControlProcessor, Promise, _Control, _ElementUtilities) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        QueryCollection: _Base.Class.derive(Array, function (items) {
            /// <signature helpKeyword="WinJS.Utilities.QueryCollection">
            /// <summary locid="WinJS.Utilities.QueryCollection">
            /// Represents the result of a query selector, and provides
            /// various operations that perform actions over the elements of
            /// the collection.
            /// </summary>
            /// <param name="items" locid="WinJS.Utilities.QueryCollection_p:items">
            /// The items resulting from the query.
            /// </param>
            /// </signature>
            if (items) {
                this.include(items);
            }
        }, {
            forEach: function (callbackFn, thisArg) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.forEach">
                /// <summary locid="WinJS.Utilities.QueryCollection.forEach">
                /// Performs an action on each item in the QueryCollection
                /// </summary>
                /// <param name="callbackFn" type="function(value, Number index, traversedObject)" locid="WinJS.Utilities.QueryCollection.forEach_p:callbackFn">
                /// Action to perform on each item.
                /// </param>
                /// <param name="thisArg" isOptional="true" type="function(value, Number index, traversedObject)" locid="WinJS.Utilities.QueryCollection.forEach_p:thisArg">
                /// Argument to bind to callbackFn
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.forEach_returnValue">
                /// Returns the QueryCollection
                /// </returns>
                /// </signature>
                Array.prototype.forEach.apply(this, [callbackFn, thisArg]);
                return this;
            },
            get: function (index) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.get">
                /// <summary locid="WinJS.Utilities.QueryCollection.get">
                /// Gets an item from the QueryCollection.
                /// </summary>
                /// <param name="index" type="Number" locid="WinJS.Utilities.QueryCollection.get_p:index">
                /// The index of the item to return.
                /// </param>
                /// <returns type="Object" locid="WinJS.Utilities.QueryCollection.get_returnValue">
                /// A single item from the collection.
                /// </returns>
                /// </signature>
                return this[index];
            },
            setAttribute: function (name, value) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.setAttribute">
                /// <summary locid="WinJS.Utilities.QueryCollection.setAttribute">
                /// Sets an attribute value on all the items in the collection.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.setAttribute_p:name">
                /// The name of the attribute to be set.
                /// </param>
                /// <param name="value" type="String" locid="WinJS.Utilities.QueryCollection.setAttribute_p:value">
                /// The value of the attribute to be set.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.setAttribute_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    item.setAttribute(name, value);
                });
                return this;
            },
            getAttribute: function (name) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.getAttribute">
                /// <summary locid="WinJS.Utilities.QueryCollection.getAttribute">
                /// Gets an attribute value from the first element in the collection.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.getAttribute_p:name">
                /// The name of the attribute.
                /// </param>
                /// <returns type="String" locid="WinJS.Utilities.QueryCollection.getAttribute_returnValue">
                /// The value of the attribute.
                /// </returns>
                /// </signature>
                if (this.length > 0) {
                    return this[0].getAttribute(name);
                }
            },
            addClass: function (name) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.addClass">
                /// <summary locid="WinJS.Utilities.QueryCollection.addClass">
                /// Adds the specified class to all the elements in the collection.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.addClass_p:name">
                /// The name of the class to add.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.addClass_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    _ElementUtilities.addClass(item, name);
                });
                return this;
            },
            hasClass: function (name) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.hasClass">
                /// <summary locid="WinJS.Utilities.QueryCollection.hasClass">
                /// Determines whether the specified class exists on the first element of the collection.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.hasClass_p:name">
                /// The name of the class.
                /// </param>
                /// <returns type="Boolean" locid="WinJS.Utilities.QueryCollection.hasClass_returnValue">
                /// true if the element has the specified class; otherwise, false.
                /// </returns>
                /// </signature>
                if (this.length > 0) {
                    return _ElementUtilities.hasClass(this[0], name);
                }
                return false;
            },
            removeClass: function (name) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.removeClass">
                /// <summary locid="WinJS.Utilities.QueryCollection.removeClass">
                /// Removes the specified class from all the elements in the collection.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.removeClass_p:name">
                /// The name of the class to be removed.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.removeClass_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    _ElementUtilities.removeClass(item, name);
                });
                return this;
            },
            toggleClass: function (name) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.toggleClass">
                /// <summary locid="WinJS.Utilities.QueryCollection.toggleClass">
                /// Toggles (adds or removes) the specified class on all the elements in the collection.
                /// If the class is present, it is removed; if it is absent, it is added.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.toggleClass_p:name">
                /// The name of the class to be toggled.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.toggleClass_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    _ElementUtilities.toggleClass(item, name);
                });
                return this;
            },
            listen: function (eventType, listener, capture) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.listen">
                /// <summary locid="WinJS.Utilities.QueryCollection.listen">
                /// Registers the listener for the specified event on all the elements in the collection.
                /// </summary>
                /// <param name="eventType" type="String" locid="WinJS.Utilities.QueryCollection.listen_p:eventType">
                /// The name of the event.
                /// </param>
                /// <param name="listener" type="Function" locid="WinJS.Utilities.QueryCollection.listen_p:listener">
                /// The event handler function to be called when the event occurs.
                /// </param>
                /// <param name="capture" type="Boolean" locid="WinJS.Utilities.QueryCollection.listen_p:capture">
                /// true if capture == true is to be passed to addEventListener; otherwise, false.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.listen_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    item.addEventListener(eventType, listener, capture);
                });
                return this;
            },
            removeEventListener: function (eventType, listener, capture) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.removeEventListener">
                /// <summary locid="WinJS.Utilities.QueryCollection.removeEventListener">
                /// Unregisters the listener for the specified event on all the elements in the collection.
                /// </summary>
                /// <param name="eventType" type="String" locid="WinJS.Utilities.QueryCollection.removeEventListener_p:eventType">
                /// The name of the event.
                /// </param>
                /// <param name="listener" type="Function" locid="WinJS.Utilities.QueryCollection.removeEventListener_p:listener">
                /// The event handler function.
                /// </param>
                /// <param name="capture" type="Boolean" locid="WinJS.Utilities.QueryCollection.removeEventListener_p:capture">
                /// true if capture == true; otherwise, false.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.removeEventListener_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    item.removeEventListener(eventType, listener, capture);
                });
                return this;
            },
            setStyle: function (name, value) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.setStyle">
                /// <summary locid="WinJS.Utilities.QueryCollection.setStyle">
                /// Sets the specified style property for all the elements in the collection.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.setStyle_p:name">
                /// The name of the style property.
                /// </param>
                /// <param name="value" type="String" locid="WinJS.Utilities.QueryCollection.setStyle_p:value">
                /// The value for the property.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.setStyle_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    item.style[name] = value;
                });
                return this;
            },
            clearStyle: function (name) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.clearStyle">
                /// <summary locid="WinJS.Utilities.QueryCollection.clearStyle">
                /// Clears the specified style property for all the elements in the collection.
                /// </summary>
                /// <param name="name" type="String" locid="WinJS.Utilities.QueryCollection.clearStyle_p:name">
                /// The name of the style property to be cleared.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.clearStyle_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                this.forEach(function (item) {
                    item.style[name] = "";
                });
                return this;
            },
            query: function (query) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.query">
                /// <summary locid="WinJS.Utilities.QueryCollection.query">
                /// Executes a query selector on all the elements in the collection
                /// and aggregates the result into a QueryCollection.
                /// </summary>
                /// <param name="query" type="String" locid="WinJS.Utilities.QueryCollection.query_p:query">
                /// The query selector string.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.query_returnValue">
                /// A QueryCollection object containing the aggregate results of
                /// executing the query on all the elements in the collection.
                /// </returns>
                /// </signature>
                var newCollection = new exports.QueryCollection();
                this.forEach(function (item) {
                    newCollection.include(item.querySelectorAll(query));
                });
                return newCollection;
            },
            include: function (items) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.include">
                /// <summary locid="WinJS.Utilities.QueryCollection.include">
                /// Adds a set of items to this QueryCollection.
                /// </summary>
                /// <param name="items" locid="WinJS.Utilities.QueryCollection.include_p:items">
                /// The items to add to the QueryCollection. This may be an
                /// array-like object, a document fragment, or a single item.
                /// </param>
                /// </signature>
                if (typeof items.length === "number") {
                    for (var i = 0; i < items.length; i++) {
                        this.push(items[i]);
                    }
                } else if (items.DOCUMENT_FRAGMENT_NODE && items.nodeType === items.DOCUMENT_FRAGMENT_NODE) {
                    this.include(items.childNodes);
                } else {
                    this.push(items);
                }
            },
            control: function (Ctor, options) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.control">
                /// <summary locid="WinJS.Utilities.QueryCollection.control">
                /// Creates controls that are attached to the elements in this QueryCollection.
                /// </summary>
                /// <param name='Ctor' locid="WinJS.Utilities.QueryCollection.control_p:ctor">
                /// A constructor function that is used to create controls to attach to the elements.
                /// </param>
                /// <param name='options' locid="WinJS.Utilities.QueryCollection.control_p:options">
                /// The options passed to the newly-created controls.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.control_returnValue">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>
                /// <signature>
                /// <summary locid="WinJS.Utilities.QueryCollection.control2">
                /// Configures the controls that are attached to the elements in this QueryCollection.
                /// </summary>
                /// <param name='ctor' locid="WinJS.Utilities.QueryCollection.control_p:ctor2">
                /// The options passed to the controls.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.control_returnValue2">
                /// This QueryCollection object.
                /// </returns>
                /// </signature>

                if (Ctor && typeof (Ctor) === "function") {
                    this.forEach(function (element) {
                        element.winControl = new Ctor(element, options);
                    });
                } else {
                    options = Ctor;
                    this.forEach(function (element) {
                        ControlProcessor.process(element).done(function (control) {
                            control && _Control.setOptions(control, options);
                        });
                    });
                }
                return this;
            },
            template: function (templateElement, data, renderDonePromiseCallback) {
                /// <signature helpKeyword="WinJS.Utilities.QueryCollection.template">
                /// <summary locid="WinJS.Utilities.QueryCollection.template">
                /// Renders a template that is bound to the given data
                /// and parented to the elements included in the QueryCollection.
                /// If the QueryCollection contains multiple elements, the template
                /// is rendered multiple times, once at each element in the QueryCollection
                /// per item of data passed.
                /// </summary>
                /// <param name="templateElement" type="DOMElement" locid="WinJS.Utilities.QueryCollection.template_p:templateElement">
                /// The DOM element to which the template control is attached to.
                /// </param>
                /// <param name="data" type="Object" locid="WinJS.Utilities.QueryCollection.template_p:data">
                /// The data to render. If the data is an array (or any other object
                /// that has a forEach method) then the template is rendered
                /// multiple times, once for each item in the collection.
                /// </param>
                /// <param name="renderDonePromiseCallback" type="Function" locid="WinJS.Utilities.QueryCollection.template_p:renderDonePromiseCallback">
                /// If supplied, this function is called
                /// each time the template gets rendered, and is passed a promise
                /// that is fulfilled when the template rendering is complete.
                /// </param>
                /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.QueryCollection.template_returnValue">
                /// The QueryCollection.
                /// </returns>
                /// </signature>
                if (templateElement instanceof exports.QueryCollection) {
                    templateElement = templateElement[0];
                }
                var template = templateElement.winControl;

                if (data === null || data === undefined || !data.forEach) {
                    data = [data];
                }

                renderDonePromiseCallback = renderDonePromiseCallback || function () { };

                var that = this;
                var donePromises = [];
                data.forEach(function (datum) {
                    that.forEach(function (element) {
                        donePromises.push(template.render(datum, element));
                    });
                });
                renderDonePromiseCallback(Promise.join(donePromises));

                return this;
            }
        }, {
            supportedForProcessing: false,
        }),

        query: function (query, element) {
            /// <signature helpKeyword="WinJS.Utilities.query">
            /// <summary locid="WinJS.Utilities.query">
            /// Executes a query selector on the specified element or the entire document.
            /// </summary>
            /// <param name="query" type="String" locid="WinJS.Utilities.query_p:query">
            /// The query selector to be executed.
            /// </param>
            /// <param name="element" optional="true" type="HTMLElement" locid="WinJS.Utilities.query_p:element">
            /// The element on which to execute the query. If this parameter is not specified, the
            /// query is executed on the entire document.
            /// </param>
            /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.query_returnValue">
            /// The QueryCollection that contains the results of the query.
            /// </returns>
            /// </signature>
            return new exports.QueryCollection((element || _Global.document).querySelectorAll(query));
        },

        id: function (id) {
            /// <signature helpKeyword="WinJS.Utilities.id">
            /// <summary locid="WinJS.Utilities.id">
            /// Looks up an element by ID and wraps the result in a QueryCollection.
            /// </summary>
            /// <param name="id" type="String" locid="WinJS.Utilities.id_p:id">
            /// The ID of the element.
            /// </param>
            /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.id_returnValue">
            /// A QueryCollection that contains the element, if it is found.
            /// </returns>
            /// </signature>
            var e = _Global.document.getElementById(id);
            return new exports.QueryCollection(e ? [e] : []);
        },

        children: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.children">
            /// <summary locid="WinJS.Utilities.children">
            /// Creates a QueryCollection that contains the children of the specified parent element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.children_p:element">
            /// The parent element.
            /// </param>
            /// <returns type="WinJS.Utilities.QueryCollection" locid="WinJS.Utilities.children_returnValue">
            /// The QueryCollection that contains the children of the element.
            /// </returns>
            /// </signature>
            return new exports.QueryCollection(element.children);
        }
    });
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_Hoverable',[
    'exports',
    '../Core/_Global'
], function hoverable(exports, _Global) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    _Global.document.documentElement.classList.add("win-hoverable");
    exports.isHoverable = true;

    if (!_Global.MSPointerEvent) {
        var touchStartHandler = function () {
            _Global.document.removeEventListener("touchstart", touchStartHandler);
            // Remove win-hoverable CSS class fromstartt . <html> to avoid :hover styles in webkit when there is
            // touch support.
            _Global.document.documentElement.classList.remove("win-hoverable");
            exports.isHoverable = false;
        };

        _Global.document.addEventListener("touchstart", touchStartHandler);
    }
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_ParallelWorkQueue',[
    'exports',
    '../Core/_Base',
    '../Promise',
    '../Scheduler'
    ], function parallelWorkQueueInit(exports, _Base, Promise, Scheduler) {
    "use strict";

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _ParallelWorkQueue : _Base.Namespace._lazy(function () {
            return _Base.Class.define(function ParallelWorkQueue_ctor(maxRunning) {
                var workIndex = 0;
                var workItems = {};
                var workQueue = [];

                maxRunning = maxRunning || 3;
                var running = 0;
                var processing = 0;
                function runNext() {
                    running--;
                    // if we have fallen out of this loop, then we know we are already
                    // async, so "post" is OK. If we are still in the loop, then the
                    // loop will continue to run, so we don't need to "post" or
                    // recurse. This avoids stack overflow in the sync case.
                    //
                    if (!processing) {
                        Scheduler.schedule(run, Scheduler.Priority.normal,
                            null, "WinJS._ParallelWorkQueue.runNext");
                    }
                }
                function run() {
                    processing++;
                    for (; running < maxRunning; running++) {
                        var next;
                        var nextWork;
                        do {
                            next = workQueue.shift();
                            nextWork = next && workItems[next];
                        } while (next && !nextWork);

                        if (nextWork) {
                            delete workItems[next];
                            try {
                                nextWork().then(runNext, runNext);
                            }
                            catch (err) {
                                // this will only get hit if there is a queued item that
                                // fails to return something that conforms to the Promise
                                // contract
                                //
                                runNext();
                            }
                        } else {
                            break;
                        }
                    }
                    processing--;
                }
                function queue(f, data, first) {
                    var id = "w" + (workIndex++);
                    var workPromise;
                    return new Promise(
                        function (c, e, p) {
                            var w = function () {
                                workPromise = f().then(c, e, p);
                                return workPromise;
                            };
                            w.data = data;
                            workItems[id] = w;
                            if (first) {
                                workQueue.unshift(id);
                            } else {
                                workQueue.push(id);
                            }
                            run();
                        },
                        function () {
                            delete workItems[id];
                            if (workPromise) {
                                workPromise.cancel();
                            }
                        }
                    );
                }

                this.sort = function (f) {
                    workQueue.sort(function (a, b) {
                        a = workItems[a];
                        b = workItems[b];
                        return a === undefined && b === undefined ? 0 : a === undefined ? 1 : b === undefined ? -1 : f(a.data, b.data);
                    });
                };
                this.queue = queue;
            }, {
                /* empty */
            }, {
                supportedForProcessing: false,
            });
        })
    });

});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_VersionManager',[
    'exports',
    '../Core/_Base',
    '../_Signal'
    ], function versionManagerInit(exports, _Base, _Signal) {
    "use strict";

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _VersionManager: _Base.Namespace._lazy(function () {
            return _Base.Class.define(function _VersionManager_ctor() {
                this._unlocked = new _Signal();
                this._unlocked.complete();
            }, {
                _cancelCount: 0,
                _notificationCount: 0,
                _updateCount: 0,
                _version: 0,

                // This should be used generally for all logic that should be suspended while data changes are happening
                //
                locked: { get: function () { return this._notificationCount !== 0 || this._updateCount !== 0; } },

                // this should only be accessed by the update logic in ListViewImpl.js
                //
                noOutstandingNotifications: { get: function () { return this._notificationCount === 0; } },
                version: { get: function () { return this._version; } },

                unlocked: { get: function () { return this._unlocked.promise; } },

                _dispose: function () {
                    if (this._unlocked) {
                        this._unlocked.cancel();
                        this._unlocked = null;
                    }
                },

                beginUpdating: function () {
                    this._checkLocked();
                    this._updateCount++;
                },
                endUpdating: function () {
                    this._updateCount--;
                    this._checkUnlocked();
                },
                beginNotifications: function () {
                    this._checkLocked();
                    this._notificationCount++;
                },
                endNotifications: function () {
                    this._notificationCount--;
                    this._checkUnlocked();
                },
                _checkLocked: function () {
                    if (!this.locked) {
                        this._dispose();
                        this._unlocked = new _Signal();
                    }
                },
                _checkUnlocked: function () {
                    if (!this.locked) {
                        this._unlocked.complete();
                    }
                },
                receivedNotification: function () {
                    this._version++;
                    if (this._cancel) {
                        var cancel = this._cancel;
                        this._cancel = null;
                        cancel.forEach(function (p) { p && p.cancel(); });
                    }
                },
                cancelOnNotification: function (promise) {
                    if (!this._cancel) {
                        this._cancel = [];
                        this._cancelCount = 0;
                    }
                    this._cancel[this._cancelCount++] = promise;
                    return this._cancelCount - 1;
                },
                clearCancelOnNotification: function (token) {
                    if (this._cancel) {
                        delete this._cancel[token];
                    }
                }
            }, {
                supportedForProcessing: false,
            });
        })
    });

});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
// Items Manager

define('WinJS/Utilities/_ItemsManager',[
    'exports',
    '../Core/_Global',
    '../Core/_Base',
    '../Core/_BaseUtils',
    '../Core/_ErrorFromName',
    '../Core/_Resources',
    '../Core/_WriteProfilerMark',
    '../Promise',
    '../_Signal',
    '../Scheduler',
    '../Utilities/_ElementUtilities',
    './_ParallelWorkQueue',
    './_VersionManager'
    ], function itemsManagerInit(exports, _Global, _Base, _BaseUtils, _ErrorFromName, _Resources, _WriteProfilerMark, Promise, _Signal, Scheduler, _ElementUtilities, _ParallelWorkQueue, _VersionManager) {
    "use strict";

    var markSupportedForProcessing = _BaseUtils.markSupportedForProcessing;
    var uniqueID = _ElementUtilities._uniqueID;

    function simpleItemRenderer(f) {
        return markSupportedForProcessing(function (itemPromise, element) {
            return itemPromise.then(function (item) {
                return (item ? f(item, element) : null);
            });
        });
    }

    var trivialHtmlRenderer = simpleItemRenderer(function (item) {
        if (_ElementUtilities._isDOMElement(item.data)) {
            return item.data;
        }

        var data = item.data;
        if (data === undefined) {
            data = "undefined";
        } else if (data === null) {
            data = "null";
        } else if (typeof data === "object") {
            data = JSON.stringify(data);
        }

        var element = _Global.document.createElement("span");
        element.textContent = data.toString();
        return element;
    });

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _normalizeRendererReturn: function (v) {
            if (v) {
                if (typeof v === "object" && v.element) {
                    var elementPromise = Promise.as(v.element);
                    return elementPromise.then(function (e) { return { element: e, renderComplete: Promise.as(v.renderComplete) }; });
                } else {
                    var elementPromise = Promise.as(v);
                    return elementPromise.then(function (e) { return { element: e, renderComplete: Promise.as() }; });
                }
            } else {
                return { element: null, renderComplete: Promise.as() };
            }
        },
        simpleItemRenderer: simpleItemRenderer,
        _trivialHtmlRenderer: trivialHtmlRenderer
    });

    // Private statics

    var strings = {
        get listDataSourceIsInvalid() { return "Invalid argument: dataSource must be an object."; },
        get itemRendererIsInvalid() { return "Invalid argument: itemRenderer must be a function."; },
        get itemIsInvalid() { return "Invalid argument: item must be a DOM element that was returned by the Items Manager, and has not been replaced or released."; },
    };

    var imageLoader;
    var lastSort = new Date();
    var minDurationBetweenImageSort = 64;

    // This optimization is good for a couple of reasons:
    // - It is a global optimizer, which means that all on screen images take precedence over all off screen images.
    // - It avoids resorting too frequently by only resorting when a new image loads and it has been at least 64 ms since
    //   the last sort.
    // Also, it is worth noting that "sort" on an empty queue does no work (besides the function call).
    function compareImageLoadPriority(a, b) {
        var aon = false;
        var bon = false;

        // Currently isOnScreen is synchronous and fast for list view
        a.isOnScreen().then(function (v) { aon = v; });
        b.isOnScreen().then(function (v) { bon = v; });

        return (aon ? 0 : 1) - (bon ? 0 : 1);
    }

    var nextImageLoaderId = 0;
    var seenUrls = {};
    var seenUrlsMRU = [];
    var SEEN_URLS_MAXSIZE = 250;
    var SEEN_URLS_MRU_MAXSIZE = 1000;

    function seenUrl(srcUrl) {
        if ((/^blob:/i).test(srcUrl)) {
            return;
        }

        seenUrls[srcUrl] = true;
        seenUrlsMRU.push(srcUrl);

        if (seenUrlsMRU.length > SEEN_URLS_MRU_MAXSIZE) {
            var mru = seenUrlsMRU;
            seenUrls = {};
            seenUrlsMRU = [];

            for (var count = 0, i = mru.length - 1; i >= 0 && count < SEEN_URLS_MAXSIZE; i--) {
                var url = mru[i];
                if (!seenUrls[url]) {
                    seenUrls[url] = true;
                    count++;
                }
            }
        }
    }

    // Exposing the seenUrl related members to use them in unit tests
    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _seenUrl: seenUrl,
        _getSeenUrls: function () {
            return seenUrls;
        },
        _getSeenUrlsMRU: function () {
            return seenUrlsMRU;
        },
        _seenUrlsMaxSize: SEEN_URLS_MAXSIZE,
        _seenUrlsMRUMaxSize: SEEN_URLS_MRU_MAXSIZE
    });

    function loadImage(srcUrl, image, data) {
        var imageId = nextImageLoaderId++;
        imageLoader = imageLoader || new _ParallelWorkQueue._ParallelWorkQueue(6);
        return imageLoader.queue(function () {
            return new Promise(function (c, e) {
                Scheduler.schedule(function ImageLoader_async_loadImage(jobInfo) {
                    if (!image) {
                        image = _Global.document.createElement("img");
                    }

                    var seen = seenUrls[srcUrl];

                    if (!seen) {
                        jobInfo.setPromise(new Promise(function (imageLoadComplete) {
                            var tempImage = _Global.document.createElement("img");

                            var cleanup = function () {
                                tempImage.removeEventListener("load", loadComplete, false);
                                tempImage.removeEventListener("error", loadError, false);

                                // One time use blob images are cleaned up as soon as they are not referenced by images any longer.
                                // We set the image src before clearing the tempImage src to make sure the blob image is always
                                // referenced.
                                image.src = srcUrl;

                                var currentDate = new Date();
                                if (currentDate - lastSort > minDurationBetweenImageSort) {
                                    lastSort = currentDate;
                                    imageLoader.sort(compareImageLoadPriority);
                                }
                            };

                            var loadComplete = function () {
                                imageLoadComplete(jobComplete);
                            };
                            var loadError = function () {
                                imageLoadComplete(jobError);
                            };

                            var jobComplete = function () {
                                seenUrl(srcUrl);
                                cleanup();
                                c(image);
                            };
                            var jobError = function () {
                                cleanup();
                                e(image);
                            };

                            tempImage.addEventListener("load", loadComplete, false);
                            tempImage.addEventListener("error", loadError, false);
                            tempImage.src = srcUrl;
                        }));
                    } else {
                        seenUrl(srcUrl);
                        image.src = srcUrl;
                        c(image);
                    }
                }, Scheduler.Priority.normal, null, "WinJS.UI._ImageLoader._image" + imageId);
            });
        }, data);
    }

    function isImageCached(srcUrl) {
        return seenUrls[srcUrl];
    }

    function defaultRenderer() {
        return _Global.document.createElement("div");
    }

    // Public definitions

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _createItemsManager: _Base.Namespace._lazy(function () {
            var ListNotificationHandler = _Base.Class.define(function ListNotificationHandler_ctor(itemsManager) {
                // Constructor

                this._itemsManager = itemsManager;
            }, {
                // Public methods

                beginNotifications: function () {
                    this._itemsManager._versionManager.beginNotifications();
                    this._itemsManager._beginNotifications();
                },

                // itemAvailable: not implemented

                inserted: function (itemPromise, previousHandle, nextHandle) {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._inserted(itemPromise, previousHandle, nextHandle);
                },

                changed: function (newItem, oldItem) {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._changed(newItem, oldItem);
                },

                moved: function (itemPromise, previousHandle, nextHandle) {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._moved(itemPromise, previousHandle, nextHandle);
                },

                removed: function (handle, mirage) {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._removed(handle, mirage);
                },

                countChanged: function (newCount, oldCount) {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._countChanged(newCount, oldCount);
                },

                indexChanged: function (handle, newIndex, oldIndex) {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._indexChanged(handle, newIndex, oldIndex);
                },

                affectedRange: function (range) {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._affectedRange(range);
                },

                endNotifications: function () {
                    this._itemsManager._versionManager.endNotifications();
                    this._itemsManager._endNotifications();
                },

                reload: function () {
                    this._itemsManager._versionManager.receivedNotification();
                    this._itemsManager._reload();
                }
            }, { // Static Members
                supportedForProcessing: false,
            });

            var ItemsManager = _Base.Class.define(function ItemsManager_ctor(listDataSource, itemRenderer, elementNotificationHandler, options) {
                // Constructor

                if (!listDataSource) {
                    throw new _ErrorFromName("WinJS.UI.ItemsManager.ListDataSourceIsInvalid", strings.listDataSourceIsInvalid);
                }
                if (!itemRenderer) {
                    throw new _ErrorFromName("WinJS.UI.ItemsManager.ItemRendererIsInvalid", strings.itemRendererIsInvalid);
                }

                this.$pipeline_callbacksMap = {};

                this._listDataSource = listDataSource;

                this.dataSource = this._listDataSource;

                this._elementNotificationHandler = elementNotificationHandler;

                this._listBinding = this._listDataSource.createListBinding(new ListNotificationHandler(this));

                if (options) {
                    if (options.ownerElement) {
                        this._ownerElement = options.ownerElement;
                    }
                    this._profilerId = options.profilerId;
                    this._versionManager = options.versionManager || new _VersionManager._VersionManager();
                }

                this._indexInView = options && options.indexInView;
                this._itemRenderer = itemRenderer;
                this._viewCallsReady = options && options.viewCallsReady;

                // Map of (the uniqueIDs of) elements to records for items
                this._elementMap = {};

                // Map of handles to records for items
                this._handleMap = {};

                // Owner for use with jobs on the scheduler. Allows for easy cancellation of jobs during clean up.
                this._jobOwner = Scheduler.createOwnerToken();

                // Boolean to track whether endNotifications needs to be called on the ElementNotificationHandler
                this._notificationsSent = false;

                // Only enable the lastItem method if the data source implements the itemsFromEnd method
                if (this._listBinding.last) {
                    this.lastItem = function () {
                        return this._elementForItem(this._listBinding.last());
                    };
                }
            }, {
                _itemFromItemPromise: function (itemPromise) {
                    return this._waitForElement(this._elementForItem(itemPromise));
                },
                // If stage 0 is not yet complete, caller is responsible for transitioning the item from stage 0 to stage 1
                _itemFromItemPromiseThrottled: function (itemPromise) {
                    return this._waitForElement(this._elementForItem(itemPromise, true));
                },
                _itemAtIndex: function (index) {
                    var itemPromise = this._itemPromiseAtIndex(index);
                    this._itemFromItemPromise(itemPromise).then(null, function (e) {
                        itemPromise.cancel();
                        return Promise.wrapError(e);
                    });
                },
                _itemPromiseAtIndex: function (index) {
                    return this._listBinding.fromIndex(index);
                },
                _waitForElement: function (possiblePlaceholder) {
                    var that = this;
                    return new Promise(function (c) {
                        if (possiblePlaceholder) {
                            if (!that.isPlaceholder(possiblePlaceholder)) {
                                c(possiblePlaceholder);
                            } else {
                                var placeholderID = uniqueID(possiblePlaceholder);
                                var callbacks = that.$pipeline_callbacksMap[placeholderID];
                                if (!callbacks) {
                                    that.$pipeline_callbacksMap[placeholderID] = [c];
                                } else {
                                    callbacks.push(c);
                                }
                            }
                        } else {
                            c(possiblePlaceholder);
                        }
                    });
                },
                _updateElement: function (newElement, oldElement) {
                    var placeholderID = uniqueID(oldElement);
                    var callbacks = this.$pipeline_callbacksMap[placeholderID];
                    if (callbacks) {
                        delete this.$pipeline_callbacksMap[placeholderID];
                        callbacks.forEach(function (c) { c(newElement); });
                    }
                },
                _firstItem: function () {
                    return this._waitForElement(this._elementForItem(this._listBinding.first()));
                },
                _lastItem: function () {
                    return this._waitForElement(this._elementForItem(this._listBinding.last()));
                },
                _previousItem: function (element) {
                    this._listBinding.jumpToItem(this._itemFromElement(element));
                    return this._waitForElement(this._elementForItem(this._listBinding.previous()));
                },
                _nextItem: function (element) {
                    this._listBinding.jumpToItem(this._itemFromElement(element));
                    return this._waitForElement(this._elementForItem(this._listBinding.next()));
                },
                _itemFromPromise: function (itemPromise) {
                    return this._waitForElement(this._elementForItem(itemPromise));
                },
                isPlaceholder: function (item) {
                    return !!this._recordFromElement(item).elementIsPlaceholder;
                },

                itemObject: function (element) {
                    return this._itemFromElement(element);
                },

                release: function () {
                    this._listBinding.release();
                    this._elementNotificationHandler = null;
                    this._listBinding = null;
                    this._jobOwner.cancelAll();
                    this._released = true;
                },

                releaseItemPromise: function (itemPromise) {
                    var handle = itemPromise.handle;
                    var record = this._handleMap[handle];
                    if (!record) {
                        // The item promise is not in our handle map so we didn't even try to render it yet.
                        itemPromise.cancel();
                    } else {
                        this._releaseRecord(record);
                    }
                },

                releaseItem: function (element) {
                    var record = this._elementMap[uniqueID(element)];
                    this._releaseRecord(record);
                },

                _releaseRecord: function (record) {
                    if (!record) { return; }

                    if (record.renderPromise) {
                        record.renderPromise.cancel();
                    }
                    if (record.itemPromise) {
                        record.itemPromise.cancel();
                    }
                    if (record.imagePromises) {
                        record.imagePromises.forEach(function (promise) {
                            promise.cancel();
                        });
                    }
                    if (record.itemReadyPromise) {
                        record.itemReadyPromise.cancel();
                    }
                    if (record.renderComplete) {
                        record.renderComplete.cancel();
                    }

                    this._removeEntryFromElementMap(record.element);
                    this._removeEntryFromHandleMap(record.itemPromise.handle, record);

                    if (record.item) {
                        this._listBinding.releaseItem(record.item);
                    }

                },

                refresh: function () {
                    return this._listDataSource.invalidateAll();
                },

                // Private members

                _handlerToNotifyCaresAboutItemAvailable: function () {
                    return !!(this._elementNotificationHandler && this._elementNotificationHandler.itemAvailable);
                },

                _handlerToNotify: function () {
                    if (!this._notificationsSent) {
                        this._notificationsSent = true;

                        if (this._elementNotificationHandler && this._elementNotificationHandler.beginNotifications) {
                            this._elementNotificationHandler.beginNotifications();
                        }
                    }
                    return this._elementNotificationHandler;
                },

                _defineIndexProperty: function (itemForRenderer, item, record) {
                    record.indexObserved = false;
                    Object.defineProperty(itemForRenderer, "index", {
                        get: function () {
                            record.indexObserved = true;
                            return item.index;
                        }
                    });
                },

                _renderPlaceholder: function (record) {
                    var itemForRenderer = {};
                    var elementPlaceholder = defaultRenderer(itemForRenderer);
                    record.elementIsPlaceholder = true;
                    return elementPlaceholder;
                },

                _renderItem: function (itemPromise, record, callerThrottlesStage1) {
                    var that = this;
                    var indexInView = that._indexInView || function () { return true; };
                    var stage1Signal = new _Signal();
                    var readySignal = new _Signal();
                    var perfItemPromiseId = "_renderItem(" + record.item.index + "):itemPromise";

                    var stage0RunningSync = true;
                    var stage0Ran = false;
                    itemPromise.then(function (item) {
                        stage0Ran = true;
                        if (stage0RunningSync) {
                            stage1Signal.complete(item);
                        }
                    });
                    stage0RunningSync = false;

                    var itemForRendererPromise = stage1Signal.promise.then(function (item) {
                        if (item) {
                            var itemForRenderer = Object.create(item);
                            // Derive a new item and override its index property, to track whether it is read
                            that._defineIndexProperty(itemForRenderer, item, record);
                            itemForRenderer.ready = readySignal.promise;
                            itemForRenderer.isOnScreen = function () {
                                return Promise.wrap(indexInView(item.index));
                            };
                            itemForRenderer.loadImage = function (srcUrl, image) {
                                var loadImagePromise = loadImage(srcUrl, image, itemForRenderer);
                                if (record.imagePromises) {
                                    record.imagePromises.push(loadImagePromise);
                                } else {
                                    record.imagePromises = [loadImagePromise];
                                }
                                return loadImagePromise;
                            };
                            itemForRenderer.isImageCached = isImageCached;
                            return itemForRenderer;
                        } else {
                            return Promise.cancel;
                        }
                    });

                    function queueAsyncStage1() {
                        itemPromise.then(function (item) {
                            that._writeProfilerMark(perfItemPromiseId + ",StartTM");
                            stage1Signal.complete(item);
                            that._writeProfilerMark(perfItemPromiseId + ",StopTM");
                        });
                    }
                    if (!stage0Ran) {
                        if (callerThrottlesStage1) {
                            record.stage0 = itemPromise;
                            record.startStage1 = function () {
                                record.startStage1 = null;
                                queueAsyncStage1();
                            };
                        } else {
                            queueAsyncStage1();
                        }
                    }

                    itemForRendererPromise.handle = itemPromise.handle;
                    record.itemPromise = itemForRendererPromise;
                    record.itemReadyPromise = readySignal.promise;
                    record.readyComplete = false;

                    // perfRendererWorkId = stage 1 rendering (if itemPromise is async) or stage 1+2 (if itemPromise is sync and ran inline)
                    // perfItemPromiseId = stage 2 rendering only (should only be emitted if itemPromise was async)
                    // perfItemReadyId = stage 3 rendering
                    var perfRendererWorkId = "_renderItem(" + record.item.index + (stage0Ran ? "):syncItemPromise" : "):placeholder");
                    var perfItemReadyId = "_renderItem(" + record.item.index + "):itemReady";

                    this._writeProfilerMark(perfRendererWorkId + ",StartTM");
                    var rendererPromise = Promise.as(that._itemRenderer(itemForRendererPromise, record.element)).
                        then(exports._normalizeRendererReturn).
                        then(function (v) {
                            if (that._released) {
                                return Promise.cancel;
                            }

                            itemForRendererPromise.then(function (item) {
                                // Store pending ready callback off record so ScrollView can call it during realizePage. Otherwise
                                // call it ourselves.
                                record.pendingReady = function () {
                                    if (record.pendingReady) {
                                        record.pendingReady = null;
                                        record.readyComplete = true;
                                        that._writeProfilerMark(perfItemReadyId + ",StartTM");
                                        readySignal.complete(item);
                                        that._writeProfilerMark(perfItemReadyId + ",StopTM");
                                    }
                                };
                                if (!that._viewCallsReady) {
                                    var job = Scheduler.schedule(record.pendingReady, Scheduler.Priority.normal,
                                        record, "WinJS.UI._ItemsManager._pendingReady");
                                    job.owner = that._jobOwner;
                                }
                            });
                            return v;
                        });

                    this._writeProfilerMark(perfRendererWorkId + ",StopTM");
                    return rendererPromise;
                },

                _replaceElement: function (record, elementNew) {
                    this._removeEntryFromElementMap(record.element);
                    record.element = elementNew;
                    this._addEntryToElementMap(elementNew, record);
                },

                _changeElement: function (record, elementNew, elementNewIsPlaceholder) {
                    record.renderPromise = null;
                    var elementOld = record.element,
                        itemOld = record.item;

                    if (record.newItem) {
                        record.item = record.newItem;
                        record.newItem = null;
                    }

                    this._replaceElement(record, elementNew);

                    if (record.item && record.elementIsPlaceholder && !elementNewIsPlaceholder) {
                        record.elementDelayed = null;
                        record.elementIsPlaceholder = false;
                        this._updateElement(record.element, elementOld);
                        if (this._handlerToNotifyCaresAboutItemAvailable()) {
                            this._handlerToNotify().itemAvailable(record.element, elementOld);
                        }
                    } else {
                        this._handlerToNotify().changed(elementNew, elementOld, itemOld);
                    }
                },

                _elementForItem: function (itemPromise, callerThrottlesStage1) {
                    var handle = itemPromise.handle,
                        record = this._recordFromHandle(handle, true),
                        element;

                    if (!handle) {
                        return null;
                    }

                    if (record) {
                        element = record.element;
                    } else {
                        // Create a new record for this item
                        record = {
                            item: itemPromise,
                            itemPromise: itemPromise
                        };
                        this._addEntryToHandleMap(handle, record);

                        var that = this;
                        var mirage = false;
                        var synchronous = false;

                        var renderPromise =
                            that._renderItem(itemPromise, record, callerThrottlesStage1).
                            then(function (v) {
                                var elementNew = v.element;
                                record.renderComplete = v.renderComplete;

                                itemPromise.then(function (item) {
                                    record.item = item;
                                    if (!item) {
                                        mirage = true;
                                        element = null;
                                    }
                                });

                                synchronous = true;
                                record.renderPromise = null;

                                if (elementNew) {
                                    if (element) {
                                        that._presentElements(record, elementNew);
                                    } else {
                                        element = elementNew;
                                    }
                                }
                            });

                        if (!mirage) {
                            if (!synchronous) {
                                record.renderPromise = renderPromise;
                            }

                            if (!element) {
                                element = this._renderPlaceholder(record);
                            }

                            record.element = element;
                            this._addEntryToElementMap(element, record);

                            itemPromise.retain();
                        }
                    }

                    return element;
                },

                _addEntryToElementMap: function (element, record) {
                    this._elementMap[uniqueID(element)] = record;
                },

                _removeEntryFromElementMap: function (element) {
                    delete this._elementMap[uniqueID(element)];
                },

                _recordFromElement: function (element) {
                    var record = this._elementMap[uniqueID(element)];
                    if (!record) {
                        this._writeProfilerMark("_recordFromElement:ItemIsInvalidError,info");
                        throw new _ErrorFromName("WinJS.UI.ItemsManager.ItemIsInvalid", strings.itemIsInvalid);
                    }

                    return record;
                },

                _addEntryToHandleMap: function (handle, record) {
                    this._handleMap[handle] = record;
                },

                _removeEntryFromHandleMap: function (handle) {
                    delete this._handleMap[handle];
                },

                _handleInHandleMap: function (handle) {
                    return !!this._handleMap[handle];
                },

                _recordFromHandle: function (handle, ignoreFailure) {
                    var record = this._handleMap[handle];
                    if (!record && !ignoreFailure) {
                        throw new _ErrorFromName("WinJS.UI.ItemsManager.ItemIsInvalid", strings.itemIsInvalid);
                    }
                    return record;
                },

                _foreachRecord: function (callback) {
                    var records = this._handleMap;
                    for (var property in records) {
                        var record = records[property];
                        callback(record);
                    }
                },

                _itemFromElement: function (element) {
                    return this._recordFromElement(element).item;
                },

                _elementFromHandle: function (handle) {
                    if (handle) {
                        var record = this._recordFromHandle(handle, true);

                        if (record && record.element) {
                            return record.element;
                        }
                    }

                    return null;
                },

                _inserted: function (itemPromise, previousHandle, nextHandle) {
                    this._handlerToNotify().inserted(itemPromise, previousHandle, nextHandle);
                },

                _changed: function (newItem, oldItem) {
                    if (!this._handleInHandleMap(oldItem.handle)) { return; }

                    var record = this._recordFromHandle(oldItem.handle);

                    if (record.renderPromise) {
                        record.renderPromise.cancel();
                    }
                    if (record.itemPromise) {
                        record.itemPromise.cancel();
                    }
                    if (record.imagePromises) {
                        record.imagePromises.forEach(function (promise) {
                            promise.cancel();
                        });
                    }
                    if (record.itemReadyPromise) {
                        record.itemReadyPromise.cancel();
                    }
                    if (record.renderComplete) {
                        record.renderComplete.cancel();
                    }

                    record.newItem = newItem;

                    var that = this;
                    var newItemPromise = Promise.as(newItem);
                    newItemPromise.handle = record.itemPromise.handle;
                    record.renderPromise = this._renderItem(newItemPromise, record).
                        then(function (v) {
                            record.renderComplete = v.renderComplete;
                            that._changeElement(record, v.element, false);
                            that._presentElements(record);
                        });
                },

                _moved: function (itemPromise, previousHandle, nextHandle) {
                    // no check for haveHandle, as we get move notification for items we
                    // are "next" to, so we handle the "null element" cases below
                    //
                    var element = this._elementFromHandle(itemPromise.handle);
                    var previous = this._elementFromHandle(previousHandle);
                    var next = this._elementFromHandle(nextHandle);

                    this._handlerToNotify().moved(element, previous, next, itemPromise);
                    this._presentAllElements();
                },

                _removed: function (handle, mirage) {
                    if (this._handleInHandleMap(handle)) {
                        var element = this._elementFromHandle(handle);

                        this._handlerToNotify().removed(element, mirage, handle);
                        this.releaseItem(element);
                        this._presentAllElements();
                    } else {
                        this._handlerToNotify().removed(null, mirage, handle);
                    }
                },

                _countChanged: function (newCount, oldCount) {
                    if (this._elementNotificationHandler && this._elementNotificationHandler.countChanged) {
                        this._handlerToNotify().countChanged(newCount, oldCount);
                    }
                },

                _indexChanged: function (handle, newIndex, oldIndex) {
                    var element;
                    if (this._handleInHandleMap(handle)) {
                        var record = this._recordFromHandle(handle);
                        if (record.indexObserved) {
                            if (!record.elementIsPlaceholder) {
                                if (record.item.index !== newIndex) {
                                    if (record.renderPromise) {
                                        record.renderPromise.cancel();
                                    }
                                    if (record.renderComplete) {
                                        record.renderComplete.cancel();
                                    }

                                    var itemToRender = record.newItem || record.item;
                                    itemToRender.index = newIndex;

                                    var newItemPromise = Promise.as(itemToRender);
                                    newItemPromise.handle = record.itemPromise.handle;

                                    var that = this;
                                    record.renderPromise = this._renderItem(newItemPromise, record).
                                        then(function (v) {
                                            record.renderComplete = v.renderComplete;
                                            that._changeElement(record, v.element, false);
                                            that._presentElements(record);
                                        });
                                }
                            } else {
                                this._changeElement(record, this._renderPlaceholder(record), true);
                            }
                        }
                        element = record.element;
                    }
                    if (this._elementNotificationHandler && this._elementNotificationHandler.indexChanged) {
                        this._handlerToNotify().indexChanged(element, newIndex, oldIndex);
                    }
                },

                _affectedRange: function (range) {
                    if (this._elementNotificationHandler && this._elementNotificationHandler.updateAffectedRange) {
                        this._handlerToNotify().updateAffectedRange(range);
                    }
                },

                _beginNotifications: function () {
                    // accessing _handlerToNotify will force the call to beginNotifications on the client
                    //
                    this._externalBegin = true;
                    this._handlerToNotify();
                },
                _endNotifications: function () {
                    if (this._notificationsSent) {
                        this._notificationsSent = false;
                        this._externalBegin = false;

                        if (this._elementNotificationHandler && this._elementNotificationHandler.endNotifications) {
                            this._elementNotificationHandler.endNotifications();
                        }
                    }
                },

                _reload: function () {
                    if (this._elementNotificationHandler && this._elementNotificationHandler.reload) {
                        this._elementNotificationHandler.reload();
                    }
                },

                // Some functions may be called synchronously or asynchronously, so it's best to post _endNotifications to avoid
                // calling it prematurely.
                _postEndNotifications: function () {
                    if (this._notificationsSent && !this._externalBegin && !this._endNotificationsPosted) {
                        this._endNotificationsPosted = true;
                        var that = this;
                        Scheduler.schedule(function ItemsManager_async_endNotifications() {
                            that._endNotificationsPosted = false;
                            that._endNotifications();
                        }, Scheduler.Priority.high, null, "WinJS.UI._ItemsManager._postEndNotifications");
                    }
                },

                _presentElement: function (record) {
                    var elementOld = record.element;
                    // Finish modifying the slot before calling back into user code, in case there is a reentrant call
                    this._replaceElement(record, record.elementDelayed);
                    record.elementDelayed = null;

                    record.elementIsPlaceholder = false;
                    this._updateElement(record.element, elementOld);
                    if (this._handlerToNotifyCaresAboutItemAvailable()) {
                        this._handlerToNotify().itemAvailable(record.element, elementOld);
                    }
                },

                _presentElements: function (record, elementDelayed) {
                    if (elementDelayed) {
                        record.elementDelayed = elementDelayed;
                    }

                    this._listBinding.jumpToItem(record.item);
                    if (record.elementDelayed) {
                        this._presentElement(record);
                    }

                    this._postEndNotifications();
                },

                // Presents all delayed elements
                _presentAllElements: function () {
                    var that = this;
                    this._foreachRecord(function (record) {
                        if (record.elementDelayed) {
                            that._presentElement(record);
                        }
                    });
                },

                _writeProfilerMark: function (text) {
                    var message = "WinJS.UI._ItemsManager:" + (this._profilerId ? (this._profilerId + ":") : ":") + text;
                    _WriteProfilerMark(message);
                }
            }, { // Static Members
                supportedForProcessing: false,
            });

            return function (dataSource, itemRenderer, elementNotificationHandler, options) {
                return new ItemsManager(dataSource, itemRenderer, elementNotificationHandler, options);
            };
        })
    });

});


// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_TabContainer',[
    'exports',
    '../Core/_Global',
    '../Core/_Base',
    '../Core/_BaseUtils',
    './_ElementUtilities'
    ], function tabManagerInit(exports, _Global, _Base, _BaseUtils, _ElementUtilities) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    function fireEvent(element, name, forward, cancelable) {
        var event = _Global.document.createEvent('UIEvent');
        event.initUIEvent(name, false, !!cancelable, _Global, forward ? 1 : 0);
        return !element.dispatchEvent(event);
    }

    var getTabIndex = _ElementUtilities.getTabIndex;

    // tabbableElementsNodeFilter works with the TreeWalker to create a view of the DOM tree that is built up of what we want the focusable tree to look like.
    // When it runs into a tab contained area, it rejects anything except the childFocus element so that any potentially tabbable things that the TabContainer
    // doesn't want tabbed to get ignored.
    function tabbableElementsNodeFilter(node) {
        var nodeStyle = _Global.getComputedStyle(node);
        if (nodeStyle.display === "none" || nodeStyle.visibility === "hidden") {
            return _Global.NodeFilter.FILTER_REJECT;
        }
        if (node._tabContainer) {
            return _Global.NodeFilter.FILTER_ACCEPT;
        }
        if (node.parentNode && node.parentNode._tabContainer) {
            var managedTarget = node.parentNode._tabContainer.childFocus;
            // Ignore subtrees that are under a tab manager but not the child focus. If a node is contained in the child focus, either accept it (if it's tabbable itself), or skip it and find tabbable content inside of it.
            if (managedTarget && node.contains(managedTarget)) {
                return (getTabIndex(node) >= 0 ? _Global.NodeFilter.FILTER_ACCEPT : _Global.NodeFilter.FILTER_SKIP);
            }
            return _Global.NodeFilter.FILTER_REJECT;
        }
        var tabIndex = getTabIndex(node);
        if (tabIndex >= 0) {
            return _Global.NodeFilter.FILTER_ACCEPT;
        }
        return _Global.NodeFilter.FILTER_SKIP;
    }

    // We've got to manually scrape the results the walker generated, since the walker will have generated a fairly good representation of the tabbable tree, but
    // won't have a perfect image. Trees like this cause a problem for the walker:
    //     [ tabContainer element ]
    //   [ element containing childFocus ]
    //  [ childFocus ] [ sibling of child focus that has tabIndex >= 0 ]
    // We can't tell the tree walker to jump right to the childFocus, so it'll collect the childFocus but also that sibling element. We don't want that sibling element
    // to appear in our version of the tabOrder, so scrapeTabManagedSubtree will take the pretty accurate representation we get from the TreeWalker, and do a little
    // more pruning to give us only the nodes we're interested in.
    function scrapeTabManagedSubtree(walker) {
        var tabManagedElement = walker.currentNode,
            childFocus = tabManagedElement._tabContainer.childFocus,
            elementsFound = [];

        if (!childFocus) {
            return [];
        }

        walker.currentNode = childFocus;
        function scrapeSubtree() {
            if (walker.currentNode._tabContainer) {
                elementsFound = elementsFound.concat(scrapeTabManagedSubtree(walker));
            } else {
                // A child focus can have tabIndex = -1, so check the tabIndex before marking it as valid
                if (getTabIndex(walker.currentNode) >= 0) {
                    elementsFound.push(walker.currentNode);
                }
                if (walker.firstChild()) {
                    do {
                        scrapeSubtree();
                    } while (walker.nextSibling());
                    walker.parentNode();
                }
            }
        }
        scrapeSubtree();
        walker.currentNode = tabManagedElement;

        return elementsFound;
    }

    function TabHelperObject(element, tabIndex) {
        function createCatcher() {
            var fragment = _Global.document.createElement("DIV");
            fragment.tabIndex = (tabIndex ? tabIndex : 0);
            fragment.setAttribute("aria-hidden", true);
            return fragment;
        }

        var parent = element.parentNode;

        // Insert prefix focus catcher
        var catcherBegin = createCatcher();
        parent.insertBefore(catcherBegin, element);

        // Insert postfix focus catcher
        var catcherEnd = createCatcher();
        parent.insertBefore(catcherEnd, element.nextSibling);

        catcherBegin.addEventListener("focus", function () {
            fireEvent(element, "onTabEnter", true);
        }, true);
        catcherEnd.addEventListener("focus", function () {
            fireEvent(element, "onTabEnter", false);
        }, true);

        this._catcherBegin = catcherBegin;
        this._catcherEnd = catcherEnd;
        var refCount = 1;
        this.addRef = function () {
            refCount++;
        };
        this.release = function () {
            if (--refCount === 0) {
                if (catcherBegin.parentElement) {
                    parent.removeChild(catcherBegin);
                }
                if (catcherEnd.parentElement) {
                    parent.removeChild(catcherEnd);
                }
            }
            return refCount;
        };
        this.updateTabIndex = function (tabIndex) {
            catcherBegin.tabIndex = tabIndex;
            catcherEnd.tabIndex = tabIndex;
        };
    }

    var TrackTabBehavior = {
        attach: function (element, tabIndex) {
            ///
            if (!element["win-trackTabHelperObject"]) {
                element["win-trackTabHelperObject"] = new TabHelperObject(element, tabIndex);
            } else {
                element["win-trackTabHelperObject"].addRef();
            }

            return element["win-trackTabHelperObject"];
        },

        detach: function (element) {
            ///
            if (!element["win-trackTabHelperObject"].release()) {
                delete element["win-trackTabHelperObject"];
            }
        }
    };

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        TrackTabBehavior: TrackTabBehavior,
        TabContainer: _Base.Class.define(function TabContainer_ctor(element) {
            /// <signature helpKeyword="WinJS.UI.TabContainer.TabContainer">
            /// <summary locid="WinJS.UI.TabContainer.constructor">
            /// Constructs the TabContainer.
            /// </summary>
            /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.UI.TabContainer.constructor_p:element">
            /// The DOM element to be associated with the TabContainer.
            /// </param>
            /// <param name="options" type="Object" locid="WinJS.UI.TabContainer.constructor_p:options">
            /// The set of options to be applied initially to the TabContainer.
            /// </param>
            /// <returns type="WinJS.UI.TabContainer" locid="WinJS.UI.TabContainer.constructor_returnValue">
            /// A constructed TabContainer.
            /// </returns>
            /// </signature>
            this._element = element;
            this._tabIndex = 0;
            element._tabContainer = this;
            if (element.getAttribute("tabindex") === null) {
                element.tabIndex = -1;
            }
            var that = this;

            element.addEventListener("onTabEnter", function (e) {
                var skipDefaultBehavior = fireEvent(that._element, "onTabEntered", e.detail, true);
                if (skipDefaultBehavior) {
                    return;
                }

                if (that.childFocus) {
                    that.childFocus.focus();
                } else {
                    element.focus();
                }
            });
            element.addEventListener("keydown", function (e) {
                var targetElement = e.target;
                if (e.keyCode === _ElementUtilities.Key.tab) {
                    var forwardTab = !e.shiftKey;
                    var canKeepTabbing = that._hasMoreElementsInTabOrder(targetElement, forwardTab);
                    if (!canKeepTabbing) {
                        var skipTabExitHandling = fireEvent(that._element, "onTabExiting", forwardTab, true);
                        if (skipTabExitHandling) {
                            e.stopPropagation();
                            e.preventDefault();
                            return;
                        }
                        var allTabbableElements = that._element.querySelectorAll("a[href],area[href],button,command,input,link,menuitem,object,select,textarea,th[sorted],[tabindex]"),
                            len = allTabbableElements.length,
                            originalTabIndices = [];

                        for (var i = 0; i < len; i++) {
                            var element = allTabbableElements[i];
                            originalTabIndices.push(element.tabIndex);
                            element.tabIndex = -1;
                        }
                        // If there's nothing else that can be tabbed to on the page, tab should wrap around back to the tab contained area.
                        // We'll disable the sentinel node that's directly in the path of the tab order (catcherEnd for forward tabs, and
                        // catcherBegin for shift+tabs), but leave the other sentinel node untouched so tab can wrap around back into the region.
                        that._elementTabHelper[forwardTab ? "_catcherEnd" : "_catcherBegin"].tabIndex = -1;

                        var restoreTabIndicesOnBlur = function () {
                            targetElement.removeEventListener("blur", restoreTabIndicesOnBlur, false);
                            for (var i = 0; i < len; i++) {
                                if (originalTabIndices[i] !== -1) {
                                    // When the original tabIndex was -1, don't try restoring to -1 again. A nested TabContainer might also be in the middle of handling this same code,
                                    // and so would have set tabIndex = -1 on this element. The nested tab container will restore the element's tabIndex properly.
                                    allTabbableElements[i].tabIndex = originalTabIndices[i];
                                }
                            }
                            that._elementTabHelper._catcherBegin.tabIndex = that._tabIndex;
                            that._elementTabHelper._catcherEnd.tabIndex = that._tabIndex;
                        };
                        targetElement.addEventListener("blur", restoreTabIndicesOnBlur, false);
                        _BaseUtils._yieldForEvents(function () {
                            fireEvent(that._element, "onTabExit", forwardTab);
                        });
                    }
                }
            });

            this._elementTabHelper = TrackTabBehavior.attach(element, this._tabIndex);
            this._elementTabHelper._catcherBegin.tabIndex = 0;
            this._elementTabHelper._catcherEnd.tabIndex = 0;
        }, {

            // Public members

            /// <signature helpKeyword="WinJS.UI.TabContainer.dispose">
            /// <summary locid="WinJS.UI.TabContainer.dispose">
            /// Disposes the Tab Container.
            /// </summary>
            /// </signature>
            dispose: function () {
                TrackTabBehavior.detach(this._element, this._tabIndex);
            },

            /// <field type="HTMLElement" domElement="true" locid="WinJS.UI.TabContainer.childFocus" helpKeyword="WinJS.UI.TabContainer.childFocus">
            /// Gets or sets the child element that has focus.
            /// </field>
            childFocus: {
                set: function (e) {
                    if (e !== this._focusElement) {
                        if (e && e.parentNode) {
                            this._focusElement = e;
                        } else {
                            this._focusElement = null;
                        }
                    }
                },
                get: function () {
                    return this._focusElement;
                }
            },

            /// <field type="Number" integer="true" locid="WinJS.UI.TabContainer.tabIndex" helpKeyword="WinJS.UI.TabContainer.tabIndex">
            /// Gets or sets the tab order of the control within its container.
            /// </field>
            tabIndex: {
                set: function (tabIndex) {
                    this._tabIndex = tabIndex;
                    this._elementTabHelper.updateTabIndex(tabIndex);
                },

                get: function () {
                    return this._tabIndex;
                }
            },

            // Private members

            _element: null,
            _skipper: function (e) {
                e.stopPropagation();
                e.preventDefault();
            },
            _hasMoreElementsInTabOrder: function (currentFocus, movingForwards) {
                if (!this.childFocus) {
                    return false;
                }
                var walker = _Global.document.createTreeWalker(this._element, _Global.NodeFilter.SHOW_ELEMENT, tabbableElementsNodeFilter, false);
                var tabStops = scrapeTabManagedSubtree(walker);
                for (var i = 0; i < tabStops.length; i++) {
                    if (tabStops[i] === currentFocus) {
                        return (movingForwards ? (i < tabStops.length - 1) : (i > 0));
                    }
                }
                return false;
            },
            _focusElement: null

        }, { // Static Members
            supportedForProcessing: false,
        })
    });

});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_KeyboardBehavior',[
    'exports',
    '../Core/_Global',
    '../Core/_Base',
    './_Control',
    './_ElementUtilities',
    './_TabContainer'
    ], function KeyboardBehaviorInit(exports, _Global, _Base, _Control, _ElementUtilities, _TabContainer) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    var _keyboardSeenLast = false;

    _ElementUtilities._addEventListener(_Global, "pointerdown", function () {
        if (_keyboardSeenLast) {
            _keyboardSeenLast = false;
        }
    }, true);

    _Global.addEventListener("keydown", function () {
        if (!_keyboardSeenLast) {
            _keyboardSeenLast = true;
        }
    }, true);

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _keyboardSeenLast : {
            get: function _keyboardSeenLast_get() {
                return _keyboardSeenLast;
            },
            set: function _keyboardSeenLast_set(value) {
                _keyboardSeenLast = value;
            }
        },
        _WinKeyboard: function (element) {
            // Win Keyboard behavior is a solution that would be similar to -ms-keyboard-focus.
            // It monitors the last input (keyboard/mouse) and adds/removes a win-keyboard class
            // so that you can style .foo.win-keyboard:focus vs .foo:focus to add a keyboard rect
            // on an item only when the last input method was keyboard.
            // Reminder: Touch edgy does not count as an input method.
            _ElementUtilities._addEventListener(element, "pointerdown", function (ev) {
                // In case pointer down came on the active element.
                _ElementUtilities.removeClass(ev.target, "win-keyboard");
            }, true);
            element.addEventListener("keydown", function (ev) {
                _ElementUtilities.addClass(ev.target, "win-keyboard");
            }, true);
            _ElementUtilities._addEventListener(element, "focusin", function (ev) {
                exports._keyboardSeenLast && _ElementUtilities.addClass(ev.target, "win-keyboard");
            }, false);
            _ElementUtilities._addEventListener(element, "focusout", function (ev) {
                _ElementUtilities.removeClass(ev.target, "win-keyboard");
            }, false);
        },
        _KeyboardBehavior: _Base.Namespace._lazy(function () {
            var Key = _ElementUtilities.Key;

            var _KeyboardBehavior = _Base.Class.define(function KeyboardBehavior_ctor(element, options) {
                // KeyboardBehavior allows you to easily convert a bunch of tabable elements into a single tab stop with
                // navigation replaced by keyboard arrow (Up/Down/Left/Right) + Home + End + Custom keys.
                //
                // Example use cases:
                //
                // 1 Dimensional list: FixedDirection = height and FixedSize = 1;
                // [1] [ 2 ] [  3  ] [4] [  5  ]...
                //
                // 2 Dimensional list: FixedDirection = height and FixedSize = 2;
                // [1] [3] [5] [7] ...
                // [2] [4] [6] [8]
                //
                // 1 Dimensional list: FixedDirection = width and FixedSize = 1;
                // [ 1 ]
                // -   -
                // |   |
                // | 2 |
                // |   |
                // -   -
                // [ 3 ]
                // [ 4 ]
                //  ...
                //
                // 2 Dimensional list: FixedDirection = width and FixedSize = 2;
                // [1][2]
                // [3][4]
                // [5][6]
                // ...
                //
                // Currently it is a "behavior" instead of a "control" so it can be attached to the same element as a
                // winControl. The main scenario for this would be to attach it to the same element as a repeater.
                //
                // It also blocks "Portaling" where you go off the end of one column and wrap around to the other
                // column. It also blocks "Carousel" where you go from the end of the list to the beginning.
                //
                // Keyboarding behavior supports nesting. It supports your tab stops having sub tab stops. If you want
                // an interactive element within the tab stop you need to use the win-interactive classname or during the
                // keydown event stop propogation so that the event is skipped.
                //
                // If you have custom keyboarding the getAdjacent API is provided. This can be used to enable keyboarding
                // in multisize 2d lists or custom keyboard commands. PageDown and PageUp are the most common since this
                // behavior does not detect scrollers.
                //
                // It also allows developers to show/hide keyboard focus rectangles themselves.
                //
                // It has an API called currentIndex so that Tab (or Shift+Tab) or a developer imitating Tab will result in
                // the correct item having focus.
                //
                // It also allows an element to be represented as 2 arrow stops (commonly used for a split button) by calling
                // the _getFocusInto API on the child element's winControl if it exists.

                element = element || _Global.document.createElement("DIV");
                options = options || {};

                element._keyboardBehavior = this;
                this._element = element;

                this._fixedDirection = _KeyboardBehavior.FixedDirection.width;
                this._fixedSize = 1;
                this._currentIndex = 0;

                _Control.setOptions(this, options);

                // If there's a scroller, the TabContainer can't be inside of the scroller. Otherwise, tabbing into the
                // TabContainer will cause the scroller to scroll.
                this._tabContainer = new _TabContainer.TabContainer(this.scroller || this._element);
                this._tabContainer.tabIndex = 0;
                if (this._element.children.length > 0) {
                    this._tabContainer.childFocus = this._getFocusInto(this._element.children[0]);
                }

                this._element.addEventListener('keydown', this._keyDownHandler.bind(this));
                _ElementUtilities._addEventListener(this._element, 'pointerdown', this._MSPointerDownHandler.bind(this));
            }, {
                element: {
                    get: function () {
                        return this._element;
                    }
                },

                fixedDirection: {
                    get: function () {
                        return this._fixedDirection;
                    },
                    set: function (value) {
                        this._fixedDirection = value;
                    }
                },

                fixedSize: {
                    get: function () {
                        return this._fixedSize;
                    },
                    set: function (value) {
                        if (+value === value) {
                            value = Math.max(1, value);
                            this._fixedSize = value;
                        }
                    }
                },

                currentIndex: {
                    get: function () {
                        if (this._element.children.length > 0) {
                            return this._currentIndex;
                        }
                        return -1;
                    },
                    set: function (value) {
                        if (+value === value) {
                            var length = this._element.children.length;
                            value = Math.max(0, Math.min(length - 1, value));
                            this._currentIndex = value;
                            this._tabContainer.childFocus = this._getFocusInto(this._element.children[value]);
                        }
                    }
                },

                getAdjacent: {
                    get: function () {
                        return this._getAdjacent;
                    },
                    set: function (value) {
                        this._getAdjacent = value;
                    }
                },

                // If set, KeyboardBehavior will prevent *scroller* from scrolling when moving focus
                scroller: {
                    get: function () {
                        return this._scroller;
                    },
                    set: function (value) {
                        this._scroller = value;
                    }
                },

                _keyDownHandler: function _KeyboardBehavior_keyDownHandler(ev) {
                    if (!ev.altKey) {
                        if (_ElementUtilities._matchesSelector(ev.target, ".win-interactive, .win-interactive *")) {
                            return;
                        }
                        var blockScrolling = false;

                        var newIndex = this.currentIndex;
                        var maxIndex = this._element.children.length - 1;

                        var rtl = _Global.getComputedStyle(this._element).direction === "rtl";
                        var leftStr = rtl ? Key.rightArrow : Key.leftArrow;
                        var rightStr = rtl ? Key.leftArrow : Key.rightArrow;

                        var targetIndex = this.getAdjacent && this.getAdjacent(newIndex, ev.keyCode);
                        if (+targetIndex === targetIndex) {
                            blockScrolling = true;
                            newIndex = targetIndex;
                        } else {
                            var modFixedSize = newIndex % this.fixedSize;

                            if (ev.keyCode === leftStr) {
                                blockScrolling = true;
                                if (this.fixedDirection === _KeyboardBehavior.FixedDirection.width) {
                                    if (modFixedSize !== 0) {
                                        newIndex--;
                                    }
                                } else {
                                    if (newIndex >= this.fixedSize) {
                                        newIndex -= this.fixedSize;
                                    }
                                }
                            } else if (ev.keyCode === rightStr) {
                                blockScrolling = true;
                                if (this.fixedDirection === _KeyboardBehavior.FixedDirection.width) {
                                    if (modFixedSize !== this.fixedSize - 1) {
                                        newIndex++;
                                    }
                                } else {
                                    if (newIndex + this.fixedSize - modFixedSize <= maxIndex) {
                                        newIndex += this.fixedSize;
                                    }
                                }
                            } else if (ev.keyCode === Key.upArrow) {
                                blockScrolling = true;
                                if (this.fixedDirection === _KeyboardBehavior.FixedDirection.height) {
                                    if (modFixedSize !== 0) {
                                        newIndex--;
                                    }
                                } else {
                                    if (newIndex >= this.fixedSize) {
                                        newIndex -= this.fixedSize;
                                    }
                                }
                            } else if (ev.keyCode === Key.downArrow) {
                                blockScrolling = true;
                                if (this.fixedDirection === _KeyboardBehavior.FixedDirection.height) {
                                    if (modFixedSize !== this.fixedSize - 1) {
                                        newIndex++;
                                    }
                                } else {
                                    if (newIndex + this.fixedSize - modFixedSize <= maxIndex) {
                                        newIndex += this.fixedSize;
                                    }
                                }
                            } else if (ev.keyCode === Key.home) {
                                blockScrolling = true;
                                newIndex = 0;
                            } else if (ev.keyCode === Key.end) {
                                blockScrolling = true;
                                newIndex = this._element.children.length - 1;
                            } else if (ev.keyCode === Key.pageUp) {
                                blockScrolling = true;
                            } else if (ev.keyCode === Key.pageDown) {
                                blockScrolling = true;
                            }
                        }

                        newIndex = Math.max(0, Math.min(this._element.children.length - 1, newIndex));

                        if (newIndex !== this.currentIndex) {
                            this._focus(newIndex, ev.keyCode);

                            // Allow KeyboardBehavior to be nested
                            if (ev.keyCode === leftStr || ev.keyCode === rightStr || ev.keyCode === Key.upArrow || ev.keyCode === Key.downArrow) {
                                ev.stopPropagation();
                            }
                        }

                        if (blockScrolling) {
                            ev.preventDefault();
                        }
                    }
                },

                _getFocusInto: function _KeyboardBehavior_getFocusInto(elementToFocus, keyCode) {
                    return elementToFocus && elementToFocus.winControl && elementToFocus.winControl._getFocusInto ?
                        elementToFocus.winControl._getFocusInto(keyCode) :
                        elementToFocus;
                },

                _focus: function _KeyboardBehavior_focus(index, keyCode) {
                    index = (+index === index) ? index : this.currentIndex;

                    var elementToFocus = this._element.children[index];
                    if (elementToFocus) {
                        elementToFocus = this._getFocusInto(elementToFocus, keyCode);

                        this.currentIndex = index;

                        _ElementUtilities._setActive(elementToFocus, this.scroller);
                    }
                },

                _MSPointerDownHandler: function _KeyboardBehavior_MSPointerDownHandler(ev) {
                    var srcElement = ev.target;
                    if (srcElement === this.element) {
                        return;
                    }

                    while (srcElement.parentNode !== this.element) {
                        srcElement = srcElement.parentNode;
                    }

                    var index = -1;
                    while (srcElement) {
                        index++;
                        srcElement = srcElement.previousElementSibling;
                    }

                    this.currentIndex = index;
                }
            }, {
                FixedDirection: {
                    height: "height",
                    width: "width"
                }
            });

            return _KeyboardBehavior;
        })
    });

});
// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_SafeHtml',[
    'exports',
    '../Core/_Global',
    '../Core/_Base',
    '../Core/_ErrorFromName',
    '../Core/_Resources'
    ], function safeHTMLInit(exports, _Global, _Base, _ErrorFromName, _Resources) {
    "use strict";


    var setInnerHTML,
        setInnerHTMLUnsafe,
        setOuterHTML,
        setOuterHTMLUnsafe,
        insertAdjacentHTML,
        insertAdjacentHTMLUnsafe;

    var strings = {
        get nonStaticHTML() { return "Unable to add dynamic content. A script attempted to inject dynamic content, or elements previously modified dynamically, that might be unsafe. For example, using the innerHTML property or the document.write method to add a script element will generate this exception. If the content is safe and from a trusted source, use a method to explicitly manipulate elements and attributes, such as createElement, or use setInnerHTMLUnsafe (or other unsafe method)."; },
    };

    setInnerHTML = setInnerHTMLUnsafe = function (element, text) {
        /// <signature helpKeyword="WinJS.Utilities.setInnerHTML">
        /// <summary locid="WinJS.Utilities.setInnerHTML">
        /// Sets the innerHTML property of the specified element to the specified text.
        /// </summary>
        /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.setInnerHTML_p:element">
        /// The element on which the innerHTML property is to be set.
        /// </param>
        /// <param name="text" type="String" locid="WinJS.Utilities.setInnerHTML_p:text">
        /// The value to be set to the innerHTML property.
        /// </param>
        /// </signature>
        element.innerHTML = text;
    };
    setOuterHTML = setOuterHTMLUnsafe = function (element, text) {
        /// <signature helpKeyword="WinJS.Utilities.setOuterHTML">
        /// <summary locid="WinJS.Utilities.setOuterHTML">
        /// Sets the outerHTML property of the specified element to the specified text.
        /// </summary>
        /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.setOuterHTML_p:element">
        /// The element on which the outerHTML property is to be set.
        /// </param>
        /// <param name="text" type="String" locid="WinJS.Utilities.setOuterHTML_p:text">
        /// The value to be set to the outerHTML property.
        /// </param>
        /// </signature>
        element.outerHTML = text;
    };
    insertAdjacentHTML = insertAdjacentHTMLUnsafe = function (element, position, text) {
        /// <signature helpKeyword="WinJS.Utilities.insertAdjacentHTML">
        /// <summary locid="WinJS.Utilities.insertAdjacentHTML">
        /// Calls insertAdjacentHTML on the specified element.
        /// </summary>
        /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.insertAdjacentHTML_p:element">
        /// The element on which insertAdjacentHTML is to be called.
        /// </param>
        /// <param name="position" type="String" locid="WinJS.Utilities.insertAdjacentHTML_p:position">
        /// The position relative to the element at which to insert the HTML.
        /// </param>
        /// <param name="text" type="String" locid="WinJS.Utilities.insertAdjacentHTML_p:text">
        /// The value to be provided to insertAdjacentHTML.
        /// </param>
        /// </signature>
        element.insertAdjacentHTML(position, text);
    };

    var msApp = _Global.MSApp;
    if (msApp) {
        setInnerHTMLUnsafe = function (element, text) {
            /// <signature helpKeyword="WinJS.Utilities.setInnerHTMLUnsafe">
            /// <summary locid="WinJS.Utilities.setInnerHTMLUnsafe">
            /// Sets the innerHTML property of the specified element to the specified text.
            /// </summary>
            /// <param name='element' type='HTMLElement' locid="WinJS.Utilities.setInnerHTMLUnsafe_p:element">
            /// The element on which the innerHTML property is to be set.
            /// </param>
            /// <param name='text' type="String" locid="WinJS.Utilities.setInnerHTMLUnsafe_p:text">
            /// The value to be set to the innerHTML property.
            /// </param>
            /// </signature>
            msApp.execUnsafeLocalFunction(function () {
                element.innerHTML = text;
            });
        };
        setOuterHTMLUnsafe = function (element, text) {
            /// <signature helpKeyword="WinJS.Utilities.setOuterHTMLUnsafe">
            /// <summary locid="WinJS.Utilities.setOuterHTMLUnsafe">
            /// Sets the outerHTML property of the specified element to the specified text
            /// in the context of msWWA.execUnsafeLocalFunction.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.setOuterHTMLUnsafe_p:element">
            /// The element on which the outerHTML property is to be set.
            /// </param>
            /// <param name="text" type="String" locid="WinJS.Utilities.setOuterHTMLUnsafe_p:text">
            /// The value to be set to the outerHTML property.
            /// </param>
            /// </signature>
            msApp.execUnsafeLocalFunction(function () {
                element.outerHTML = text;
            });
        };
        insertAdjacentHTMLUnsafe = function (element, position, text) {
            /// <signature helpKeyword="WinJS.Utilities.insertAdjacentHTMLUnsafe">
            /// <summary locid="WinJS.Utilities.insertAdjacentHTMLUnsafe">
            /// Calls insertAdjacentHTML on the specified element in the context
            /// of msWWA.execUnsafeLocalFunction.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.insertAdjacentHTMLUnsafe_p:element">
            /// The element on which insertAdjacentHTML is to be called.
            /// </param>
            /// <param name="position" type="String" locid="WinJS.Utilities.insertAdjacentHTMLUnsafe_p:position">
            /// The position relative to the element at which to insert the HTML.
            /// </param>
            /// <param name="text" type="String" locid="WinJS.Utilities.insertAdjacentHTMLUnsafe_p:text">
            /// Value to be provided to insertAdjacentHTML.
            /// </param>
            /// </signature>
            msApp.execUnsafeLocalFunction(function () {
                element.insertAdjacentHTML(position, text);
            });
        };
    } else if (_Global.msIsStaticHTML) {
        var check = function (str) {
            if (!_Global.msIsStaticHTML(str)) {
                throw new _ErrorFromName("WinJS.Utitilies.NonStaticHTML", strings.nonStaticHTML);
            }
        };
        // If we ever get isStaticHTML we can attempt to recreate the behavior we have in the local
        // compartment, in the mean-time all we can do is sanitize the input.
        //
        setInnerHTML = function (element, text) {
            /// <signature helpKeyword="WinJS.Utilities.setInnerHTML">
            /// <summary locid="WinJS.Utilities.msIsStaticHTML.setInnerHTML">
            /// Sets the innerHTML property of a element to the specified text
            /// if it passes a msIsStaticHTML check.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.msIsStaticHTML.setInnerHTML_p:element">
            /// The element on which the innerHTML property is to be set.
            /// </param>
            /// <param name="text" type="String" locid="WinJS.Utilities.msIsStaticHTML.setInnerHTML_p:text">
            /// The value to be set to the innerHTML property.
            /// </param>
            /// </signature>
            check(text);
            element.innerHTML = text;
        };
        setOuterHTML = function (element, text) {
            /// <signature helpKeyword="WinJS.Utilities.setOuterHTML">
            /// <summary locid="WinJS.Utilities.msIsStaticHTML.setOuterHTML">
            /// Sets the outerHTML property of a element to the specified text
            /// if it passes a msIsStaticHTML check.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.msIsStaticHTML.setOuterHTML_p:element">
            /// The element on which the outerHTML property is to be set.
            /// </param>
            /// <param name="text" type="String" locid="WinJS.Utilities.msIsStaticHTML.setOuterHTML_p:text">
            /// The value to be set to the outerHTML property.
            /// </param>
            /// </signature>
            check(text);
            element.outerHTML = text;
        };
        insertAdjacentHTML = function (element, position, text) {
            /// <signature helpKeyword="WinJS.Utilities.insertAdjacentHTML">
            /// <summary locid="WinJS.Utilities.msIsStaticHTML.insertAdjacentHTML">
            /// Calls insertAdjacentHTML on the element if it passes
            /// a msIsStaticHTML check.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.msIsStaticHTML.insertAdjacentHTML_p:element">
            /// The element on which insertAdjacentHTML is to be called.
            /// </param>
            /// <param name="position" type="String" locid="WinJS.Utilities.msIsStaticHTML.insertAdjacentHTML_p:position">
            /// The position relative to the element at which to insert the HTML.
            /// </param>
            /// <param name="text" type="String" locid="WinJS.Utilities.msIsStaticHTML.insertAdjacentHTML_p:text">
            /// The value to be provided to insertAdjacentHTML.
            /// </param>
            /// </signature>
            check(text);
            element.insertAdjacentHTML(position, text);
        };
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        setInnerHTML: setInnerHTML,
        setInnerHTMLUnsafe: setInnerHTMLUnsafe,
        setOuterHTML: setOuterHTML,
        setOuterHTMLUnsafe: setOuterHTMLUnsafe,
        insertAdjacentHTML: insertAdjacentHTML,
        insertAdjacentHTMLUnsafe: insertAdjacentHTMLUnsafe
    });

});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_Select',[
    'exports',
    '../Core/_Base',
    './_SafeHtml'
    ], function selectInit(exports, _Base, _SafeHtml) {
    "use strict";

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _Select: _Base.Namespace._lazy(function () {
            var encodeHtmlRegEx = /[&<>'"]/g;
            var encodeHtmlEscapeMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            };
            var stringDirectionRegEx = /[\u200e\u200f]/g;
            function encodeHtml(str) {
                return str.replace(encodeHtmlRegEx, function (m) {
                    return encodeHtmlEscapeMap[m] || "";
                });
            }
            function stripDirectionMarker(str) {
                return str.replace(stringDirectionRegEx, "");
            }
            function stockGetValue(index) {
                /*jshint validthis: true */
                return this[index];
            }
            function stockGetLength() {
                /*jshint validthis: true */
                return this.length;
            }
            function fixDataSource(dataSource) {
                if (!dataSource.getValue) {
                    dataSource.getValue = stockGetValue;
                }

                if (!dataSource.getLength) {
                    dataSource.getLength = stockGetLength;
                }
                return dataSource;
            }

            return _Base.Class.define(function _Select_ctor(element, options) {
                // This is an implementation detail of the TimePicker and DatePicker, designed
                // to provide a primitive "data bound" select control. This is not designed to
                // be used outside of the TimePicker and DatePicker controls.
                //

                this._dataSource = fixDataSource(options.dataSource);
                this._index = options.index || 0;

                this._domElement = element;
                // Mark this as a tab stop
                this._domElement.tabIndex = 0;

                if (options.disabled) {
                    this.setDisabled(options.disabled);
                }

                var that = this;
                this._domElement.addEventListener("change", function () {
                    //Should be set to _index to prevent events from firing twice
                    that._index = that._domElement.selectedIndex;
                }, false);

                //update runtime accessibility value after initialization
                this._createSelectElement();
            }, {
                _index: 0,
                _dataSource: null,

                dataSource: {
                    get: function () { return this._dataSource; },
                    set: function (value) {
                        this._dataSource = fixDataSource(value);

                        //Update layout as data source change
                        if (this._domElement) {
                            this._createSelectElement();
                        }
                    }
                },

                setDisabled: function (disabled) {
                    if (disabled) {
                        this._domElement.setAttribute("disabled", "disabled");
                    } else {
                        this._domElement.removeAttribute("disabled");
                    }
                },

                _createSelectElement: function () {
                    var dataSourceLength = this._dataSource.getLength();
                    var text = "";
                    for (var i = 0; i < dataSourceLength; i++) {
                        var value = "" + this._dataSource.getValue(i);
                        var escaped = encodeHtml(value);
                        // WinRT localization often tags the strings with reading direction. We want this
                        // for display text (escaped), but don't want this in the value space, as it
                        // only present for display.
                        //
                        var stripped = stripDirectionMarker(escaped);
                        text += "<option value='" + stripped + "'>" + escaped + "</option>";
                    }
                    _SafeHtml.setInnerHTMLUnsafe(this._domElement, text);
                    this._domElement.selectedIndex = this._index;
                },

                index: {
                    get: function () {
                        return Math.max(0, Math.min(this._index, this._dataSource.getLength() - 1));
                    },
                    set: function (value) {
                        if (this._index !== value) {
                            this._index = value;

                            var d = this._domElement;
                            if (d && d.selectedIndex !== value) {
                                d.selectedIndex = value;
                            }
                        }
                    }
                },

                value: {
                    get: function () {
                        return this._dataSource.getValue(this.index);
                    }
                }
            });
        })
    });
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_UI',[
    'exports',
    '../Core/_BaseCoreUtils',
    '../Core/_Base'
    ], function uiInit(exports, _BaseCoreUtils, _Base) {
    "use strict";

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        eventHandler: function (handler) {
            /// <signature helpKeyword="WinJS.UI.eventHandler">
            /// <summary locid="WinJS.UI.eventHandler">
            /// Marks a event handler function as being compatible with declarative processing.
            /// </summary>
            /// <param name="handler" type="Object" locid="WinJS.UI.eventHandler_p:handler">
            /// The handler to be marked as compatible with declarative processing.
            /// </param>
            /// <returns type="Object" locid="WinJS.UI.eventHandler_returnValue">
            /// The input handler.
            /// </returns>
            /// </signature>
            return _BaseCoreUtils.markSupportedForProcessing(handler);
        },
        /// <field locid="WinJS.UI.Orientation" helpKeyword="WinJS.UI.Orientation">
        /// Orientation options for a control's property
        /// </field>
        Orientation: {
            /// <field locid="WinJS.UI.Orientation.horizontal" helpKeyword="WinJS.UI.Orientation.horizontal">
            /// Horizontal
            /// </field>
            horizontal: "horizontal",
            /// <field locid="WinJS.UI.Orientation.vertical" helpKeyword="WinJS.UI.Orientation.vertical">
            /// Vertical
            /// </field>
            vertical: "vertical"
        },

        CountResult: {
            unknown: "unknown"
        },

        CountError: {
            noResponse: "noResponse"
        },

        DataSourceStatus: {
            ready: "ready",
            waiting: "waiting",
            failure: "failure"
        },

        FetchError: {
            noResponse: "noResponse",
            doesNotExist: "doesNotExist"
        },

        EditError: {
            noResponse: "noResponse",
            canceled: "canceled",
            notPermitted: "notPermitted",
            noLongerMeaningful: "noLongerMeaningful"
        },

        /// <field locid="WinJS.UI.ListView.ObjectType" helpKeyword="WinJS.UI.ObjectType">
        /// Specifies the type of an IListViewEntity.
        /// </field>
        ObjectType: {
            /// <field locid="WinJS.UI.ListView.ObjectType.item" helpKeyword="WinJS.UI.ObjectType.item">
            /// This value represents a ListView item.
            /// </field>
            item: "item",
            /// <field locid="WinJS.UI.ListView.ObjectType.groupHeader" helpKeyword="WinJS.UI.ObjectType.groupHeader">
            /// This value represents a ListView group header.
            /// </field>
            groupHeader: "groupHeader"
        },

        /// <field locid="WinJS.UI.ListView.SelectionMode" helpKeyword="WinJS.UI.SelectionMode">
        /// Specifies the selection mode for a ListView.
        /// </field>
        SelectionMode: {
            /// <field locid="WinJS.UI.ListView.SelectionMode.none" helpKeyword="WinJS.UI.SelectionMode.none">
            /// Items cannot be selected.
            /// </field>
            none: "none",
            /// <field locid="WinJS.UI.ListView.SelectionMode.single" helpKeyword="WinJS.UI.SelectionMode.single">
            /// A single item may be selected.
            /// <compatibleWith platform="Windows" minVersion="8.0"/>
            /// </field>
            single: "single",
            /// <field locid="WinJS.UI.ListView.SelectionMode.multi" helpKeyword="WinJS.UI.SelectionMode.multi">
            /// Multiple items may be selected.
            /// </field>
            multi: "multi"
        },

        /// <field locid="WinJS.UI.TapBehavior" helpKeyword="WinJS.UI.TapBehavior">
        /// Specifies how an ItemContainer or items in a ListView respond to the tap interaction.
        /// </field>
        TapBehavior: {
            /// <field locid="WinJS.UI.TapBehavior.directSelect" helpKeyword="WinJS.UI.TapBehavior.directSelect">
            /// Tapping the item invokes it and selects it. Navigating to the item with the keyboard changes the
            /// the selection so that the focused item is the only item that is selected.
            /// <compatibleWith platform="Windows" minVersion="8.0"/>
            /// </field>
            directSelect: "directSelect",
            /// <field locid="WinJS.UI.TapBehavior.toggleSelect" helpKeyword="WinJS.UI.TapBehavior.toggleSelect">
            /// Tapping the item invokes it. If the item was selected, tapping it clears the selection. If the item wasn't
            /// selected, tapping the item selects it.
            /// Navigating to the item with the keyboard does not select or invoke it.
            /// </field>
            toggleSelect: "toggleSelect",
            /// <field locid="WinJS.UI.TapBehavior.invokeOnly" helpKeyword="WinJS.UI.TapBehavior.invokeOnly">
            /// Tapping the item invokes it. Navigating to the item with keyboard does not select it or invoke it.
            /// </field>
            invokeOnly: "invokeOnly",
            /// <field locid="WinJS.UI.TapBehavior.none" helpKeyword="WinJS.UI.TapBehavior.none">
            /// Nothing happens.
            /// </field>
            none: "none"
        },

        /// <field locid="WinJS.UI.SwipeBehavior" helpKeyword="WinJS.UI.SwipeBehavior">
        /// Specifies whether items are selected when the user performs a swipe interaction.
        /// <compatibleWith platform="Windows" minVersion="8.0"/>
        /// </field>
        SwipeBehavior: {
            /// <field locid="WinJS.UI.SwipeBehavior.select" helpKeyword="WinJS.UI.SwipeBehavior.select">
            /// The swipe interaction selects the items touched by the swipe.
            /// </field>
            select: "select",
            /// <field locid="WinJS.UI.SwipeBehavior.none" helpKeyword="WinJS.UI.SwipeBehavior.none">
            /// The swipe interaction does not change which items are selected.
            /// </field>
            none: "none"
        },

        /// <field locid="WinJS.UI.GroupHeaderTapBehavior" helpKeyword="WinJS.UI.GroupHeaderTapBehavior">
        /// Specifies how group headers in a ListView respond to the tap interaction.
        /// </field>
        GroupHeaderTapBehavior: {
            /// <field locid="WinJS.UI.GroupHeaderTapBehavior.invoke" helpKeyword="WinJS.UI.GroupHeaderTapBehavior.invoke">
            /// Tapping the group header invokes it.
            /// </field>
            invoke: "invoke",
            /// <field locid="WinJS.UI.GroupHeaderTapBehavior.none" helpKeyword="WinJS.UI.GroupHeaderTapBehavior.none">
            /// Nothing happens.
            /// </field>
            none: "none"
        }

    });

});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities/_Xhr',[
    '../Core/_Global',
    '../Core/_Base',
    '../Promise',
    '../Scheduler'
    ], function xhrInit(_Global, _Base, Promise, Scheduler) {
    "use strict";

    function schedule(f, arg, priority) {
        Scheduler.schedule(function xhr_callback() {
            f(arg);
        }, priority, null, "WinJS.xhr");
    }

    function noop() {
    }

    function xhr(options) {
        /// <signature helpKeyword="WinJS.xhr">
        /// <summary locid="WinJS.xhr">
        /// Wraps calls to XMLHttpRequest in a promise.
        /// </summary>
        /// <param name="options" type="Object" locid="WinJS.xhr_p:options">
        /// The options that are applied to the XMLHttpRequest object. They are: type,
        /// url, user, password, headers, responseType, data, and customRequestInitializer.
        /// </param>
        /// <returns type="WinJS.Promise" locid="WinJS.xhr_returnValue">
        /// A promise that returns the XMLHttpRequest object when it completes.
        /// </returns>
        /// </signature>
        var req;
        return new Promise(
            function (c, e, p) {
                /// <returns value="c(new XMLHttpRequest())" locid="WinJS.xhr.constructor._returnValue" />
                var priority = Scheduler.currentPriority;
                req = new _Global.XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (req._canceled) {
                        req.onreadystatechange = noop;
                        return;
                    }

                    if (req.readyState === 4) {
                        if ((req.status >= 200 && req.status < 300) || req.status === 0) {
                            schedule(c, req, priority);
                        } else {
                            schedule(e, req, priority);
                        }
                        req.onreadystatechange = noop;
                    } else {
                        schedule(p, req, priority);
                    }
                };

                req.open(
                    options.type || "GET",
                    options.url,
                    // Promise based XHR does not support sync.
                    //
                    true,
                    options.user,
                    options.password
                );
                req.responseType = options.responseType || "";

                Object.keys(options.headers || {}).forEach(function (k) {
                    req.setRequestHeader(k, options.headers[k]);
                });

                if (options.customRequestInitializer) {
                    options.customRequestInitializer(req);
                }

                if (options.data === undefined) {
                    req.send();
                } else {
                    req.send(options.data);
                }
            },
            function () {
                req.onreadystatechange = noop;
                req._canceled = true;
                req.abort();
            }
        );
    }

    _Base.Namespace.define("WinJS", {
        xhr: xhr
    });

    return xhr;

});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS/Utilities',[
    './Utilities/_Control',
    './Utilities/_Dispose',
    './Utilities/_ElementListUtilities',
    './Utilities/_ElementUtilities',
    './Utilities/_Hoverable',
    './Utilities/_ItemsManager',
    './Utilities/_KeyboardBehavior',
    './Utilities/_ParallelWorkQueue',
    './Utilities/_SafeHtml',
    './Utilities/_Select',
    './Utilities/_TabContainer',
    './Utilities/_UI',
    './Utilities/_VersionManager',
    './Utilities/_Xhr' ], function () {

    //wrapper module
});

// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
define('WinJS-custom',[
    'WinJS/Utilities'
    ], function (_WinJS) {
    "use strict";

    return _WinJS;
});


        require(['WinJS/Core/_WinJS', 'WinJS-custom'], function (_WinJS) {
            global.WinJS = _WinJS;
            return _WinJS;
        });
    }));
}(this));

