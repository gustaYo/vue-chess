<template>
  <div v-on:click="OpenInputFile">
    <slot></slot>
  </div>
  <input
          style="display: none"
          id="{{ id || name }}"
          type="file"
          name="{{ name }}"
          v-bind-boolean:multiple="multiple"
          @change="fileInputChange"
  >
</template>

<script>
export default {
  name: 'UploadFiles',
  props: {
    value: {
      type: Array
    },
    headers: Object,
    action: {
      type: String,
      required: true
    },
    id: String,
    name: {
      type: String,
      required: true
    },
    multiple: {
      type: Boolean,
      required: false,
      'default': false
    },
    maxsize: String,
    pathpermit: String,
    method: String
  },
  directives: {
    bindBoolean: {
      priority: 850,
      update: function (value) {
        var arg = this.arg
        if (value) {
          this.el.setAttribute(arg, arg)
        } else {
          this.el.removeAttribute(arg)
        }
      }
    }
  },
  data () {
    return {
      myFiles: []
    }
  },
  methods: {
    OpenInputFile () {
      document.getElementById(this.name).click()
      this.fileInputClick()
    },
    fileInputClick () {
      // click actually triggers after the file dialog opens
      this.$dispatch('onFileClick', this.myFiles)
    },
    validateFiles (files) {
      var sumSize = 0
      var allOk = true
      Array.prototype.slice.call(files, 0).map(function (file) {
        sumSize += parseInt(file.size)
        var maxSize = parseInt(this.maxsize) * 1024 * 1024
        if (sumSize > maxSize) {
          this.$dispatch('onFileError', this.myFiles, 'size_not_permit')
          allOk = false
        }
        var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|'
        if (this.pathpermit.indexOf(type) === -1) {
          this.$dispatch('onFileError', this.myFiles, 'path_not_permit')
          allOk = false
        }
      }.bind(this))
      return allOk
    },
    fileInputChange () {
      // get the group of files assigned to this field
      var ident = this.id || this.name
      this.myFiles = document.getElementById(ident).files
      this.$dispatch('onFileChange', this.myFiles)
      if (this.validateFiles(this.myFiles)) {
        this.fileUpload()
      }
    },
    _onProgress (e) {
      // this is an internal call in XHR to update the progress
      e.percent = (e.loaded / e.total) * 100
      this.$dispatch('onFileProgress', e)
    },
    _handleUpload (file) {
      this.$dispatch('beforeFileUpload', file)
      var form = new window.FormData()
      var xhr = new window.XMLHttpRequest()
      try {
        form.append('Content-Type', file.type || 'application/octet-stream')
        // our request will have the file in the ['file'] key
        form.append('file', file)
      } catch (err) {
        this.$dispatch('onFileError', file, err)
        return
      }
      return new Promise(function (resolve, reject) {
        xhr.upload.addEventListener('progress', this._onProgress, false)
        xhr.onreadystatechange = function () {
          if (xhr.readyState < 4) {
            return
          }
          if (xhr.status < 400) {
            var res = xhr.responseText
            var newFile = {
              name: res,
              size: file.size,
              type: file.type,
              lastModifiedDate: file.lastModifiedDate
            }
            this.value.push(newFile)
            this.$dispatch('onFileUpload', newFile, res)
            resolve(file)
          } else {
            var err = xhr.responseText
            this.$dispatch('onFileError', file, err)
            reject(err)
          }
        }.bind(this)

        xhr.onerror = function () {
          var err = JSON.parse(xhr.responseText)
          this.$dispatch('onFileError', file, err)
          reject(err)
        }.bind(this)

        xhr.open(this.method || 'POST', this.action, true)
        if (this.headers) {
          for (var header in this.headers) {
            xhr.setRequestHeader(header, this.headers[header])
          }
        }
        xhr.send(form)
        this.$dispatch('afterFileUpload', file)
      }.bind(this))
    },
    fileUpload () {
      if (this.myFiles.length > 0) {
        // a hack to push all the Promises into a new array
        var arrayOfPromises = Array.prototype.slice.call(this.myFiles, 0).map(function (file) {
          return this._handleUpload(file)
        }.bind(this))
        // wait for everything to finish
        Promise.all(arrayOfPromises).then(function (allFiles) {
          this.$dispatch('onAllFilesUploaded', allFiles)
        }.bind(this)).catch(function (err) {
          this.$dispatch('onFileError', this.myFiles, err)
        }.bind(this))
      } else {
        // someone tried to upload without adding files
        var err = new Error('No files to upload for this field')
        this.$dispatch('onFileError', this.myFiles, err)
      }
    }
  }
}
</script>