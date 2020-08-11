# Cycle Token Stack
For the Fountry Virtual Tabletop (FVTT), this module helps you to cycle through tokens that are stacked upon one another using left-mouse clicks or using '[' and ']' hotkeys to jump a token to the top or bottom of the stack -- even those tokens players can't control. Stores state automatically between sessions and pushes GM entire token state for a scene to players with a hotkey.

# Installation
## Three ways to install the module for Foundry VTT.
1. _(Recommended)_ Install module from within Foundry VTT. The module is called "Cycle Token Stack". 

2. Copy the following text (not the file it points to): <br>
`https://raw.githubusercontent.com/aka-beer-buddy/fvtt-cycle-token-stack/master/module.json` <br>
and paste it in Foundry VTT application (press the "Install Module" button under "Add-on Modules" menu and enter the link in the edit box near the bottom). <br>

3. Download and extract the files manually: <br>
https://github.com/aka-beer-buddy/fvtt-cycle-token-stack/raw/master/cycle-token-stack.zip <br>
Copy to your user data folder, normally `FoundryVTT/Data/modules/` on Windows, and extract the files. It should create a sub-folder called 'cycle-token-stack' with the necessary files inside. <br>
<br>
Once you launch the world, be sure to enable the module using the Module Configuration menu item on the task bar.  Also, don't forget to check for updates, as this is in active development.

# Features/Behaviors
 - Left-click on a token will either select it (if unselected) or invoke a cycle action which selects the next token in the stack and brings it to the top of the stack. Each subsequent left-click will cycle the stack once.
 - A hotkey _(default is '[')_ will move the token under the mouse to the top of the stack. Very handy to pull a partially obsured token to the forefront.
 - A hotkey _(default is ']')_ will move the token under the mouse to the bottom of the stack.  Very handy to get vehicles under the player tokens.
 - A tooltip appears below the current token to show names of all controllable tokens for the player along with a 'check' if the token is selected and an 'eye' if the token is targeted.
 - Hotkeys are customizable on a player-by-player basis. Also, tooltip can be turned off.
 - In "select target" mode, the cycling of the stack is disabled and tooltips hidden.
 - A stack is defined as any tokens overlapping with the current token being hovered over by the mouse. It may include tokens that are not directly under the mouse cursor.  This is done so that small tokens buried behind a large token can be retrieved without knowing the precise location of the buried token.
 - GM pressing Ctrl+`[` will sync the players machines with the current GM stack state for the entire scene.
 - A player pressing Ctrl+`[` will retrieve the current stack state of the GM.
 - GM pressing Alt+`]` will reset the z-buffer in order to start from scratch.
 
 # Module Configuration Settings
The Cycle Token Stack module has three configuration settings that each player can define:
 - Define a keystroke that performs a _move to top_ action and _sync player_ action.  The default is the '[' character (left square bracket). Leave the field blank if you don't want a hotkey.
 - Define a keystorke that performs a _move to bottom_ action and _reset stacks_ action.  The default is the ']' character (right square bracket).
 - Control when the tooltip is displayed. The default is to have the tooltip appear when two or more tokens are stacked.
 - Control the click delay that the module waits before cycling the tokens. Any click or move happening before this delay will cancel the cycle operation. This is needed to avoid conflict with double-click behavior.  The delay is defined in milliseconds and defaults to 300.  A value above 250 and below 1000 is recommended.
 
 # Known Issues
 - The module sometimes becomes unresponsive after moving the token on top of other tokens.
 - If a large token has a number of smaller ones spread around under it, the selection process may not visit every small token under the large one.
 - Cannot push player stack state to the GM's machine; does not retain player stack state for player between sessions.
<br>
If you find any other issues or have suggestions, feel free to add an Issue to this project on GitHub.  Be sure to be specific in how to recreate it so that I can resolve it.

# Troubleshooting
 - The click-cycling or keystroke becomes unresponsive. Moving the mouse cursor off the token and back on will 'wake up' the cycle token behavior.
 - Player cannot see the tooltip or nothing happens when clicking a token: If a player can only control a single token (or no tokens), then the tooltip will not be displayed and mouse-cycling is disabled. Player can use hotkeys to arrange a stack of uncontrollable tokens.
 - Clicking multiple times causes character sheet to appear: This means you are clicking too quickly in succession. This is intended behavior. There is a required delay between clicks so that double-click functionality can pass through.

## Copyright Notice
This module copyright (c) 2020 by John Sandberg <br>
Rights granted as stated in the LICENSE file.
