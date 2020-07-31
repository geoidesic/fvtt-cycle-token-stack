/**
 * Cycle through a stack of tokens using the left-click or keyboard shortcut.
 * Copyright (c) 2020 by John Sandberg, rights granted as described in LICENSE file
 */

/**
  * Class for retaining hover state and for processing cycle requests.
  * Stores zIndex in data.flags for safe keeping between sessions.
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
		this.showTokenList = 'stacked';
		this.minClickDelay = 300;

		this.maxZ = 1000;
	}

	IsControllable(token) { return game.user.isGM || token.owner; }

	IsDeactivated() {
		return (!this.isTooltipOK || ui.controls.controls.find( n => n.name === 'token' ).activeTool === '"target');
	}
	IsModifierPressed(e) {
		return (e && (e.altKey || e.ctrlKey || e.metaKey));
	}
	BuildStack(token, allTokens = false) {
		this.tokenStack = [];
		if (token) {
			this.tokenStack = canvas.tokens.placeables.filter(t => (allTokens || this.IsControllable(t)) &&
				(t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h));
		}
		return token;
	}

	getTokenZ(token) {
		let zValue = (token.zIndex === undefined || isNaN(token.zIndex)) ? 0 : token.zIndex;
		let fValue = token.getFlag(CTS_MODULE_NAME, CTS_FLAG_INDEX);
		if (fValue === undefined || isNaN(fValue))
			fValue = zValue;

		return (game.user.isGM || zValue === 0) ? fValue : zValue;
	}

	async setTokenZ(token, value) {
		token.zIndex = (value === undefined || isNaN(value)) ? 0 : value;
		if (game.user.isGM)
			token.setFlag(CTS_MODULE_NAME, CTS_FLAG_INDEX, token.zIndex);
	}

	async RevertToCachedZ() {
		for (const t of canvas.tokens.placeables) {
			_CycleTokenStack.setTokenZ(t, t.getFlag(CTS_MODULE_NAME, CTS_FLAG_INDEX));
		}
	}
	async ClearAllFlags() {
		if (game.user.isGM) {
			for (const t of canvas.tokens.placeables)
			{
				t.zIndex = 0;
				t.unsetFlag(CTS_MODULE_NAME, CTS_FLAG_INDEX);
			}
		} else
			this.RevertToCachedZ();
	}

	async MoveAllFlags(delta) {
		for (const t of canvas.tokens.placeables)  { 
			// TBD: Compress range (plenty of holes between z-Indices (unless user stacked 1980 tokens)
			this.setTokenZ(t, Math.clamped(10 - this.maxZ, this.getTokenZ(t) + delta, this.maxZ - 10) );
		}
	}

	async RefreshPlayers() {
		if (game.user.isGM) {
			for await (const t of canvas.tokens.placeables) {
				if (this.getTokenZ(t) !== t.zIndex)
					this.setTokenZ(t, t.zIndex);
			}
			const myActivityData = { cycleTokenStack: { action: 'refreshPlayers', sceneID: game.users.current.viewedScene } }; 
			game.socket.emit('userActivity', game.user.id, myActivityData);
		}
		else this.RevertToCachedZ();
	}

	RemoveTooltip() {
		$('.cts-stack-tooltip').remove();
	}

	SetTooltip(t) {
		this.RemoveTooltip();
		if (!t) return t;
		this.BuildStack(t, false);
		let showTooltip = this.showTokenList;
		if (showTooltip == 'hide' || (showTooltip == 'always' && this.tokenStack.length < 1) || (showTooltip == 'stacked' && this.tokenStack.length < 2))
			return t;
		let fullTemplate = `<div class="section">`;
		this.tokenStack.forEach(tok => {
			fullTemplate += `<div class="value">
			<i class="${tok._controlled ? 'fa fa-check' : 'fa fa-square-o'}"></i>
			${tok.name}
			${tok.isTargeted ? '<j class="far fa-eye"></j>' : ' '}
			</div>`;
		});
		fullTemplate +=	`</div>`;

		let tooltip = $(`<div class="cts-stack-tooltip"></div>`);
		tooltip.css('left', (t.worldTransform.tx + 0) + 'px');
		tooltip.css('top', (t.worldTransform.ty + (((t.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
		tooltip.html(fullTemplate);
		$('body.game').append(tooltip);
		return t;
	}

	FindNextToken(token) {
		if (!token || this.tokenStack.length < 2) return token;
		let idx = this.tokenStack.findIndex(t => t.id === token.id);
		idx = ((idx + 1) % this.tokenStack.length);
		return this.tokenStack[idx];
	}

	async MoveToBack(token) {
		if (!token || this.tokenStack.length < 2) return token;
		let oldZ = this.getTokenZ(token);
		let newZ = oldZ;
		for (const t of this.tokenStack) {
			if (t.id !== token.id) newZ = Math.min(newZ, this.getTokenZ(t)); 
		}
		if (newZ < -this.maxZ) 
			this.MoveAllFlags(this.maxZ);
		else
			this.setTokenZ(token, (newZ < oldZ) ? newZ - 1 : newZ);
		return token;
	}

	async MoveToTop(token) {
		if (!token || this.tokenStack.length < 2) return token;
		let oldZ = this.getTokenZ(token);
		let newZ = oldZ;
		for (const t of this.tokenStack) {
			if (t.id !== token.id) newZ = Math.max(newZ, this.getTokenZ(t)); 
		}
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

	async OnKeyDown(e) {
		if (this.IsDeactivated()) return;
		if (this.hovering && e.key === this.keyCycleForward && !this.IsModifierPressed(e)) {
			let newToken = this.hovering;
			if (newToken._controlled || !this.IsControllable(newToken))
				this.MoveToTop(this.BuildStack(newToken, true)).then(t => this.SetTooltip(t));
			else
				newToken.control({releaseOthers: true});
		}
		else if (this.hovering && e.key === this.keyCycleBackward && !this.IsModifierPressed(e)) {
			this.MoveToBack(this.BuildStack(this.hovering, true)).then(t => this.SetTooltip(t));
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

	async OnMouseMove(e) {
		_CycleTokenStack.cancelClick = true;
		_CycleTokenStack.RemoveTooltip();
	}

	async MouseDown(t, f) {
		this.clicking = true;
		this.cancelClick = false;
		t.once('mousemove', this.OnMouseMove);
		setTimeout( () => { 
			t.off('mousemove', this.OnMouseMove);
			if (!this.cancelClick) {
				this.CycleOneAbove(t, false);
			}
			this.clicking = false;
			this.cancelClick = false;
		}, this.minClickDelay);
	}
	
	async ActOnControl(token) {
		if (this.IsDeactivated()) return;
		this.MoveToTop(this.BuildStack(token, true)).then(t => this.SetTooltip(t));
	}

	async OnMouseDown(e) {
		const c = _CycleTokenStack;
		if (c.IsDeactivated()) return;
		const oe = e.data.originalEvent;
		if (c.IsModifierPressed(oe) || oe.shiftKey) return;
		if (c.clicking) { c.cancelClick = true; return; }
		c.MouseDown(this, true);
	}
}

  /* ----------- Global Variable ------------ */

let _CycleTokenStack = new CycleTokenStack();

  /* ---------------------------------------- */

onkeydown = async (e) => {
	e = e || event;
	if (_CycleTokenStack.IsDeactivated()) return;
	_CycleTokenStack.OnKeyDown(e);
};

Hooks.on('controlToken', async (token, controlled) => {
	const c = _CycleTokenStack;
	if (c.IsDeactivated()) return;
	if (controlled) {
		token.on('mousedown', c.OnMouseDown);
		c.ActOnControl(token);
	} else {
		token.off('mousedown', c.OnMouseDown);
		c.setTokenZ(token, c.getTokenZ(token));
	}
});

Hooks.on('hoverToken', async (token, hover) => {
	const c = _CycleTokenStack;
	if (c.IsDeactivated()) return;
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

Hooks.on('deleteToken', async (token) => {
	const c = _CycleTokenStack;
	c.hovering = null;
	c.RemoveTooltip();
});

Hooks.on('canvasReady', async () => { 
	const c = _CycleTokenStack;
	c.isTooltipOK = true;
	c.RevertToCachedZ();

	game.socket.on('userActivity', async (t, r) => { 
		if (r.cycleTokenStack && r.cycleTokenStack.action && r.cycleTokenStack.action === 'refreshPlayers') {
			if (game.users.current.viewedScene && r.cycleTokenStack.sceneID === game.users.current.viewedScene)
				_CycleTokenStack.RevertToCachedZ();
		}
	 });
} );
