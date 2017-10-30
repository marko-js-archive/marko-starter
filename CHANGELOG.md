CHANGELOG
=========

# 3.x

## 3.0.x

### 3.0.0

- BREAKING: Removed `colors` configuration option. Default behavior is to
auto-detect color support. Use `FORCE_COLOR=0` to force colors to be disabled
or use `FORCE_COLOR=1` to force colors to be used.

- BREAKING: Made `lasso` and `marko` peer dependencies. Projects using
`marko-starter` will need to install these dependencies at the correct
minimum level in their project.

- BREAKING: Dropped support for `paths` property of route. Use the `path`
property but make the value an array of strings.

For example, in your `route.js`:

```javascript
// To have a single route associated with multiple paths:
exports.path = [
  '/hello/world/1',
  '/hello/world/2'
  '/hello/world/3'
]
```

Typically, a route only has one path, so `route.js` will be similar to:

```javascript
// To have a single route associated with multiple paths:
exports.path = '/hello/world'
```

- Linting: No longer using `eslint-config-marko` because `eslint` makes
sharing configuration nearly useless due to projects having to install
all eslint plugins and configs as peer dependencies.

- Code style: Removed 'use-strict' from all files.

- Simplification: Moved `marko-starter-lasso` plugin into this repo.

- Simplification: Moved `mlrawlings/routes-table` into this repo.
