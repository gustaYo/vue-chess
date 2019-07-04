<script>
import PuzzleChess from './puzzle'
import Chessground from 'chessground'
import UserService from '../../services/user'
import PuzzleService from '../../services/puzzle'
import Chess from 'chess.js'
import toast from 'vue-material-components'
import Jquery from 'jquery'
var groundInit = 1
var groundFinish = 1
export default {
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') ? true : transition.redirect('user/loguin')
    },
    data (transition) {
      return Promise.all([
        PuzzleService.count(this)
      ]).then(function (data) {
        const theD = JSON.parse(data)
        return {
          counts: theD
        }
      }, function (response) {
        window.alert('no se pudo contar')
      })
    }
  },
  template: require('./template.html'),
  data () {
    return {
      user: UserService.getUser(),
      mode: 'add',
      fenInit: '',
      fenFinish: '',
      item: {
        num: 0
      },
      counts: [],
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
          numMoves: 3,
          type: 'MateIn3',
          description: 'Las blancas ganan en 3 movimientos',
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
    nextPuzzle () {
      var post = this.puzzles.indexOf(this.item)
      if (post !== -1 && (post + 1) < this.puzzles.length) {
        this.selectItm(this.puzzles[post + 1])
      } else {
        if (((post + 1) >= this.puzzles.length) && ((this.puzzlesType.indexOf(this.puzzleType) + 1) < this.puzzlesType.length)) {
          this.selectPuzzleType(this.puzzlesType[this.puzzlesType.indexOf(this.puzzleType) + 1])
        } else {
          this.toast('<span>Ya no hay mas</span>', 2000)
        }
      }
    },
    selectPuzzleType (puzzle) {
      this.puzzleType = puzzle
      var parms = {
        type: puzzle.type
      }
      PuzzleService.get(this, parms).then(function (response) {
        const theD = JSON.parse(response)
        this.puzzles = theD
        setTimeout(function () {
          if (this.puzzles.length > 0) {
            this.selectItm(this.puzzles[0])
          }
          Jquery('#listSomePuzzles').animate({
            'scrollTop': 0
          }, 'slow')
        }.bind(this), 400)
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
      if (window.confirm('Seguro de eliminar')) {
        PuzzleService.del(this, this.item._id).then(function (response) {
          this.selectPuzzleType(this.puzzleType)
        }, function (response) {
          this.error = response.data
        })
      }
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
