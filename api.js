const outbound = require('./lib/notify').outbound
const inbound = require('./lib/notify').inbound

outbound.insertRow = (cell, rowData) => inbound({type: 'addRow', cell: cell, rowData: rowData})
outbound.deleteRow = (cell) => inbound({type: 'deleteRow', cell: cell})
outbound.update = (cell, rowData) => inbound({type: 'updateRow', cell: cell, rowData: rowData})

module.exports = outbound
