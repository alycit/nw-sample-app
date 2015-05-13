# Node Webkit / Angular Sample Desktop App

This is a reference app for a Desktop App built with

- Node Webkit
- Angular JS
- WebSQL

## Getting Started

1. Install [node-webkit](https://github.com/nwjs/nw.js/) using npm (now nw.js)
2. Install [node-webkit-builder](https://github.com/mllrsohn/node-webkit-builder) using npm
3. Install Dependencies (angular) by running `npm install`

### Running in development
1. run `nw .` in the repository directory
2. The app can be refresed without killing and rerunning

### To package as an app
1. run `nwbuild -p osx64 -v 0.12.1 .`  
2. the resulting app will be in the build folder 
