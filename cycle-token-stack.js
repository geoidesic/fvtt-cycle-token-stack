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

	BuildStack(token) {
		this.tokenStack = [];
		if (token) {
			this.tokenStack = canvas.tokens.placeables.filter(t => (game.user.isGM || t.owner) &&
				(t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h));
		}
		return token;
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
				${tok.isTargeted ? '<j class="far fa-eye"></j>' : ''}
				</div>`;
		});
		fullTemplate +=	`</div>`;

		let tooltip = $(`<div class="cts-tooltip"></div>`);
		tooltip.css('left', (t.worldTransform.tx + 0) + 'px');
		tooltip.css('top', (t.worldTransform.ty + (((t.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
		tooltip.html(fullTemplate);
		$('body.game').append(tooltip);
	}

	async CycleSelected(token) {
		if (!token ||this.tokenStack.length < 2) return token;
		let idx = 0;
		while (idx < this.tokenStack.length && this.tokenStack[idx].id !== token.id) 
			++idx;
		idx = ((idx + 1) % this.tokenStack.length);
		await this.tokenStack[idx].control({releaseOthers: true});
		return this.tokenStack[idx];
	}

	UncycleSelected(token) {
		if (!token ||this.tokenStack.length < 2) return token;
		token.release();
		this.tokenStack.forEach(t => {
			if (t.id !== token.id)
				t.control({releaseOthers: false});
		});	
		return token;
	}

	ReleaseHovered(token) {
		this.BuildStack(token);
		this.SetTooltip(this.UncycleSelected(token));
	}

	RefreshStack(token) {
		this.BuildStack(token);
		this.SetTooltip(this.CycleSelected(token));
	}

	OnKeyDown(e) {
		if (this.IsDeactivated(e)) return;
		if (this.hovering && e.key === this.keyCycleForward) {
			if (this.hovering._controlled)
				this.RefreshStack(this.hovering);
			else {
				this.hovering.control({releaseOthers: true});
				this.SetTooltip(this.hovering);
			}
		}
		else if (this.hovering && e.key === this.keyCycleBackward)
			this.ReleaseHovered(this.hovering);
	}

	OnMouseMove(e) {
		_CycleTokenStack.cancelClick = true;
		_CycleTokenStack.RemoveTooltip();
	}

	MouseDown(t, f) {
		this.clicking = true;
		this.cancelClick = false;
		t.once('mousemove', this.OnMouseMove);
		setTimeout( () => { 
			t.off('mousemove', this.OnMouseMove);
			if (!this.cancelClick) {
				if (f) this.RefreshStack(t); else this.SetTooltip(t);
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
		if (c.IsDeactivated(oe) || oe.shiftKey) return;
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
	const c = _CycleTokenStack;
	if (controlled) {
		c.isTooltipOK = true;
		token.on('mousedown', c.OnMouseDown);
		c.WaitALittle(token);
	}
	else
		token.off('mousedown', c.OnMouseDown);
});

Hooks.on("hoverToken", (token, hover) => {
	const c = _CycleTokenStack;
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
