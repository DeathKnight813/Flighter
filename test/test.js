const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const expect = chai.expect;
chai.use(chaiHttp);
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { Builder, By, Key, until, WebDriver } = require('selenium-webdriver'), chrome = require('selenium-webdriver/chrome');
var driver;
let name, origin, destination, price, rating, addBtn, sortPrice, sortRating, flightItems, originFilter, destFilter;
const options = new chrome.Options();
options.addArguments(
    'headless'
);

describe('Flighter app \n', function() {
  this.timeout(100000);

  before(function(done) {
      driver = new Builder()
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build();
      driver.get('http://localhost:8000')
          .then(() => {
              done();
          });
  });

  after(function() {
      driver.quit();
  })

  beforeEach(async function() {
      driver.navigate().refresh();
      name = await driver.findElement(By.id("name"));
      origin = await driver.findElement(By.id("origin"));
      destination = await driver.findElement(By.id("destination"));
      price = await driver.findElement(By.id("price"));
      rating = await driver.findElement(By.id("rating"));
      addBtn = await driver.findElement(By.id("addBtn"));
      //Sorting Btn
      sortPrice = await driver.findElement(By.id("sortPrice"));
      sortRating = await driver.findElement(By.id("sortRating"));
      flightItems = await driver.findElement(By.id("flightItems"));
      // Aside
      originFilter = await driver.findElement(By.id("originFilter"));
      destFilter = await driver.findElement(By.id("destFilter"));
  })

  it('should add the flight card on clicking `Add` button', async function() {
    name.sendKeys('Spicejet');
    origin.sendKeys('Bangalore');
    destination.sendKeys('Delhi');
    price.sendKeys('1000');
    rating.sendKeys('4');
    await addBtn.click();
    const nameVal = await driver.executeScript("return document.querySelectorAll('#flightItems ul')[2].children[0].innerText");
    expect(nameVal).to.contain('Flight Name');
    expect(nameVal).to.contain('Spicejet');
    const originDestVal = await driver.executeScript("return document.querySelectorAll('#flightItems ul')[2].children[1].innerText");
    expect(originDestVal).to.contain('Bangalore to Delhi');
    const priceVal = await driver.executeScript("return document.querySelectorAll('#flightItems ul')[2].children[2].innerText");
    expect(priceVal).to.contain('4*');
    const ratingVal = await driver.executeScript("return document.querySelectorAll('#flightItems ul')[2].children[3].innerText");
    expect(ratingVal).to.contain('1000');
  });

  it('should show error when input fields are empty', async function() {
    name.sendKeys('');
    origin.sendKeys('');
    destination.sendKeys('');
    price.sendKeys('');
    rating.sendKeys('');
    await addBtn.click();
    const hasNoItem = await driver.executeScript("return document.querySelectorAll('#flightItems ul').length === 2");
    const displayError = await driver.executeScript("return getComputedStyle(document.getElementsByClassName('error')[0]).display !== 'none'");
    expect(hasNoItem).to.be.true;
    expect(displayError).to.be.true;
  });

  it('should reset after adding a flight item', async function() {
    name.sendKeys('Spicejet');
    origin.sendKeys('Bangalore');
    destination.sendKeys('Delhi');
    price.sendKeys('1000');
    rating.sendKeys('4');
    await addBtn.click();

    let messageDisplay = await name.getAttribute('value');
    expect(messageDisplay).to.equal('');
    messageDisplay = await origin.getAttribute('value');
    expect(messageDisplay).to.equal('');
    messageDisplay = await destination.getAttribute('value');
    expect(messageDisplay).to.equal('');
    messageDisplay = await price.getAttribute('value');
    expect(messageDisplay).to.equal('');
    messageDisplay = await rating.getAttribute('value');
    expect(messageDisplay).to.equal('');
  });
  
  it('should allow, sort by price', async function() {
    name.sendKeys('Indigo');
    origin.sendKeys('Manali');
    destination.sendKeys('Bali');
    price.sendKeys('5000');
    rating.sendKeys('1');
    await addBtn.click();

    // Ascending
    await sortPrice.click();
    const priceElt1 = "document.querySelectorAll('#flightItems ul')[0].children[3].innerText";
    const priceElt2 = "document.querySelectorAll('#flightItems ul')[1].children[3].innerText";
    const priceElt3 = "document.querySelectorAll('#flightItems ul')[2].children[3].innerText";
    let price1 = await driver.executeScript(`return ${priceElt1}`);
    expect(price1).to.contain('3000');
    let price2 = await driver.executeScript(`return ${priceElt2}`);
    expect(price2).to.contain('4000');
    let price3 = await driver.executeScript(`return ${priceElt3}`);
    expect(price3).to.contain('5000');
    driver.takeScreenshot().then(
      function(image, err) {
          require('fs').writeFile('price-sorting-ascending.png', image, 'base64', function(err) {});
      }
    );

    await sortPrice.click();
    price1 = await driver.executeScript(`return ${priceElt1}`);
    expect(price1).to.contain('5000');
    price2 = await driver.executeScript(`return ${priceElt2}`);
    expect(price2).to.contain('4000');
    price3 = await driver.executeScript(`return ${priceElt3}`);
    expect(price3).to.contain('3000');
  });

  it('should allow to sort by Rating', async function() {
    name.sendKeys('Indigo');
    origin.sendKeys('Manali');
    destination.sendKeys('Bali');
    price.sendKeys('5000');
    rating.sendKeys('1');
    await addBtn.click();

    // Ascending
    let rating1Elt = "document.querySelectorAll('#flightItems ul')[0].children[2].innerText";
    let rating2Elt = "document.querySelectorAll('#flightItems ul')[1].children[2].innerText";
    let rating3Elt = "document.querySelectorAll('#flightItems ul')[2].children[2].innerText";
    await sortRating.click();
    let rating1 = await driver.executeScript(`return ${rating1Elt}`);
    expect(rating1).to.contain('1');
    let rating2 = await driver.executeScript(`return ${rating2Elt}`);
    expect(rating2).to.contain('2');
    let rating3 = await driver.executeScript(`return ${rating3Elt}`);
    expect(rating3).to.contain('3');
    
    await sortRating.click();
    rating1 = await driver.executeScript(`return ${rating1Elt}`);
    expect(rating1).to.contain('3');
    rating2 = await driver.executeScript(`return ${rating2Elt}`);
    expect(rating2).to.contain('2');
    rating3 = await driver.executeScript(`return ${rating3Elt}`);
    expect(rating3).to.contain('1');
    driver.takeScreenshot().then(
      function(image, err) {
          require('fs').writeFile('rating-sorting-descending.png', image, 'base64', function(err) {});
      }
    );
  });

  it('should change asc/desc text while Sorting based on Price and Rating', async function() {
    // Ascending
    await sortPrice.click();
    let sortPriceElt = "document.querySelector('#sortPrice').innerText";
    let sortPriceText = await driver.executeScript(`return ${sortPriceElt}`);
    expect(sortPriceText.toLowerCase()).to.contain('asc');
    expect(sortPriceText.toLowerCase()).to.not.contain('desc');

    await sortRating.click();
    let sortRatingElt = "document.querySelector('#sortPrice').innerText";
    let sortRatingText = await driver.executeScript(`return ${sortRatingElt}`);
    expect(sortRatingText.toLowerCase()).to.contain('asc');
    expect(sortRatingText.toLowerCase()).to.not.contain('desc');

    // Descending
    await sortPrice.click();
    sortPriceElt = "document.querySelector('#sortPrice').innerText";
    sortPriceText = await driver.executeScript(`return ${sortPriceElt}`);
    expect(sortPriceText.toLowerCase()).to.contain('desc');
    expect(sortPriceText.toLowerCase()).to.not.contain('asc');
    await sortRating.click();
    sortRatingElt = "document.querySelector('#sortPrice').innerText";
    sortRatingText = await driver.executeScript(`return ${sortRatingElt}`);
    expect(sortRatingText.toLowerCase()).to.contain('desc');
    expect(sortRatingText.toLowerCase()).to.not.contain('asc');
  });

  it('should have specified Bg colors in sorter heading, easy access and flights card', async function() {
    const jsGetSorterBg = "getComputedStyle(document.getElementById('sorter')).backgroundColor === 'rgb(222, 184, 135)'";
    const jsGetCardBg = "getComputedStyle(document.querySelectorAll('#flightItems ul')[2]).backgroundColor === 'rgb(250, 235, 215)'";
    const jsGetEasyAccessBg = "getComputedStyle(document.getElementById('easyAccess')).backgroundColor === 'rgb(95, 158, 160)'";

    name.sendKeys('Spicejet');
    origin.sendKeys('Bangalore');
    destination.sendKeys('Delhi');
    price.sendKeys('1000');
    rating.sendKeys('4');
    await addBtn.click();

    let bgColor =  await driver.executeScript(`return ${jsGetSorterBg}`);
    expect(bgColor).to.be.true;
    bgColor =  await driver.executeScript(`return ${jsGetCardBg}`);
    expect(bgColor).to.be.true;
    bgColor =  await driver.executeScript(`return ${jsGetEasyAccessBg}`);
    expect(bgColor).to.be.true;
  });

  it('should add source to Easy Access Section', async function() {
    name.sendKeys('Indigo');
    origin.sendKeys('Manali');
    destination.sendKeys('Bali');
    price.sendKeys('1000');
    rating.sendKeys('4');
    await addBtn.click();
    const jsEasyAccess = "document.querySelectorAll('#originFilter li')[2].innerText === 'Manali'";
    let hasValidOrigin =  await driver.executeScript(`return ${jsEasyAccess}`);
    expect(hasValidOrigin).to.be.true;
  });

  it('should add Destination to Easy Access Section', async function() {
    name.sendKeys('Indigo');
    origin.sendKeys('Bangalore');
    destination.sendKeys('Bali');
    price.sendKeys('1000');
    rating.sendKeys('4');
    await addBtn.click();
    const jsEasyAccess = "document.querySelectorAll('#destFilter li')[2].innerText === 'Bali'";
    let hasValidDest =  await driver.executeScript(`return ${jsEasyAccess}`);
    expect(hasValidDest).to.be.true;
  });

  it('should avoid adding duplicate entries to Source and Destination of Easy Access Section', async function() {
    name.sendKeys('Indigo');
    origin.sendKeys('Goa');
    destination.sendKeys('Chennai');
    price.sendKeys('1000');
    rating.sendKeys('4');
    await addBtn.click();

    const nameVal = await driver.executeScript("return document.querySelectorAll('#flightItems ul')[2].children[0].innerText");
    expect(nameVal).to.contain('Flight Name');
    expect(nameVal).to.contain('Indigo');

    const jsEasyAccess = "document.querySelectorAll('#originFilter li').length === 2";
    let hasNoDuplicateSource =  await driver.executeScript(`return ${jsEasyAccess}`);
    expect(hasNoDuplicateSource).to.be.true;

    const jsEasyAccessDest = "document.querySelectorAll('#destFilter li').length === 2";
    let hasNoDuplicateDest =  await driver.executeScript(`return ${jsEasyAccessDest}`);
    expect(hasNoDuplicateDest).to.be.true;
  });

  it('should have card layout for flights card', async function() {
    name.sendKeys('Indigo');
    origin.sendKeys('Bangalore');
    destination.sendKeys('Delhi');
    price.sendKeys('1000');
    rating.sendKeys('4');
    await addBtn.click();

    let jsGetBrderRadius = 'getComputedStyle(document.querySelectorAll(".card")[2]).borderRadius !== "0px"';
    let hasBorderRadius =  await driver.executeScript(`return ${jsGetBrderRadius}`);
    expect(hasBorderRadius).to.be.true;

    let jsGetBoxShadow = 'getComputedStyle(document.querySelectorAll(".card")[2]).boxShadow !== "none"';
    let hasBoxShadow =  await driver.executeScript(`return ${jsGetBoxShadow}`);
    expect(hasBoxShadow).to.be.true;

  });
});
