'use strict';

var range_template = '\n  <div class="mt-range" :class="{ \'mt-range--disabled\': disabled }">\n    <slot name="start"></slot>\n    <div class="mt-range-content" ref="content">\n      <div class="mt-range-runway" :style="{ \'border-top-width\': barHeight + \'px\' }">\n      </div>\n      <div class="flex runway_tip">\n        <div v-for = \'(item, index) in progressArr\' class = "runway_li">\n          <span style="margin-left:-3px">{{ index % 2 === 0 ? item : \'\' }}</span>\n        </div>\n      </div>\n      <div class="mt-range-progress" :style="{ width: (progress+2) + \'%\', height: barHeight + \'px\' }"></div>\n      <div class="mt-range-thumb" ref="thumb" :style="{ left: progress + \'%\' }"><slot name="thumb"></slot></div>\n    </div>\n    <slot name="end"></slot>\n  </div>\n';
Vue.component('range', {
  template: range_template,
  name: 'mt-range',
  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number
    },
    barHeight: {
      type: Number,
      default: 1
    }
  },
  computed: {
    progressArr: function progressArr() {
      var len = (this.max - this.min) / this.step;
      var min = this.min;
      var arr = [];
      for (var i = 0; i < len; i++) {
        min = this.min + this.step * i;
        arr.push(min);
      }
      return arr;
    },
    progress: function progress() {
      var value = this.value;
      if (typeof value === 'undefined' || value === null) return 0;
      return Math.floor((value - this.min) / (this.max - this.min) * 100);
    }
  },
  mounted: function mounted() {
    var _this = this;

    var thumb = this.$refs.thumb;
    var content = this.$refs.content;
    var getThumbPosition = function getThumbPosition() {
      var contentBox = content.getBoundingClientRect();
      var thumbBox = thumb.getBoundingClientRect();
      return {
        left: thumbBox.left - contentBox.left,
        top: thumbBox.top - contentBox.top,
        thumbBoxLeft: thumbBox.left
      };
    };
    var dragState = {};
    draggable(thumb, {
      start: function start(event) {
        if (_this.disabled) return;
        var position = getThumbPosition();
        var thumbClickDetalX = event.clientX - position.thumbBoxLeft;
        dragState = {
          thumbStartLeft: position.left,
          thumbStartTop: position.top,
          thumbClickDetalX: thumbClickDetalX
        };
      },
      drag: function drag(event) {
        if (_this.disabled) return;
        var contentBox = content.getBoundingClientRect();
        var deltaX = event.pageX - contentBox.left - dragState.thumbStartLeft - dragState.thumbClickDetalX;
        var stepCount = Math.ceil((_this.max - _this.min) / _this.step);
        var newPosition = dragState.thumbStartLeft + deltaX - (dragState.thumbStartLeft + deltaX) % (contentBox.width / stepCount);
        var newProgress = newPosition / contentBox.width;
        if (newProgress < 0) {
          newProgress = 0;
        } else if (newProgress > 1) {
          newProgress = 1;
        }
        _this.$emit('input', _this.min + newProgress * (_this.max - _this.min));
      },
      end: function end() {
        if (_this.disabled) return;
        _this.$emit('change', _this.value);
        dragState = {};
      }
    });
  }
});