// removed DirectiveOption because priority is not boolean
var bindBoolean = {
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
export default bindBoolean
