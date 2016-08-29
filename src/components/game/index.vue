<script>
import Chessground from 'chessground'
import MiChess from 'chess.js'
import Garbochess from 'garbochess'
import UserCard from './userCard'
import BoardHistory from './boardHistory'
import BodyMen from '../home/bodyMen'
import Store from '../../services/lstorage'
import UserService from '../../services/user'
import { boardGameMove, boardGameTurn, boardGameCountDown } from '../../vuex/actions'
import { getGamePgn, getGameTurn, getGameTimesUsers } from '../../vuex/getters'
import Jquery from 'jquery'
import tooltip from 'vue-material-components'
var timesColor = {
  white: 1,
  black: 1
}
var stylesBoard = {
  board: ['light-wood-3d', 'blue', 'wood', 'marble'],
  pieces: ['merida', 'staunton', 'pirouetti', 'cburnett']
}
export default {
  template: require('./template.html'),
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') && Store.get('board')._id ? true : transition.redirect('home')
    }
  },
  data () {
    return {
      chattext: '',
      mensjGame: [],
      user: UserService.getUser(),
      ground: 0,
      fen: 'none',
      orientation: 'white',
      history: [],
      styleboard: true,
      active: true,
      state: '',
      chess: new MiChess(),
      stylesBoard: stylesBoard,
      styles: Store.get('styleBoard',
        {
          board: 1,
          pieces: 0
        }),
      board: Store.get('board'),
      dirServer: Store.get('serverDir')
    }
  },
  mixins: [
    tooltip
  ],
  props: {},
  components: {
    UserCard,
    BoardHistory,
    BodyMen
  },
  vuex: {
    actions: {
      boardGameMove,
      boardGameTurn,
      boardGameCountDown
    },
    getters: {
      pgn: getGamePgn,
      turn: getGameTurn,
      time: getGameTimesUsers
    }
  },
  events: {
    move (board) {
      if (this.active) {
        this.boardGameMove(board.pgn)
      }
      this.changeStateGame(board.pgn, board.move)
      if (board.times) {
        // console.log(board.times)
        this.boardGameCountDown(board.times.black, 'black')
        this.boardGameCountDown(board.times.white, 'white')
      }
    },
    gameFinish (dataResult) {
      this.stateFinishGame(dataResult)
    },
    mensaje (data) {
      this.recibeMensaje(data.men)
    }
  },
  methods: {
    recibeMensaje (men) {
      var idDiv = 'chatConvertGame'
      var divScroll = document.getElementById(idDiv)
      var atBottom = divScroll.scrollTop >= divScroll.scrollHeight - divScroll.clientHeight
      this.mensjGame.push(men)
      if (atBottom) {
        setTimeout(function () {
          Jquery('#' + idDiv).animate({
            'scrollTop': Jquery('#' + idDiv)[0].scrollHeight
          }, 'slow')
        }, 10)
      }
    },
    loadUserConvert (parms) {
      var data = {
        c: 'chat',
        f: 'loadUserConvert',
        data: parms
      }
      this.$socket.emit('event', data, function (...callbacks) {
        var log = callbacks[1]
        this.mensjGame = log
        setTimeout(function () {
          Jquery('#chatConvertGame').animate({
            'scrollTop': Jquery('#chatConvertGame')[0].scrollHeight
          }, 'slow')
        }, 1000)
      }.bind(this))
    },
    sendMensaje () {
      var thisUser = UserService.getUser().username
      var otherUser = this.board.u1 === thisUser ? this.board.u2 : this.board.u1
      if (otherUser === 'PC' || this.chattext === '') {
        return
      }
      var men = {
        body: this.chattext,
        type: 'text',
        public: false,
        send: thisUser,
        recibe: otherUser
      }
      var data = {
        c: 'chat',
        f: 'mensaje',
        data: {
          men: men
        }
      }
      this.$socket.emit('event', data, function (...callbacks) {
        // console.log(callbacks)
      })
      this.chattext = ''
    },
    countDown () {
      var seg = 0
      seg = this.time[this.turn] - 1
      if (seg <= 0) {
        seg = 0
        clearInterval(timesColor[this.turn])
        if (this.active) {
          const result = {
            color: this.turn === 'black' ? 'white' : 'black',
            motiv: 'timeout'
          }
          this.gameFinish(result)
        }
      }
      this.boardGameCountDown(seg, this.turn)
    },
    countDownStart () {
      clearInterval(timesColor[this.turn])
      timesColor[this.turn] = setInterval(function () {
        this.countDown()
      }.bind(this), 1000)
    },
    chessToDests (chess) {
      var dests = {}
      chess.SQUARES.forEach(function (s) {
        var ms = chess.moves({square: s, verbose: true})
        if (ms.length) dests[s] = ms.map(function (m) { return m.to })
      })
      return dests
    },
    chessToColor (chess) {
      var t = chess.turn()
      var turn = (t === 'w') ? 'white' : 'black'
      this.boardGameTurn(turn)
      turn = UserService.getUser().username === this.board.u2 ? 'black' : 'white'
      return turn
    },
    onMove (orig, dest) {
      // comprobar si el juego esta activo
      if (this.active) {
        this.chess.move({
          from: orig,
          to: dest,
          promotion: 'q'
        })
        // comunicacion con servidor
        var turn = (this.chess.turn() === 'w') ? 'white' : 'black'
        var data = {
          c: 'board',
          f: 'move',
          data: {
            event: 'move',
            data: {
              pgn: this.chess.pgn(),
              idBoard: this.board._id,
              turn: turn,
              times: {},
              move: {
                from: orig,
                to: dest
              }
            }
          }
        }
        this.$socket.emit('event', data, function (...callbacks) {
          // console.log(callbacks)
        })
      }
    },
    PcIngeniesMove (move) {
      var from = move & 0xFF
      var to = (move >> 8) & 0xFF
      var sfrom = Garbochess.FormatSquare(from)
      var sto = Garbochess.FormatSquare(to)
      this.onMove(sfrom, sto)
    },
    pcMove (fen) {
      Garbochess.InitializeFromFen(fen)
      Garbochess.Search(this.PcIngeniesMove, 5, null)
    },
    isVsPc (turn) {
      if ((turn === 'white' && this.board.u1 === 'PC') || (turn === 'black' && this.board.u2 === 'PC')) {
        setTimeout(function () {
          this.pcMove(this.chess.fen())
        }.bind(this), 700)
      }
    },
    isHumanVsPC () {
      return (this.board.u1 === 'PC') || (this.board.u2 === 'PC')
    },
    changeStateGame (pgn, move = {}) {
      // show move board
      if (move.from) {
        this.chess.move({
          from: move.from,
          to: move.to,
          promotion: 'q'
        })
        this.ground.move(move.from, move.to)
        // this.ground.playPremove()
      } else {
        // load from pgn
        this.chess.load_pgn(pgn)
      }
      this.ground.set({
        fen: this.chess.fen(),
        turnColor: this.chessToColor(this.chess),
        movable: {
          color: this.chessToColor(this.chess),
          dests: this.chessToDests(this.chess)
        }
      })
      this.isVsPc(this.turn)
    },
    changeOrientation () {
      this.orientation = this.orientation === 'white' ? 'black' : 'white'
      this.ground.set({
        orientation: this.orientation
      })
    },
    changeStyle (type) {
      this.styles[type] = this.styles[type] + 1
      if (this.styles[type] > stylesBoard[type].length - 1) {
        this.styles[type] = 0
      }
      this.styleAdapter()
      Store.set('styleBoard', this.styles)
    },
    styleAdapter () {
      if (this.stylesBoard['board'][this.styles['board']] === 'light-wood-3d') {
        document.getElementById('tablerochess').style.height = (document.getElementById('tablerochess').clientWidth - (document.getElementById('tablerochess').clientWidth * 6.25 / 100)) + 'px'
      } else {
        document.getElementById('tablerochess').style.height = document.getElementById('tablerochess').clientWidth + 'px'
      }
    },
    initGame () {
      // inicializando tiempos
      this.boardGameMove('none')
      var data = {
        c: 'board',
        f: 'getBoard',
        data: Store.get('board')
      }
      this.$socket.emit('event', data, function (...callbacks) {
        if (callbacks[0]) {
          Store.del('board')
          this.$route.router.go('/')
          return
        }
        var board = callbacks[1].board
        this.boardGameCountDown(callbacks[1].times.black, 'black')
        this.boardGameCountDown(callbacks[1].times.white, 'white')
        this.changeStateGame(board.pgn)
        this.boardGameMove(board.pgn)
        this.board = board
      }.bind(this))
      var thisUser = UserService.getUser().username
      var otherUser = this.board.u1 === thisUser ? this.board.u2 : this.board.u1
      var parmsLoad = {
        user: otherUser,
        range: {
          limit: 10,
          skip: 0
        }
      }
      this.loadUserConvert(parmsLoad)
    },
    gameState (state = {}) {
      if (state.motiv) {
        if (state.motiv === 'checkmate') {
          return 'checkmate ' + 'gana ' + state.color
        }
        if (state.motiv === 'drawn_position') {
          return 'drawn_position ' + 'gana' + state.color
        }
        if (state.motiv === 'rendicion') {
          return 'gana ' + state.color + ' por rendicion'
        }
        if (state.motiv === 'timeout') {
          this.boardGameCountDown(0, state.color === 'white' ? 'black' : 'white')
          return 'gana ' + state.color + ' por tiempo'
        }
      }
      // checkmate?
      if (this.chess.in_checkmate()) {
        const result = {
          color: this.turn === 'white' ? 'black' : 'white',
          motiv: 'checkmate'
        }
        this.gameFinish(result)
        return
      }
      if (this.chess.in_draw()) {
        const result = {
          color: this.turn,
          motiv: 'drawn_position'
        }
        this.gameFinish(result)
        return
      }
      if (this.chess.in_check()) {
        return this.turn + 'is in check'
      }
      return 'Juegan las ' + this.turn
    },
    rendir () {
      const result = {
        color: this.board.u1 === UserService.getUser().username ? 'black' : 'white',
        motiv: 'rendicion'
      }
      this.gameFinish(result)
    },
    gameFinish (result) {
      if (!this.active) {
        return
      }
      var data = {
        c: 'board',
        f: 'gameFinish',
        data: {
          idBoard: this.board._id,
          result: result
        }
      }
      this.$socket.emit('event', data, function (...callbacks) {
        // console.log(callbacks)
      })
    },
    stateFinishGame (state) {
      this.active = false
      this.state = this.gameState(state.result)
      Store.del('board')
      this.ground.stop()
      clearInterval(timesColor.black)
      clearInterval(timesColor.white)
    }
  },
  created () {
    Garbochess.ResetGame()
    setTimeout(function () {
      this.orientation = UserService.getUser().username === this.board.u2 ? 'black' : 'white'
      this.ground = Chessground(document.getElementById('tablerochess'), {
        viewOnly: false,
        turnColor: 'white',
        animation: {
          duration: 300
        },
        movable: {
          free: false,
          premove: true,
          dests: this.chessToDests(this.chess),
          events: {
            after: this.onMove
          }
        },
        drawable: {
          enabled: true
        },
        showDests: true,
        orientation: this.orientation
      })
      // estableciendo razones de altura y ancho
      this.styleAdapter()
      // actualizando juego
      this.initGame()
      Jquery('html, body').animate({
        scrollTop: Jquery('#tablerochess').offset().top
      }, 500)
    }.bind(this), 10)
  },
  watch: {
    turn (newVal, oldVal) {
      if (this.active) {
        clearInterval(timesColor[oldVal])
        this.countDownStart()
      }
    },
    pgn (newVal, oldVal) {
      this.state = this.gameState()
      this.history = this.chess.history({ verbose: true })
    }
  }
}
</script>


