# ascot-form-controller

A controller for the ascot library. Binds models and forms.

# Installation

```
npm install rvangundy/ascot-form-controller --save
```

# Usage

The form controller is intended to be used with [browserify](https://github.com/substack/node-browserify) and [ascot](https://github.com/rvangundy/ascot2). The package returns a setup function that creates a new controller. The only parameter passed to the setup function is the model associated with the controller.

The formController may be applied to any form element. Values in the model are two-way bound to form fields based on the "name" attribute. A model with the following data :

```json
{
  "name" : {
    "first" : "John",
    "last"  : "Doe"
  }
}
```

May be bound to a form such as :

```html
<form>
  <input type="text" name="name.first" placeholder="First">
  <input type="text" name="name.last" placeholder="Last">
</form>
```

# Example

In the following example, the ```person``` model is bound to ```form```. Any change to either the model or to any form field will be reflected in both. Note that pressing [Return] may attempt to submit the form. At the time of this writing, form submission must be configured manually or the keypress event ignored.

```javascript
var ascot = require('ascot2');
var person = ascot.createModel({ name : { first : 'John', last : 'Doe' }, age : 25 });
var formController = require('ascot-form-controller')(person);
var formHTML = '<form>' +
              '<input type="text" name="name.first">' +
              '<input type="text" name="name.last">' +
              '<input type="text" name="age">' +
              '</form>';

var form = ascot(formHTML, formController);

form.appendTo(document.body);
```

