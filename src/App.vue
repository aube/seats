<template>
  <div id="app">
    <aside>
      <com-select
        label="Sectors"
        name="sector"
        :value="selected.sector"
        :options="sectors"
        @onSelectChange="onSelectChange"
      ></com-select> 

      <com-select
        label="Categories"
        name="category"
        :value="selected.category"
        :options="categories"
        @onSelectChange="onSelectChange"
      ></com-select> 

      <com-select
        label="Lines"
        name="line"
        :value="selected.line"
        :options="lines"
        @onSelectChange="onSelectChange"
      ></com-select> 

      <com-select
        label="Seats"
        name="seat"
        optionNameKey="seat"
        :value="selected.seat"
        :options="seats"
        @onSelectChange="onSelectChange"
      ></com-select> 

      <button @click="showAlert">Save</button>
    </aside>

    <main class="content">
      <div
        v-if="selected.sector"
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
              active: seat.id == selected.seat
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
