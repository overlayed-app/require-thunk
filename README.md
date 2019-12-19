# require-thunk

Thunk dependencies by modifying require 🧙‍♂️🔁

A simple way to [thunk](https://en.wikipedia.org/wiki/Thunk) dependencies (including local dependencies). Typescript is supported out of the box. We need this for better `dry-run` support in some [Overlayed](https://github.com/overlayed-app) modules.

```
import thunker from './index'

// turn on thunking
thunker.enableThunking(['net', 'fs'], (target, original) => {
  if (target === 'net') {
    return { isFakeNet: true }
  } else {
    return { isFakeFs: true }
  }
})

// later on...
import('net').then(mongo => {
  // default: { isFakeNet: true, __thunked: true }
  console.log(mongo)
})

// finally, to turn it off
thunker.disableThunking()
```

## API

Note: If you're using vanilla JS, the API methods exist off of `default`. For example:

```
const enableThunking = require('require-thunk').default.enableThunking

// use enableThunking(...)
```

### Types

#### Thunk handler

> (targets, exports) => { return {someKey: 'someValue' } }

The thunk handler callback signature.

- `target` the target being thunked. `String`.
- `exports` the value being provided for the thunk. `Object`.

### enableThunking(targets, thunkHandler)

Enables dependency thunking via require.

- `targets` target (or targets) to thunk. `String` or `String[]`.
- `thunkHandler` the thunk handler, called when a target requires thunking. See [#thunk-handler](#thunk-handler) for the function signature.

### clearThunkCache(targets)

Clears a portion of (or all of) the thunk cache.

- `targets` the target (or targets) to remove from the thunk cache. `String` or `String[]`.

### disableThunking()

Disables dependency thunking via require.

## License

MIT
