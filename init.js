Hooks.once("init", () => {
	game.settings.register("cycle-token-stack", "showTokenList", {
		name: game.i18n.localize('BBCTS.showTokenList.title'),
		hint: game.i18n.localize('BBCTS.showTokenList.hint'),
		scope: "world",
		config: true,
		default: "stacked",
		type: String,
		choices: {
			"hide": game.i18n.localize('BBCTS.showTokenList.hide'),
			"always": game.i18n.localize('BBCTS.showTokenList.always'),
			"stacked": game.i18n.localize('BBCTS.showTokenList.stacked')
		}
	});
	game.settings.register("cycle-token-stack", "minClickDelay", {
		name: game.i18n.localize('BBCTS.minClickDelay.title'),
		hint: game.i18n.localize('BBCTS.minClickDelay.hint'),
		scope: "world",
		config: true,
		default: 300,
		type: Number
	});
});