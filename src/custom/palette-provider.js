import { assign } from 'min-dash';

/**
 * A palette provider for BPMN 2.0 elements.
 */
export default function PaletteProvider(
  palette,
  create,
  elementFactory,
  lassoTool,
  translate
) {
  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._lassoTool = lassoTool;
  this._translate = translate;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'lassoTool',
  'translate',
];

PaletteProvider.prototype.getPaletteEntries = function(element) {
  var actions = {},
    create = this._create,
    elementFactory = this._elementFactory,
    lassoTool = this._lassoTool,
    translate = this._translate;

  function createAction(type, group, className, title, options) {
    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    var shortType = type.replace(/^bpmn:/, '');

    return {
      group: group,
      className: className,
      title: title || translate('Create {type}', { type: shortType }),
      action: {
        dragstart: createListener,
        click: createListener,
      },
    };
  }

  assign(actions, {
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: translate('选择'),
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        },
      },
    },
    'tool-separator': {
      group: 'tools',
      separator: true,
    },
    'create.start-event': createAction(
      'bpmn:StartEvent',
      'event',
      'bpmn-icon-start-event-none',
      translate('开始')
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent',
      'event',
      'bpmn-icon-end-event-none',
      translate('结束')
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ParallelGateway',
      'gateway',
      'bpmn-icon-gateway-parallel',
      translate('网关')
    ),
    'create.task': createAction(
      'bpmn:UserTask',
      'activity',
      'bpmn-icon-task',
      translate('任务')
    ),
  });

  return actions;
};
