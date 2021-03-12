# bpmn-edit

## 下载

```js
 npm install @99cloud/bpmn-editor --save
```

## 该组件有 13 个传出方法，7 个调用方法。

```js
  <bpmn-editor
    ref="bpmn"
    @select-task="selectTask"
    @ctrl-v="ctrlV"
    @ctrl-c="ctrlC"
    @ctrl-z="ctrlZ"
    @ctrl-y="ctrlY"
    @add-task="addTask"
    @remove-task="removeTask"
  ></bpmn-edior>
```

### 13 个调用方法：

```js
  /**
   * 获取bpmn文件内的高度和宽度
   * 传入参数：xml
   */
  getBpmnStyle(xml) {
    this.$refs.bpmn.getBpmnStyle(xml)
  },
  /**
   * 通过类型获得节点
   * 传入参数：类型
   */
  getEventList(type) {
    this.$refs.bpmn.getEventList(type)
  },
  /**
   * 获得所有上下链接信息
   */
  getSequenceList() {
    this.$refs.bpmn.getSequenceList()
  },
  /**
   * 获得该事件id前的所有任务节点
   * 传入参数：节点id
   */
  getBeforeTaskNodes(id) {
    this.$refs.bpmn.getBeforeTaskNodes(id)
  },
  /**
   * 获得该事件id前的所有节点
   * 传入参数：节点id
   */
  getBeforeNodes(id) {
    this.$refs.bpmn.getBeforeNodes(id)
  },
  /**
   * 获得节点元素的上一个节点列表
   * 传入参数：节点id
   */
  getLastNode(id) {
    this.$refs.bpmn.getLastNode(id)
  },
  /**
   * 获取所有bpmn流程图所有信息，包括线，节点，开始结束事件等等。
   */
  getAllbpmn(){
    let obj = this.$refs.bpmn.getAllbpmn()
  }
  /**
   * 验证流程节点
   * 当流程没有开始事件、有多个开始事件、没有结束事件、有多个结束事件时,返回false，
   * 如果没有以上情况返回true
   */
  validata(){
    let Bol = this.$refs.bpmn.validata()
  }
  /**
   * 修改节点颜色
   * 传入参数要修改的节点id、改变的颜色
   */
  changeNodeColor(id, color) {
    this.$refs.bpmn.getTaskNameById(id, {
      stroke:'red'
    })
  },
  /**
   * 通过节点Id获得节点名称
   * 传入节点id
   */
  getTaskNameById(id) {
    this.$refs.bpmn.getTaskNameById(id)
  },
  /**
   * 节点回复到初始位置
   */
  fitViewport() {
    this.$refs.bpmn.fitViewport()
  },
  /**
   * 放大
   */
  zoomIn() {
    this.$refs.bpmn.zoomIn()
  },
  /**
   * 缩小
   */
  zoomOut() {
    this.$refs.bpmn.zoomOut()
  },
```

### 7 个组件传出方法：

```js
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
```
