const outbound = require('./lib/notify').outbound
const inbound = require('./lib/notify').inbound

outbound.insertRow = (evt) => inbound({type: 'insertRow', id: evt.id, rows: evt.rows})
outbound.deleteRow = (evt) => inbound({type: 'removeRow', id: evt.id})
outbound.update = (evt) => inbound({type: 'updateCell', cell: evt.cell, data: evt.data})
outbound.userActive = (evt) => inbound({type: 'userActive', cell: evt.cell})

module.exports = outbound
