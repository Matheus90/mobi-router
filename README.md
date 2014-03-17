# Mobi-Router

Simple router made for meteor apps designed specifically for mobile devices.  

It uses the concept of keeping a stack of "slides" (alias for pages in web apps) which can be used to create sequences like sign up, etc. E.g for applications which need to go deeper and deeper into a page (like School > Class > Student > Student Profile), it makes creating such sequences with "Back" and "Next" buttons very easy. 

You can checkout the demo site here: http://mobi-router.meteor.com/


## Installation

The latest package is always on Atmosphere. To install latest package:

```sh
$ mrt add Mobi-Router
```

## API

### Basic Navigation


#### `.go(routeName, params, pushToStack);`

Most common way to navigate to the **routeName** . It's possible to use different ways:

Start new route stack: `MobiRouter.go('home', {first: 'blabla', second: '123'});`

* `routeName`: Name of the route 
* `params`: Parameters to be passed to the given route
* `pushToStack`: Whether to create a new stack or push to the present stack.

When `pushToStack` is true, back button is automatically enabled. Text to show in Back button can be customized in settings.

*Note: `pushToStack` will append the path of routeName to url already present in browser window*

Consider keeping `pushToStack` true for the special usecase of creating flow sequences when you need user to go back to previous slide with a 'Back' button. 

Append page to stack can be shorten, because this:

```js
MobiRouter.go('greeting', {}, true)
```
is the same as:

```js
MobiRouter.go('greeting', true)
```



#### `.back(posToMove, keepFollowings);`

Animates the content to move back to left. It navigates to the previous slide in sequence if there is one.

* `posToMove` (int): (def.: 1) number of pages to move
* `keepFollowings` (bool): (def.: false) if set true, the stack remains the same, but paging animation fires
* `return`: no return


#### `.next(posToMove);`

Animates the content to move back to left. Navigates to next slide in the stack if there is one.

* `posToMove` (int): (def.: 1) number of pages to move
* `return`: no return


#### `.setParams(params, route);`

If you do not want to go to another page but change parameters of the current or any requested page, you can use this function.

* `params` (object): the parameteres you want to update
* `route` (MobiRoute): (deg.: current) the route which you want to update it's parameters
* `return`: the refreshed route used by the function


### Configuration


#### `.map(map);`

Adding routes to MobiRouter. The data attribute if object will be passed to the template, if function it will be calculated first and the result is passed to the template.

```js
MobiRouter.map({
    'home': {
        path: '/',
        defaultTitle: 'Home',
        template: 'home',
        routeType: 'SimplePage',
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
        routeType: 'TableView',
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
    loadingTemplate: true, // { false || true || 'loading' },
    minLoadingTemplateTime: 3000, 
    scrollTime: 750,
});
```

#### `.addViewTypes(types);`

The is an opportunity to create custom templates to fit the routes into. You can set the `routeType` of the route e.g. `TableView` and it will create a page like **[this](http://mobi-router.meteor.com/animals)**. If you leave out the routeType attribute it will defaults to `SimplePage` that means the route will be rendered with it's own template.

To create new view types you need to add them this way:

```js
MobiRouter.setViewTypes({
    TableView: 'mobi_tableview',
    . . .
});
```

### Custom views
You can easily add custom views with `.addViewTypes`. Custom views are basically simple templates which are rendered with all the other data provided when defining a route in MobiRouter.map(). They provide infinite re-usability.  

For now, mobi-router provide following custom views baked in:

#### TableView
It renders a list of rows on the screen like the most common interface of most mobile apps. There are various customization options to render the rows differently.

A route can be converted to render a TableView by specifying `routeType: "TableView"`. A **TableView** require `rows` property of the route which represents the rows to render. See below

* **rows**
  It has to be an *array* of *objects*. Each object in the array represents a single row. Each row can have various customization options.
  
  * **type**
    A row can be of basically two types: `link` and `button` which are further customizable.
    * **link**
      A link is a simple link row which performs some *action* (provided by *action* property of the row) when user click/touch it. *action* is usually used for navigation  
      Link can have an option `linkBtn` property. If set to true, a button appears on the right end of row with `linkBtnText` as its text and `linkBtnClass` as its class, which performs action provided by `linkBtnAction`.  
    * **button**
      Simple row with a button at the right end. In this case row itself doesn't do any action, action is performed by the button only. [*TODO*: More docs]
  * **linkBtn**: *Boolean*
    Decide if a button will be shown in right end of row. Works only with *link* type row
  * **linkBtnText**: *String*
    Text to be shown in the button. It can also be html code. Works  only with *link* type row
  * **linkBtnClass**: *String*
    Class of the button. Useful if you want button to have bootstrap/foundation classes. Works  only with *link* type row
  * **linkBtnAction**: *Function*
    Function to be executed when button on *link* row is clicked

!-----------------------------------!
!-- *TODO*: *More Documentation*  --!
!-----------------------------------!


### Other functions related to *MobiRouter* object

#### `.animateScroller(pos, time);`

Animates the content to move to the requested/current position. (paging animation)

* **pos(int)**: (def.: currentPosition()) requested position, starts with 0
* **time(int)**: (def.: 750) animation duration in milliseconds
* **return**: no return



#### `.backBtnAction();`

Action that will be fired when pressing the current `back` button in the header. Default: `MobiRouter.back();`


#### `.backBtnText();`

The text of the current `back` button in the header.


#### `.calculateSizes();`

Refreshes the stored data of Mobi-Router part sizes


#### `.content(route);`

The template of the specified/current route.

* `route(MobiRoute)`: (def.: `.currentRoute()`) the route what you need the title for
* `return`: (Template)


#### `.currentPosition();`

Provide current route's position in the stack

* `return`: (int)


#### `.currentRoute();`

Returns the current route object (MobiRoute object)

* `return`: (MobiRoute)


#### `.currentRouteName();`

The id/name of the current route.

* `return`: (string)


#### `.currentTemplate();`

The name of template assigned to the current route.

* `return`: (string)


#### `.dep` *(Dependecy)*

Reactivity trigger used by Mobi-Router.


#### `.getData();`

Returns the data of route passed into the current template.

* `return`: (object)


#### `.getMap();`

Provides the whole routemap saved from calling `.map()` function.

* `return`: (object)


#### `.getPageTitle(route);`

The title of specified/current route, calculated by the `.getData()` returned values.

* `route` (MobiRoute): (def.: `.currentRoute()`) the route which you need the title for
* `return`: (html)


#### `.getSlideStack();`

The stack/array of currently queued routes.

* `return`: (array)


#### `.getSlideStackSize();`

Size of routes stack.

* `return`: (int)


#### `.getUrl();`

Generates pathname for url from the actual stack and route parameters.

* `return`: (string)



**more description coming soon...**
  
