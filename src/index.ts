import Module from 'module'

/**
 * Internal alias for thunk type
 */
type ThunkType = any

/**
 * The thunk handler callback
 *
 * @template TThunk the type of the thunk value
 * @param {String} target the target being thunked
 * @param {TThunk} exports the value being provided for the thunk
 */
export type ThunkHandlerCallback<TThunk = ThunkType> = (
  target: string,
  exports: TThunk
) => TThunk

/**
 * The thunk provider interface
 */
export interface ThunkProvider {
  /**
   * Enables dependency thunking via require
   *
   * @param targets target (or targets) to thunk
   * @param thunkHandler the thunk handler, called when a target requires thunking
   */
  enableThunking: <TThunk = ThunkType>(
    targets: string | string[],
    thunkHandler: ThunkHandlerCallback<TThunk>
  ) => void

  /**
   * Clears a portion of (or all of) the thunk cache
   *
   * @param targets the target (or targets) to remove from the thunk cache
   */
  clearThunkCache: (targets?: string | string[]) => void

  /**
   * Disables dependency thunking via require
   */
  disableThunking: () => void
}

/**
 * Store the original require implementation
 */
const originalRequire = Module.prototype.require

/**
 * A cache containing thunked modules
 */
const thunkCache = new Map()

function enableThunking<TThunk = ThunkType>(
  targets: string | string[],
  thunkHandler: ThunkHandlerCallback<TThunk>
) {
  if (Module.prototype.require !== originalRequire) {
    throw new Error(`require is already patched - cannot rethunk.`)
  }

  const selections: string[] = typeof targets === 'string' ? [targets] : targets
  const isSelected = (id: string) => selections.includes('*') || selections.includes(id)

  Module.prototype.require = function thunkedRequire(id: string) {
    const selected = isSelected(id)

    if (selected && thunkCache.has(id)) {
      return thunkCache.get(id)
    }

    const orig = originalRequire.apply(this, arguments as any)

    if (!selected) {
      return orig
    }

    const result = thunkHandler(id, orig) as any
    result.__thunked = true
    thunkCache.set(id, result)
    return result
  }
}

function clearThunkCache(targets?: string | string[]) {
  if (typeof targets === 'undefined') {
    thunkCache.clear()
  } else if (typeof targets === 'string') {
    thunkCache.delete(targets)
  } else {
    targets.forEach(target => {
      thunkCache.delete(target)
    })
  }
}

function disableThunking() {
  if (Module.prototype.require === originalRequire) {
    // already unthunked
    return
  }

  Module.prototype.require = originalRequire
  thunkCache.clear()
}

/**
 * The thunk provider
 */
const requireThunk: ThunkProvider = {
  enableThunking,
  clearThunkCache,
  disableThunking,
}

export default requireThunk
