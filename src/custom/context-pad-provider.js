import { assign, forEach, isArray } from 'min-dash';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { isEventSubProcess } from 'bpmn-js/lib/util/DiUtil';

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import { hasPrimaryModifier } from 'diagram-js/lib/util/Mouse';

/**
 * A provider for BPMN 2.0 elements context pad
 */
export default function ContextPadProvider(
  config,
  injector,
  eventBus,
  contextPad,
  modeling,
  elementFactory,
  connect,
  create,
  canvas,
  rules,
  translate
) {
  config = config || {};

  contextPad.registerProvider(this);

  this._contextPad = contextPad;

  this._modeling = modeling;

  this._elementFactory = elementFactory;
  this._connect = connect;
  this._create = create;
  this._canvas = canvas;
  this._rules = rules;
  this._translate = translate;

  if (config.autoPlace !== false) {
    this._autoPlace = injector.get('autoPlace', false);
  }

  eventBus.on('create.end', 250, function(event) {
    var shape = event.context.shape;

    if (!hasPrimaryModifier(event)) {
      return;
    }

    var entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });
}

ContextPadProvider.$inject = [
  'config.contextPad',
  'injector',
  'eventBus',
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'canvas',
  'rules',
  'translate',
];

ContextPadProvider.prototype.getContextPadEntries = function(element) {
  var contextPad = this._contextPad,
    modeling = this._modeling,
    elementFactory = this._elementFactory,
    connect = this._connect,
    create = this._create,
    canvas = this._canvas,
    rules = this._rules,
    autoPlace = this._autoPlace,
    translate = this._translate;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }

  var businessObject = element.businessObject;

  function startConnect(event, element) {
    connect.start(event, element);
  }

  function removeElement(e) {
    modeling.removeElements([element]);
  }

  function getReplaceMenuPosition(element) {
    var Y_OFFSET = 5;

    var diagramContainer = canvas.getContainer(),
      pad = contextPad.getPad(element).html;

    var diagramRect = diagramContainer.getBoundingClientRect(),
      padRect = pad.getBoundingClientRect();

    var top = padRect.top - diagramRect.top;
    var left = padRect.left - diagramRect.left;

    var pos = {
      x: left,
      y: top + padRect.height + Y_OFFSET,
    };

    return pos;
  }

  /**
   * Create an append action
   *
   * @param {String} type
   * @param {String} className
   * @param {String} [title]
   * @param {Object} [options]
   *
   * @return {Object} descriptor
   */
  function appendAction(type, className, title, options) {
    if (typeof title !== 'string') {
      options = title;
      title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
    }

    function appendStart(event, element) {
      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape, element);
    }

    var append = autoPlace
      ? function(event, element) {
        var shape = elementFactory.createShape(
          assign({ type: type }, options)
        );

        autoPlace.append(element, shape);
      }
      : appendStart;

    return {
      group: 'model',
      className: className,
      title: title,
      action: {
        dragstart: appendStart,
        click: append,
      },
    };
  }

  // 类型为流程节点
  if (is(businessObject, 'bpmn:FlowNode')) {
    if (
      // 不是结束事件并且不是补偿 并且不是IntermediateThrowEvent事件
      !is(businessObject, 'bpmn:EndEvent') &&
      !businessObject.isForCompensation &&
      !isEventType(
        businessObject,
        'bpmn:IntermediateThrowEvent',
        'bpmn:LinkEventDefinition'
      ) &&
      !isEventSubProcess(businessObject)
    ) {
      assign(actions, {
        'append.end-event': appendAction(
          'bpmn:EndEvent',
          'bpmn-icon-end-event-none',
          translate('结束')
        ),
        'append.gateway': appendAction(
          'bpmn:ParallelGateway',
          'bpmn-icon-gateway-parallel',
          translate('网关')
        ),
        'append.append-task': appendAction(
          'bpmn:UserTask',
          'bpmn-icon-task',
          translate('任务')
        ),
      });
    }
  }

  if (
    isAny(businessObject, [
      'bpmn:FlowNode',
      'bpmn:InteractionNode',
      'bpmn:DataObjectReference',
      'bpmn:DataStoreReference',
    ]) &&
    !is(businessObject, 'bpmn:EndEvent')
  ) {
    assign(actions, {
      connect: {
        group: 'edit',
        className: 'bpmn-icon-connection',
        title: translate('链接'),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  // delete element entry, only show if allowed by rules
  var deleteAllowed = rules.allowed('elements.delete', { elements: [element] });

  if (isArray(deleteAllowed)) {
    // was the element returned as a deletion candidate?
    deleteAllowed = deleteAllowed[0] === element;
  }

  if (deleteAllowed) {
    assign(actions, {
      delete: {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: translate('删除'),
        action: {
          click: removeElement,
        },
      },
    });
  }

  return actions;
};

function isEventType(eventBo, type, definition) {
  var isType = eventBo.$instanceOf(type);
  var isDefinition = false;

  var definitions = eventBo.eventDefinitions || [];
  forEach(definitions, function(def) {
    if (def.$type === definition) {
      isDefinition = true;
    }
  });

  return isType && isDefinition;
}
