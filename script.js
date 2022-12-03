'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



// let map, mapEvent;
class Worrkout {
  date = new Date();
  id = (Date.now()+"").slice(-10)
  clicks = 0
  // id = Date.now();
  constructor(distance, duration, coord, type) {
    this.distance = distance;
    this.duration = duration;
    this.coord = coord;
    this.type = type;
    // this._setDescription()
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
      'November', 'December'];
    console.log(this.type[0]);
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }

  click(){
    this.clicks++
  }
}

class Running extends Worrkout {
  constructor(coord, distance, duration, type, cadence) {
    super(distance, duration, coord, type);
    this.cadence = cadence;
    // this.pace = pace;
    this.getPace();
    this._setDescription()
  }

  getPace() {
    this.pace = this.cadence / this.distance;
    console.log(this.pace);

    return this.pace;
  }
}

class Cycling extends Worrkout {
  constructor(coord, distance, duration, type, eleveationGain) {
    super(distance, duration, coord, type);
    // this.cadence = cadence;
    this.eleveationGain = eleveationGain;
    this.getSpeed();
    this._setDescription()
  }

  getSpeed() {
    this.speed = this.eleveationGain / (this.distance / 60);
    console.log(this.speed);
    return this.speed;
  }
}

// const run = new Running([39, -12], 5.2, 24, 178);
// const cyc = new Cycling([39, -12], 27, 95, 178);
// console.log(run);
// console.log(cyc);

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = []
  zoomLevel = 15
  // #workout;
  constructor() {
    console.log('aa');
    this._getMapdate()
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._movetoPopup.bind(this))
  }



  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('No location');
      }
    );
  }

  _loadMap(position) {
    console.log(position);
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    // console.log(`https://www.google.ng/maps/@${latitude},${longitude}`);
    // console.log(latitude);
    const coord = [latitude, longitude];

    this.#map = L.map('map').setView(coord, this.zoomLevel);
    // console.log(map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this.renderWorkoutMarker(work)
    })
  }

  _showForm(mapEv) {
    console.log(mapEv);
    this.#mapEvent = mapEv;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    // clear input fields and hide form
    form.style.display = 'none'
    form.classList.add('hidden');
    setTimeout(() => form.style.display = 'grid', 1000);
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ""

  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    const Isanumber = (...inputs) => inputs.every(inp => Number.isFinite(inp))
    const isPositive = (...values) => values.every(inp => inp > 0)
    //get data from form
    const type = inputType.value
    const distance = +inputDistance.value
    const duration = +inputDuration.value
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;


    //if activity runing create running object
    if (type === 'running') {
      //check if the data is valid
      const cadence = +inputCadence.value
      // if(!Number.isFinite(distance)|| !Number.isFinite(duration) || !Number.isFinite(cadence))return ("value is not a number or not a positive number")
      if (!Isanumber(distance, duration, cadence) || !isPositive(distance, duration, cadence)) return alert("not  number")

      workout = new Running([lat, lng], distance, duration, type, cadence)


    }




    //if activity cycling create cycling object
    if (type === 'cycling') {
      const elevgain = +inputElevation.value
      //check if the data is valid
      if (!Isanumber(distance, duration, elevgain) || !isPositive(distance, duration)) return alert("not  number")

      workout = new Cycling([lat, lng], distance, duration, type, elevgain)


    }
    // Add new object to workout array
    this.#workouts.push(workout)

    console.log(workout);


    // render workout on map



    //display marker
    this.renderWorkoutMarker(workout)

    // render new workout on list
    this._renderWorkout(workout)

    this._hideForm()

    this._saveMapinfo()








  }



  renderWorkoutMarker(workout) {
    L.marker(workout.coord)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          closeOnClick: false,
          autoClose: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
      .openPopup();
  }

  _renderWorkout(workout) {
    let html =
      `<li class="workout workout--${workout.type}" data-id=${workout.id}>
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`

    if (workout.type === 'running')
      html +=
        `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`
    if (workout.type === 'cycling')
      html +=
        `<div class="workout__details">
   <span class="workout__icon">⚡️</span>
   <span class="workout__value">${workout.speed.toFixed(1)}</span>
   <span class="workout__unit">km/h</span>
 </div>
 <div class="workout__details">
   <span class="workout__icon">⛰</span>
   <span class="workout__value">${workout.eleveationGain}</span>
   <span class="workout__unit">m</span>
 </div>
</li>`

    form.insertAdjacentHTML("afterend", html)
  }
  _movetoPopup(e){
    const formEl = e.target.closest('.workout')

    if (!formEl)return
    console.log(formEl);
    const check  = this.#workouts.find(workinf => workinf.id === formEl.dataset.id)
    console.log(this.#workouts);
    
    
    this.#map.setView(check.coord,this.zoomLevel,{
      animate: true,
      pan:{
        duration:1,
      }
    })

    check.click()
    
    
  }
  _saveMapinfo(workout){
    localStorage.setItem('workout',JSON.stringify(this.#workouts))

  }
  _getMapdate(){
    const data = JSON.parse(localStorage.getItem('workout'))
    this.#workouts = data
    this.#workouts.forEach(work => {
      this._renderWorkout(work)
      
    })
  }
}

const app = new App();

