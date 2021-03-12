import Vue from 'vue';
import App from './App.vue';
import BpmnEditor from '../index.js';
Vue.use(BpmnEditor);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
