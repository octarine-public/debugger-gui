export const RootMenu = Menu.AddEntry(
	"Debugger GUI",
	Menu.Icons.MonitorPlay,
	"What the game would draw, over octarine-debugger's empty window, and the replay's controls"
)
export const State = RootMenu.AddToggle(
	"State",
	true,
	"Draws everything below: off leaves the window empty, the replay's keys still work"
)
