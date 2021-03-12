<template>
  <div class="box">
    <bpmn-editor ref="bpmn" @select-task="selectTask" @ctrl-v="ctrlV" @ctrl-c="ctrlC" @ctrl-z="ctrlZ" @ctrl-y="ctrlY" @add-task="addTask" @remove-task="removeTask"></bpmn-editor>
    <ul class="ul">
      <li><button @click="zoomOut">缩小</button></li>
      <li><button @click="zoomIn">放大</button></li>
      <li><button @click="fitViewport">复原</button></li>
    </ul>
  </div>
</template>

<script>
import data from './xml';
export default {
  name: 'app',
  data() {
    return {
      data: {},
    };
  },
  mounted() {
    this.data = data;
    this.$refs.bpmn.openDiagram(data.str);
    this.$refs.bpmn.fitViewport();
  },
  methods: {
    /**
     * 修改节点颜色
     * 传入参数要修改的节点id、改变的颜色
     */
    changeNodeColor(id, color) {
      this.$refs.bpmn.getTaskNameById(id, color);
    },
    /**
     * 通过节点Id获得节点名称
     * 传入节点id
     */
    getTaskNameById(id) {
      this.$refs.bpmn.getTaskNameById(id);
    },
    /**
     * 节点回复到初始位置
     */
    fitViewport() {
      this.$refs.bpmn.fitViewport();
    },
    /**
     * 放大
     */
    zoomIn() {
      this.$refs.bpmn.zoomIn();
    },
    /**
     * 缩小
     */
    zoomOut() {
      this.$refs.bpmn.zoomOut();
    },
    /**
     * 监听节点变化，当点击节点，节点发送改变时触发
     * 返回数据，当前节点的ID
     */
    selectTask(bpm) {
      console.log(bpm, '点击');
    },
    /**
     * ctrlv 事件触发
     * 返回当前节点的数据信息
     */
    ctrlV(bpm) {
      console.log(bpm, 'v');
    },
    /**
     * ctrlz 事件触发
     * 返回当前节点的数据信息
     */
    ctrlZ(bpm) {
      console.log(bpm, 'z');
    },
    /**
     * ctrlc 事件触发
     * 返回当前节点的数据信息
     */
    ctrlC(bpm) {
      console.log(bpm, 'c');
    },
    /**
     * ctrly 事件触发
     * 返回当前节点的数据信息
     */
    ctrlY(bpm) {
      console.log(bpm, 'y');
    },
    /**
     * 添加节点时触发
     * 返回当前添加的节点ID
     */
    addTask(bpm) {
      console.log(bpm, '添加');
    },
    /**
     * 删除节点时触发
     * 返回当前删除的节点ID
     */
    removeTask(bpm) {
      console.log(bpm, '删除');
    },
  },
};
</script>

<style>
.box {
  width: 100%;
  height: 500px;
}
.custom-bpmn {
  height: 500px;
}
.ul {
  position: absolute;
  top: 20px;
  right: 500px;
}
.ul > li {
  margin-bottom: 10px;
}
</style>
