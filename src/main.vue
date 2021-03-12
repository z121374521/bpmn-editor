<template>
  <div class="custom-bpmn">
    <div class="containers" ref="content"></div>
  </div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { generateShortUUID } from './custom/util';
import CustomModule from './custom';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default {
  name: 'BpmnEditor',
  data() {
    return {
      modeler: null,
      container: null,
      canvas: null,
      scale: null,
      // 1.6
      scaleCoefficient: 1.05,
      beforeNodeIdsArr: [],
      count: 0,
      idsCopy: '',
      idTmp: '',
      bpmnModelerArr: {},
      bpmnPaste: '',
      ctrlyKey: '',
      num: '',
    };
  },
  methods: {
    // 获取所有bpmn信息
    getAllbpmn() {
      return this.modeler.get('elementRegistry').getAll();
    },
    /**
     * 打开工作流
     * @param xml
     */
    async openDiagram(xml) {
      // let _self = this;
      // this.modeler.importXML(xml, function(err) {
      //   if (err) {
      //   }
      //   _self.canvas = _self.modeler.get("canvas");
      //   _self.scale = _self.canvas.zoom("fit-viewport");
      // });
      try {
        const result = await this.modeler.importXML(xml);
        const { warnings } = result;
        this.canvas = this.modeler.get('canvas');
        this.scale = this.canvas.zoom(0.9);
        // 根据视口大小自适应
        // this.scale = this.canvas.zoom('fit-viewport');
      } catch (err) {}
    },
    getBpmnShapeAll() {
      this.bpmnModelerArr = {};
      let modeler = this.modeler.get('elementRegistry').getAll();
      let sum = 0;
      modeler.forEach((element, idx) => {
        if (element.type === 'bpmn:UserTask') {
          // bpmnModelerArrKey.push(element.businessObject.name);
          sum += parseInt(idx);
          this.bpmnModelerArr[idx] = element;
        }
      });
      this.bpmnModelerArr.sum = sum;
    },
    /**
     * 监听任务选择
     * 任务点击通知付组件
     */
    listenTaskSelect() {
      this.modeler.on('selection.changed', e => {
        if (this.ctrlyKey === 'buffer-ctrl-v') {
          this.ctrlyKey = '';
          return;
        }
        this.getBpmnShapeAll();
        let selection = e.newSelection;
        if (selection.length === 1 && is(selection[0], 'bpmn:UserTask')) {
          // 获得选中任务之前的任务id节点
          let ids = this.getBeforeTaskNodes(selection[0].id);
          this.idsCopy = ids;
          this.idTmp = selection[0].id;
          this.$emit('select-task', selection[0].id, ids);
        } else {
          this.$emit('select-task', '');
        }
      });
    },
    /**
     * 监听任务节点删除
     */
    listenTaskRemove() {
      let bpmn = this;
      this.modeler.on('commandStack.shape.delete.postExecuted', event => {
        let context = event.context;
        let element = context.shape;
        if (is(element, 'bpmn:UserTask')) {
          bpmn.$emit('remove-task', element.id);
        }
      });
    },
    /**
     * 监听任务添加
     */
    listenTaskAdd() {
      this.modeler.on('commandStack.shape.create.postExecuted', event => {
        if (this.bpmnPaste === 'ctrl-v') {
          this.$emit('ctrl-v', event);
          this.bpmnPaste = '';
          return;
        }
        let context = event.context;
        let element = context.shape;
        if (is(element, 'bpmn:UserTask')) {
          this.$emit('add-task', element.id);
        }
        // this.bpmnCtrlY = true
      });
    },
    /**
     * 维护任务节点名称列表
     */
    changeTaskName(id, name) {
      let elementRegistry = this.modeler.get('elementRegistry');
      let element = elementRegistry.get(id);
      if (element) {
        let modeling = this.modeler.get('modeling');
        modeling.updateLabel(element, name);
      }
    },
    /**
     * 修改节点颜色
     * this.changeNodeColor(id,{
     *     fill: "red",
     *     stroke: "yellow"
     * });
     */
    changeNodeColor(id, color) {
      let elementRegistry = this.modeler.get('elementRegistry');
      let element = elementRegistry.get(id);
      if (element) {
        let modeling = this.modeler.get('modeling');
        modeling.setColor(element, color);
      }
    },
    /**
     * 创建新的工作流
     */
    createNewDiagram() {
      let id = 'Process_' + generateShortUUID();
      let diagramXML =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">\n' +
        '  <bpmn2:process id="' +
        id +
        '" isExecutable="true">\n' +
        '    <bpmn2:startEvent id="StartEvent_1"/>\n' +
        '  </bpmn2:process>\n' +
        '  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n' +
        '    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="' +
        id +
        '">\n' +
        '      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">\n' +
        '        <dc:Bounds height="36.0" width="36.0" x="140.0" y="30.0"/>\n' +
        '      </bpmndi:BPMNShape>\n' +
        '    </bpmndi:BPMNPlane>\n' +
        '  </bpmndi:BPMNDiagram>\n' +
        '</bpmn2:definitions>';
      this.openDiagram(diagramXML);
      return id;
    },
    /**
     * 生成xml
     */
    async getXml() {
      let newXml;
      // this.modeler.saveXML({ format: true }, function(err, xml) {
      //   newXml = xml;
      // });
      try {
        const result = await this.modeler.saveXML({ format: true });
        const { xml } = result;
        newXml = xml;
      } catch (err) {}
      return newXml;
    },
    /**
     * 获得该事件id前的所有任务节点
     */
    getBeforeTaskNodes(taskId) {
      this.beforeNodeIdsArr = [];
      let sequenceList = [];
      let elementRegistry = this.modeler.get('elementRegistry');
      let elements = elementRegistry._elements;
      let elementsKey = Object.keys(elements);
      for (let i = 0; i < elementsKey.length; i++) {
        let element = elements[elementsKey[i]].element;
        if (is(element, 'bpmn:SequenceFlow')) {
          sequenceList.push({
            id: element.id,
            target: element.target.id,
            source: element.source.id,
          });
        }
      }
      this.getRtnNodeIds([taskId], sequenceList);
      return this.beforeNodeIdsArr;
    },
    getRtnNodeIds(ids, list) {
      let arr = this.getBeforeNodeIds(ids, list);
      if (arr.length) {
        this.beforeNodeIdsArr = Array.from(new Set(this.beforeNodeIdsArr.concat(arr)));
        this.getRtnNodeIds(arr, list);
      }
    },
    getBeforeNodeIds(arr, list) {
      let rtnArr = [];
      if (arr.length) {
        for (let i = 0; i < arr.length; i++) {
          rtnArr = rtnArr.concat(this.haveBeforeNodeIds(arr[i], list));
        }
      }
      return Array.from(new Set(rtnArr));
    },
    haveBeforeNodeIds(id, list) {
      let arr = [];
      for (let i = 0; i < list.length; i++) {
        if (id === list[i].target) {
          arr.push(list[i].source);
        }
      }
      return arr;
    },
    /**
     * 获得该事件id前的所有节点
     */
    getBeforeNodes(elementId) {
      let ids = this.getLastNode(elementId);
      if (ids && ids.length > 0) {
        for (let i = 0; i < ids.length; i++) {
          let beforeIds = this.getBeforeNodes(ids[i]);
          if (beforeIds && beforeIds.length > 0) {
            ids = ids.concat(beforeIds);
          }
        }
        // 去掉重复
        ids = this.unique(ids);
      }
      return ids;
    },
    /**
     * 获得节点元素的上一个节点列表
     * @param elementId
     */
    getLastNode(elementId) {
      return this.getSequenceList()
        .filter(sequence => elementId === sequence.target)
        .map(sequence => sequence.source);
    },
    /**
     * 获得所有上下链接信息
     */
    getSequenceList() {
      return this.modeler
        .get('elementRegistry')
        .getAll()
        .filter(element => is(element, 'bpmn:SequenceFlow'))
        .map(element => {
          return {
            id: element.id,
            target: element.target.id,
            source: element.source.id,
          };
        });
    },
    /**
     * id去重
     */
    unique(list) {
      // 一个新的临时数组
      let newArr = [];
      for (let i = 0, len = list.length; i < len; i++) {
        if (newArr.indexOf(list[i]) === -1) {
          // 如果当前数组的第i已经保存进了临时数组，那么跳过,否则把当前项push到临时数组里面
          newArr.push(list[i]);
        }
      }
      return newArr;
    },
    /**
     * 通过节点Id获得节点名称
     */
    getTaskNameById(id) {
      let elementRegistry = this.modeler.get('elementRegistry');
      let element = elementRegistry.get(id);
      return getBusinessObject(element).name;
    },
    /**
     * 验证流程节点
     */
    validata(error) {
      // 获得结束节点
      let startEventList = this.getEventList('bpmn:StartEvent');
      if (!startEventList || startEventList.length === 0) {
        error('流程没有开始事件');
        return false;
      }
      if (startEventList.length > 1) {
        error('流程不能有多个开始事件');
        return false;
      }
      let endEventList = this.getEventList('bpmn:EndEvent');
      if (!endEventList || endEventList.length === 0) {
        error('流程没有结束事件');
        return false;
      }
      if (endEventList.length > 1) {
        error('流程不能有多个结束事件');
        return false;
      }
      /* let endId = endEventList[0];
      //获得结束节点上所有节点
      //判断其中是否有开始节点
      let elementRegistry = this.modeler.get("elementRegistry");
      let startList = this.getBeforeNodes(endId).filter(id => {
        let element = elementRegistry.get(id);
        return is(element, "bpmn:StartEvent");
      });
      if (!startList || startList.length === 0) {
        error("流程缺失");
        return false;
      }*/
      return true;
    },
    /**
     * 获得结束节点
     */
    getEventList(type) {
      return this.modeler
        .get('elementRegistry')
        .getAll()
        .filter(element => is(element, type))
        .map(element => {
          return element.id;
        });
    },
    fitViewport() {
      if (this.canvas) {
        this.scale = this.canvas.zoom(0.9, null);
      }
    },
    zoomIn() {
      if (this.canvas) {
        this.scale = this.canvas.zoom(this.scale * this.scaleCoefficient);
      }
    },
    zoomOut() {
      if (this.canvas) {
        this.scale = this.canvas.zoom(this.scale / this.scaleCoefficient);
      }
    },
    fn(arr, name, num) {
      if (arr.includes(`${name}00${num}`)) {
        num++;
        this.fn(arr, name, num);
      } else {
        this.num = num;
      }
    },
  },
  mounted() {
    this.container = this.$refs.content;
    this.modeler = new BpmnModeler({
      additionalModules: CustomModule,
      container: this.container,
      width: '100%',
      height: '100%',
      // 暂时关闭 add by donghm 2020-12-21
      keyboard: {
        bindTo: document,
      },
    });

    const eventBus = this.modeler.get('eventBus');
    const overlays = this.modeler.get('overlays');
    // 节点名称的更新
    const modeling = this.modeler.get('modeling');
    eventBus.on('copyPaste.copyElement', e => {
      this.$emit('ctrl-c', e);
    });

    // v
    eventBus.on('copyPaste.pasteElement', e => {
      this.ctrlyKey = 'buffer-ctrl-v';
      if (!e.descriptor.name) {
        this.bpmnPaste = 'ctrl-v';
        return;
      }
      let modeler = this.modeler.get('elementRegistry').getAll();
      let bpmnModelerArr = [];
      modeler.forEach(element => {
        if (element.type === 'bpmn:UserTask') {
          bpmnModelerArr.push(element.businessObject.name);
        }
      });
      this.num = 2;
      let name = e.descriptor.name || '';
      if (bpmnModelerArr.includes(name + '001')) {
        this.fn(bpmnModelerArr, name, this.num);
        if (100 < this.num && this.num < 1000) {
          this.num = '0' + this.num;
        } else if (this.num < 100) {
          this.num = '00' + this.num;
        }
        e.descriptor.businessObject.name = name + this.num;
      } else {
        e.descriptor.businessObject.name = name + '001';
      }
      this.bpmnPaste = 'ctrl-v';
    });
    // z
    eventBus.on('commandStack.shape.create.reverted', e => {
      this.getBpmnShapeAll();
      this.$emit('ctrl-z', e);
    });

    document.onkeydown = e => {
      var evtobj = window.event ? event : e;
      if (evtobj.keyCode === 89 && (evtobj.ctrlKey || evtobj.metaKey)) {
        let modeler = this.modeler.get('elementRegistry').getAll();
        let bpmnModelerArrKey = {};
        let sum = 0;
        let ctrlY;
        modeler.forEach((element, idx) => {
          if (element.type === 'bpmn:UserTask') {
            sum += parseInt(idx);
            bpmnModelerArrKey[idx] = element;
          }
        });
        bpmnModelerArrKey.sum = sum;
        if (this.bpmnModelerArr.sum < bpmnModelerArrKey.sum) {
          ctrlY = bpmnModelerArrKey[bpmnModelerArrKey.sum - this.bpmnModelerArr.sum];
        }
        this.bpmnModelerArr = bpmnModelerArrKey;
        if (ctrlY) {
          this.$emit('ctrl-y', ctrlY);
        }
      }
    };
    eventBus.on('element.hover', e => {
      if (e && e.element !== undefined && e.element.type === 'bpmn:UserTask' && e.element.businessObject.name !== undefined) {
        let tipText = e.element.businessObject.name;
        if (tipText.length >= 10) {
          const $overlayHtml = ' <div class="tipBox">' + tipText + '</div>';
          e.element.overlayId = overlays.add(e.element.id, {
            position: { top: e.element.height, left: 0 },
            html: $overlayHtml,
          });
        }
      }
    });
    eventBus.on('element.out', e => {
      if (e && e.element !== undefined && e.element.type === 'bpmn:UserTask' && e.element.businessObject.name !== undefined) {
        if (!e.element || !e.element.overlayId) return;
        overlays.remove(e.element.overlayId);
      }
    });

    this.canvas = this.modeler.get('canvas');
    this.scale = this.canvas.zoom('fit-viewport');
    this.listenTaskSelect();
    this.listenTaskRemove();
    this.listenTaskAdd();
  },
};
</script>

<style lang="scss">
@import '~diagram-js/assets/diagram-js.css';
@import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

.containers {
  background-color: #ffffff;
  width: 100%;
  height: 100%;
}

.bjs-container {
  border: solid 0px #ccc;
}
.bjs-powered-by {
  display: none;
}
.custom-bpmn .toolbar {
  position: absolute;
  right: 50px;
  top: 10px;
  z-index: 10;
  button i {
    font-size: 30px;
  }
}
.tipBox {
  min-width: 200px;
  max-width: 500px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #666666;
  padding: 12px;
}
</style>
