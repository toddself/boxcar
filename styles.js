const sf = require('sheetify')

const grid = sf`
  :host {
    width: 1000px;
    box-sizing: border-box;
  }

  .grid {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .row-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .cell {
    flex: 1;
    border: 1px solid #888;
    overflow: hidden;
  }

  :host:focus {
    outline-width: 0;
  }

  .cell-content {
    display: inline-block;
    width: 100%;
    min-height: 100%;
    margin: 2px;
  }

  .active {
    border: 2px solid #00FFFF;
    margin: 0px;
  }

  .row {
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .row:nth-child(odd) {
    background-color: #eee;
  }
`

module.exports = grid
