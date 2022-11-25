import {
	Color,
	ComputedAttachment,
	Entity,
	EntityManager,
	Input,
	RendererSDK,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { RootMenu } from "./menu"

const AttachmentsNode = RootMenu.AddNode("Attachments")
const State = AttachmentsNode.AddToggle("State", true),
	GameTimeState = AttachmentsNode.AddToggle("Use game time", false),
	Offset = AttachmentsNode.AddSlider("Frame offset", 0, -30, 30)
function RenderAttachment(
	ent: Entity,
	attach: ComputedAttachment,
	color: Color,
	name: string
): void {
	const time = !GameTimeState.value ? attach.FrameCount / attach.FPS / 2 : ent.AnimationTime
	const screen_pos = RendererSDK.WorldToScreen(
		attach
			.GetPosition(time + Offset.value / attach.FPS, ent.RotationRad, ent.ModelScale)
			.AddForThis(ent.Position)
	)
	if (screen_pos === undefined) return
	if (Input.CursorOnScreen.Distance(screen_pos) < 16) RendererSDK.Text(name, screen_pos, color)
	RendererSDK.FilledRect(screen_pos.SubtractScalar(4), new Vector2(8, 8), color)
}

export function DrawAttachments(): void {
	if (!State.value) return
	EntityManager.AllEntities.forEach(ent => {
		if (!ent.IsVisible) return
		ent.GetAttachments()?.forEach((attachment, name) => {
			let color: Color
			switch (name) {
				case "attach_hitloc":
					color = Color.Aqua
					break
				case "attach_attack1":
					color = Color.Red
					break
				default:
					color = Color.White
					break
			}
			RenderAttachment(ent, attachment, color, name)
		})
	})
}
