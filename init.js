const CTS_MODULE_NAME = 'cycle-token-stack';

function modifySettings()
{
	if (_CycleTokenStack)
	{
		_CycleTokenStack.minClickDelay = game.settings.get(CTS_MODULE_NAME, "minClickDelay");
		_CycleTokenStack.showTokenList = game.settings.get(CTS_MODULE_NAME, "showTokenList");
		_CycleTokenStack.keyCycleForward = game.settings.get(CTS_MODULE_NAME, "keyCycleForward");
	}
}


Hooks.once("init", () => {
	game.settings.register(CTS_MODULE_NAME, "showTokenList", {
		name: game.i18n.localize('BBCTS.showTokenList.title'),
		hint: game.i18n.localize('BBCTS.showTokenList.hint'),
		scope: "client",
		config: true,
		default: "stacked",
		type: String,
		onChange: modifySettings,
		choices: {
			"hide": game.i18n.localize('BBCTS.showTokenList.hide'),
			"always": game.i18n.localize('BBCTS.showTokenList.always'),
			"stacked": game.i18n.localize('BBCTS.showTokenList.stacked')
		}
	});
	game.settings.register(CTS_MODULE_NAME, "minClickDelay", {
		name: game.i18n.localize('BBCTS.minClickDelay.title'),
		hint: game.i18n.localize('BBCTS.minClickDelay.hint'),
		scope: "client",
		config: true,
		default: 300,
		onChange: modifySettings,
		type: Number
	});
	game.settings.register(CTS_MODULE_NAME, "keyCycleForward",  {
		name: game.i18n.localize('BBCTS.keyCycleForward.title'),
		hint: game.i18n.localize('BBCTS.keyCycleForward.hint'),
		scope: "client",
		config: true,
		default: '[',
		onChange: modifySettings,
		type: String
	});

	modifySettings();
});