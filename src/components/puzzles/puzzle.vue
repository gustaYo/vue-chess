
<template>
  <div class="col s12">
    <div class="col s12 m12 l9" style="padding: 0 0 ">
      <div id='puzzleBoard' style="width: 100%;height: 500px;" class="wood chessground vuejs cburnett"></div>
    </div>
    <div class="col s12 m12 l3" style="text-align: center" v-show="puzzle.createby">
      <md-card class=" darken-1">
        <h5 class="flat-text-header hello">{{ $t("puzzles.createBy") }} </h5>
        {{puzzle.createby}}
        <h5 class="flat-text-header hello">{{ $t("puzzles.date") }}</h5>
        {{puzzle.created | moment 'MMMM Do YYYY, h:mm:ss a'}}
        <h5 class="flat-text-header hello">{{ $t("puzzles.played") }}</h5>
        {{ $t("puzzles.color."+turn) }}
        <h6 class="flat-text-header hello">{{ $t("puzzles.movs") }}</h6>
        {{numMoves}}
        <div v-if="mate && numMoves===0">
          <span>
            <h3>{{ $t("puzzles.wins") }}</h3>      
          </span>
          <a class="btn waves-effect waves-light col s12 m12 l12"
             @click="nextPuzzle()"
          >
            Siguiente
          </a>
        </div>
        <div v-if="!mate && numMoves===0">
          <h3>{{ $t("puzzles.lost") }}</h3>
          <a class="btn waves-effect waves-light col s12 m12 l12"
             @click="reintent()"
          >
            {{ $t("puzzles.reintent") }}
          </a>
        </div>
        <div slot="actions">
          <a>Intentos {{puzzle.corrects}}/{{puzzle.intents}}</a>
        </div>
      </md-card>
    </div>
  </div>
</template>


<script>
import Chessground from 'chessground'
import Chess from 'chess.js'
import Garbochess from '../../services/garbochess.js'
import PuzzleService from '../../services/puzzle'
export default {
  name: 'puzzleChess',
  props: {
    puzzle: {
      type: Object
    },
    nextPuzzle: {
      type: Function,
      required: false,
      'default': function () {
        return false
      }
    }
  },
  data () {
    return {
      mate: false,
      numMoves: 1000,
      userColor: 'white',
      ground: 1,
      turn: 'white',
      chess: new Chess()
    }
  },
  methods: {
    chessToDests (chess) {
      var dests = {}
      chess.SQUARES.forEach(function (s) {
        var ms = chess.moves({square: s, verbose: true})
        if (ms.length) dests[s] = ms.map(function (m) { return m.to })
      })
      return dests
    },
    resolvePuzzle (parms) {
      PuzzleService.resolve(this, parms).then(function (response) {
        // window.alert('bien')
      }, function (response) {
        // window.alert('mal')
      })
    },
    chessToColor (chess) {
      var t = chess.turn()
      var turn = (t === 'w') ? 'white' : 'black'
      this.turn = turn
      return turn
    },
    onMove (orig, dest) {
      this.numMoves --
      this.chess.move({
        from: orig,
        to: dest,
        promotion: 'q'
      })
      this.ground.move(orig, dest)
      this.ground.set({
        fen: this.chess.fen(),
        turnColor: this.chessToColor(this.chess),
        movable: {
          color: this.chessToColor(this.chess),
          dests: this.chessToDests(this.chess)
        }
      })
      if (this.numMoves <= 0) {
        if (this.puzzle.type === 'FindFork' || this.puzzle.type === 'TakePiece') {
          // verificar que fen actual es la esperada
          // console.log(this.puzzle.fenfinish, this.ground.getFen())
          this.mate = this.puzzle.fenfinish === this.ground.getFen()
        } else {
          this.mate = this.isFinish(this.chess)
        }
        this.ground.stop()
        this.resolvePuzzle({_id: this.puzzle._id, resolve: this.mate ? 1 : 0})
      } else {
        this.movePC(this.turn)
      }
    },
    PcIngeniesMove (move) {
      var from = move & 0xFF
      var to = (move >> 8) & 0xFF
      var sfrom = Garbochess.FormatSquare(from)
      var sto = Garbochess.FormatSquare(to)
      this.onMove(sfrom, sto)
    },
    movePC (turn) {
      if (turn !== this.userColor) {
        setTimeout(function () {
          this.pcMove(this.chess.fen())
        }.bind(this), 700)
      }
    },
    pcMove (fen) {
      if (this.puzzle._id) {
        // use chess moves
        this.makeRandomMove()
      } else {
        // use garbochess ingenie (dando problemas con los flags)
        Garbochess.InitializeFromFen(fen)
        Garbochess.Search(this.PcIngeniesMove, 5, null)
      }
    },
    makeRandomMove () {
      var possibleMoves = this.chess.moves({
        verbose: true
      })
      var randomIndex = Math.floor(Math.random() * possibleMoves.length)
      var move = possibleMoves[randomIndex]
      var from = move.from
      var to = move.to
      this.onMove(from, to)
    },
    loadPuzzle (fen) {
      this.numMoves = (parseInt(this.puzzle.nummoves) * 2) - 1
      if (fen) {
        this.chess.load(fen + ' ' + 'w KQ - 21 20')
        this.ground.set({
          fen: this.chess.fen(),
          turnColor: this.chessToColor(this.chess),
          movable: {
            color: this.chessToColor(this.chess),
            dests: this.chessToDests(this.chess)
          }
        })
        this.movePC(this.turn)
      }
    },
    isFinish (chess) {
      return chess.game_over()
    },
    reintent () {
      this.mate = false
      this.loadPuzzle(this.puzzle.feninit)
    }
  },
  created () {
    Garbochess.ResetGame()
    var options = {
      orientation: 'white',
      movable: {
        free: false,
        color: 'both',
        dests: this.chessToDests(this.chess),
        dropOff: 'revert',
        showDests: true,
        events: {
          after: this.onMove
        }
      }
    }
    setTimeout(function () {
      this.ground = Chessground(document.getElementById('puzzleBoard'), options)
      var Width = document.getElementById('puzzleBoard').clientWidth
      document.getElementById('puzzleBoard').style.height = Width + 'px'
      document.getElementById('puzzleBoard').style.width = Width + 'px'
      // getFromLocalStorage
      console.log('cargando board')
      this.loadPuzzle()
    }.bind(this), 10)
  },
  watch: {
    puzzle (newVal, oldVal) {
      this.loadPuzzle(newVal.feninit)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #42b983;
}
</style>