import Vue from 'vue'
import axios from 'axios'
import Component from 'vue-class-component'
import ComSelect from './components/ComSelect'

@Component({
  components: {
    ComSelect: ComSelect
  }
})

export default class App extends Vue {
  // initial data
  selectedSector = ''
  selectedCategory = ''
  selectedLine = ''
  selectedSeat = ''
  sectors = {}
  categories = {}
  lines = {}
  seats = {}
  dataAddress = 'http://syn.su/js/front/data.js'
  fulldata = {
    categories: {}, sectors: {}, lines: {}, seats: {}
  }

  /**
   * @return {Object} All seats for selected sector
   */
  get sectorSeats () : object {
    const vm: any = this
    if (!vm.selectedSector) {
      return {}
    }

    const lines: any = Object.keys(vm.data.lines).reduce((r, e) => {
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

  /**
   * lifecycle hook
   */
  created () {
    this.getData()
  }

  /**
   * get HTTP data
   */
  getData () {
    const vm: any = this
    axios.get(vm.dataAddress)
      .then((response) => {
        // TODO: check up response status
        vm.data = response.data.response || {}

        // mapping:
        const categories = vm.data.categories,
          sectors = vm.data.sectors,
          lines = vm.data.lines
        vm.sectors = vm.data.sectors
        vm.freeSeats = new Set()

        Object.keys(vm.data.seats).map((id) => {
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
            vm.freeSeats.add(`${_s.sector}:${_s.category}:${_s.line}`)
          }
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  /**
   * Rebuild current data for selectboxes
   * @param {string} select name
   */
  onSelectChange (select: string) {
    const vm: any = this

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

        let lines,
          line

        vm.lines = Object.keys(vm.data.lines).reduce((r, e) => {
          line = vm.data.lines[e]
          if ((!vm.selectedCategory || line.categories && line.categories.has(vm.selectedCategory)) &&
            (!vm.selectedSector || line.sectors && line.sectors.has(vm.selectedSector)) &&
              vm.freeSeats.has(`${vm.selectedSector}:${vm.selectedCategory}:${line.id}`)
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
            (!vm.selectedCategory || seat.category === vm.selectedCategory) &&
            (!vm.selectedSector || seat.sector === vm.selectedSector) &&
            (!vm.selectedLine || seat.line === vm.selectedLine)) {
            r[e] = seat
          }
          return r
        }, {})

        vm.selectedSeat = ''
        break
    }
  }

  /**
   * Mouseover method
   * @param {any}    event mouse
   * @param {object} seat
   */
  seatHoverShow (event: any, seat: object) {
    if (seat.status) {
      return
    }
    const vm: any = this
    const el: any = event.target
    const rect: any = el.getBoundingClientRect()
    const hc: any = this.$refs['hover-content']

    hc.style.display = 'block'
    hc.style.left = `${rect.left}px`
    hc.style.top = `${rect.top}px`
    hc.innerHTML = ''
    hc.innerHTML = `${vm.data.categories[seat.category].name}<br>${vm.data.categories[seat.category].price}руб`
  }

  /**
   * Mouseleave event
   */
  seatHoverHide () {
    const hc: any = this.$refs['hover-content']

    hc.style.display = 'none'
  }

  /**
   * Fill selectboxes by selected seat data
   * @param {object} seat
   */
  seatSelect (seat: object) {
    if (seat.status) {
      return
    }
    this.selectedCategory = seat.category
    this.onSelectChange('category')
    this.selectedLine = seat.line
    this.selectedSeat = seat.id
  }

  /**
   * Show alert with current id
   */
  showAlert () {
    const vm = this
    if (vm.selectedSector && vm.selectedCategory && vm.selectedLine) {
      alert(`id: ${vm.selectedSeat}`)
    }
  }
}
