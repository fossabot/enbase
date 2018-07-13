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
Enbase is a `nodejs` app, running as a server, that provides `serverless` backend solution for your mobile and web apps. It is compatible to `Firebase SDK's` and it is prefered to use them, because they can supply special features, that is specific for mobile or web platform (offline mode, faster data synchronization). We strongly recommend to use all `Firebase SDK's` with Enbase by overriding `databaseUrl`
