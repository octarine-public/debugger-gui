import { GuiIcons, WithIcon } from "./icons"

export const RootMenu = Menu.AddEntry(
	"Debugger GUI",
	GuiIcons.Page,
	"What the game would draw, over octarine-debugger's empty window, and the replay's controls"
)
export const State = WithIcon(
	RootMenu.AddToggle(
		"State",
		true,
		"Draws everything below: off leaves the window empty, the replay's keys still work"
	),
	GuiIcons.State
)
RootMenu.HeaderControl = State
RootMenu.Gate = State

/**
 * A section of the page with its own switch in the card's header, the way the page wears
 * {@link State} in the top bar.
 */
export function AddSection(name: string, iconPath: string): [Menu.Node, Menu.Toggle] {
	const node = RootMenu.AddNode(name, iconPath)
	const state = WithIcon(node.AddToggle("State", true), GuiIcons.State)
	node.HeaderControl = state
	return [node, state]
}
