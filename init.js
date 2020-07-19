Hooks.once("init", () => {
	game.settings.register("cycle-token-stack", "showTokenList", {
		name: "Display List of Tokens",
		hint: "Determines whether or not to show a list of tokens as a tool tip when hovering over stack.",
		scope: "world",
		config: true,
		default: "stacked",
		type: String,
		choices: {
			"hide": "Always Hide",
			"always": "Always Show on Hover",
			"stacked": "Show When Stacked Two or More"
		}
	});
	game.settings.register("cycle-token-stack", "minClickDelay", {
		name: "Click Threshold (milliseconds)",
		hint: "Minimum duration (ms) between single clicks to trigger cycling; avoids conflict with double-click.",
		scope: "world",
		config: true,
		default: 300,
		type: Number
	});
});