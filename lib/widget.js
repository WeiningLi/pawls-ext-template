"use strict";
// Copyright (c) 
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleView = exports.ExampleModel = void 0;
const base_1 = require("@jupyter-widgets/base");
const ReactWidget_1 = __importDefault(require("./ReactWidget"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const version_1 = require("./version");
// Import the CSS
require("../css/widget.css");
// Your widget state goes here. Make sure to update the corresponding
// Python state in example.py
const defaultModelProperties = {
    value: 'Hello World',
};
class ExampleModel extends base_1.DOMWidgetModel {
    defaults() {
        return Object.assign(Object.assign(Object.assign({}, super.defaults()), { _model_name: ExampleModel.model_name, _model_module: ExampleModel.model_module, _model_module_version: ExampleModel.model_module_version, _view_name: ExampleModel.view_name, _view_module: ExampleModel.view_module, _view_module_version: ExampleModel.view_module_version }), defaultModelProperties);
    }
}
exports.ExampleModel = ExampleModel;
ExampleModel.serializers = Object.assign({}, base_1.DOMWidgetModel.serializers);
ExampleModel.model_name = 'ExampleModel';
ExampleModel.model_module = version_1.MODULE_NAME;
ExampleModel.model_module_version = version_1.MODULE_VERSION;
ExampleModel.view_name = 'ExampleView'; // Set to null if no view
ExampleModel.view_module = version_1.MODULE_NAME; // Set to null if no view
ExampleModel.view_module_version = version_1.MODULE_VERSION;
class ExampleView extends base_1.DOMWidgetView {
    render() {
        this.el.classList.add('custom-widget');
        const component = react_1.default.createElement(ReactWidget_1.default, {
            model: this.model,
        });
        react_dom_1.default.render(component, this.el);
    }
}
exports.ExampleView = ExampleView;
//# sourceMappingURL=widget.js.map