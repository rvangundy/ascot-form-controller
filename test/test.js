'use strict';

var formController = require('../src/controller');
var ascot          = require('ascot2');
var formTemplate   = require('./sampleForm.hbs');
var assert         = chai.assert;

describe('FormProxy', function () {

    var app = ascot(formTemplate());

    window.model = ascot.createModel({
        name : { first : 'Ryan', last : 'VanGundy' },
        seasons : ['spring', 'summer']
    });

    var controller = formController(window.model);

    document.body.appendChild(app.element);

    controller(app.element);

    describe('set', function() {

    });

    it('is a module', function () {
        assert.ok(true);
    });
});
