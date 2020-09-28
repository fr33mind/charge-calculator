// Register service worker to control making site work offline

if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('/charge-calculator/sw.js')
           .then(function() { 
             //console.log('Service Worker Registered');
          });
}


// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.querySelector('.a2hs-button');
const addBtnWrapper = document.querySelector('.a2hs-button-wrapper');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtnWrapper.style.display = 'block';

  addBtn.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    addBtnWrapper.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        //if (choiceResult.outcome === 'accepted') {
        //  console.log('User accepted the A2HS prompt');
        //} else {
        //  console.log('User dismissed the A2HS prompt');
        //}
        deferredPrompt = null;
      });
  });
});

let vehicle_select  = document.querySelector('.vehicle-select');
let soh_field  = document.querySelector('.soh-field');
let soh_input  = document.querySelector('.soh-input');
let real_capacity_input = document.querySelector('.real-capacity-input');
let energy_type_select = document.querySelector('.energy-type-select');
let current_field = document.querySelector('.current-field');
let electric_potential_field = document.querySelector('.electric-potential-field');
let current_input = document.querySelector('.current-input');
let electric_potential_input = document.querySelector('.electric-potential-input');
let power_input = document.querySelector('.power-input');
let calculate_button = document.querySelector('.calculate-button');
let actual_soc_input = document.querySelector('.actual-soc-input');
let desired_soc_input = document.querySelector('.desired-soc-input');
let charge_kwh_element = document.querySelector('.charge-kwh');
let estimated_time_element = document.querySelector('.estimated-time');
let start_time_input = document.querySelector('.start-time-input');
let leafCapacity = {
  "leaf24": "22",
  "leaf30": "27",
  "leaf40": "39",
  "leaf62": "62"
};

function onVehicleChange()
{
  let vehicle = vehicle_select.value;
  
  if (vehicle === 'custom') {
    soh_field.classList.add('hidden');
    real_capacity_input.value = '';
    real_capacity_input.removeAttribute('disabled');
  }
  else {
    soh_field.classList.remove('hidden');
    real_capacity_input.setAttribute('disabled', '');
    real_capacity_input.value = getRealCapacity(vehicle).toFixed(2);
  }  
}

function onSohChange()
{
  let vehicle = vehicle_select.value;
  let soh = soh_input.value;
 
  if (vehicle === 'custom')
    return;
  
  real_capacity_input.value = getRealCapacity(vehicle, soh).toFixed(2);
}

function getRealCapacity(vehicle, soh)
{
  let capacity = 0;
  
  if (vehicle === undefined)
    vehicle = vehicle_select.value;
  
  if (soh === undefined)
    soh = soh_input.value;
  
  if (vehicle in leafCapacity)
    capacity = parseInt(leafCapacity[vehicle]);
  
  return capacity * (soh / 100);
}

function onCurrentOrElectricPotentialChange()
{
  let current = current_input.value;
  let electric_potential = electric_potential_input.value;
  power_input.value = electric_potential * current;
}

function onEnergyTypeChange()
{
  let energy_type = energy_type_select.value;
  
  if (energy_type === 'w') {
    current_field.classList.add('hidden');
    electric_potential_field.classList.add('hidden');
    power_input.removeAttribute('disabled');
  }
  else if (energy_type === 'av') {
    current_field.classList.remove('hidden');
    electric_potential_field.classList.remove('hidden');
    power_input.setAttribute('disabled', '');  
    onCurrentOrElectricPotentialChange();
  }
}

function getTimeFormatted(hours, minutes)
{
  if (hours < 10)
    hours = '0' + hours;
  
  if (minutes < 10)
    minutes = '0' + minutes;
  
  return hours + ':' + minutes;
}

function checkValidity()
{
  let actual_soc = parseInt(actual_soc_input.value);
  let desired_soc = parseInt(desired_soc_input.value);
  
  if (desired_soc <= actual_soc) {
    actual_soc_input.setCustomValidity('Invalid SOC');
    desired_soc_input.setCustomValidity('Invalid SOC');
  }
  else {
    actual_soc_input.setCustomValidity('');
    desired_soc_input.setCustomValidity('');
  }
  
  let inputs = document.querySelectorAll('.inline-input');
  
  for (let i=0; i < inputs.length; i++) {
    if (typeof inputs[i].checkValidity !== 'function')
      return null;
    
    if (!inputs[i].checkValidity()) {
      return false;
    }
  }
  
  return true;
}

function onCalculateButtonClick()
{
  let valid = checkValidity();
  
  if (valid === null) {
    alert("Can't validate form. Browser probably too old, doesn't support checkValidity.");
    return;
  }
  
  if (!valid) {
    charge_kwh_element.textContent = '';
    estimated_time_element.textContent = '';
    return;
  }
  
  let actual_soc = parseInt(actual_soc_input.value);
  let desired_soc = parseInt(desired_soc_input.value);
  let real_capacity = parseFloat(real_capacity_input.value);
  let charge_capacity = ((desired_soc - actual_soc) / 100) * real_capacity;
  let power = parseInt(power_input.value);
  
  charge_kwh_element.textContent = charge_capacity.toFixed(2);
  
  let time = charge_capacity / (power / 1000);
  let hours = parseInt(time);
  let min = 0;
  
  if (hours > 0)
    min = parseInt((time % hours) * 60);
  else
    min = parseInt(time * 60);
  
  let now = new Date();
  let start_time = start_time_input.value;
  let end_time = null;
  
  if (start_time) {
    let split_time = start_time.split(':');
    let start_hours = parseInt(split_time[0]);
    let start_min = parseInt(split_time[1]);
    now.setHours(start_hours);
    now.setMinutes(start_min);
  }
  else {
    start_time = getTimeFormatted(now.getHours(), now.getMinutes());
  }
  
  now.setTime(now.getTime() + (hours*60*60*1000) + (min*60*1000));
  end_time = getTimeFormatted(now.getHours(), now.getMinutes());
  estimated_time_element.textContent = getTimeFormatted(hours, min) + ' (From '+start_time+' to '+end_time+')';
  
  saveToLocalStorage();
}

function saveToLocalStorage()
{
  if (typeof(Storage) === "undefined") {
    alert('LocalStorage is not available. Saving information will not be possible.');
    return;
  }
  
  let data = {};
  let inputs = document.querySelectorAll('.inline-input');
  
  for (let i=0; i < inputs.length; i++) {
    data[inputs[i].name] = inputs[i].value;
  }
  
  window.localStorage.setItem('charge-calculator', JSON.stringify(data));
}

function loadFromLocalStorage()
{
  let data = window.localStorage.getItem('charge-calculator');
  
  if (!data)
    return false;
  
  try {
    data = JSON.parse(data);
  }
  catch(error) {
    alert('Error decoding saved data: "' + error.message + '"');
    return false;
  }
  
  for(let key in data) {
    let input = document.querySelector('.inline-input[name="'+key+'"]');
    if (input)
      input.value = data[key];
  }
  
  return true;
}

loadFromLocalStorage();
onVehicleChange();
onEnergyTypeChange();

vehicle_select.onchange = onVehicleChange;
soh_input.onchange = onSohChange;
current_input.onchange = onCurrentOrElectricPotentialChange;
electric_potential_input.onchange = onCurrentOrElectricPotentialChange;
energy_type_select.onchange = onEnergyTypeChange;
calculate_button.onclick = onCalculateButtonClick;
