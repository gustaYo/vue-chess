import Chart from './components/chart'

function install (Vue, options = {}) {
  Vue.component('vue-chart', Chart)
}

export default install
