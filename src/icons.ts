/** Root the loader mounts this package at: a spelled-out repository path does not resolve. */
const icon = (name: string) =>
	`${__OCT_PACKAGE_ROOT__}/scripts_files/debugger-gui/icons/${name}.svg`

/** Outline glyphs of the menu: the SDK set where it has one, our own next to it otherwise. */
export const GuiIcons = {
	Page: Menu.Icons.MonitorPlay,
	State: Menu.Icons.Power,
	Cursor: icon("mouse-pointer"),
	FPS: Menu.Icons.Activity,
	LowerHud: icon("panel-bottom"),
	TopPanel: Menu.Icons.PanelTop,

	Attachments: Menu.Icons.Anchor,
	GameTime: Menu.Icons.Hourglass,
	/** Frames the attachment is read ahead of or behind the animation. */
	FrameOffset: icon("arrow-left-right"),
	NetworkActivity: Menu.Icons.Globe,

	Entities: icon("units"),
	Trees: icon("tree-pine"),
	Creeps: Menu.Icons.IconCreeps,
	Runes: icon("runes"),
	Heroes: icon("heroes"),
	Other: icon("circle-ellipsis"),
	Hitboxes: Menu.Icons.Scan,
	Icons: icon("image"),

	Minimap: icon("map"),
	Camps: icon("jungle"),
	Couriers: icon("courier"),
	Buildings: icon("tower"),

	WorldBars: icon("bars-stacked"),
	Allies: icon("allies"),
	Enemies: icon("enemies"),
	Mana: icon("mana"),
	Level: icon("chevrons-up"),
	Numbers: icon("hash"),

	Replay: Menu.Icons.History,
	Play: Menu.Icons.Play,
	Key: Menu.Icons.Keyboard,
	Speed: icon("gauge"),
	Step: Menu.Icons.ChevronRight,
	Back: icon("rewind"),
	Forward: icon("fast-forward"),
	BackFar: Menu.Icons.SkipBack,
	ForwardFar: Menu.Icons.SkipForward,
	Clock: Menu.Icons.Clock,
	GoTo: Menu.Icons.ArrowRight,
	Restart: Menu.Icons.RefreshCw,
	/** The player under the lower HUD: its track with the moment on it. */
	Player: Menu.Icons.SliderRail,
	FpsGraph: icon("chart-line")
} as const

/** Puts a glyph on a row and hands the row back, so a declaration stays one expression. */
export function WithIcon<T extends Menu.Base>(entry: T, iconPath: string): T {
	entry.IconPath = iconPath
	return entry
}
