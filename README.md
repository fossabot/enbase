# Enbase :fire:

[![Drone.io badge](http://matisiekpl.nazwa.pl:7111/api/badges/enteam/enbase/status.svg)](https://drone.io/)
[![npm version](https://badge.fury.io/js/enbase.svg)](https://badge.fury.io/js/enbase)
[![Greenkeeper badge](https://badges.greenkeeper.io/enteam/enbase.svg)](https://greenkeeper.io/)

Open source implementation of Google's Firebase Realtime Database :fire: with fully support for security rules :police_car: and auth! :credit_card:

## Just run it! :rocket:
#### Install and run

CLI comming soon, now you need to do it by importing package

```
$ npm install enbase --save
```

```
require('enbase');
```
#### Use it

```
const app = firebase.initializeApp({
  databaseURL: `ws://localhost:3000`,
});
```

## Table of contents
* [General info](#general-info)
* [How it works?](#how-it-works?)
* [Setup](#setup)
* [Project config](#project-config)

## General info :balloon:
Enbase is a `nodejs` app, running as a server, that provides `serverless` backend solution for your mobile and web apps. It is compatible to `Firebase SDK's` and it is prefered to use them, because they can supply special features, that is specific for mobile or web platform (offline mode, faster data synchronization). We strongly recommend to use all `Firebase SDK's` with Enbase by overriding `databaseURL`

## How it works? :scream:
Enbase basically has dependency (`firebase-websockets-adapter`), that provide fully websockets server with handler to `Firebase SDKs` endpoints. Currently, `Enbase` has handler for `set`, `read` and `update` actions. Removing data from tree works fine. 

To store data, enbase uses `MongoDB`, in which, is saving data as a documents with path reference to place in a data tree.

## Setup :hatching_chick:
Just install last version of packge from `NPM`. (Powerful CLI comming soon)
```
$ npm install enbase --save
```

```
require('enbase');
```


## Project config :whale:
To use enbase, change `databaseURL` option in your `Firebase SDK` like this:
```
const app = firebase.initializeApp({
  databaseURL: `ws://localhost:3000`,
});
```
