<template>
  <div class="col s12" v-cloak>
    <div class="col s12 m12 l6">
      <div class="col s12 m12 l12 card-panel">
        <div class="col s1 m1 l1">
          <img style="height: 80px; position: relative;"
               src="../../../static/images/pieces/staunton/basic/White-Knight-Flipped.png" alt="">
        </div>
        <div class="col s4 m4 l4" style="text-align: right;" v-bind:class="[turn === 'white' ? 'userTurn' : '']">
          <h5 class="flat-text-header">{{ boardShow.u1 }}</h5>
          <p class="flat-text-header">{{ times.white | timeBoard }}</p>
        </div>
        <div class="col s2 m2 l2" style="text-align: center;">
          <h5 class="flat-text-header" style="position: relative;
        top: 15px;">vs</h5>
        </div>
        <div class="col s4 m4 l4" style="text-align: left;" v-bind:class="[turn === 'black' ? 'userTurn' : '']">
          <h5 class="flat-text-header">{{ boardShow.u2 }}</h5>
          <p class="flat-text-header" style="float: center">{{ times.black | timeBoard}}</p>
        </div>
        <div class="col s1 m1 l1">
          <img style="height: 80px; left: -30px; position: relative;"
               src="../../../static/images/pieces/staunton/basic/Black-Knight-Flipped.png" alt="">
        </div>
      </div>
      <div class="col s12 m12 l12 " style="padding: 0 0 ">
        <div id='frontBoardVisor' style="width: 100%;height: 460px;" class="wood chessground vuejs cburnett"></div>
      </div>
    </div>
    <div class="col s12 m12 l6">
      <h5 class="flat-text-header" style="float: center" v-if="board.wins || result.wins !==''">{{ $t("visor.result")
        }} </h5>
      <label v-if="board.wins || result.wins !==''">
        {{ $t("visor.wins") }} {{ board.wins || result.wins }} {{ $t("visor.by") }} {{ board.motiv || result.motiv }}
      </label>
      <h5 class="flat-text-header" style="float: center">pgn</h5>
      {{ pgn }}
      <board-history :history="history"></board-history>

    </div>
  </div>
</template>

<script>
import Chess from 'chess.js'
import Chessground from 'chessground'
import Garbochess from '../../services/garbochess.js'
import BoardHistory from '../game/boardHistory'
var timesColor = {
  white: 1,
  black: 1
}
window.computerGame = 1
export default {
  name: 'BoardVisor',
  props: {
    board: {
      type: Object
    }
  },
  data () {
    return {
      result: {},
      boardShow: {},
      ground: 0,
      orientation: 'white',
      history: [],
      chess: new Chess(),
      turn: '',
      pgn: '',
      fen: '',
      times: {
        black: 60,
        white: 60
      },
      historyChange: true
    }
  },
  components: {
    BoardHistory
  },
  events: {
    move (board) {
      if (this.boardShow.wins && board.idBoard) {
        return
      }
      this.historyChange = false
      if (board.idBoard) {
        this.historyChange = true
      }
      this.changeStateGame(board)
      if (board.times) {
        this.times = board.times
      }
    },
    gameFinish (dataResult) {
      this.stateFinishGame(dataResult)
    }
  },
  methods: {
    stateFinishGame (state) {
      this.result = {
        wins: state.result.color,
        motiv: state.result.motiv
      }
      clearInterval(timesColor.black)
      clearInterval(timesColor.white)
    },
    changeStateGame (board) {
      this.pgn = board.pgn
      this.chess.load_pgn(board.pgn)
      // console.log(this.chess.undo())
      if (board.move) {
        this.ground.move(board.move.from, board.move.to)
      }
      this.ground.set({
        fen: this.chess.fen(),
        orientation: this.orientation
      })
      this.chessToColor(this.chess)
      if (this.historyChange) {
        this.history = this.chess.history({ verbose: true })
      }
    },
    countDown () {
      timesColor[this.turn] = setInterval(function () {
        this.times[this.turn] = this.times[this.turn] - 1
        if (this.times[this.turn] <= 0) {
          clearInterval(timesColor.white)
          clearInterval(timesColor.black)
          this.times[this.turn] = 0
        }
      }.bind(this), 1000)
    },
    chessToColor (chess) {
      var t = chess.turn()
      this.turn = (t === 'w') ? 'white' : 'black'
    },
    loadDataGame (board) {
      clearTimeout(window.computerGame)
      clearInterval(timesColor.white)
      clearInterval(timesColor.black)
      // cuando se esta visualizando un juego terminado
      if (board.wins) {
        // console.log('visualizando juego terminado')
        this.boardShow = board
        this.historyChange = true
        this.changeStateGame(board)
        return
      }
      var data = {
        c: 'board',
        f: 'getBoard',
        data: board
      }
      this.$socket.emit('event', data, function (...callbacks) {
        if (!callbacks[0]) {
          var board = callbacks[1].board
          this.boardShow = board
          this.times = callbacks[1].times
          this.historyChange = true
          this.changeStateGame(board)
          this.countDown()
        } else {
          this.boardShow = {
            u1: 'Computer1',
            u2: 'Computer2'
          }
          // console.log('pc VS pc')
          // this.pcVsPcInit()
        }
      }.bind(this))
    },
    FinishMoveCallback (move) {
      var from = move & 0xFF
      var to = (move >> 8) & 0xFF
      var sfrom = Garbochess.FormatSquare(from)
      var sto = Garbochess.FormatSquare(to)
      this.chess.move({
        from: sfrom,
        to: sto,
        promotion: 'q'
      })
      this.ground.move(sfrom, sto)
      var fen = this.chess.fen()
      var options = {
        orientation: 'white',
        fen: fen
      }
      this.ground.set(options)
      this.chessToColor(this.chess)
      if (this.$route.path === '/home') {
        if (!this.chess.game_over()) {
          window.computerGame = setTimeout(function () {
            this.timerfunction(fen)
          }.bind(this), 10000)
        } else {
          clearTimeout(window.computerGame)
        }
      }
    },
    timerfunction (fen) {
      Garbochess.InitializeFromFen(fen)
      Garbochess.Search(this.FinishMoveCallback, 5, null)
    },
    pcVsPcInit () {
      Garbochess.ResetGame()
      setTimeout(function () {
        var fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.timerfunction(fen)
      }.bind(this), 2000)
    }
  },
  watch: {
    board (newVal, oldVal) {
      this.loadDataGame(newVal)
      this.result = {
        wins: '',
        motiv: ''
      }
    },
    turn (newVal, oldVal) {
      clearInterval(timesColor[oldVal])
      clearInterval(timesColor[newVal])
      if (!this.boardShow.wins) {
        this.countDown()
      }
    }
  },
  created () {
    clearTimeout(window.computerGame)
    clearInterval(timesColor.white)
    clearInterval(timesColor.black)
    var options = {
      orientation: 'white',
      movable: {
        free: false, // all moves are valid - board editor
        color: 'both', // color that can move. "white" | "black" | "both" | null
        dests: {}, // valid moves. {a2: ["a3", "a4"], b1: ["a3", "c3"]} | null
        dropOff: 'revert', // when a piece is dropped outside the board. "revert" | "trash"
        showDests: true // add the move-dest class to squares
      }
    }
    setTimeout(function () {
      this.ground = Chessground(document.getElementById('frontBoardVisor'), options)
      var Width = document.getElementById('frontBoardVisor').clientWidth
      document.getElementById('frontBoardVisor').style.height = Width + 'px'
      document.getElementById('frontBoardVisor').style.width = Width + 'px'
      // getFromLocalStorage
      this.loadDataGame(this.board)
    }.bind(this), 10)
  }
}
</script>

<style scoped>

  .userTurn {
    background-color: #D8B980;
  }

</style>