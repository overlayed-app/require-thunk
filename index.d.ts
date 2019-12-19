declare module 'require-thunk' {
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
   * The thunk provider
   */
  const requireThunk: ThunkProvider
  export default requireThunk
}
