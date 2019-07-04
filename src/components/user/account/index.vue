<script>
import UserService from '../../../services/user'
import Storage from '../../../services/lstorage'
import { setUser } from '../../../vuex/actions'
// import { getUser } from '../../../vuex/getters'
import UploadFiles from '../../home/uploadFiles'
export default {
  template: require('./template.html'),
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') ? true : transition.redirect('user/loguin')
    },
    data (transition) {
      return Promise.all([
        UserService.get(this, this.$route.params.username)
      ]).then(function (data) {
        const dd = JSON.parse(data)
        const somedata = dd
        this.setUser(somedata)
        return {
          user: somedata
        }
      }.bind(this), function (response) {
        window.alert('usuario no encontrado')
        transition.redirect(UserService.getUser().username)
      })
    }
  },
  vuex: {
    actions: {
      setUser
    }
  },
  data () {
    return {
      user: {},
      dirActionUpload: Storage.get('serverDir') + '/chat/upload',
      filesUpload: [],
      fileProgress: 0,
      allFilesUploaded: true
    }
  },
  methods: {
    imageUrl (name) {
      return Storage.get('serverDir') + '/uploads/' + name
    }
  },
  components: {
    UploadFiles
  },
  events: {
    onFileClick (file) {
      // console.log('onFileClick', file)
    },
    onFileChange (file) {
      // console.log('onFileChange', file)
      // here is where we update our view
      this.fileProgress = 0
      this.allFilesUploaded = false
    },
    beforeFileUpload (file) {
      // called when the upload handler is called
      console.log('beforeFileUpload', file)
    },
    afterFileUpload (file) {
      // called after the xhr.send() at the end of the upload handler
      console.log('afterFileUpload', file)
    },
    onFileProgress (progress) {
      // console.log('onFileProgress', progress)
      // update our progress bar
      this.fileProgress = parseInt(progress.percent)
    },
    onFileUpload (file, res) {
      console.log('onFileUpload', file, res)
      if (this.user.image !== '50x50defaultAvatar.png') {
        UserService.deleteImage(this, {name: this.user.image}).then(function (response) {
          console.log('eliminado correctamente')
        }, function (response) {
        })
      }
      this.setUser(file.name, 'image')
      UserService.setUser(this.user)
      UserService.signin(this, {_id: this.user._id, image: this.user.image}).then(function (response) {
      }, function (response) {
        window.alert('error actualizando imagen usuario')
      })
    },
    onFileError (file, res) {
      console.error('onFileError', file, res)
    },
    onAllFilesUploaded (files) {
      console.log('onAllFilesUploaded', files)
      // everything is done!
      this.allFilesUploaded = true
    }
  }
}
</script>