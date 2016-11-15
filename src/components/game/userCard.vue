<template>
  <div class="col s12 m12 l12 card-panel" v-bind:class="[turn === color ? 'userTurn' : '']">
    <div  class="col s4 m4 l3">
      <h4 class="flat-text-header">{{ time[color] | boardTime }}</h4>
    </div>
    <div  class="col s4 m4 l6">
     <p class="flat-text-header" style="float: right">{{ username }}</p>     
   </div>
   <div  class="col s4 m4 l3">
    <img alt="" src="../../assets/50x50defaultAvatar.png" class="avatar avatar-50 photo avatar-default" height="50" width="50">
  </div>
</div>
</template>

<script>
import { getGameTurn, getGameTimesUsers } from '../../vuex/getters'
export default {
  name: 'userCard',
  props: {
    color: {
      type: String
    },
    username: {
      type: String
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