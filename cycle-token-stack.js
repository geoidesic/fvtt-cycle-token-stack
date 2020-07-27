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


	IsDeactivated(e) {
		return (!this.isTooltipOK || !e || e.altKey || e.ctrlKey || e.metaKey || ui.controls.controls.find( n => n.name === "token" ).activeTool === "target");
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
		let f = 1;
		let flag = token.getFlag(CTS_MODULE_NAME, "zIndex");
		if (flag === undefined || isNaN(flag)) 
			f = (token.zIndex === undefined || isNaN(token.zIndex)) ? 1 : token.zIndex; 
		else 
			f = flag;
		return f;
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

	CycleSelected(token) {
		if (!token || this.tokenStack.length < 2) return token;
		let idx = 0;
		while (idx < this.tokenStack.length && this.tokenStack[idx].id !== token.id) 
			++idx;
		idx = ((idx + 1) % this.tokenStack.length);
		let tsi = this.tokenStack[idx];
		this.setTokenZ(tsi, this.getTokenZ(token));
		tsi.control({releaseOthers: true});
		return tsi;
	}

	UncycleSelected(token) {
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

	ReleaseHovered(token) {
		this.BuildStack(token, true);
		this.SetTooltip(this.UncycleSelected(token));
	}

	RefreshStack(token) {
		this.BuildStack(token);
		this.SetTooltip(this.CycleSelected(token));
	}

	OnKeyDown(e) {
		let c = _CycleTokenStack;
		if (c.IsDeactivated(e)) return;
		if (c.hovering && e.key === c.keyCycleForward) {
			if (c.hovering._controlled)
				c.RefreshStack(c.hovering);
			else {
				c.hovering.control({releaseOthers: true});
				c.SetTooltip(c.hovering);
			}
		}
		else if (c.hovering && e.key === c.keyCycleBackward)
			this.ReleaseHovered(c.hovering);
	}

	OnMouseMove(e) {
		_CycleTokenStack.cancelClick = true;
		_CycleTokenStack.RemoveTooltip();
	}

	WaitALittle(token) {
		this.clicking = true;
		token.once('mousemove', this.OnMouseMove);
		setTimeout( () => { 
			token.off('mousemove', this.OnMouseMove);
			this.SetTooltip(token);
			this.clicking = false;
		}, this.minClickDelay);
	}

	OnMouseDown(e) {
		let c = _CycleTokenStack;
		let oe = e.data.originalEvent;
		if (c.IsDeactivated(oe) || oe.shiftKey) return;
		if (c.clicking) { c.cancelClick = true; return; }
		c.clicking = true;
		c.cancelClick = false;
		this.once('mousemove', c.OnMouseMove);
		setTimeout( () => { 
			this.off('mousemove', c.OnMouseMove);
			if (!c.cancelClick)
				c.RefreshStack(this);
			c.clicking = false;
		}, c.minClickDelay);
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
		if (!c.clicking) c.WaitALittle(token);
	}
	else
	{
		token.off('mousedown', c.OnMouseDown);
	}
	c.setTokenZ(token, c.getTokenZ(token));
});

Hooks.on("hoverToken", (token, hover) => {
	let c = _CycleTokenStack;
	if (hover) {
		if (!c.clicking && !c.IsDeactivated(event)) {
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
