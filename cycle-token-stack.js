/**
 * Cycle through a stack of tokens using the left-click or keyboard shortcut.
 * Copyright (c) 2020 by John Sandberg, rights granted as described in LICENSE file
 */

/**
  * Class for retaining current control and hover state and processing cycle requests.
  */

 class CycleTokenStack {

	constructor() {
		this.tokenStack = [];
		this.hovering = null;
		this.controlling = null;
		this.cancelClick = false;
		this.clicking = false;
		this.isTooltipOK = false;

		this.keyCycleForward = '[';
		this.keyCycleBackward = ']';
		this.showTokenList = "stacked";
		this.minClickDelay = 300;

		this.maxZ = 99;
	}

	IsControllable(token) { return game.user.isGM || token.owner; }

	IsDeactivated() {
		return (!this.isTooltipOK || ui.controls.controls.find( n => n.name === "token" ).activeTool === "target");
	}
	IsModifierPressed(e) {
		return (e && (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey));
	}

	BuildStack(token, allTokens=false) {
		this.tokenStack = [];
		if (token) {
			this.tokenStack = canvas.tokens.placeables.filter(t => (allTokens || this.IsControllable(t)) &&
				(t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h));
		}
		return token;
	}

	getTokenZ(token) {
		let value = token.getFlag(CTS_MODULE_NAME, "zIndex");
		if (value === undefined || isNaN(value)) 
			value = (token.zIndex === undefined || isNaN(token.zIndex)) ? 1 : token.zIndex; 
		return value;
	}
	
	setTokenZ(token, value)
	{
		token.zIndex = (value === undefined || isNaN(value)) ? 0 : value;
		if (this.IsControllable(token))
		{
			token.update({ z: token.zIndex });
			if (game.user.isGM)
				token.setFlag(CTS_MODULE_NAME, "zIndex", token.zIndex);
		}
	}

	ClearAllFlags() {
		for (let t of canvas.tokens.placeables)  { 
			this.setTokenZ(t, 0);
		}
	}

	MoveAllFlags(delta) {
		for (let t of canvas.tokens.placeables)  { 
			this.setTokenZ(t, Math.clamped(10 - this.maxZ, this.getTokenZ(t) + delta, this.maxZ - 10) );
		}
	}

	RefreshPlayers(token) {
		for (let t of canvas.tokens.placeables)  { 
			this.setTokenZ(t, t.zIndex);
		}
	}

	async RemoveTooltip() {
		$('.cts-tooltip').remove();
	}

	SetTooltip(t) {
		this.RemoveTooltip();
		if (!t) return t;
		this.BuildStack(t);
		let showTooltip = this.showTokenList;
		if (showTooltip == "hide" || (showTooltip == "always" && this.tokenStack.length < 1) || (showTooltip == "stacked" && this.tokenStack.length < 2))
			return t;
		let fullTemplate = `<div class="section">`;
		this.tokenStack.forEach(tok => {
			fullTemplate += `<div class="value">
			<i class="${tok._controlled ? 'fa fa-check' : 'fa fa-square-o'}"></i>
			${tok.name}
			${tok.isTargeted ? '<j class="far fa-eye"></j>' : ' '}
			(${this.getTokenZ(tok)}) ${tok.zIndex}
			</div>`;
		});
		fullTemplate +=	`</div>`;

		let tooltip = $(`<div class="cts-tooltip"></div>`);
		tooltip.css('left', (t.worldTransform.tx + 0) + 'px');
		tooltip.css('top', (t.worldTransform.ty + (((t.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
		tooltip.html(fullTemplate);
		$('body.game').append(tooltip);
		return t;
	}

	FindNextToken(token)
	{
		if (!token || this.tokenStack.length < 2) return token;
		let idx = 0;
		while (idx < this.tokenStack.length && this.tokenStack[idx].id !== token.id) 
			++idx;
		idx = ((idx + 1) % this.tokenStack.length);
		return this.tokenStack[idx];
	}

	MoveToBack(token) {
		if (!token || this.tokenStack.length < 2) return token;
		let oldZ = this.getTokenZ(token);
		let newZ = oldZ;
		this.tokenStack.forEach(t => {
			if (t.id !== token.id) newZ = Math.min(newZ, this.getTokenZ(t)); 
		});
		if (newZ < -this.maxZ) 
			this.MoveAllFlags(this.maxZ);
		else
			this.setTokenZ(token, (newZ < oldZ) ? newZ - 1 : newZ);
		return token;
	}

	MoveToTop(token) {
		if (!token || this.tokenStack.length < 2) return token;
		let oldZ = this.getTokenZ(token);
		let newZ = oldZ;
		this.tokenStack.forEach(t => {
			if (t.id !== token.id) newZ = Math.max(newZ, this.getTokenZ(t)); 
		});
		if (newZ > this.maxZ) 
			this.MoveAllFlags( -this.maxZ);
		else
			this.setTokenZ(token, (newZ !== oldZ) ? newZ + 1 : oldZ + 1);
		return token;
	}

	CycleOneAbove(token, allTokens) {
		this.BuildStack(token, allTokens);
		let newToken = this.FindNextToken(token);
		if (newToken._controlled || !this.IsControllable(newToken))
			this.SetTooltip(this.MoveToTop(newToken));
		else
			newToken.control({releaseOthers: true});
	}

	OnKeyDown(e) {
		if (this.IsDeactivated()) return;
		if (this.hovering && e.key === this.keyCycleForward && !this.IsModifierPressed(e)) {
			let newToken = this.hovering;
			if (newToken._controlled || !this.IsControllable(newToken))
				this.SetTooltip(this.MoveToTop(this.BuildStack(newToken, true)));
			else
				newToken.control({releaseOthers: true});
		}
		else if (this.hovering && e.key === this.keyCycleBackward && !this.IsModifierPressed(e)) {
			this.SetTooltip(this.MoveToBack(this.BuildStack(this.hovering, true)));
		}
		else if (e.key === this.keyCycleBackward && (e.ctrlKey || e.metaKey) && !e.altKey)
		{
			this.MoveAllFlags(0);
		}
		else if (e.key === this.keyCycleForward && (e.ctrlKey || e.metaKey) && !e.altKey)
		{
			this.RefreshPlayers();
		}
		else if (e.key === this.keyCycleBackward && !(e.ctrlKey || e.metaKey) && e.altKey)
		{
			this.ClearAllFlags();
		}
	}

	OnMouseMove(e) {
		_CycleTokenStack.cancelClick = true;
		_CycleTokenStack.RemoveTooltip();
	}

	MouseDown(t, f) {
		if (this.IsDeactivated()) return;
		this.clicking = true;
		this.cancelClick = false;
		t.once('mousemove', this.OnMouseMove);
		setTimeout( () => { 
			t.off('mousemove', this.OnMouseMove);
			if (!this.cancelClick) {
				if (f) this.CycleOneAbove(t, false); else this.SetTooltip(t);
			}
			this.clicking = false;
			this.cancelClick = false;
		}, this.minClickDelay);
	}
	
	WaitALittle(token) {
		this.MouseDown(token, false);
	}

	OnMouseDown(e) {
		const c = _CycleTokenStack;
		const oe = e.data.originalEvent;
		if (c.IsModifierPressed(oe)) return;
		if (c.clicking) { c.cancelClick = true; return; }
		c.MouseDown(this, true);
	}
}


let _CycleTokenStack = new CycleTokenStack();


onkeydown = function (e) {
	e = e || event;
	_CycleTokenStack.OnKeyDown(e);
};

Hooks.on("controlToken", (token, controlled) => {
	let c = _CycleTokenStack;
	if (controlled) {
		c.isTooltipOK = true;
		token.on('mousedown', c.OnMouseDown);
		c.MoveToTop(c.BuildStack(token, false));
		c.controlling = token;
		c.WaitALittle(token);
	}
	else
	{
		token.off('mousedown', c.OnMouseDown);
		c.setTokenZ(token, c.getTokenZ(token));
		c.controlling = null;
	}

});

Hooks.on("hoverToken", (token, hover) => {
	let c = _CycleTokenStack;
	if (hover) {
		if (!c.clicking && !c.IsDeactivated()) {
			c.hovering = token;
			c.SetTooltip(c.hovering);
		}
	} else {
		if (!c.clicking || c.cancelClick) {
			c.hovering = null;
			c.RemoveTooltip();
		} 
	}
});

Hooks.on("deleteToken", (token) => {
	_CycleTokenStack.hovering = null;
	_CycleTokenStack.RemoveTooltip();
});

Hooks.on("ready", () => { _CycleTokenStack.MoveAllFlags(0); } );
