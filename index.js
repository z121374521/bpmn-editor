import BpmnEditor from './src/main';

// 单独使用组件时，Vue.use(BpmnEditor)触发install方法执行。
BpmnEditor.install = function(Vue) {
  // 全局注册Example组件
  Vue.component(BpmnEditor.name, BpmnEditor);
};

export default BpmnEditor;
