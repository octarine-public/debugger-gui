// AUTO-GENERATED - do not edit.
declare namespace MenuSDK {
	/**
	 * The menu as a whole: whether its window is open, its config, and walks over its entries.
	 * Scripts use its one instance, `MenuSDK.MenuManager`.
	 */
	interface CMenuManager {
		/** The handles of the entries added straight to `MenuSDK.Menu`, made anew on every read. */
		get entries(): AnyHandle[]
		/** Whether the menu window is open. Setting it opens or closes the window. */
		get IsOpen(): boolean
		set IsOpen(value: boolean)
		/**
		 * The menu's state as a config object: every setting, the window, the hotkeys and profiler
		 * panels, saved colours, recent searches and whether the tour was seen. Each read builds a new
		 * object. Assigning one applies it, leaving the language and the open page as they are.
		 */
		get config(): ConfigObject
		set config(value: ConfigObject)
		/**
		 * Asks every view of the menu to re-render, which happens once the current task ends. Inside
		 * {@link Batch} the request waits for the batch to finish.
		 */
		Update(): void
		/**
		 * Re-renders once for everything `fn` changes, instead of once per entry it touches - for a
		 * preset or anything else that writes many rows at a time.
		 *
		 * @example
		 * MenuManager.Batch(() => {
		 * 	fov.value = preset.fov
		 * 	smooth.value = preset.smooth
		 * })
		 */
		Batch(fn: () => void): void
		/**
		 * Calls `callback` with a handle of every entry under `node`, depth first: a node before its
		 * children. `node` takes a node's stored `entry`; omitted, the whole menu is walked.
		 */
		foreachRecursive(callback: (handle: AnyHandle) => void, node?: NodeEntry): void
		/**
		 * Walks every hotkey the menu carries, in menu order, with the row it rides
		 * — what a listing of everything the user has bound is built from.
		 *
		 * @example
		 * Menu.MenuManager.foreachHotkey((holder, hotkey) =>
		 * 	console.log(holder.Name, hotkey.BindName)
		 * )
		 */
		foreachHotkey(callback: (holder: AnyHandle, hotkey: AnyHotkey) => void): void
		/**
		 * Walks a stored config into the tree, the state kept beside the settings included. The
		 * place the menu stood at comes back with the boot load alone: a scripts reload lands on the
		 * same page, while a config switched to mid-session leaves the page the user is on alone.
		 */
		LoadConfig(raw: unknown, onLanguage?: (name: string) => void): void
		/** {@link config} with `language` added as the menu's language. It writes nothing. */
		SaveConfig(language: string): ConfigObject
		/**
		 * Reads the stored config again and walks it into the menu as {@link LoadConfig} does, the
		 * stored language included. Does nothing on a host that cannot read configs; a read that fails
		 * or is not valid JSON is loaded as `{}`.
		 */
		ReloadConfig(): Promise<void>
	}
	/** The one {@link CMenuManager}: the menu window's open state, its config and its entries. */
	const MenuManager: CMenuManager
}
