<script>
import PuzzleChess from './puzzle'
import Chessground from 'chessground'
import UserService from '../../services/user'
import PuzzleService from '../../services/puzzle'
import Chess from 'chess.js'
import toast from 'vue-material-components'
var groundInit = 1
var groundFinish = 1
export default {
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') ? true : transition.redirect('user/loguin')
    }
  },
  template: require('./template.html'),
  data () {
    return {
      // 4Q2N/4q2k/2b4r/2pPBP2/2P3p1/5n2/1K4p1/7R
      user: UserService.getUser(),
      mode: 'add',
      fenInit: '',
      fenFinish: '',
      item: {
        num: 0
      },
      chess: new Chess(),
      puzzleType: {},
      puzzlesType: [
        {
          numMoves: 1,
          type: 'MateIn1',
          description: 'Las blancas ganan en un movimiento',
          position: false
        },
        {
          numMoves: 2,
          type: 'MateIn2',
          description: 'Las blancas ganan en 2 movimientos',
          position: false
        },
        {
          numMoves: 1,
          type: 'FindFork',
          description: 'Find white move that results in fork',
          position: true
        },
        {
          numMoves: 1,
          type: 'TakePiece',
          description: 'One of Black pieces is undefended. Take it',
          position: true
        }
      ],
      puzzles: []
    }
  },
  mixins: [
    toast
  ],
  components: {
    PuzzleChess
  },
  methods: {
    selectItm (item) {
      this.item = item
    },
    selectPuzzleType (puzzle) {
      this.puzzleType = puzzle
      var parms = {
        type: puzzle.type
      }
      PuzzleService.get(this, parms).then(function (response) {
        this.puzzles = response.data
      }, function (response) {
        this.error = response.data
      })
    },
    updateFenInit (orig, dest) {
      this.chess.move({
        from: orig,
        to: dest
      })
      this.fenInit = groundInit.getFen()
    },
    updateFenFinish (orig, dest) {
      this.chess.move({
        from: orig,
        to: dest
      })
      this.fenFinish = groundFinish.getFen()
    },
    addPuzzle (mode) {
      this.mode = mode
      if (!this.puzzleType.type) {
        this.toast('<span>Selecciona un tipo de puzzle</span>', 2000)
        return
      }
      this.$broadcast('modal::open', 'modalCreatePuzzle')
      var options = {
        fen: this.fenInit,
        orientation: 'white',
        movable: {
          events: {
            after: this.updateFenInit
          }
        }
      }
      setTimeout(function () {
        groundInit = Chessground(document.getElementById('puzzleGenerateFenInit'), options)
        if (this.puzzleType.position) {
          var optionsF = {
            fen: this.fenFinish,
            orientation: 'white',
            movable: {
              events: {
                after: this.updateFenFinish
              }
            }
          }
          groundFinish = Chessground(document.getElementById('puzzleGenerateFenFinish'), optionsF)
        }
      }.bind(this), 100)
    },
    createPuzzle (action) {
      if (action) {
        // validar que no existe uno similar en db
        var newPuzzle = {
          type: this.puzzleType.type,
          createby: UserService.getUser().username,
          feninit: this.fenInit,
          fenfinish: this.fenFinish,
          nummoves: this.puzzleType.numMoves,
          mode: this.mode
        }
        PuzzleService.add(this, newPuzzle).then(function (response) {
          this.toast('<span>Creado correctamente</span>', 3000)
          // actualizar listado
          this.selectPuzzleType(this.puzzleType)
          // seleccionar actual
          if (this.mode === 'add') {
            this.selectItm(response.data)
          } else {
            console.log('selecciona otra vez para ver los cambios')
          }
        }, function (response) {
          this.error = response.data
          console.log(response.data)
        })
      }
      this.$broadcast('modal::close', 'some', 'modalCreatePuzzle')
    },
    editPuzzle () {
      this.addPuzzle(this.item._id)
      setTimeout(function () {
        this.fenInit = this.item.feninit
        if (this.item.fenfinish) {
          this.fenFinish = this.item.fenfinish
        }
      }.bind(this), 1000)
    },
    delPuzzle () {
      PuzzleService.del(this, this.item._id).then(function (response) {
        this.selectPuzzleType(this.puzzleType)
      }, function (response) {
        this.error = response.data
      })
    }
  },
  watch: {
    fenInit (newVal, oldVal) {
      if (newVal === '') {
        newVal = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
      }
      groundInit.set({
        fen: newVal
      })
    },
    fenFinish (newVal, oldVal) {
      if (newVal === '') {
        newVal = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
      }
      groundFinish.set({
        fen: newVal
      })
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
