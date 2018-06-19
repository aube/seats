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
  selectedSeat = 4046;
  selected = {
    sector: 0,
    line: 0,
    category: 0,
    seat: 0
  }
  sectors = {}
  categories = {}
  lines = {}
  seats = {}
  dataAddress = 'http://syn.su/js/front/data.js'
  fulldata = {
    categories: {}, sectors: {}, lines: {}, seats: {}
  }

  /**
   * All seats for selected sector
   * @return {Object}
   */
  get sectorSeats () : object {
    const vm: any = this
    if (!vm.selected.sector) {
      return {}
    }

    const lines: any = Object.keys(vm.data.lines).reduce((r, e) => {
      const line = vm.data.lines[e]
      if (!vm.selected.sector || line.sectors && line.sectors.has(vm.selected.sector)) {
        line.seats = []
        r[e] = line
      }
      return r
    }, {})

    Object.keys(vm.data.seats).map((id) => {
      const seat = vm.data.seats[id]
      if (vm.selected.sector === seat.sector && lines[seat.line]) {
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
  onSelectChange (select: string, data?: number) {
    const vm: any = this
    vm.selected[select] = data

    switch (select) {
      case 'sector':
        if (!vm.selected.sector) {
          vm.categories = vm.data.categories
        }

        vm.categories = Object.keys(vm.data.categories).reduce((r, e) => {
          const category = vm.data.categories[e]
          if (!data || category.sectors && category.sectors.has(data)) {
            r[e] = category
          }
          return r
        }, {})

        vm.selected.category = ''
        vm.selected.line = ''
        vm.selected.seat = ''

      case 'category':
        if (!vm.selected.sector) {
          vm.lines = vm.data.lines
        }

        let lines,
          line

        vm.lines = Object.keys(vm.data.lines).reduce((r, e) => {
          line = vm.data.lines[e]
          if ((!vm.selected.category || line.categories && line.categories.has(vm.selected.category)) &&
            (!vm.selected.sector || line.sectors && line.sectors.has(vm.selected.sector)) &&
              vm.freeSeats.has(`${vm.selected.sector}:${vm.selected.category}:${line.id}`)
          ) {
            r[e] = line
          }
          return r
        }, {})

        vm.selected.line = ''
        vm.selected.seat = ''

      case 'line':
        if (!vm.selected.sector && !vm.selected.category && !vm.selected.line) {
          return vm.data.seats
        }

        vm.seats = Object.keys(vm.data.seats).reduce((r, e) => {
          const seat = vm.data.seats[e]
          if (!seat.status &&
            (!vm.selected.category || seat.category === vm.selected.category) &&
            (!vm.selected.sector || seat.sector === vm.selected.sector) &&
            (!vm.selected.line || seat.line === vm.selected.line)) {
            r[e] = seat
          }
          return r
        }, {})

        vm.selected.seat = ''
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
    const vm = this;
    vm.selected.category = seat.category
    vm.onSelectChange('category', seat.category)
    vm.selected.line = seat.line
    vm.selected.seat = seat.id
    vm.selectedSeat = seat.id
  }

  /**
   * Show alert with current id
   */
  showAlert () {
    const vm = this
    if (vm.selected.sector && vm.selected.category && vm.selected.line) {
      alert(`id: ${vm.selected.seat}`)
    }
  }
}
