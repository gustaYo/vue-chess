<script>
import Board from '../../services/board'
import Store from '../../services/lstorage'
import BoardVisor from '../home/boardVisor'
export default {
  template: require('./template.html'),
  route: {
    data (transition) {
      return {
        filters: {
          u1: this.$route.params.u1 === ':u1' ? '' : this.$route.params.u1 === 'all' ? '' : this.$route.params.u1,
          u2: this.$route.params.u2 === ':u2' ? '' : this.$route.params.u2 === 'all' ? '' : this.$route.params.u2
        },
        skip: this.$route.params.skip === ':skip' ? 0 : parseInt(this.$route.params.skip),
        boardSelect: this.$route.params.idBoard === ':idBoard' ? 'none' : this.$route.params.idBoard
      }
    }
  },
  data () {
    return {
      boardSelect: '',
      limit: 20,
      foundList: [],
      boardView: Store.get('boardView', {}),
      totalRecords: 0,
      filters: {
        u1: '',
        u2: ''
      },
      skip: -1
    }
  },
  components: {
    BoardVisor
  },
  methods: {
    updateRouter () {
      var u1 = this.filters.u1 === '' ? 'all' : this.filters.u1
      var u2 = this.filters.u2 === '' ? 'all' : this.filters.u2
      var newUrl = '/visor/' + this.boardView._id + '/' + this.skip + '/' + u1 + '/' + u2
      this.$route.router.replace(newUrl)
      Board.setParms({
        u1: u1,
        u2: u2,
        skip: this.skip,
        idBoard: this.boardView._id
      })
    },
    Filter () {
      var filters = {
        filters: this.filters,
        limit: this.limit,
        skip: this.skip
      }
      Board.filter(this, filters).then(function (response) {
        const data = JSON.parse(response)
        this.foundList = data.documents
        this.totalRecords = data.total
        this.updateRouter()
        if (this.boardSelect !== this.boardView._id) {
          for (var i in this.foundList) {
            if (this.foundList[i]._id === this.boardSelect) {
              this.selectBoard(this.foundList[i])
            }
          }
        }
      }, function (response) {
        this.error = response.data
      })
    },
    selectBoard (board) {
      this.boardView = board
      Store.set('boardView', board)
      this.updateRouter()
    }
  },
  created () {},
  watch: {
    skip (newVal, oldVal) {
      this.Filter()
    }
  }
}
</script>
