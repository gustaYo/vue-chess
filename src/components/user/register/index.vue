<script>
import UserService from '../../../services/user'
export default {
  template: require('./template.html'),
  data () {
    return {
      user: {
        age: 23
      },
      error: '',
      formValidMsg: {
        successMsgPasswrd: 'luce bien',
        errorMsgPasswrd: ''
      }
    }
  },
  methods: {
    validPassword () {
      // algoritmo de validacion de passwords
      if (this.user.password.length < 5) {
        this.formValidMsg.errorMsgPasswrd = 'muy corta la contraseña'
        return false
      }
      return true
    },
    repitPasswordValidate () {
      if (this.user.password !== this.user.repeatpassword) {
        return false
      }
      return true
    },
    registerUser () {
      this.error = 'procesando'
      UserService.signin(this, this.user).then(function (response) {
        this.error = 'redireccionando'
        // Storage.set('token', response.data.token)
        // UserService.setUser(response.data.data)
        // this.$dispatch('userLoguin', 'user loguin')
        this.$route.router.go('/')
      }, function (response) {
        for (var i in response.data.errors) {
          // mostrando un solo error por el mommento
          this.error = response.data.errors[i].message
        }
      })
    }
  }
}
</script>

<style scoped>
.input-field label {
    right: 10px !important;
    left: 10px;
    width: 100%;
}
</style>