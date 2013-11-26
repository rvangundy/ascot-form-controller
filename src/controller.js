'use strict';

var FormProxy = require('./FormProxy');

/**
 * Updates all tagged form entries with a corresponding value from a model
 * @param {FormProxy} proxy A proxy representing the form to update
 * @param {Model}     model A model object
 */
function updateForm(proxy, model) {
    proxy.set(model.data);
}

/**
 * Handles updating the model based on a form change
 * @param {FormProxy} proxy A proxy representing the form that has changed
 * @param {Model}     model A model object
 * @param {Event}     evt   A native event object
 */
function updateModel(proxy, model, evt) {
    var key = evt.target.name;

    evt.stopPropagation();

    proxy.debounce(function(done) {
        model.set(key, proxy.get(key));
        done();
    });
}

/**
 * Creates a new form controller bound to the specified model
 * @param {Element} element An element containing form elements
 */
function createFormController(model) {
    return function(element) {
        var proxy = new FormProxy(element);

        // Model --> Form binding
        model.addListener(updateForm.bind(this, proxy));

        // Form --> model binding
        proxy.on('change', updateModel.bind(this, proxy, model));
    };
}

module.exports = createFormController;
