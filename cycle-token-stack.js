/**
 * Copyright (c) 2020 by John Sandberg under MIT License
 */

let cts_HoverToken = null;
let cts_TokenStack = [];
let cts_Controlling = false;
let cts_ReadyToCycle = false;
let cts_IAmClicking = false;
let cts_IAmTargeting = false;
let cts_HasATooltip = false;

function cts_BuildStack(token)
{
	cts_TokenStack = [];
	if (token) {
		cts_TokenStack = canvas.tokens.placeables.filter(t => (game.user.isGM || t.owner)
			 && (t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h));
	}
	return token;
}


function cts_RemoveTooltip()
{
	if (cts_HasATooltip)
		$('.cts-tooltip').remove();
	cts_HasATooltip = false;
}


function cts_SetTooltip(canvasToken)
{
	cts_RemoveTooltip();
	if (!canvasToken) return;
	let showTooltip = game.settings.get("cycle-token-stack", "showTokenList");
	if (showTooltip == "hide" || (showTooltip == "always" && cts_TokenStack.length < 1) || (showTooltip == "stacked" && cts_TokenStack.length < 2))
		return;
	let fullTemplate = `<div class="section">`;
	cts_TokenStack.forEach(tok => {
			fullTemplate += `<div class="value">
			<i class="${tok._controlled ? 'fa fa-check' : 'fa fa-square-o'}"></i>
			${tok.name}
			${tok.isTargeted ? '<i class="far fa-eye"></i>' : ''}
			</div>`;
	});
	fullTemplate +=	`</div>`;

	let cts_tooltip = $(`<div class="cts-tooltip"></div>`);
	cts_tooltip.css('left', (canvasToken.worldTransform.tx + 0) + 'px');
	cts_tooltip.css('top', (canvasToken.worldTransform.ty + (((canvasToken.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
	cts_tooltip.html(fullTemplate);
	$('body.game').append(cts_tooltip);
	cts_HasATooltip = true;
}


function cts_CycleSelected()
{
	if (cts_HoverToken === null || cts_TokenStack.length < 2) return;
	let idx = 0;
	while (idx < cts_TokenStack.length && cts_TokenStack[idx].id !== cts_HoverToken.id) 
		++idx;
	idx = ((idx + 1) % cts_TokenStack.length);
	cts_Controlling = true;
	cts_HoverToken = cts_TokenStack[idx];
	cts_HoverToken.control({releaseOthers: true});
	cts_Controlling = false;
}


function cts_RefreshStack(token)
{
	cts_IAmTargeting = (ui.controls.controls.find( n => n.name === "token" ).activeTool === "target");
	if (cts_HoverToken)
		cts_HoverToken.off('mousedown', cts_OnMouseDown);
	cts_HoverToken = cts_BuildStack(token);
	if (cts_ReadyToCycle && !cts_IAmTargeting)
		cts_CycleSelected();
	cts_HoverToken = cts_BuildStack(cts_HoverToken);
	cts_SetTooltip(cts_HoverToken);
	if (cts_HoverToken)
		cts_HoverToken.once('mousedown', cts_OnMouseDown);
}


function cts_OnMouseMove () 
{
	cts_ReadyToCycle = false;
	if (cts_HoverToken)
		cts_HoverToken.once('mousedown', cts_OnMouseDown);
	cts_RemoveTooltip();
}


function cts_DoDelayedAction(token)
{
	let timeOut = game.settings.get("cycle-token-stack", "minClickDelay");
	token.once('mousemove', cts_OnMouseMove);
	cts_IAmClicking = true;
	setTimeout( () => {
		token.off('mousemove', cts_OnMouseMove);
		cts_IAmClicking = false;
		if (cts_ReadyToCycle)
			cts_RefreshStack(cts_HoverToken);
		else
			cts_HoverToken.once('mousedown', cts_OnMouseDown);
	}, timeOut);
}


function cts_OnMouseDown() {
	if (!this || !event || cts_IAmClicking)
		cts_ReadyToCycle = false;
	else if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
		cts_SetTooltip(cts_BuildStack(this));
		this.once('mousedown', cts_OnMouseDown);
	} else {
		cts_ReadyToCycle = (cts_HoverToken && this.id === cts_HoverToken.id);
		if (cts_ReadyToCycle) {
			cts_DoDelayedAction(this);
		} else {
			cts_HoverToken = this;
			cts_SetTooltip(cts_BuildStack(this));
			cts_HoverToken.once('mousedown', cts_OnMouseDown);
		}
	}
}


Hooks.on("controlToken", (token, controlled) => {
	cts_ReadyToCycle = false;
	if (!cts_Controlling && token && controlled)
	{
		token.off('mousedown', cts_OnMouseDown);
		cts_SetTooltip(cts_BuildStack(token));
		token.once('mousedown', cts_OnMouseDown);
	}
});


Hooks.on("hoverToken", (token, hovered) => {
	cts_ReadyToCycle = false;
	if (cts_Controlling) return;
	if (token && hovered)
	{
		token.off('mousedown', cts_OnMouseDown);
		cts_HoverToken = (token._controlled ? token : cts_HoverToken);
		cts_SetTooltip(cts_BuildStack(token));
		if (token)
			token.once('mousedown', cts_OnMouseDown);
	}
	else
		cts_RemoveTooltip();
});


Hooks.on("deleteToken", (scene, token) => {
	cts_ReadyToCycle = false;
	cts_RemoveTooltip();
});
