'use strict';

var isArray      = Array.isArray;
var EventEmitter = require('events').EventEmitter;

/************
 *  Events  *
 ************/

/**
 * Emits the onchange event on the proxy
 * @param {Event} evt A native event object
 */
function emitOnChange(evt) {
    this.emit('change', evt);
}

/***************
 *  Utilities  *
 ***************/

/**
 * Recursively builds a data-key referenced index of FormControl elements
 * @param {Element} element An element to search for indexable FormControls
 * @param {Object}  index   An index object
 */
function buildIndex(element, index) {
    var child, key, items;
    var children = element.children;

    index = index || {};

    // Recursively cycle through child elements
    for (var i = 0, len = children.length; i < len; i += 1) {
        child = children[i];
        key   = child.getAttribute('name');

        if (key) {
            items = index[key];

            // Add to index
            if (items && isArray(items)) {
                items.push(child);
            } else if (items) {
                items = index[key] = [items];
                items.push(child);
            } else {
                index[key] = child;
            }

            // Register event handler
            child.addEventListener('change', emitOnChange.bind(this), false);
        }

        buildIndex.call(this, child, index);
    }

    return index;
}

/**
 * Resolves a value from an object based on a dot-delimited path
 * @param {Object} obj An object from which to resolve a value
 * @param {String} key A dot-delimited key or path
 */
function resolve(obj, key) {
    var value = obj;
    key = key.split('.');

    for (var i = 0, len = key.length; i < len; i += 1) {
        value = value[key[i]];
    }

    return value;
}

/**
 * Performs a function while temporarily disabling event triggering on the proxy
 * @param {Function} fn A function to run while proxy is in debounce mode
 */
function debounce(fn) {
    this.ignore = true;
    fn(function() {
        this.ignore = false;
    }.bind(this));
}

/************
 *  Access  *
 ************/

/**
 * Sets a form element's value by key. If an entire object is passed to 'set', attempt
 * to update the entire form with the given values
 * @param {String} key   The dot-delimited key value associated with the form field
 * @param {String} value The value of the field
 */
function set(key, value) {
    var element, form, item, keys, thisSet, val;

    if (this.ignore) { return; }

    // Adjust for single-parameter, corresponding to an entire object
    if (arguments.length === 1) {
        thisSet = set.bind(this);
        keys    = Object.keys(this.index);

        for (var j = 0, lenJ = keys.length; j < lenJ; j += 1) {
            val = resolve(key, keys[j]);
            if (val !== undefined) {
                thisSet(keys[j], val);
            }
        }

        return;
    }

    element = this.index[key];
    form    = element.form;

    // Handle updating multiple-choice items
    if (isArray(element)) {
        value = isArray(value) ? value : [value];

        for (var i = 0, len = element.length; i < len; i += 1) {
            item = element[i];
            if (value.indexOf(item.value) >= 0) {
                item.checked = true;
            } else {
                item.checked = false;
            }
        }

        return;
    }

    // Handle 'checkable' elements
    if (element.type === 'checkbox') {
        element.checked = value;
        return;
    }

    // Handle all other form elements
    if (element.type !== 'file') {
        element.value = value;
    }
}

/**
 * Returns the value of the specified form field
 * @param {String} key A dot-delimited key
 */
function get(key) {
    var item, value, type, checked;
    var element = this.index[key];

    // Collect multiple-choice values
    if (isArray(element)) {
        value = [];

        for (var i = 0, len = element.length; i < len; i += 1) {
            item    = element[i];
            type    = item.type;
            checked = item.checked;

            if (type === 'checkbox' && checked) {
                value.push(item.value);
            }

            else if (type === 'radio' && checked) {
                return item.value;
            }
        }

        return value;
    }

    // Return all other values
    return element.value;
}

/*****************
 *  Constructor  *
 *****************/

/**
 * Constructs a form wrapper object that serves as a proxy to a collection
 * of FormControl elements.
 * @param {Element} element An HTML element that contains FormControl elements
 */
function FormWrapper(element) {
    if (element.tagName !== 'FORM') { throw new Error('Element must be a valid form'); }

    // Establish an index referenced by data-key
    this.index = buildIndex.call(this, element);
}

/***************
 *  Prototype  *
 ***************/

var proto = FormWrapper.prototype = {
    set      : set,
    get      : get,
    ignore   : false,
    debounce : debounce
};

// EventEmitter mixin

var eventEmitterProto = EventEmitter.prototype;

for (var i in eventEmitterProto) {
    if (eventEmitterProto.hasOwnProperty(i)) {
        proto[i] = eventEmitterProto[i];
    }
}

/*************
 *  Exports  *
 *************/

module.exports = FormWrapper;
