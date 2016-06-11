# Boxcar

[![API Stability](https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square)](https://nodejs.org/api/documentation.html#documentation_stability_index) [![Build Status](https://travis-ci.org/toddself/boxcar.svg?branch=master)](https://travis-ci.org/toddself/boxcar) [![codecov](https://codecov.io/gh/toddself/boxcar/branch/master/graph/badge.svg)](https://codecov.io/gh/toddself/boxcar)

A [:steam_locomotive::train::train::train::train::train: (choo)](https://github.com/yoshuawuyts/choo)-based spreadsheet/multi-row form element widget.

> ["Got a friend, her name is Boxcar..."](https://www.youtube.com/watch?v=4KGzXUmbyiQ)

## Status
Very much a WIP.  You can hardcode some data and see it get (rudimentarily using flex-box) rendered to the screen.  You can move the focused cell with the arrow keys.  You can double-click a cell to make it an input.

Still working on finalizing the data flow so things are subject to change.

## Browser Support

While in experimental mode, expect this to only work in browsers which support:

* [flexbox](http://caniuse.com/#search=flex)
* [arrow-functions](http://caniuse.com/#search=arrow-functions)
* template strings

[![Build Status](https://saucelabs.com/browser-matrix/boxcar.svg)](https://saucelabs.com/beta/builds/063d475755d94d5e99603d41bbf86447)

Due to CSS-support issues, support is not currently planned for anything prior to IE 11 (and IE 11 support is conditional depending on how it handles flexbox). However! You'll be able to override the provided CSS so you have that option if you need.

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
