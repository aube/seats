<template>
  <div id="app">
    <aside>
      <label>
        Sectors
        <select class="form-control" v-model="selectedSector" @change="onSelectChange('sector')">
          <option
            v-for="option in sectors"
            :value="option.id"
            :key="option.id">{{option.name}}</option>
        </select>
      </label>

      <label>
        Categories
        <select class="form-control" v-model="selectedCategory" @change="onSelectChange('category')">
          <option
            v-for="option in categories"
            :value="option.id"
            :key="option.id">{{option.name}}</option>
        </select>
      </label>

      <label>
        Lines
        <select class="form-control" v-model="selectedLine" @change="onSelectChange('line')">
          <option
            v-for="option in lines"
            :value="option.id"
            :key="option.id">{{option.name}}</option>
        </select>
      </label>

      <label>
        Seats
        <select class="form-control" v-model="selectedSeat" @change="onSelectChange('seat')">
          <option
            v-for="option in seats"
            :value="option.id"
            :key="option.id">{{option.seat}}</option>
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
          :key="line.id"
          class="line">
          <span
            v-for="seat in line.seats"
            :key="seat.id"
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

<script lang='ts' src="./App.ts"></script>

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
