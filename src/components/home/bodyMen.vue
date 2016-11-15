<template>
  <div class="col popover {{ [men.send === user.username  ? 'left' : 'right'] }}" v-for="men in mens">
    <div class="arrow"></div>
    <h3 class="popover-title">{{ men.send }} <span style="float:right">{{ men.created | moment 'MMMM Do YYYY, h:mm:ss a'}}</span></h3>
    <div class="popover-content menText">
      <p v-if="men.type==='text'"> {{ men.body }}</p>
      <div style="float:left" v-if="men.type==='file'">      
       <img v-if="isImage(men.body)" class="col s6 m6 l6" v-bind:src="imageUrl(men.body.name)" alt="">
       <md-button v-else class="waves-effect waves-light" v-bind:href="imageUrl(men.body.name)">
       <md-icon left>cloud</md-icon>{{men.body.name}}
     </md-button>
   </div>
 </div>
</div>
</template>

<script>
import UserService from '../../services/user'
export default {
  name: 'BodyMen',
  props: {
    mens: {
      type: Array
    },
    dirServer: {
      type: String
    }
  },
  data () {
    return {
      user: UserService.getUser()
    }
  },
  methods: {
    imageUrl (name) {
      return this.dirServer + '/uploads/' + name
    },
    isImage (file) {
      var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|'
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1
    }
  }
}
</script>