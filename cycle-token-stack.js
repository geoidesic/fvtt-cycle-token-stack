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
		this.cancelClick = false;
		this.clicking = false;
		this.isTooltipOK = false;

		this.keyCycleForward = '[';
		this.keyCycleBackward = ']';
		this.showTokenList = "stacked";
		this.minClickDelay = 300;
	}


	IsDeactivated() {
		return (!this.isTooltipOK || ui.controls.controls.find( n => n.name === "token" ).activeTool === "target");
	}
	IsModifierPressed(e) {
		return (e && (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey));
	}

	BuildStack(token, allTokens=false) {
		this.tokenStack = [];
		if (token) {
			this.tokenStack = canvas.tokens.placeables.filter(t => (allTokens || game.user.isGM || t.owner) &&
				(t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h));
		}
		return token;
	}

	getTokenZ(token)
	{
		let value = 1;
		let flag = token.getFlag(CTS_MODULE_NAME, "zIndex");
		if (flag === undefined || isNaN(flag)) 
			value = (token.zIndex === undefined || isNaN(token.zIndex)) ? value : token.zIndex; 
		else 
			value = flag;
		return value;
	}
	
	setTokenZ(token, value)
	{
		token.zIndex = (value === undefined || isNaN(value)) ? 1 : value;
		if(game.user.isGM || token.owner)
		{
			token.update({ z: token.zIndex });
			token.setFlag(CTS_MODULE_NAME, "zIndex", token.zIndex);
		}
	}

	async RemoveTooltip() {
		$('.cts-tooltip').remove();
	}

	SetTooltip(t) {
		this.RemoveTooltip();
		if (!t) return;
		this.BuildStack(t);
		let showTooltip = this.showTokenList;
		if (showTooltip == "hide" || (showTooltip == "always" && this.tokenStack.length < 1) || (showTooltip == "stacked" && this.tokenStack.length < 2))
			return;
		let fullTemplate = `<div class="section">`;
		this.tokenStack.forEach(tok => {
				fullTemplate += `<div class="value">
				<i class="${tok._controlled ? 'fa fa-check' : 'fa fa-square-o'}"></i>
				${tok.name}
				${tok.isTargeted ? '<j class="far fa-eye"></j>' : ' '}
				(${this.getTokenZ(tok)})
				</div>`;
		});
		fullTemplate +=	`</div>`;

		let tooltip = $(`<div class="cts-tooltip"></div>`);
		tooltip.css('left', (t.worldTransform.tx + 0) + 'px');
		tooltip.css('top', (t.worldTransform.ty + (((t.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
		tooltip.html(fullTemplate);
		$('body.game').append(tooltip);
	}

	MoveAboveToken(token) {
		if (!token || this.tokenStack.length < 2) return token;
		let idx = 0;
		while (idx < this.tokenStack.length && this.tokenStack[idx].id !== token.id) 
			++idx;
		idx = ((idx + 1) % this.tokenStack.length);
		let tsi = this.tokenStack[idx];
		tsi.control({releaseOthers: true});
		let newZ = 0;
		this.tokenStack.forEach(t => { if (t.id !== tsi.id)	newZ = Math.max(newZ, this.getTokenZ(t)); });
		if (newZ >= this.getTokenZ(tsi))
		{
			this.setTokenZ(tsi, newZ);
		}
		return tsi;
	}

	MoveToBack(token) {
		if (!token || this.tokenStack.length < 2) return token;

		let tokenZ = this.getTokenZ(token);
		let myMin = Math.max(1, tokenZ - 1);
		let myMinDelta = 1;
		this.tokenStack.forEach(t => {
			if (t.id !== token.id)
			{
				let tokz = this.getTokenZ(t);
				myMinDelta = Math.min(myMinDelta, tokz - myMin - 1);
			}
		});
		if (myMinDelta > 0) return token;
		if (myMin > 1 - myMinDelta)
		{ myMin += myMinDelta; myMinDelta = 0; }
		this.setTokenZ(token, myMin);
		this.tokenStack.forEach(t => {
			if (t.id !== token.id)
			{
				tokenZ = this.getTokenZ(t);
				this.setTokenZ(t, tokenZ - myMinDelta);
			}
		});
		return token;
	}

	MoveToTop(token) {
		if (!token || this.tokenStack.length < 2) return token;
		token.control({releaseOthers: true});
		let newZ = 0;
		this.tokenStack.forEach(t => { if (t.id !== token.id) newZ = Math.max(newZ, this.getTokenZ(t)); });
		if (newZ >= this.getTokenZ(token))
		{
			this.setTokenZ(token, newZ + 1);
		}
		return token;
	}

	CycleOneAbove(token, allTokens) {
		this.BuildStack(token, allTokens);
		this.SetTooltip(this.MoveAboveToken(token));
	}

	OnKeyDown(e) {
		if (this.IsDeactivated()) return;
		if (this.hovering && e.key === this.keyCycleForward && !this.IsModifierPressed(e)) {
			this.BuildStack(this.hovering, true);
			this.SetTooltip(this.MoveToTop(this.hovering));
		}
		else if (this.hovering && e.key === this.keyCycleBackward && !this.IsModifierPressed(e)) {
			this.BuildStack(this.hovering, true);
			this.SetTooltip(this.MoveToBack(this.hovering));
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
	let tokZ = c.getTokenZ(token);
	if (controlled) {
		c.isTooltipOK = true;
		token.on('mousedown', c.OnMouseDown);
		c.WaitALittle(token);
		c.setTokenZ(token, tokZ + 1);
	}
	else
	{
		token.off('mousedown', c.OnMouseDown);
		if (tokZ > 0)
			c.setTokenZ(token, tokZ - 1);
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
