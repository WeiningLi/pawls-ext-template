"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const widget_model_1 = require("./hooks/widget-model");
const components_1 = require("./components");
function ReactWidget(props) {
    const [data, setName] = widget_model_1.useModelState('value');
    console.log('prev', data);
    return (react_1.default.createElement("div", { className: "Widget" },
        react_1.default.createElement("h1", { onChange: () => setName(data) }, "Hello"),
        react_1.default.createElement(components_1.PDF, { data: data })));
}
function withModelContext(Component) {
    return (props) => (react_1.default.createElement(widget_model_1.WidgetModelContext.Provider, { value: props.model },
        react_1.default.createElement(Component, Object.assign({}, props))));
}
exports.default = withModelContext(ReactWidget);
//# sourceMappingURL=ReactWidget.js.map