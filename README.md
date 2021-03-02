# marko-starter is deprecated, check out [@marko/serve](https://github.com/marko-js/cli/blob/master/packages/serve/README.md) for an updated zero config Marko setup!
# marko-starter

`marko-starter` is a project for building and running
[Marko.js](https://github.com/marko-js/marko) applications. It provides a
toolset that includes a build pipeline and a generic HTTP server with routing
that makes building Marko applications easy! If you're looking to build a
project from scratch quickly, check out
[marko-devtools](https://github.com/marko-js/marko-devtools), which includes a
command for creating Marko projects with `marko-starter`!

## Getting Started

**Requires Node 6+**

To get started, `marko-starter` may be installed locally to your project or
globally:

```bash
npm install marko-starter --save
```

Or installed globally:

```bash
npm install marko-starter -g
```

## Adding pages

Adding a page to your application simply requires adding a new directory under
the `routes/` directory.  Inside this directory, you can put either an
`index.marko` template and/or a `route.js` file that exports a `handler` method.

<details>
<summary>Example scenario</summary>

Given a directory structure like this:

```
⤷ routes/
  ⤷ my-page/
    ⤷ index.marko
```

Hitting `/my-page` will render `index.marko`.
</details>

### Custom routes and params

By default, the route for a page is determined by the page's directory name,
but you can also define a custom route for your page.  This route can include
custom express-style url parameters.  You do this by exporting a `path` from a
`route.js` file in your page's directory:

```js
exports.path = '/people/:name';
```

If using an `index.marko` template for the route, the `input` will contain the
following properties:

| Property   | Type     | Description                                                                          | Example            |
|------------|----------|--------------------------------------------------------------------------------------|--------------------|
| `path`     | `String` | The path from the request                                                            | `"/people/frank"`  |
| `params`   | `Object` | An object that contains `String` properties populated from the path placeholders     | `{name: "frank"}`  |
| `query`    | `Object` | An object that contains `String` query parameters properties from the _query string_ | `{age: "27"}`        |
| `metadata` | `Object` | The route metadata                                                                   | `{secure: false}`  |

<details>
<summary>Example scenario</summary>

Given a route:

`/people/:name`

And a template:

```marko
<ul>
    <li>${input.params.name}</li>
    <li>${input.query.age}</li>
</ul>
```

When you hit the following url:

`/people/frank?age=27`

The rendered output would be:
```html
<ul>
    <li>frank</li>
    <li>27</li>
</ul>
```
</details>

Routes may also be added to the `projectConfig`:

**my-project/project.js**
```js
const template = require('./template.marko');

module.exports = require('marko-starter').projectConfig({
  ...
  routes: [
    {
      path: '/foo/:name',
      handler(input, out) {
        const name = input.params.name;
        template.render({ name }, out);
      }
    }
  ]
});
```

### Custom handler entry

If you need more control over the data passed to the template or don't even want
to render a template, you can define a custom `handler` function in your
`route.js` file:

```js
const template = require('./index.marko');

exports.path = '/people/:name';

exports.handler = (input, out) => {
    const name = input.params.name;
    template.render({ name }, out);
};
```


## Adding components

To add a component, simply create a new directory under the `components/`
directory. The directory name will be used as the component name.  Inside the
directory you should put an `index.marko` file.

```
⤷ components/
  ⤷ my-component/
     ⤷ index.marko
```

Given the above structure, you will be able to use `<my-component>` in any other
component template or page template.

### Client-side behavior

Adding client-side behavior to a component is as simple as defining methods in
your `index.marko` in a `class` tag and exporting them within the template, or
defining a `component.js` file next to your `index.marko` file that exports the
methods.

<details>
<summary>Example single file component</summary>
Single file components contain the component logic and the markup in the same
index.marko file:

**index.marko**
```marko
class {
    onInput(input) {
        this.state = {
            count: input.count
        }
        this.initialCount = input.count
    }
    incrementCount() {
        this.state.count++
    }
    resetCount() {
        this.state.count = this.initialCount
    }
}

<div>${state.count}</div>
<button on-click('incrementCount')>+</button>
<button on-click('resetCount')>reset</button>
```
</details>

<details>
<summary>Example split-file component</summary>
Split-file components separate the component logic into a component.js and
the markup in index.marko:

**index.marko**
```html
<div>${state.count}</div>
<button on-click('incrementCount')>+</button>
<button on-click('resetCount')>reset</button>
```

**component.js**
```js
module.exports = {
    onInput(input) {
        this.state = {
            count: input.count
        }
        this.initialCount = input.count
    },
    incrementCount() {
        this.state.count++
    },
    resetCount() {
        this.state.count = this.initialCount
    }
};
```
</details>

### Styles

To add styles to your components, either add a top-level `<style>` tag in your
`index.marko` file or define a `style.css` file next to your `index.marko` file.

### Subcomponents

You can also create a `components` directory under another component and those
components will only be available to the parent component.

<details>
<summary>Example subcomponent</summary>

Given a directory structure like this:

```
⤷ components/
  ⤷ my-component/
    ⤷ components/
      ⤷ my-subcomponent/
        ⤷ index.marko
    ⤷ index.marko
```


You will only be able to use `my-subcomponent` from the
`my-component/index.marko` template or other subcomponents defined under
`my-component/components`.
</details>

## Building a static site

Generating a static site is simple:

```
marko-starter build
```

The build tool will hit all your page routes and generate the resulting html
files and assets in a `build` directory at your project root. You can then take
this build directory and host it on any provider that provides static hosting.

### Dynamic routes

If you have routes that have custom parameters, the build tool needs to know
which parameters can be passed. You can export a `params` array from the
`route.js` file for a page.

```js
exports.path = '/people/:name';

exports.params = [
    { name:'reyna' },
    { name:'dakota' },
    { name:'jordan' },
];
```

`params` may be programmatically generated and may also be a `Promise`.

## Overriding Project Configuration

`marko-starter` configuration options, including the
[lasso](https://github.com/lasso-js/lasso) build config can be overriden by
creating a `project.js` file in the route of the project. For example:

```js
const isProduction = process.env.NODE_ENV === 'production';

module.exports = require('marko-starter').projectConfig({
    routePathPrefix: '/',
    lassoConfig: {
        bundlingEnabled: isProduction,
        fingerprintsEnabled: isProduction,
        require: {
          // ...
        },
        minifyJS: false,
        plugins: [
            'lasso-marko'
        ]
    }
});
```

`marko-starter` also provides useful hooks for executing code before and after
running a build or starting the server:

- `beforeBuild`: Runs before the build runs
- `beforeStartServer`: Runs before the server is started
- `afterBuild`: Runs after the build is complete
- `afterServerStarted`: Runs after the server has successfully started

Hooks can be registered by providing the hook as a property
calling `projectConfig`, and may return a `Promise`:

```js
module.exports = require('marko-starter').projectConfig({
  ...
  beforeBuild() {
    console.log('Executing before the build starts!');
    return Promise.resolve();
  }
  ...
});
```

## Serving a static site over HTTP

You can easily serve the directory that contains the statically built version
of your application with `marko-starter`.

```bash
marko-starter serve-static
```

Now you can navigate to [localhost:8080](http://localhost:8080) to view the
application!

`marko-starter` uses [http-server](https://github.com/indexzero/http-server)
to serve static files. You can pass command line arguments that
[http-server](https://github.com/indexzero/http-server) supports:

```bash
marko-starter serve-static -p 9001 # Serve on port 9001
```

## Project Plugins

External project plugins can be installed into `marko-starter`. The
`projectConfig` can take a `plugins` option with an array of plugins. A
plugins can be a string representing an installed node module or a plugin
object:

**my-project/project.js**
```js
module.exports = require('marko-starter').projectConfig({
  plugins: ['marko-starter-babel']
});

```

## Publishing to GitHub Pages (or other remote repo)

Simply add a `static-repo` entry to your `package.json` which is a git url.
When running `npm run build`, a new commit will be created and pushed to the
remote repository.

```js
{
  ...
  "static-repo": "git@github.com:user/repo.git#branch"
}
```

If you're publishing a project site at a subdirectory, you'll also want to set
a `baseurl` entry which will be prepended to any root-relative urls.

```js
{
  ...
  "static-repo": "git@github.com:user/repo.git#branch",
  "baseurl": "/repo"
}
```

## Example project

For an example of a project that is using `marko-starter` check out
[markojs-website](https://github.com/marko-js/markojs-website)
