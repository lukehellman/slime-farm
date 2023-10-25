"use strict";

import * as model from "./model.js";
import * as view from "./views/view.js";
import {
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  COLORS_IN_WHEEL,
  COLORS_NOT_IN_WHEEL,
  DEFAULT_UNLOCKED_COLORS,
} from "./config.js";
import { randomInt } from "./helpers.js";

// import "core-js/stable";
// import "regenerator-runtime/runtime";
// if (module.hot) {
//   module.hot.accept();
// }

class Color {
  static allColors = [];
  static unlockedColors = this.allColors.filter((color) => color.unlocked);
  static wheel;

  wallet;

  paraCW;
  paraCCW;
  metaCW;
  metaCCW;
  anti;

  unlocked = false;

  constructor(nameStr) {
    this.nameStr = nameStr;
    Color.allColors.push(this);
  }

  static generateWheel(...colors) {
    colors.forEach(function (color, i, arr) {
      color.paraCW = arr[(i + 1) % 6];
      color.metaCW = arr[(i + 2) % 6];
      color.anti = arr[(i + 3) % 6];
      color.metaCCW = arr[(i + 4) % 6];
      color.paraCCW = arr[(i + 5) % 6];
    });
    return colors;
  }

  static createWallets(colors) {
    colors.forEach((color) => {
      const newWallet = document.createElement("div");
      newWallet.classList.add(`wallet`, `${color.nameStr}`, `hidden`);
      newWallet.insertAdjacentHTML(
        "beforeend",
        `
          <h3 class="total-owned">${playerInventory[color.nameStr]}</h3>
          <p class="production-rate">${color.productionRate || 0}/s</p>
        `
      );
      color.wallet = newWallet;
      walletContainer.insertAdjacentElement("beforeend", newWallet);
    });
  }

  static getColorFromString(str) {
    return Color.allColors.find((color) => color.nameStr === str);
  }

  updateWallet() {
    this.wallet.innerHTML = "";
    this.wallet.insertAdjacentHTML(
      "beforeend",
      `
        <h3 class="total-owned">${playerInventory[this.nameStr]}</h3>
        <p class="production-rate">${this.productionRate || 0}/s</p>
      `
    );
  }

  combineColor(input) {
    if (input === this.metaCW) return this.paraCW;
    if (input === this.metaCCW) return this.paraCCW;
    if (input === this.anti) return white;
    return this;
  }

  unlock() {
    this.unlocked = true;
    appContainer
      .querySelectorAll(`.${this.nameStr}`)
      ?.forEach((el) => el.classList.remove("hidden"));
  }
}

class Inventory {
  constructor() {
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.cyan = 0;
    this.magenta = 0;
    this.yellow = 0;
  }

  increase(color, amount = 1) {
    this[color.nameStr] += amount;
    return this;
  }
  decrease(color, amount = 1) {
    this[color.nameStr] -= amount;
    return this;
  }

  combineInventory() {
    console.log("combineInventory method to be built");
  }
}

class Button {
  static arr = [];
  el;
  callback;
  args;

  constructor(
    displayText = "Button",
    callback = () => console.error("No function specified."),
    ...args
  ) {
    this.el = document.createElement("div");
    this.el.classList.add("btn-frame");
    this.el.insertAdjacentHTML(
      "beforeend",
      `<div class="btn">${displayText}</div>`
    );

    this.callback = callback.bind(this);
    this.args = args;

    Button.arr.push(this);
    this.el.dataset.btnID = Button.arr.findIndex(
      (arrayItem) => arrayItem === this
    );
  }

  // BUTTON METHODS
  // parameters: clickEvent, [additionalArguments]

  static argumentsTest = function (e, args) {
    console.log(Button.getClickedSlideColor(e).nameStr, ...args);
  };

  static getClickedSlideColor = function (e) {
    return Color.getColorFromString(
      `${e.target.closest(".slide").dataset.color}`
    );
  };

  static colorRandomTile = function (e) {
    const randomOpenTile = grid.getRandomOpenTile();
    randomOpenTile.setColor(Button.getClickedSlideColor(e));
    console.log(
      `Tile ${randomOpenTile.positionIndex} was turned ${randomOpenTile.color.nameStr}.`
    );
  };

  static setPaintMode(mode) {
    grid.paintMode = mode;
  }
  static buyProducer(e, level = 0) {
    // remove the cost from playerInventory
    const newProducer = new Producer(Button.getClickedSlideColor(e), ...level);
    console.log(newProducer);
  }
  // buyCollector() {}
  // unlockUpgrade() {}
  // buyUpgrade() {}
}

class MenuTab {
  el;
  contents;

  constructor(tabHeading = "Tab") {
    this.el = document.createElement("div");
    this.el.classList.add("tab");
    this.el.insertAdjacentHTML(
      "beforeend",
      `<h2 class="tab-header">${tabHeading}</h2>
      <div class="tab-contents"></div>`
    );
    this.contents = this.el.querySelector(".tab-contents");
    menuSection.insertAdjacentElement("beforeend", this.el);
  }

  insertButton(
    location,
    displayText = "Button",
    callbackFunction = () => console.error(`insertButton lacks callback`),
    ...args
  ) {
    location.insertAdjacentElement(
      "beforeend",
      new Button(`${displayText}`, callbackFunction, ...args).el
    );
  }

  insertSlides(colors) {
    const newContainer = document.createElement("container");
    newContainer.classList.add("slides-container");
    this.contents.insertAdjacentElement("beforeend", newContainer);

    const newNav = document.createElement("nav");
    newNav.classList.add("slides-nav");
    this.contents.insertAdjacentElement("beforeend", newNav);

    colors.forEach((color) => {
      const slide = document.createElement("div");
      slide.dataset.color = color.nameStr;
      slide.classList.add(`slide`, `${color.nameStr}`, `hidden`);

      const slideContents = document.createElement("div");
      slideContents.insertAdjacentHTML("beforeend", `<p></p>`); // put the slide layout here
      slideContents.classList.add("slide-contents");

      slide.insertAdjacentElement("beforeend", slideContents);

      this.insertButton(slideContents, "Spawn New Unit", Button.buyProducer, 1);

      this.insertButton(
        slideContents,
        "Color Random Tile",
        Button.colorRandomTile
      );

      this.insertButton(
        slideContents,
        "Arguments Test",
        Button.argumentsTest,
        1,
        2,
        3
      );

      newContainer.insertAdjacentElement("beforeend", slide);

      const newNavPage = document.createElement("div");
      newNavPage.classList.add(`nav-page`, `${color.nameStr}`, `hidden`);
      newNav.insertAdjacentElement("beforeend", newNavPage);
    });
  }
}

class ShopItem {
  constructor(name, description, price, ...buttons) {}
}

class Grid {
  allUnits = [];
  allTiles = [];
  paintMode = false;

  constructor(height = 5, width = 5) {
    this.height = height;
    this.width = width;
    this.totalNumberTiles = this.height * this.width;

    gridElement.style.gridTemplate = `repeat(${this.height}, 1fr) / repeat(${this.width}, 1fr)`;

    for (let i = 0; i < this.totalNumberTiles; i++) {
      this.allTiles.push(new Tile(i));
    }
  }

  getOpenTiles(color = white) {
    // returns array of tile positions which the color passed in can be placed on
    const unoccupied = this.allTiles.filter((tile) => !tile.resident);

    const matching = unoccupied.filter((tile) => tile.color === color);
    if (matching.length > 0) return matching.map((tile) => tile.positionIndex);

    const adjacent = unoccupied.filter(
      (tile) => tile.color === color.paraCW || tile.color === color.paraCCW
    );
    if (adjacent.length > 0) return adjacent.map((tile) => tile.positionIndex);

    const whiteTiles = unoccupied.filter((tile) => tile.color === white);
    if (whiteTiles.length > 0)
      return whiteTiles.map((tile) => tile.positionIndex);

    const nonadjacent = unoccupied.filter(
      (tile) => tile.color === color.metaCW || tile.color === color.metaCCW
    );
    return nonadjacent.map((tile) => tile.positionIndex);
  }

  getRandomOpenTile(color = white) {
    const openTiles = this.getOpenTiles(color);
    if (openTiles.length <= 0) return console.error("no open tiles");
    return grid.allTiles[openTiles[randomInt(0, openTiles.length - 1)]];
  }

  expandGrid() {
    this.height < this.width
      ? this.#expandGridVertical()
      : this.#expandGridHorizontal();
  }

  #expandGridVertical() {
    // adds an additional grid row to the bottom:
    // add gridWidth number of black tiles to the end of the array
    // height ++
  }
  #expandGridHorizontal() {
    // adds an additional grid column to the right side:
    // after every oldWidth number of black tiles, add 1 new tile to the array
    // width ++
  }
}

class Tile {
  constructor(positionIndex, color = white) {
    this.positionIndex = positionIndex;
    this.color = color;

    this.el = document.createElement("div");
    this.el.classList.add("tile", this.color.nameStr);
    this.el.dataset.positionIndex = this.positionIndex;
    this.el.dataset.color = this.color.nameStr;
    gridElement.insertAdjacentElement("beforeend", this.el);
  }

  setColor(color) {
    this.el.classList.remove(`${this.el.dataset.color}`);
    this.color = color;
    this.el.dataset.color = this.color.nameStr;
    this.el.classList.add(this.el.dataset.color);
    return this.positionIndex;
  }

  static get height() {
    return grid.allTiles[0].el.clientHeight;
  }
  static get width() {
    return grid.allTiles[0].el.clientWidth;
  }

  get resident() {
    return grid.allUnits.find(
      (unit) => unit.positionIndex === this.positionIndex
    );
  }
  get northNeighborID() {
    if (this.positionIndex <= grid.width - 1) return false;
    return this.positionIndex - grid.width;
  }
  get southNeighborID() {
    if (this.positionIndex >= grid.totalNumberTiles - grid.width) return false;
    return this.positionIndex + grid.width;
  }
  get eastNeighborID() {
    if (this.positionIndex % grid.width === grid.width - 1) return false;
    return this.positionIndex + 1;
  }
  get westNeighborID() {
    if (this.positionIndex % grid.width === 0) return false;
    return this.positionIndex - 1;
  }
  get northNeighborTile() {
    return grid.allTiles[this.northNeighborID];
  }
  get southNeighborTile() {
    return grid.allTiles[this.southNeighborID];
  }
  get eastNeighborTile() {
    return grid.allTiles[this.eastNeighborID];
  }
  get westNeighborTile() {
    return grid.allTiles[this.westNeighborID];
  }
}

class Unit {
  constructor() {}
}

class Producer extends Unit {
  type = "producer";

  constructor(color, level = 0, inventory = new Inventory()) {
    super();
    this.color = color;
    this.level = level;
    this.inventory = inventory;
    this.el = document.createElement("div");

    this.el.classList.add(`${this.type}-unit`, `${this.color.nameStr}`);
    this.el.innerText = `Lv. ${this.level}`;

    const spawnTile = grid.getRandomOpenTile(color);
    spawnTile.el.insertAdjacentElement("beforeend", this.el);
    this.positionIndex = spawnTile.positionIndex;

    grid.allUnits.push(this);
  }

  get currentTile() {
    return grid.allTiles.find(
      (tile) => tile.positionIndex === this.positionIndex
    );
  }

  get productionIncrement() {
    if (this.currentTile.color === this.color) return 2;
    if (
      this.currentTile.color === this.color.paraCCW ||
      this.currentTile.color === this.color.paraCW
    )
      return 1.5;
    if (this.currentTile.color === white) return 1;
    if (
      this.currentTile.color === this.color.metaCCW ||
      this.currentTile.color === this.color.metaCW
    )
      return 0.5;
    if (
      this.currentTile.color === this.color.anti ||
      this.currentTile.color === black
    )
      return 0;
  }

  get maxCapacity() {}

  moveToTile(tile) {
    if (!this.checkValidMove(tile)) return;

    this.positionIndex = tile.positionIndex;
    this.el.remove;
    tile.el.insertAdjacentElement("beforeend", this.el);
  }

  moveOnGrid(direction) {
    if (direction === "north")
      this.moveToTile(this.currentTile.northNeighborTile);
    if (direction === "south")
      return this.moveToTile(this.currentTile.southNeighborTile);
    if (direction === "east")
      return this.moveToTile(this.currentTile.eastNeighborTile);
    if (direction === "west")
      return this.moveToTile(this.currentTile.westNeighborTile);
  }

  checkFuseCompatibility(target) {
    if (this.level !== target.level || this.type !== target.type) return false;
    return true;
  }

  fuseUnit(target) {
    console.log("fusion attempted");
    const childType = this.type;
    const childLevel = this.level + 1;
    const childColor = this.color.combineColor(target.color);
    const childInventory = this.inventory.combineInventory(target.inventory);
    // delete both parent units: DOM element and array object
    // return a new child unit using this data
  }

  idleBehavior() {}

  wander() {}

  checkValidMove(tile) {
    if (
      !tile ||
      (tile.resident && !this.checkFuseCompatibility(tile.resident)) ||
      tile.color === this.color.anti ||
      tile.color === black
    )
      return false;

    if (tile.resident && this.checkFuseCompatibility(tile.resident))
      this.fuseUnit(tile.resident);

    return true;
  }

  produceMaterial() {}

  signalInventoryFull() {}
}

class Collector extends Unit {
  currentTask;
  restPosition;

  constructor(positionIndex, color, level) {
    super(positionIndex);
  }

  get range() {}
  get depositSpeed() {}
  get movespeed() {}

  findRestPosition() {}
  findDepositLocation() {}
  findCollectionLocation() {}
  collectMaterial() {}
  depositMaterial() {}
}

///////////////////

// DEFINING DOM ELEMENTS

const appContainer = document.querySelector(".app-container");
const walletContainer = appContainer.querySelector(".wallets");
const gridElement = appContainer.querySelector(".grid");
const messageBox = appContainer.querySelector(".message-box");
const menuSection = appContainer.querySelector(".menu-section");

// DEFINING COLORS

const red = new Color("red");
const yellow = new Color("yellow");
const green = new Color("green");
const cyan = new Color("cyan");
const blue = new Color("blue");
const magenta = new Color("magenta");
const white = new Color("white");
const black = new Color("black");

Color.wheel = Color.generateWheel(red, yellow, green, cyan, blue, magenta);

// INITIALIZING INTERNAL DATA

const playerInventory = new Inventory();
const grid = new Grid(DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH);

// INITIALIZING MENU

// creating the wallets
Color.createWallets(Color.wheel);

// creating the tabs
const unitsTab = new MenuTab("Units");
unitsTab.insertSlides(Color.wheel);
const paintTab = new MenuTab("Grid");
const upgradesTab = new MenuTab("Upgrades");

// selects the first tab as active by default
menuSection.querySelector(".tab").classList.add("active-tab");

// menu event handler

menuSection.addEventListener("click", function (e) {
  // switching tabs
  if (e.target.classList.contains("tab-header")) {
    menuSection.querySelector(".active-tab")?.classList.remove("active-tab");
    e.target.closest(".tab").classList.add("active-tab");
    return;
  }

  // switching pages within a slide
  if (e.target.classList.contains("nav-page")) {
    let pageNumber = [...e.target.closest(".slides-nav").children]
      .filter((el) => !el.classList.contains("hidden"))
      .findIndex((input) => input === e.target);
    e.target
      .closest(".tab")
      .querySelector(
        ".slides-container"
      ).style.transform = `translateX(-${pageNumber}00%)`;
    return;
  }

  // clicking on a button executes its callback function
  if (e.target.classList.contains("btn")) {
    const curBtn = Button.arr[e.target.closest(".btn-frame").dataset.btnID];
    curBtn.callback(e, curBtn.args);
  }
});

// grid event handler

gridElement.addEventListener("click", function (e) {
  if (e.target.classList.contains("tile")) {
    const currentTile = grid.allTiles.find((tile) => tile.el === e.target);

    if (grid.paintMode) currentTile.setColor(grid.paintMode);
  }

  if (e.target.classList.contains("producer-unit")) {
    const currentUnit = grid.allUnits.find((unit) => unit.el === e.target);

    playerInventory.increase(currentUnit.color, currentUnit.level);
    currentUnit.color.updateWallet();
  }
});

// test unit movement
document.addEventListener("keydown", function (e) {
  if (e.key === "w") redTestProd.moveOnGrid("north");
  if (e.key === "a") redTestProd.moveOnGrid("west");
  if (e.key === "s") redTestProd.moveOnGrid("south");
  if (e.key === "d") redTestProd.moveOnGrid("east");
});

// UNLOCKING DEFAULT COLORS

red.unlock();
yellow.unlock();
green.unlock();
cyan.unlock();
blue.unlock();
magenta.unlock();
black.unlock();
white.unlock();

const redTestProd = new Producer(red, 1);
const greenTestProd = new Producer(green, 1);
const blueTestProd = new Producer(blue, 3);
