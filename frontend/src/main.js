import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import Loading from './components/lib/loading';
import CenterContainer from './components/lib/center-container';
import locale from 'element-ui/lib/locale/lang/en'

Vue.use(ElementUI, { locale })
Vue.use(ElementUI);

Vue.component('loading', Loading);
Vue.component('center-container', CenterContainer);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
