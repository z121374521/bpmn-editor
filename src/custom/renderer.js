import inherits from 'inherits';

import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer';

/**
 * A renderer that knows how to render custom elements.
 */
export default function Renderer(
  config,
  eventBus,
  styles,
  pathMap,
  canvas,
  textRenderer,
  priority,
) {
  BpmnRenderer.call(this, config, eventBus, styles, pathMap, canvas, textRenderer, priority);
  // console.log("this1:",this)
  let handlers = this.handlers;
  function renderer(type) {
    return handlers[type];
  }
  handlers['bpmn:UserTask'] = function(parentGfx, element) {
    return renderer('bpmn:Task')(parentGfx, element);
  };
}

inherits(Renderer, BpmnRenderer);
Renderer.prototype.drawShape = function(parentGfx, element) {
  let tempName;
  if (element.type === 'bpmn:UserTask') {
    tempName = element.businessObject.name;
    if (tempName === undefined || tempName === '') {
      element.businessObject.name = '';
    } else if (tempName.length >= 10) {
      element.businessObject.name = tempName.substring(0, 10) + '...';
    }
  }
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  const result = h(parentGfx, element);
  if (element.type === 'bpmn:UserTask') {
    element.businessObject.name = tempName;
    // console.log("element2:",element.businessObject.name);
  }
  return result;
};
Renderer.$inject = [
  'config.bpmnRenderer',
  'eventBus',
  'styles',
  'pathMap',
  'canvas',
  'textRenderer',
];
