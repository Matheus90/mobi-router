# Mobi-Router

Simple router made for meteor apps designed specifically for mobile devices.


## Installation

The latest package is always on Atmosphere. To install latest package:

```sh
$ mrt add Mobi-Router
```

## Quick Note

There is a specific order while configuring Mobi-Router:
1. First, you specify the map:

```js
MobiRouter.map({
  'home': {
    path: '/:testOne/:abc/',
    defaultTitle: 'Home',
    template: 'home',
    data: function(){ return {first: this.params.testOne, second: this.params.abc}; },
  },
  ...
});
```
2. Second, create sequence from routes if needed:

```js
MobiRouter.addSequence('signup', [
  {
      name: 'home',
      data: function(){ return {first: 'different first attribute', second: this.params.second}; },
  },
  ...
]);
```

3. Third and last, configure the Mobi-Router settings:

```js
MobiRouter.configure({
  canISpeak: true,  //creates logs about it's own working into the console
  desktopWidth: 800,
  desktopHeight: 600,
  headerHeight: 45,
  sidebarToggleBtn: 45,
  sidebarDefaultWidth: 300,
  sidebarTemplate: 'sidebar',
  notFoundTemplate: 'not_found',
  notFoundTitle: '404, Page not found',
  ...
});
```


## Simple Usage

The most simple way to change page is:

```js
MobiRouter.go('home', {testOne: 'cool'});
```

To open a sequence at a specifiy slide, use it like this:

```js
MobiRouter.openSequence('signup', 2, {firstname: 'Matheus'});
```
  
  
## The Concept

The basic idea was to create an "Iron Router"-like router for mobile devices with openable sidebar 
(like the facebook app's one) and a full-screen fitting layout. Sequences are useful for creating 
stuff that can be passed from left to right (e.g. sign up procedure).

  
**much more description comming soon...**
  
