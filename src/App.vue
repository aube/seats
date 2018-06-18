<template>
  <div id="app">
    <aside>
      <label>
        Sectors
        <select class="form-control" v-model="selectedSector" @change="onSelectChange('sector')">
          <option
            v-for="option in sectors"
            :value="option.id">{{option.name}}</option>
        </select>
      </label>

      <label>
        Categories
        <select class="form-control" v-model="selectedCategory" @change="onSelectChange('category')">
          <option
            v-for="option in categories"
            :value="option.id">{{option.name}}</option>
        </select>
      </label>

      <label>
        Lines
        <select class="form-control" v-model="selectedLine" @change="onSelectChange('line')">
          <option
            v-for="option in lines"
            :value="option.id">{{option.name}}</option>
        </select>
      </label>

      <label>
        Seats
        <select class="form-control" v-model="selectedSeat" @change="onSelectChange('seat')">
          <option
            v-for="option in seats"
            :value="option.id">{{option.seat}}</option>
        </select>
      </label>

      <button @click="showAlert">Save</button>
    </aside>

    <main class="content">
      <div
        v-if="selectedSector"
        class="sector">
        <p
          v-for="line in sectorSeats"
          :class="{even: line.seats.length % 2}"
          class="line">
          <span
            v-for="seat in line.seats"
            class="seat"
            @mouseover="seatHoverShow($event, seat)"
            @mouseleave="seatHoverHide"
            @click="seatSelect(seat)"
            :class="{
              free: !seat.status,
              active: seat.id == selectedSeat
            }"
            :style="{
              'background-color': seat.color
            }"></span>
        </p>
        <span class="hover-content" ref="hover-content">123</span>
      </div>
    </main>
  </div>
</template>

<script>
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

import axios from 'axios'

export default {

  data () {
    return {
      selectedSector: '',
      selectedCategory: '',
      selectedLine: '',
      selectedSeat: '',
      sectors: {},
      categories: {},
      lines: {},
      seats: {},
      fulldata: {
        categories: {}, sectors: {}, lines: {}, seats: {}
      },
      endpoint: 'https://syn.su/js/front/data.js'
    }
  },

  computed: {
    /**
     * @return {Object} All seats for selected sector
     */
    sectorSeats () {
      const vm = this
      if (!vm.selectedSector) {
        return {}
      }

      const lines = Object.keys(vm.data.lines).reduce((r, e) => {
        const line = vm.data.lines[e]
        if (!vm.selectedSector || line.sectors && line.sectors.has(vm.selectedSector)) {
          line.seats = []
          r[e] = line
        }
        return r
      }, {})

      Object.keys(vm.data.seats).map((id) => {
        const seat = vm.data.seats[id]
        if (vm.selectedSector === seat.sector && lines[seat.line]) {
          lines[seat.line].seats = lines[seat.line].seats || []
          lines[seat.line].seats.push(seat)
        }
      })
      return lines
    }
  },

  created () {
    this.getAllPosts()
  },

  methods: {
    getAllPosts () {
      axios.get(this.endpoint)
        .then((response) => {
          // TODO: check up response status
          this.data = response.data.response || {}

          // mapping:
          const vm = this,
            categories = this.data.categories,
            sectors = this.data.sectors,
            lines = this.data.lines
          vm.sectors = this.data.sectors
          vm.freeSeats = new Set()

          Object.keys(this.data.seats).map((id) => {
            const _s = vm.data.seats[id],
              c = categories[_s.category],
              s = sectors[_s.sector],
              l = lines[_s.line]
            _s.color = categories[_s.category].color;
            (c.sectors = c.sectors || new Set()).add(_s.sector);
            (c.lines = c.lines || new Set()).add(_s.line);
            (s.categories = s.categories || new Set()).add(_s.category);
            (s.lines = s.lines || new Set()).add(_s.line);
            (l.sectors = l.sectors || new Set()).add(_s.sector);
            (l.categories = l.categories || new Set()).add(_s.category)

            if (!_s.status) {
              vm.freeSeats.add(_s.sector + ':' + _s.category + ':' + _s.line)
            }
          })
        })
        .catch((error) => {
          console.error(error)
        })
    },

    onSelectChange (select) {
      const vm = this

      switch (select) {
        case 'sector':
          if (!vm.selectedSector) {
            vm.categories = vm.data.categories
          }

          vm.categories = Object.keys(vm.data.categories).reduce((r, e) => {
            const category = vm.data.categories[e]
            if (!vm.selectedSector || category.sectors && category.sectors.has(vm.selectedSector)) {
              r[e] = category
            }
            return r
          }, {})

          vm.selectedCategory = ''
          vm.selectedLine = ''
          vm.selectedSeat = ''

        case 'category':
          if (!vm.selectedSector) {
            vm.lines = vm.data.lines
          }

          let lines, line

          vm.lines = Object.keys(vm.data.lines).reduce((r, e) => {
            line = vm.data.lines[e]
            if ((!vm.selectedCategory || line.categories && line.categories.has(vm.selectedCategory)) &&
              (!vm.selectedSector || line.sectors && line.sectors.has(vm.selectedSector)) &&
                vm.freeSeats.has(vm.selectedSector + ':' + vm.selectedCategory + ':' + line.id)
            ) {
              r[e] = line
            }
            return r
          }, {})

          vm.selectedLine = ''
          vm.selectedSeat = ''

        case 'line':
          if (!vm.selectedSector && !vm.selectedCategory && !vm.selectedLine) {
            return vm.data.seats
          }

          vm.seats = Object.keys(vm.data.seats).reduce((r, e) => {
            const seat = vm.data.seats[e]
            if (!seat.status &&
              (!vm.selectedCategory || seat.category == vm.selectedCategory) &&
              (!vm.selectedSector || seat.sector == vm.selectedSector) &&
              (!vm.selectedLine || seat.line == vm.selectedLine)) {
              r[e] = seat
            }
            return r
          }, {})

          vm.selectedSeat = ''
          break
      }
    },

    seatHoverShow (event, seat) {
      if (seat.status) {
        return
      }
      const el = event.target,
        rect = el.getBoundingClientRect(),
        hc = this.$refs['hover-content']

      hc.style.display = 'block'
      hc.style.left = rect.left + 'px'
      hc.style.top = rect.top + 'px'
      hc.innerHTML = ''
      hc.innerHTML = this.data.categories[seat.category].name + '<br>' + this.data.categories[seat.category].price + 'руб'
    },

    seatHoverHide () {
      const hc = this.$refs['hover-content']

      hc.style.display = 'none'
    },

    seatSelect (seat) {
      if (seat.status) {
        return
      }
      this.selectedCategory = seat.category
      this.onSelectChange('category')
      this.selectedLine = seat.line
      this.selectedSeat = seat.id
    },

    showAlert () {
      const vm = this
      if (vm.selectedSector && vm.selectedCategory && vm.selectedLine) {
        alert('id: ' + vm.selectedSeat)
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  justify-content: center;
}

aside {
  width: 200px;
  text-align: left;
  label {
    display: block;
    margin-bottom: .5rem;
  }
  select {
    display: block;
    width: 100%;
    font-size: 1rem;
  }
  button {
    font-size: 1rem;
  }

}

main {
  margin-left: 100px;
  .sector {
    display: flex;
    flex-direction: column-reverse;
    .line {
      margin: 0;
      &.even {
        padding-left: 1rem;
      }
      .seat {
        display: inline-block;
        width: .75rem;
        height: .75rem;
        margin: .01rem;
        border-radius: 50%;
        border: 2px solid #fff;
        cursor: pointer;
        opacity: .3;
        &:hover {
          border: 2px solid #aaa;
        }
        &.active{
          border: 2px solid tomato;
        }
        &.free{
          opacity: 1;
        }
      }
      &:hover ~ .hover-content {
        display: block;
      }
    }
    .hover-content {
      display: none;
      margin-top: -50px;
      margin-left: -50px;
      width: 100px;
      position: absolute;
      background-color: #fafafa;
      border: 1px solid #333;
    }
  }
}
</style>
