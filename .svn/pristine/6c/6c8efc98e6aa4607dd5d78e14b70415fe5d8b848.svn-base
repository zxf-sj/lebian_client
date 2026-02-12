Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '请输入'
    },
    placeholder: {
      type: String,
      value: '请输入内容'
    },
    value: {
      type: String,
      value: ''
    },
    prompt:{
      type: String,
      value: ''
    }
  },

  data: {},

  methods: {
    onInput(e) {
      this.setData({ value: e.detail.value });
    },

    onCancel() {
      this.triggerEvent('cancel');
    },

    onConfirm() {
      this.triggerEvent('confirm', { value: this.data.value });
    }
  }
})