var vueCtl = new Vue({
  el: '#app',
  data: function() {
    return {
      app: window.app,
      selfWebView: {},
      ad: null
    }
  },
  filters: {},
  methods: {
    getData: function(data) {
      this.ad = data
    },
    update: function () {
      var url = this.ad.linkUrl
      plus.runtime.openURL(url)
    },
    close: function () {
      if(this.ad.isForce === "1") return false
      this.selfWebView = plus.webview.currentWebview()
      this.selfWebView.opener().evalJS("hideVersionAD()")
    }
  }
});

function loadMedia(data) {
  vueCtl.getData(data)
}