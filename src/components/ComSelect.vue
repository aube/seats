<template>
  <label>
    {{label}}
    <select class="form-control" v-model="data" @change="change">
      <option
        v-for="option in options"
        :value="option.id"
        :key="option.id">{{option[optionNameKey] || option.name}}</option>
    </select>
  </label>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

@Component({
  props: {
    label: String,
    name: String,
    optionNameKey: String,
    value: null,
    options: Object
  }
})
export default class App extends Vue {
  // initial data
  data = ''

  get data () {
      console.log('this.value',this.value);
      return this.value
  }

  // // dones't support babel?
  // @Watch ('value')
  // onChanged(val: string, oldVal: string) { }

  change () {
    this.$emit('onSelectChange', this.name, this.data)
  }
}
</script>