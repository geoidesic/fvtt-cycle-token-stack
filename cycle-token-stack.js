/**
 * Cycle through a stack of tokens using the left-click or keyboard shortcut.
 * 
 * Copyright (c) 2020 by John Sandberg, rights granted as described in LICENSE file
 */

 class CycleTokenStack {

	constructor() {
		this.hoverToken = null;
		this.lastControlledToken = null;
		this.tokenStack = [];
		this.IAmControlling = false;
		this.readyToCycle = false;
		this.IAmClicking = false;
		this.IAmTargeting = false;
	}


	async BuildStack(token)
	{
		this.hoverToken = token;
		this.tokenStack = [];
		if (token) {
			this.tokenStack = canvas.tokens.placeables.filter(t => (game.user.isGM || t.owner) &&
				(t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h));
		}
		return this.hoverToken;
	}


	async RemoveTooltip()
	{
		await $('.cts-tooltip').remove();
		this.lastControlledToken = null;
	}


	async SetTooltip()
	{
		this.RemoveTooltip();
		let t = this.hoverToken;
		if (!t) return;
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
		tooltip.css('left', (t.worldTransform.tx + 0) + 'px');
		tooltip.css('top', (t.worldTransform.ty + (((t.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
		tooltip.html(fullTemplate);
		$('body.game').append(tooltip);
	}


	async CycleSelected()
	{
		if (this.hoverToken === null || this.tokenStack.length < 2) return;
		let idx = 0;
		while (idx < this.tokenStack.length && this.tokenStack[idx].id !== this.hoverToken.id) 
			++idx;
		idx = ((idx + 1) % this.tokenStack.length);
		this.IAmControlling = true;
		this.hoverToken = this.tokenStack[idx];
		await this.hoverToken.control({releaseOthers: true});
		this.lastControlledToken = this.hoverToken;
		this.IAmControlling = false;
	}

	async DownEvents() 
	{
		if (this.hoverToken)
			this.hoverToken.off('mousedown', this.OnMouseDown);
		if (this.hoverToken)
			this.hoverToken.once('mousedown', this.OnMouseDown);
	}

	async RefreshStack(token)
	{
		this.IAmTargeting = (ui.controls.controls.find( n => n.name === "token" ).activeTool === "target");
		await this.BuildStack(token);
		if (!this.IAmTargeting)
			await this.CycleSelected();
		await this.BuildStack(this.hoverToken);
		this.SetTooltip();
		this.DownEvents();
	}


	async DoDelayedAction(token)
	{
		let timeOut = game.settings.get("cycle-token-stack", "minClickDelay");
		token.once('mousemove', this.OnMouseMove);
		this.IAmClicking = true;
		setTimeout( () => {
			token.off('mousemove', this.OnMouseMove);
			this.IAmClicking = false;
			if (this.readyToCycle) {
				this.RefreshStack(this.hoverToken);
			}
			else
			{
				this.RemoveTooltip();
				this.DownEvents();
			}
			this.readyToCycle = true;
		}, timeOut);
	}


	async OnKeyDown(e)
	{
		if (this.hoverToken && e && e.key === game.settings.get("cycle-token-stack", "keyCycleForward"))
		{
			this.readyToCycle = (this.hoverToken && this.hoverToken._controlled  && !this.IAmClicking);
			console.log("KeyDown", this.readyToCycle, this, e);
			if (this.readyToCycle)
				this.RefreshStack(this.hoverToken);
			else if (!this.IAmTargeting && this.hoverToken.owner)
				this.hoverToken.control();
		}
	}

	async OnMouseMove () 
	{
		let c = _CycleTokenStack;
		c.readyToCycle = false;
		c.RemoveTooltip();
		c.DownEvents();
	}


	async OnMouseDown(e)
	{
		let c = _CycleTokenStack;
		if (c.IAmClicking)
			c.readyToCycle = false;
		else if (e && (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey)) {
			c.DownEvents();
		} else {
			await c.BuildStack(this);
			c.SetTooltip();
			c.DoDelayedAction(c.hoverToken);
		}
	}

}
 
let _CycleTokenStack = new CycleTokenStack();


onkeydown = function (e) {
	e = e || event;
	_CycleTokenStack.OnKeyDown(e);
};


Hooks.on("controlToken", (token, controlled) => {
	let c = _CycleTokenStack;
	if (c.IAmControlling) return;
	c.readyToCycle = (controlled && c.hoverToken && c.lastControlledToken && c.lastControlledToken.id === c.hoverToken.id);
	c.BuildStack(token).then(t => {
		if (controlled)
		{
			c.SetTooltip();
			c.lastControlledToken = t;
		}
		c.DownEvents();
	});
});


Hooks.on("hoverToken", (token, hovered) => {
	let c = _CycleTokenStack;
	if (c.IAmControlling) return;
	if (hovered) {
		c.readyToCycle = (token && token._controlled);
		c.BuildStack(token).then(t => {
			c.SetTooltip();
			c.DownEvents();
		});
	}
	else
		c.RemoveTooltip();
});


Hooks.on("deleteToken", (scene, token) => {
	_CycleTokenStack.RemoveTooltip();
});
