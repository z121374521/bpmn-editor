import PaletteProvider from './palette-provider';
import ContextPadProvider from './context-pad-provider';
import LabelEditingProvider from './label-editing-provider';
// import AppendShapeUtil from "./append-shape-util";
import ElementFactory from './element-factory';
import Renderer from './renderer';

export default {
  __init__: [
    'paletteProvider',
    'contextPadProvider',
    'labelEditingProvider',
    // "appendShapeUtil",
    'elementFactory',
    'bpmnRenderer',
  ],
  paletteProvider: ['type', PaletteProvider],
  contextPadProvider: ['type', ContextPadProvider],
  labelEditingProvider: ['type', LabelEditingProvider],
  // appendShapeUtil: ["type", AppendShapeUtil],
  elementFactory: ['type', ElementFactory],
  bpmnRenderer: ['type', Renderer],
};
