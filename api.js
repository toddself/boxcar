const notify = require('./lib/notify')
const bus = {
  emit: () => {}
}

notify.insertRow = (cell, rowData) => bus.emit('addRow', cell, rowData)
notify.deleteRow = (cell) => bus.emit('deleteRow', cell)
notify.update = (cell, rowData) => bus.emit('updateRow', cell, rowData)

module.exports = notify
