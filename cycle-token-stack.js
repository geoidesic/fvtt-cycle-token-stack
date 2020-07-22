/**
 * Cycle through a stack of tokens using the left-click or keyboard shortcut.
 * 
 * Copyright (c) 2020 by John Sandberg, rights granted under MIT License
 */

 class CycleTokenStack {

	static hoverToken = null;
	static lastControlledToken = null;
	static tokenStack = [];
	static IAmControlling = false;
	static readyToCycle = false;
	static IAmClicking = false;
	static IAmTargeting = false;


	static async BuildStack(token)
	{
		this.tokenStack = [];
		if (token) {
			this.tokenStack = canvas.tokens.placeables.filter(t => (game.user.isGM || t.owner)
				&& (t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h));
		}
		return token;
	}


	static async RemoveTooltip()
	{
		$('.cts-tooltip').remove();
		this.readyToCycle = false;
		this.lastControlledToken = null;
		this.hoverToken = null;
	}


	static async SetTooltip(canvasToken)
	{
		this.RemoveTooltip();
		this.hoverToken = canvasToken;
		if (!canvasToken) return;
		let showTooltip = game.settings.get("cycle-token-stack", "showTokenList");
		if (showTooltip == "hide" || (showTooltip == "always" && this.tokenStack.length < 1) || (showTooltip == "stacked" && this.tokenStack.length < 2))
			return;
		let fullTemplate = `<div class="section">`;
		this.tokenStack.forEach(tok => {
				fullTemplate += `<div class="value">
				<i class="${tok._controlled ? 'fa fa-check' : 'fa fa-square-o'}"></i>
				${tok.name}
				${tok.isTargeted ? '<i class="far fa-eye"></i>' : ''}
				</div>`;
		});
		fullTemplate +=	`</div>`;

		let tooltip = $(`<div class="cts-tooltip"></div>`);
		tooltip.css('left', (canvasToken.worldTransform.tx + 0) + 'px');
		tooltip.css('top', (canvasToken.worldTransform.ty + (((canvasToken.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
		tooltip.html(fullTemplate);
		$('body.game').append(tooltip);
	}


	static async CycleSelected()
	{
		if (this.hoverToken === null || this.tokenStack.length < 2) return;
		let idx = 0;
		while (idx < this.tokenStack.length && this.tokenStack[idx].id !== this.hoverToken.id) 
			++idx;
		idx = ((idx + 1) % this.tokenStack.length);
		this.IAmControlling = true;
		this.hoverToken = this.tokenStack[idx];
		await this.hoverToken.control({releaseOthers: true});
		this.IAmControlling = false;
	}

	static async DownEvents(token) 
	{
		if (this.hoverToken)
			this.hoverToken.off('mousedown', this.OnMouseDown);
		this.hoverToken = token;
		if (token)
			token.once('mousedown', this.OnMouseDown);
	}

	static async RefreshStack(token)
	{
		this.IAmTargeting = (ui.controls.controls.find( n => n.name === "token" ).activeTool === "target");
		this.hoverToken = await this.BuildStack(token);
		if (this.readyToCycle && !this.IAmTargeting)
			await this.CycleSelected();
		await this.BuildStack(this.hoverToken);
		this.SetTooltip(this.hoverToken);
		this.DownEvents(this.hoverToken);
	}


	static async DoDelayedAction(token)
	{
		let timeOut = game.settings.get("cycle-token-stack", "minClickDelay");
		token.once('mousemove', this.OnMouseMove);
		this.IAmClicking = true;
		setTimeout( () => {
			token.off('mousemove', this.OnMouseMove);
			this.IAmClicking = false;
			if (this.readyToCycle)
				this.RefreshStack(this.hoverToken);
			else
				this.DownEvents(this.hoverToken);
		}, timeOut);
	}


	static async OnKeyDown(e)
	{
		if (this.hoverToken && e && e.key === game.settings.get("cycle-token-stack", "keyCycleForward"))
		{
			this.readyToCycle = (this.hoverToken && this.hoverToken._controlled  && !this.IAmClicking);
			if (this.readyToCycle)
				this.RefreshStack(this.hoverToken);
			else if (!this.IAmTargeting && this.hoverToken.owner)
				this.hoverToken.control();
		}
	}

	static async OnMouseMove () 
	{
		CycleTokenStack.readyToCycle = false;
		CycleTokenStack.DownEvents(CycleTokenStack.hoverToken);
		CycleTokenStack.RemoveTooltip();
	}


	static async OnMouseDown(e)
	{
		if (CycleTokenStack.IAmClicking)
			CycleTokenStack.readyToCycle = false;
		else if (e && (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey)) {
			CycleTokenStack.SetTooltip(BuildStack(CycleTokenStack.hoverToken));
			CycleTokenStack.DownEvents(CycleTokenStack.hoverToken);
		} else {
			CycleTokenStack.readyToCycle = (CycleTokenStack.readyToCycle 
				|| (this && CycleTokenStack.hoverToken && this.id === CycleTokenStack.hoverToken.id));
			CycleTokenStack.hoverToken = this;
			CycleTokenStack.DoDelayedAction(this);
		}
	}

};
 

onkeydown = function (e) {
	e = e || event;
	CycleTokenStack.OnKeyDown(e);
}


Hooks.on("controlToken", (token, controlled) => {
	if (CycleTokenStack.IAmControlling) return;
	CycleTokenStack.readyToCycle = (controlled && (CycleTokenStack.lastControlledToken && CycleTokenStack.hoverToken
		&& CycleTokenStack.lastControlledToken.id === CycleTokenStack.hoverToken.id));
	CycleTokenStack.BuildStack(token).then(t => {
		if (controlled)
			CycleTokenStack.SetTooltip(t);
		CycleTokenStack.DownEvents(t);
		CycleTokenStack.lastControlledToken = t;
	});
});


Hooks.on("hoverToken", (token, hovered) => {
	if (CycleTokenStack.IAmControlling) return;
	if (hovered) {
		CycleTokenStack.readyToCycle = (token && token._controlled);
		CycleTokenStack.BuildStack(token).then(t => {
			CycleTokenStack.SetTooltip(t);
			CycleTokenStack.DownEvents(t);
		});
	}
	else
		CycleTokenStack.RemoveTooltip();
});


Hooks.on("deleteToken", (scene, token) => {
	CycleTokenStack.RemoveTooltip();
});
