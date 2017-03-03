<template>
    <div>
        <div class="progress" v-show="$loadingRouteData">
            <div :class="{determinate: value != null, indeterminate: value == null}" :style="computedStyle"></div>
        </div>
        <div class="row" v-if="!$loadingRouteData">
            <div class="col s6 m6">
                <md-card class="blue-grey darken-1" content-class="white-text">
        <span slot="title">
         {{ $t("account.activity.vsPC") }}
       </span>
                    <table>
                        <thead>
                        <tr>
                            <th>

                            </th>
                            <th>
                                {{ $t("account.activity.wins") }}
                            </th>
                            <th>
                                {{ $t("account.activity.draws") }}
                            </th>
                            <th>
                                {{ $t("account.activity.losses") }}
                            </th>
                            <th>
                                Total
                            </th>
                        </tr>

                        </thead>
                        <tr>
                            <td>
                                Blancas
                            </td>
                            <td>
                                {{statsUser.whitevsPC || 0}}
                            </td>
                            <td>
                                {{statsUser.totalWhitevsPC - ((statsUser.whitevsPC || 0)+(statsUser.totalWhitevsPC -
                                (statsUser.whitevsPC || 0)))}}
                            </td>
                            <td>
                                {{statsUser.totalWhitevsPC - (statsUser.whitevsPC || 0)}}
                            </td>
                            <td>
                                {{statsUser.totalWhitevsPC}}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Negras
                            </td>
                            <td>
                                {{statsUser.blackvsPC || 0}}
                            </td>
                            <td>
                                {{(statsUser.totalvsPC - statsUser.totalWhitevsPC)-((statsUser.blackvsPC ||
                                0)+(statsUser.totalvsPC - statsUser.totalWhitevsPC)- (statsUser.blackvsPC || 0))}}
                            </td>
                            <td>
                                {{(statsUser.totalvsPC - statsUser.totalWhitevsPC)- (statsUser.blackvsPC || 0)}}
                            </td>
                            <td>
                                {{statsUser.totalvsPC - statsUser.totalWhitevsPC}}
                            </td>
                        </tr>
                        <tfoot style="background-color: #5f6161;border-top-style: groove;">
                        <th>
                            Totales
                        </th>
                        <th>
                            {{(statsUser.blackvsPC || 0) + (statsUser.whitevsPC || 0)}}
                        </th>
                        <th>
                            {{(statsUser.totalWhitevsPC - ((statsUser.whitevsPC || 0)+(statsUser.totalWhitevsPC -
                            (statsUser.whitevsPC || 0))))+(statsUser.totalvsPC -
                            statsUser.totalWhitevsPC)-((statsUser.blackvsPC || 0)+(statsUser.totalvsPC -
                            statsUser.totalWhitevsPC)- (statsUser.blackvsPC || 0))}}
                        </th>
                        <th>
                            {{(statsUser.totalWhitevsPC - (statsUser.whitevsPC || 0))+(statsUser.totalvsPC -
                            statsUser.totalWhitevsPC)- (statsUser.blackvsPC || 0)}}
                        </th>
                        <th>
                            {{statsUser.totalvsPC}}
                        </th>
                        </tfoot>
                    </table>

                </md-card>
            </div>
            <div class="col s6 m6">
                <md-card class="blue-grey darken-1" content-class="white-text">
 <span slot="title">
   {{ $t("account.activity.vsOtherUser") }}
 </span>
                    <table>
                        <thead>
                        <tr>
                            <th>

                            </th>
                            <th>
                                {{ $t("account.activity.wins") }}
                            </th>
                            <th>
                                {{ $t("account.activity.draws") }}
                            </th>
                            <th>
                                {{ $t("account.activity.losses") }}
                            </th>
                            <th>
                                Total
                            </th>
                        </tr>

                        </thead>
                        <tr>
                            <td>
                                Blancas
                            </td>
                            <td>
                                {{statsUser.whitevsOthersUsers || 0}}
                            </td>
                            <td>
                                {{statsUser.totalWhitevsOthersUsers - ((statsUser.whitevsOthersUsers || 0) +
                                (statsUser.totalWhitevsOthersUsers - (statsUser.whitevsOthersUsers || 0)))}}
                            </td>
                            <td>
                                {{statsUser.totalWhitevsOthersUsers - (statsUser.whitevsOthersUsers || 0)}}
                            </td>
                            <td>
                                {{statsUser.totalWhitevsOthersUsers}}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Negras
                            </td>
                            <td>
                                {{statsUser.blackvsOthersUsers || 0}}
                            </td>
                            <td>
                                {{(statsUser.totalvsOthersUsers -
                                statsUser.totalWhitevsOthersUsers)-(((statsUser.totalvsOthersUsers -
                                statsUser.totalWhitevsOthersUsers)-statsUser.blackvsOthersUsers)+(statsUser.blackvsOthersUsers
                                || 0))}}
                            </td>
                            <td>
                                {{(statsUser.totalvsOthersUsers -
                                statsUser.totalWhitevsOthersUsers)-statsUser.blackvsOthersUsers}}
                            </td>
                            <td>
                                {{statsUser.totalvsOthersUsers - statsUser.totalWhitevsOthersUsers}}
                            </td>
                        </tr>
                        <tfoot style="background-color: #5f6161;border-top-style: groove;">
                        <th>
                            Totales
                        </th>
                        <th>
                            {{(statsUser.blackvsOthersUsers || 0) + (statsUser.whitevsOthersUsers || 0)}}
                        </th>
                        <th>
                            {{((statsUser.totalvsOthersUsers -
                            statsUser.totalWhitevsOthersUsers)-(((statsUser.totalvsOthersUsers -
                            statsUser.totalWhitevsOthersUsers)-statsUser.blackvsOthersUsers)+(statsUser.blackvsOthersUsers
                            || 0)))+ (statsUser.totalWhitevsOthersUsers - ((statsUser.whitevsOthersUsers || 0) +
                            (statsUser.totalWhitevsOthersUsers - (statsUser.whitevsOthersUsers || 0))))}}
                        </th>
                        <th>
                            {{((statsUser.totalvsOthersUsers -
                            statsUser.totalWhitevsOthersUsers)-statsUser.blackvsOthersUsers)+(statsUser.totalWhitevsOthersUsers
                            - (statsUser.whitevsOthersUsers || 0))}}
                        </th>
                        <th>
                            {{statsUser.totalvsOthersUsers}}
                        </th>
                        </tfoot>
                    </table>

                </md-card>
            </div>
            <div class="row demo">
                <div class="col s12">
                    <md-radio-group group="size">
                        <md-radio :value.sync="activeSet" :radio-value="$key" class="with-gap" v-for="stat in statSets">
                            {{$key}}
                        </md-radio>
                    </md-radio-group>
                </div>
            </div>
            <div class="col s12 m12 card-panel">

                <vue-chart
                        keep-alive
                        :chart-type="chartType"
                        :columns="columns"
                        :rows="rows"
                        :options="options"
                >
                </vue-chart>
            </div>

        </div>

    </div>
</template>


<script>
import UserService from '../../../services/user'
import BoardService from '../../../services/board'
import Storage from '../../../services/lstorage'
import PersonalData from './personalData'
import _ from 'lodash'
export default {
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') ? true : transition.redirect('user/loguin')
    },
    data (transition) {
      return Promise.all([
        BoardService.stats(this, {user: this.user.username})
      ]).then(function (data) {
        return {
          statsUser: data[0].data,
          datachart: []
        }
      })
    }
  },
  data () {
    return {
      statsUser: {},
      user: UserService.user,
      datachart: [],
      chartType: 'LineChart',
      statSets: {
        vtotal: {
          rows: ['date', 'vtotal', 'vunique'],
          columns: [
            {
              'type': 'date',
              'label': 'Fecha'
            },
            {
              'type': 'number',
              'label': 'Visitas totales'
            },
            {
              'type': 'number',
              'label': 'Visitas únicas'
            }
          ]
        },
        fgames: {
          rows: ['date', 'gtotal', 'gwins', 'glost', 'gtired'],
          columns: [
            {
              'type': 'date',
              'label': 'Fecha'
            },
            {
              'type': 'number',
              'label': 'Jugados'
            },
            {
              'type': 'number',
              'label': 'Ganados'
            },
            {
              'type': 'number',
              'label': 'Perdidos'
            },
            {
              'type': 'number',
              'label': 'Rendido'
            }
          ]
        }
      },
      activeSet: 'vtotal',
      options: {
        chart: {
          title: 'Chart Title',
          subtitle: 'Subtitle'
        },
        hAxis: {title: 'Fecha'},
        vAxis: {title: 'num'},
        height: 500,
        animation: {
          duration: 500,
          easing: 'out'
        }
      }
    }
  },
  computed: {
    rows () {
      var statKeys = this.statSets[this.activeSet].rows
      return _
        .chain(this.datachart)
        .mapValues(function (stat) {
          var picked = _.pick(stat, statKeys)
          picked['date'] = new Date(picked['date'])
          return _.values(picked)
        })
      .toArray()
      .value()
    },
    columns () {
      return this.statSets[this.activeSet].columns
    }
  },
  components: {
    PersonalData
  },
  created () {
    window.localStorage.setItem('Vuecharts-serverRun', Storage.get('serverDir'))
  }
}
</script>