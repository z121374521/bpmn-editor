import inherits from 'inherits';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import BpmnElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';

export default function ElementFactory(bpmnFactory, moddle) {
  BpmnElementFactory.call(this, bpmnFactory, moddle);
}

inherits(ElementFactory, BpmnElementFactory);

ElementFactory.$inject = ['bpmnFactory', 'moddle'];

ElementFactory.prototype._getRewriteSize = function(semantic) {
  if (is(semantic, 'bpmn:Task')) {
    return { width: 80, height: 40 };
  }
};

ElementFactory.prototype._getBaseDefaultSize =
  BpmnElementFactory.prototype._getDefaultSize;

ElementFactory.prototype._getDefaultSize = function(semantic) {
  let size = this._getBaseDefaultSize(semantic);
  let rewrite = ElementFactory.prototype._getRewriteSize(semantic);
  return rewrite || size;
};
// 寄生组合继承实现

// ElementFactory.prototype.constructor = ElementFactory;

// ElementFactory.prototype._getDefaultSize = function(semantic) {
//   let size = BpmnElementFactory.prototype._getDefaultSize.apply(
//     this,
//     Array.prototype.slice.apply(arguments)
//   );
//   let rewrite = ElementFactory.prototype._getRewriteSize(semantic);
//   return rewrite || size;
// };
