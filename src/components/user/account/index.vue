<script>
import UserService from '../../../services/user'
export default {
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') ? true : transition.redirect('user/loguin')
    }
  },
  template: require('./template.html'),
  data () {
    return {
      user: UserService.user
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
