import { is } from 'bpmn-js/lib/util/ModelUtil';

import { deconflictPosition } from 'bpmn-js/lib/features/auto-place';

import { asTRBL, getMid, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';

var DEFAULT_HORIZONTAL_DISTANCE = 50;

export default function AppendShapeUtil(eventBus) {
  // 将形状附加到源的适当位置
  eventBus.on('autoPlace', function(event) {
    return getNewShapePosition(event.source, event.shape);
  });

  function getNewShapePosition(source, element) {
    if (is(element, 'bpmn:FlowNode')) {
      return getFlowNodePosition(source, element);
    }
    return getDefaultPosition(source, element);
  }

  /**
   * Always put element bottom right of source
   */
  function getFlowNodePosition(source, element) {
    var sourceTrbl = asTRBL(source);
    var sourceMid = getMid(source);

    var horizontalDistance = DEFAULT_HORIZONTAL_DISTANCE;

    var orientation = 'left',
      rowSize = 80,
      margin = 30;

    if (is(source, 'bpmn:BoundaryEvent')) {
      orientation = getOrientation(source, source.host, -25);

      if (orientation.indexOf('top') !== -1) {
        margin *= -1;
      }
    }

    function getVerticalDistance(orient) {
      if (orient.indexOf('top') !== -1) {
        return -1 * rowSize;
      } else if (orient.indexOf('bottom') !== -1) {
        return rowSize;
      } else {
        return 0;
      }
    }

    var position = {
      x: sourceMid.x + getVerticalDistance(orientation),
      y: sourceTrbl.bottom + horizontalDistance + element.height / 2,
    };

    var escapeDirection = {
      x: {
        margin: margin,
        rowSize: rowSize,
      },
    };
    return deconflictPosition(source, element, position, escapeDirection);
  }
  /**
   * Always put element down of source per default.
   */
  function getDefaultPosition(source, element) {
    var sourceTrbl = asTRBL(source);

    var sourceMid = getMid(source);

    // simply put element right next to source
    return {
      x: sourceMid.x,
      y: sourceTrbl.bottom + DEFAULT_HORIZONTAL_DISTANCE + element.height / 2,
    };
  }
}
AppendShapeUtil.$inject = ['eventBus'];
