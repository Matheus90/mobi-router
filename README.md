# Mobi-Router

Simple router made for meteor apps designed specifically for mobile devices. 

You can checkout the demo site here: http://mobi-router.meteor.com/


## Installation

The latest package is always on Atmosphere. To install latest package:

```sh
$ mrt add Mobi-Router
```

## API

### Basic Navigation


#### `.go(routeName, params, pushToStack);`

Most common clue to navigate. It's possible to use different ways:

Start new route stack: `MobiRouter.go('home', {first: 'blabla', second: '123'});`

Append page to stack is can be shorten, becasue this:

```js
MobiRouter.go('greeting', {}, true)
```
is the same as:

```js
MobiRouter.go('greeting', true)
```



#### `.back(posToMove, keepFollowings);`

Animates the content to move back to left.

* **posToMove(int)**: (def.: 1) number of pages to move
* **keepFollowings(bool)**: (def.: false) if set true, the stack remains the same, but paging animation fires
* **return**: no return


#### `.next(posToMove);`

Animates the content to move back to left.

* **posToMove(int)**: (def.: 1) number of pages to move
* **return**: no return


### Configuration


#### `.map(map);`

Adding routes to MobiRouter. The data attribute if object will be passed to the template, if function it will be calculated first and the result is passed to the template.

```js
MobiRouter.map({
    'home': {
        path: '/',
        defaultTitle: 'Home',
        template: 'home',
        type: 'SimplePage',
        data: function(){ return {first: this.params.first, fffsss: this.params.second}; },
        classExtensions: {
            page: 'lightsteelblue-bg',
            header: 'orange-bg',
        },
    },
    'greeting': {
        path: '/greeting/:first/:last',
        defaultTitle: 'Wellcome, <i> {:firstName} {:lastName} </i>!',
        template: 'hello',
        data: function(){ return {firstName: this.params.first, lastName: this.params.last}; },
    },
    'animals': {
        path: 'animals',
        defaultTitle: 'Animals',
        type: 'TableView',
        rows: [
            {
                id: 'mammals-link',
                classExtension: 'custom-link',
                title: 'Mammals',
                type: 'link',
                subTitle: function() { return 'Count: <b>'+(_.keys(Animals.mammals).length)+'</b>'; },
                action: function(){ MobiRouter.go('mammals', true); },
            },
            
            ...
            
        ],
    },
    
    ...
    
});
```


#### `.configure(settings);`

For setting up defaults for MobiRouter, you specify the settings like this:

```js
MobiRouter.configure({
    canISpeak: true,            // create logs in the console
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

#### `.addViewTypes(types);`

The is an opportunity to create custom templates to fit the routes into. You can set the **type** of the route e.g. **TableView** and it will create a page like **[this](http://mobi-router.meteor.com/animals)**. If you leave out the type attribute it will defaults to **SimplePage** that means the route will be rendered with it's own template.

To create new view types you need to add them this way:

```js
MobiRouter.setViewTypes({
    TableView: 'mobi_tableview',
    . . .
});
```


### Other functions related to *MobiRouter* object

#### `.animateScroller(pos, time);`

Animates the content to move to the requested/current position. (paging animation)

* **pos(int)**: (def.: currentPosition()) requested position, starts with 0
* **time(int)**: (def.: 750) animation duration in milliseconds
* **return**: no return



#### `.backBtnAction();`

Action that will be fired when pressing the current **back** button in the header. Default: **MobiRouter.back()**;


#### `.backBtnText();`

The text of the current **back** button in the header.


#### `.calculateSizes();`

Refreshes the stored data of Mobi-Router part sizes


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



**much more description coming tomorrow...**
  
