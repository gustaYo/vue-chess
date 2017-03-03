<template>

  <div class="col s12 m12 l12 ">

    <ul class="history-board" style="height: 50vh;overflow: auto">
      <li v-for="move in history" @click="moveToHistory($index)" class="col s6 m6 l6" style="padding: 0 0 !important"
          v-bind:class="[select === $index ? 'item-select' : '']">
        <span>
          <label v-if="$index % 2 ===0">{{ ($index/2)+1 }}.</label>
          <img alt="" v-bind:src="urlPiece(move)" height="25" width="25"><label>{{ move.from }}>{{ move.to }} {{ move.san }}</label>
        </span>
      </li>
    </ul>
    <div class="col s12 m12 l12" v-show="!active">
      <md-button class="waves-effect waves-light col s2 m2 l2" @click="moveToHistory(select - 1)">
        <<
      </md-button>
      <md-button class="waves-effect waves-light col s3 m3 l3" @click="play()">
        {{ [played ? '||' : '>'] }}
      </md-button>
      <md-button class="waves-effect waves-light col s2 m2 l2" @click="moveToHistory(select + 1)">
        >>
      </md-button>
      <label class="col s1 m1 l1">{{velo}}</label>
      <input v-model="velo" type=range min=0 max=5 step=1 class="col s4 m4 l4">
    </div>
  </div>

</template>

<script>
var playEvent = 1
export default {
  name: 'BoardHistory',
  props: {
    history: {
      type: Array
    },
    active: {
      type: Boolean,
      required: false,
      'default': false
    },
    humanvspc: {
      type: Function,
      required: false,
      'default': function () {
        return false
      }
    }
  },
  data () {
    return {
      velo: 2,
      select: -1,
      played: false
    }
  },
  methods: {
    urlPiece (move) {
      return '/static/images/pieces/merida/' + move.color + move.piece.toUpperCase() + '.svg'
    },
    moveToHistory (index) {
      if (index < 0 || index > this.history.length - 1) {
        clearInterval(playEvent)
        this.played = false
        return
      }
      this.select = index
      var pgnReturn = ''
      var jugada = 0
      for (var i = 0; i <= index; i++) {
        if (i % 2 === 0) {
          jugada++
          pgnReturn += jugada + '. '
        }
        pgnReturn += this.history[i].san + ' '
      }
      if (!this.active) {
        this.$dispatch('move', {pgn: pgnReturn})
        return
      }
      if (this.humanvspc()) {
        this.$dispatch('move', {pgn: pgnReturn})
        return
      }
    },
    play () {
      this.played = !this.played
      if (this.played) {
        playEvent = setInterval(function () {
          this.moveToHistory(this.select + 1)
        }.bind(this), parseInt(this.velo) * 1000)
      } else {
        clearInterval(playEvent)
      }
    }
  },
  watch: {
    velo (newVal, oldVal) {
      clearInterval(playEvent)
      this.played = false
      this.play()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

ul.history-board li:hover{
    background-color: #B9D4CB;
}
.historyMove {
  width: 50%;
  float: left
}

 .item-select {
    background-color: #5f6b44;;
  }

</style>