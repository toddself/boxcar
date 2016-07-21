# Boxcar
[![API Stability](https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square)](https://nodejs.org/api/documentation.html#documentation_stability_index) [![Build Status](https://travis-ci.org/toddself/boxcar.svg?branch=master)](https://travis-ci.org/toddself/boxcar) [![codecov](https://codecov.io/gh/toddself/boxcar/branch/master/graph/badge.svg)](https://codecov.io/gh/toddself/boxcar) [![built with choo v3](https://img.shields.io/badge/built%20with%20choo-v3-ffc3e4.svg?style=flat-square)](https://github.com/yoshuawuyts/choo)


A [:steam_locomotive::train::train::train::train::train: (choo)](https://github.com/yoshuawuyts/choo)-based spreadsheet/multi-row form element widget.

> ["Got a friend, her name is Boxcar..."](https://www.youtube.com/watch?v=4KGzXUmbyiQ)

## Status
Very much a WIP.  You can hardcode some data and see it get (rudimentarily using flex-box) rendered to the screen.  You can move the focused cell with the arrow keys.  You can double-click a cell to make it an input.

Still working on finalizing the data flow so things are subject to change.

## Browser Support
You need flexbox support currently.  Maybe one day you can provide a different
set of styles to make it work with flexbox, but today is not that day.

The build script uses [es2020](https://github.com/yoshuawuyts/es2020) to handle
compiling down to an ES5 runtime. The browser matrix, however, has nothing to do
with layout but only functionality.

[![Build Status](https://saucelabs.com/browser-matrix/boxcar.svg)](https://saucelabs.com/beta/builds/063d475755d94d5e99603d41bbf86447)

## Testing
Tests are run locally via Chrome.

Travis-CI uses Sauce Labs to run tests in:
* Chrome latest on Windows 10
* MS Edge latest on Windows 10
* Firefox latest on Linux
* IE 11 on Windows 10
* Safari 9 on Mac OS 10.11

A failing build will indicate one of these browsers has not passed the test
suite.

## License
Apache-2.0 copyright 2016 Todd Kennedy
