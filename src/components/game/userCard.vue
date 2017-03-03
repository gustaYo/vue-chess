<template>
  <div class="col s12 m12 l12 card-panel" v-bind:class="[turn === color ? 'userTurn' : '']">
    <div class="col s4 m4 l3">
      <h4 class="flat-text-header">{{ time[color] | boardTime }}</h4>
    </div>
    <div class="col s4 m4 l6">
      <p class="flat-text-header" style="float: right">{{ username.username || 'PC'}}</p>
    </div>
    <div class="col s4 m4 l3" v-show="username.image">
      <img alt="" v-bind:src="imageUrl(username.image)" class="avatar avatar-50 photo avatar-default circle" height="60"
           width="60">
    </div>
  </div>
</template>

<script>
import Store from '../../services/lstorage'
import { getGameTurn, getGameTimesUsers } from '../../vuex/getters'
export default {
  name: 'userCard',
  props: {
    color: {
      type: String
    },
    username: {
      type: Object
    }
  },
  vuex: {
    getters: {
      turn: getGameTurn,
      time: getGameTimesUsers
    }
  },
  methods: {
    pad (n, lenght) {
      return ('0' + n).slice(lenght)
    },
    imageUrl (name) {
      return Store.get('serverDir') + '/uploads/' + name
    }
  },
  filters: {
    boardTime (s) {
      var min = parseInt(s / 60)
      var segs = s % 60
      return this.pad(min, -2) + ':' + this.pad(segs, -2)
    }
  },
  watch: {},
  created () {}
}
</script>