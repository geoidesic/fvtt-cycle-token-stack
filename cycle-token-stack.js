
let cts_HoverToken = null;
let cts_TokenStack = [];
let cts_Controlling = false;
let cts_ReadyToCycle = false;
let cts_IAmClicking = false;

function cts_GetStack(token)
{
	cts_TokenStack = [];
	token = token || canvas.tokens.controlled[0];
	if (token) {
		token = canvas.tokens.placeables.find((t) => t.id === token.id);
		canvas.tokens.placeables.forEach(t => { 
			if (t.x + t.w > token.x && t.y + t.h > token.y && t.x < token.x + token.w && t.y < token.y + token.h)
			cts_TokenStack.push(t);
		});
	}
	return token;
}

function cts_SetTooltip(canvasToken)
{
	$('.cts_-tooltip').remove();
	canvasToken = cts_GetStack(canvasToken);
	if (!canvasToken) return;
	cts_HoverToken = canvasToken;
	let showTooltip = game.settings.get("cycle-token-stack", "showTokenList");
	if (showTooltip == "hide" || (showTooltip == "always" && cts_TokenStack.length < 1) || (showTooltip == "stacked" && cts_TokenStack.length < 2))
		return;
	let fullTemplate = `<div class="section">`;
	cts_TokenStack.forEach(tok => {
		if (tok._controlled)
			fullTemplate += `<div class="value"><i class="far fa-eye"></i>${tok.name}</div>`;
		else
			fullTemplate += `<div class="value"><i class="fas fa-search"></i>${tok.name}</div>`;
	});
	fullTemplate +=	`</div>`;

	let cts_tooltip = $(`<div class="cts_-tooltip"></div>`);
	cts_tooltip.css('left', (canvasToken.worldTransform.tx + 0) + 'px');
	cts_tooltip.css('top', (canvasToken.worldTransform.ty + (((canvasToken.data.height * canvas.dimensions.size) + 25) * canvas.scene._viewPosition.scale)) + 'px');
	cts_tooltip.html(fullTemplate);
	$('body.game').append(cts_tooltip);
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
	if (cts_HoverToken)
		cts_HoverToken.off('mousedown', cts_TokenOnMouseDown);
	cts_SetTooltip(token);
	if (cts_ReadyToCycle)
	{
		cts_CycleSelected();
		cts_SetTooltip(cts_HoverToken);
	}
	if (cts_HoverToken)
		cts_HoverToken.once('mousedown', cts_TokenOnMouseDown);
}


function cts_MouseMove () 
{
	cts_ReadyToCycle = false;
	if (cts_HoverToken)
		cts_HoverToken.once('mousedown', cts_TokenOnMouseDown);
	$('.cts_-tooltip').remove();
}


function cts_TokenOnMouseDown() {
	if (!this || !this.actor || !event || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || cts_IAmClicking)
		cts_ReadyToCycle = false;
	else {
		cts_ReadyToCycle = (cts_ReadyToCycle || (cts_HoverToken !== null && this.id === cts_HoverToken.id));
		if (cts_ReadyToCycle) {
			let timeOut = game.settings.get("cycle-token-stack", "minClickDelay");
			this.once('mousemove', cts_MouseMove);
			cts_IAmClicking = true;
			setTimeout( () => {
				this.off('mousemove', cts_MouseMove);
				cts_IAmClicking = false;
				if (cts_ReadyToCycle)
					cts_RefreshStack(cts_HoverToken);
				else
					cts_HoverToken.once('mousedown', cts_TokenOnMouseDown);
			}, timeout);
		}
	}
}

Hooks.on("controlToken", (token, controlled) => {
	cts_ReadyToCycle = false;
	if ((!token || cts_Controlling) && controlled)
		cts_RefreshStack(token);
});


Hooks.on("hoverToken", (token, hovered) => {
	cts_ReadyToCycle = false;
	if (token && hovered && !cts_Controlling && token._controlled)
		cts_RefreshStack(token);
	else if (hovered && !cts_Controlling)
		cts_SetTooltip(token);
	else
		$('.cts_-tooltip').remove();
});


Hooks.on("deleteToken", (scene, token) => {
	cts_ReadyToCycle = false;
	$('.cts_-tooltip').remove();
});
