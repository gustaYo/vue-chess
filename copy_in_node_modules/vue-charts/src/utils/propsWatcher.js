import _ from 'lodash'

export function propsWatcher (vue, props) {
  /*
    Watch our props. Every time they change, redraw the chart.
   */
  _.each(props, ({type: type}, attribute) => {
    vue.$watch(attribute, () => {
      vue.drawChart()
    }, {
      deep: _.isObject(type)
    })
  })
}

export default propsWatcher
