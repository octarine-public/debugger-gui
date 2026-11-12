// AUTO-GENERATED - do not edit.
/** Projection the core computes for a camera the caller describes, not the game's own. */
declare const WASM: {
	/**
	 * The world point that shows at `screen` on the near plane of a camera at `cameraPosition`
	 * turned to `cameraAngles`. `screen` runs from -1 to 1 across the window with y up, not in
	 * pixels. The core builds the camera itself, with a 66 degree vertical field of view for a
	 * window of `windowSize`; `cameraDistance` does not change the result.
	 */
	ScreenToWorld: ((screen: Vector2, cameraPosition: Vector3, cameraDistance: number, cameraAngles: QAngle, windowSize: Vector2) => Vector3)
}
