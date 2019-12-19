import requireThunk from '..'

/**
 * Developer note: Forgetting to call requireThink.disableThunking
 * at the end of your test will result in jest-util failing to be found
 *
 * Do not forget to call requireThink.disableThunking()
 */

// Require-thunk testbed
describe('require-thunk', () => {
  it('should expose a ThunkProvider', () => {
    expect(typeof requireThunk.enableThunking).not.toBe('undefined')
    expect(typeof requireThunk.clearThunkCache).not.toBe('undefined')
    expect(typeof requireThunk.disableThunking).not.toBe('undefined')
  })

  it('cannot thunk twice', () => {
    requireThunk.enableThunking('*', () => {})
    expect(() => requireThunk.enableThunking('*', () => {})).toThrowError()
    requireThunk.disableThunking()
  })

  it('unthunk is silent when already unthunk', () => {
    expect(() => requireThunk.disableThunking()).not.toThrow()
  })

  it('should thunk modules', () => {
    const expectedThunk = {
      test: true,
    }
    const expectedNet = require('net')
    const didThunk = jest.fn()

    requireThunk.enableThunking('*', didThunk)
    didThunk.mockReturnValueOnce(expectedThunk)

    const thunked = require('net')
    requireThunk.disableThunking()

    expect(thunked.__thunked).toBe(true)
    expect(thunked).toEqual(expectedThunk)
    expect(didThunk).toHaveBeenCalledTimes(1)
    expect(didThunk).toHaveBeenCalledWith('net', expectedNet)
  })

  it('should cache thunk modules', () => {
    const expectedThunk = {
      cached: true,
    }
    const didThunk = jest.fn()

    requireThunk.enableThunking('*', didThunk)

    didThunk.mockReturnValueOnce(expectedThunk)
    const one = require('net')
    const two = require('net')
    const three = require('net')
    requireThunk.disableThunking()

    expect(one).toEqual(expectedThunk)
    expect(two).toEqual(expectedThunk)
    expect(three).toEqual(expectedThunk)
    expect(didThunk).toHaveBeenCalledTimes(1)
  })

  it('should ignore unselected modules', () => {
    const didThunk = jest.fn()
    requireThunk.enableThunking('http', didThunk)

    require('net')

    requireThunk.disableThunking()

    expect(didThunk).toHaveBeenCalledTimes(0)
  })

  it('should thunk multiple modules', () => {
    const didThunk = jest.fn().mockReturnValue({ thunked: true })
    const unThunkedNet = require('net')
    requireThunk.enableThunking(['http', 'https'], didThunk)

    const thunkedNet = require('net')
    require('http')
    require('https')

    requireThunk.disableThunking()

    expect(thunkedNet).toBe(unThunkedNet)
    expect(didThunk).toHaveBeenCalledTimes(2)
  })

  it('should allow thunk cache purging', () => {
    const didThunk = jest.fn()

    requireThunk.enableThunking('*', didThunk)

    didThunk
      .mockReturnValueOnce({ thunk: 1 })
      .mockReturnValueOnce({ thunk: 2 })
      .mockReturnValueOnce({ thunk: 3 })
      .mockReturnValueOnce({ thunk: 4, part: 1 })
      .mockReturnValueOnce({ thunk: 4, part: 2 })
      .mockReturnValueOnce({ thunk: 5, part: 1 })
    const one = require('net')
    const cached = require('net')
    requireThunk.clearThunkCache()
    const two = require('net')
    requireThunk.clearThunkCache('net')
    const three = require('net')
    const fourOne = require('http')
    const fourTwo = require('https')
    requireThunk.clearThunkCache(['http'])
    const fiveOne = require('http')
    const fiveSameAsFourTwo = require('https')
    requireThunk.disableThunking()

    expect(one).toEqual({ thunk: 1, __thunked: true })
    expect(cached).toEqual({ thunk: 1, __thunked: true })
    expect(two).toEqual({ thunk: 2, __thunked: true })
    expect(three).toEqual({ thunk: 3, __thunked: true })
    expect(fourOne).toEqual({ thunk: 4, part: 1, __thunked: true })
    expect(fourTwo).toEqual({ thunk: 4, part: 2, __thunked: true })
    expect(fiveOne).toEqual({ thunk: 5, part: 1, __thunked: true })
    expect(fiveSameAsFourTwo).toEqual({ thunk: 4, part: 2, __thunked: true })
    expect(didThunk).toHaveBeenCalledTimes(6)
  })
})
