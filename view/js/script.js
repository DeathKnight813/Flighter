function flighter() {
  this.nameElt = null;
  this.ratingElt = null;
  this.priceElt = null;
  this.originElt = null;
  this.destinationElt = null;
  this.flightList = [...window.flightList];
  // Helps with eliminating duplicates
  this.flights = {
    origin: {},
    destination: {}
  }
  this.flightList.forEach((fltItem) => {
    this.flights.origin[fltItem.origin] = true;
    this.flights.destination[fltItem.destination] = true;
  });
}
// Provides the Next Flights Card to be loaded into the DOM
flighter.prototype.nextCardHTML = function(card) {
  const nextCardElt = document.createElement('ul');
  nextCardElt.className = "card";
  nextCardElt.innerHTML = `
    <li class="padT5">Flight Name: ${card.name}</li>
    <li class="padT5">${card.origin} to ${card.destination}</li>
    <li class="padT5">Rating: ${card.rating}*</li>
    <li class="padT5">Price: Rs.${card.price}</li>`;
  return nextCardElt;
}

flighter.prototype.resetFields = function() {
  this.nameElt.value = '';
  this.ratingElt.value = '';
  this.priceElt.value = '';
  this.originElt.value = '';
  this.destinationElt.value = '';
}

flighter.prototype.updateEasyAccess = function(card) {
  if (!this.flights.origin[card.origin]) {
    this.flights.origin[card.origin] = true;
    const originFilterElt = document.getElementById('originFilter');
    const nextOriginElt = document.createElement('li');
    nextOriginElt.className = 'padL10';
    nextOriginElt.innerText = card.origin;
    originFilterElt.append(nextOriginElt);
  }
  if (!this.flights.destination[card.destination]) {
    this.flights.destination[card.destination] = true;
    const destFilterElt = document.getElementById('destFilter');
    const nextDestElt = document.createElement('li');
    nextDestElt.className = 'padL10';
    nextDestElt.innerText = card.destination;
    destFilterElt.append(nextDestElt);
  }
}

flighter.prototype.addCard = function() {
  const card = {};
  card.name = this.nameElt.value;
  card.rating = this.ratingElt.value;
  card.price = this.priceElt.value;
  card.origin = this.originElt.value;
  card.destination = this.destinationElt.value;

  if (card.name === '' ||  card.origin === '' || card.destination === '' ||  card.rating === '' || card.price === '') {
    document.getElementsByClassName('error')[0].classList.remove('dn');
    return null;
  }
  document.getElementsByClassName('error')[0].classList.add('dn');
  const itemsContainer = document.getElementById('flightItems');
  itemsContainer.append(this.nextCardHTML(card));
  this.updateEasyAccess(card);
  this.flightList.push(card);
  this.resetFields();
}

// Sorting the flightList based on the sorting applied
flighter.prototype.flightSorter = function(property, isAscending) {
  this.flightList.sort((a,b) => {
    return isAscending ? a[property] - b[property] : b[property] - a[property];
  });
}

// Update asc/desc value next to Sort by heading
flighter.prototype.updateSortDOM = function(elt, type, isAscending) {
  elt.dataset.sort = isAscending ? 'desc' : 'asc';
  elt.innerText = `Sort by ${type} (${isAscending ? 'asc' : 'desc'})`;
}

// Change the order of flights if needed
flighter.prototype.updateFlightList= function() {
  const itemsContainer = document.getElementById('flightItems');
  itemsContainer.innerHTML = '';
  this.flightList.forEach((card) => {
    itemsContainer.append(this.nextCardHTML(card));
  });
}

// decide type of sorting involved
flighter.prototype.sortFlights = function(e) {
  const isAscending =  e.target.dataset.sort === 'asc';
  let sortingParam = ''
  if (e.target.id === 'sortRating') {
    sortingParam = 'rating';
    paramHeading = 'Rating';
  } else if (e.target.id === 'sortPrice') {
    sortingParam = 'price';
    paramHeading = 'Price';
  }
  this.flightSorter(sortingParam, isAscending);
  this.updateSortDOM(e.target, paramHeading, isAscending);
  this.updateFlightList();
}

flighter.prototype.init = function() {
  this.nameElt = document.getElementById('name');
  this.ratingElt = document.getElementById('rating');
  this.priceElt = document.getElementById('price');
  this.originElt = document.getElementById('origin');
  this.destinationElt = document.getElementById('destination');

  this.addElt = document.getElementById('addBtn');
  this.sortElt = document.getElementById('sorter');
  this.addElt.addEventListener('click', this.addCard.bind(this));
  this.sortElt.addEventListener('click', this.sortFlights.bind(this));
}

var flighterApp = new flighter();
flighterApp.init();

