# Mobi-Router

Simple router made for meteor apps designed specifically for mobile devices. 

You can checkout the demo site here: http://mobi-router.meteor.com/


## Installation

The latest package is always on Atmosphere. To install latest package:

```sh
$ mrt add Mobi-Router
```

## API

### MobiRouter

#### `.animateScroller(pos, time);`

Animates the content to move to the requested/current position. (paging animation)

* **pos(int)**: (def.: currentPosition()) requested position, starts with 0
* **time(int)**: (def.: 750) animation duration in milliseconds
* **return**: no return


#### `.back(posToMove, keepFollowings);`

Animates the content to move back to left.

* **posToMove(int)**: (def.: 1) number of pages to move
* **keepFollowings(bool)**: (def.: false) if set true, the stack remains the same, but paging animation fires
* **return**: no return


#### `.backBtnAction();`

Action that will be fired when pressing the current **back** button in the header. Default: **MobiRouter.back()**;


#### `.backBtnText();`

The text of the current **back** button in the header.


#### `.calculateSizes();`

Refreshes the stored data of Mobi-Router part sizes

#### `.configure(settings);`

To configure Mobi-Router, you specify the settings lke this:

```js
MobiRouter.configure({
    canISpeak: true,
    desktopWidth: 800,
    desktopHeight: 600,
    headerHeight: 45,                 
    sidebarToggleBtn: 45,
    sidebarDefaultWidth: 300,
    sidebarTemplate: 'sidebar',
    notFoundTemplate: 'not_found',
    notFoundTitle: '404, Page not found',
    scrollTime: 750,
});
```

#### `.content(route);`

The template of the specified/current route.

* **route(MobiRoute)**: (def.: **.currentRoute()**) the route what you need the title for
* **return**: (Template)


#### `.currentPosition();`

Provide current route's position in the stack

* **return**: (int)


#### `.currentRoute();`

Returns the current route object (MobiRoute object)

* **return**: (MobiRoute)


#### `.currentRouteName();`

The id/name of the current route.

* **return**: (string)


#### `.currentTemplate();`

The name of template assigned to the current route.

* **return**: (string)


#### `.dep` *(Dependecy)*

Reactivity trigger used by Mobi-Router.


#### `.getData();`

Returns the data of route passed into the current template.

* **return**: (object)


#### `.getMap();`

Provides the whole routemap saved from calling **.map()** function.

* **return**: (object)


#### `.getPageTitle(route);`

The title of specified/current route, calculated by the **.getData()** returned values.

* **route(MobiRoute)**: (def.: **.currentRoute()**) the route which you need the title for
* **return**: (html)


#### `.getSlideStack();`

The stack/array of currently queued routes.

* **return**: (array)


#### `.getSlideStackSize();`

Size of routes stack.

* **return**: (int)


#### `.getUrl();`

Generates pathname for url from the actual stack and route parameters.

* **return**: (string)


#### `.go(routeName, params, pushToStack);`



**much more description coming tomorrow...**
  
