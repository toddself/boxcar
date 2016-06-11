const columnFromInt = require('./column-from-int')

module.exports = function getActiveCellContents (state) {
  const colName = columnFromInt(state.activeCell.col, state)
  return state.data[state.activeCell.row][colName]
}

