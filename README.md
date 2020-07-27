# Cycle Token Stack
For the Fountry Virtual Tabletop (FVTT), this small module helps you to cycle through tokens that are stacked upon one another using left-mouse clicks or a '[' key stroke. You can also click ']' to push a token you can control behind all others.

# Installation
## Two ways to install the module for Foundry VTT.
1. Copy the following text (not the file it points to): <br>
`https://raw.githubusercontent.com/aka-beer-buddy/fvtt-cycle-token-stack/master/module.json` <br>
and paste it in Foundry VTT application (press the "Install Module" button under "Add-on Modules" menu and enter the link in the edit box near the bottom). <br>
<br>
OR<br>
2. Download and extract the files manually: <br>
https://github.com/aka-beer-buddy/fvtt-cycle-token-stack/raw/master/cycle-token-stack.zip <br>
Copy to your user data folder, normally `FoundryVTT/Data/modules/` on Windows, and extract the files. It should create a sub-folder called 'cycle-token-stack' with the necessary files inside. <br>
<br>
Once you launch the world, be sure to enable the module using the Module Configuration menu item on the task bar.  Also, don't forget to check for updates, as this is in active development.

# Features/Behaviors
 - **Left-click on a token** will either select it (if unselected) or **invoke a cycle** action which selects the next token in the stack and brings it to the top of the stack. Each subsequent left-click will cycle the stack once.
 - A hotkey _(default is left square bracket)_ behaves the same as a left-mouse click, either selecting the token being hovered over or cycling to a new token.
 - A hotkey _(default is right square bracket)_ will select all tokens under the token hovered over and **move that token behind all the others**.
 - Keyboard shortcuts are customizable.
 - A tooltip appears below the current token to show names of all visible tokens for the player along with a 'check' if the token is selected and an 'eye' if the token is targeted.
 - The player can only cycle through tokens that they own.  The GM can cycle through all tokens in the stack.
 - In "select target" mode, the cycling of the stack is disabled, but the tooltip still appears and shows current selection and targeting states for stack.
 - A stack is defined as any two or more tokens overlapping with the current token being hovered over by the mouse. It may include tokens that are not directly under the mouse cursor.  This is done so that small tokens buried behind a large token can be retrieved without knowing the precise location of the buried token.
 
 # Module Configuration Settings
The Cycle Token Stack module has three configuration settings that each player can define:
 - Control when the tooltip is displayed, or hide it altogeather. Have the tooltip appear when two or more tokens are stacked up or when hovering over any token.
 - Control the click delay that the module waits before cycling the tokens. Any click or move happening before this delay will cancel the cycle operation. This is needed to avoid conflict with double-click behavior.  The delay is defined in milliseconds and defaults to 300 and need only be increased when accessability settings changes the double-click time span.  A value above 250 and below 1000 is recommended.
 - Define a hotkey that performs a cycle similar to left-click button.  The default is the '[' character (left square bracket). Leave the field blank if you don't want a hotkey.
 - Define a hotkey that performs a selection of all tokens under the current one and moves them on top.  The default is the ']'  character (right square bracket).
 
 # Known Issues
 - The tooltip will sometimes refresh twice after cycling a token.
 - If a large token has a number of smaller ones spread around under it, the selection process goes 1) large token, 2) small token, 3) large token again, 4) other small token, 5) larget token again, etc. instead of a round-robin behavior.
 - Changes made on the GM machine are not reflected on the player machine.
 - The relative positions in the stack are not preserved between sessions or when pressing F5 to refresh the browser.
 - Players can end up having NPCs hidden behind their token with no way of showing the NPC.
<br>
If you find any other issues or have suggestions, feel free to add an Issue to this project on GitHub.  Be sure to be specific in how to recreate it so that I can resolve it.

# Troubleshooting
 - The cycling or keystroke becomes unresponsive. Moving the mouse cursor off the token and back on will 'wake up' the cycle token behavior.
 - Player cannot see the tooltip or nothing happens when clicking a token: If a player can only control a single token (or no tokens), then the tooltip will not be displayed and no cycling occurs. Check player permissions for token to see if they own the token.
 - Clicking multiple times causes character sheet to appear: This means you are clicking too quickly in succession. This is intended behavior. There is a required delay between clicks so that double-click functionality can pass through.

## Copyright Notice
This module copyright (c) 2020 by John Sandberg <br>
Rights granted as stated in the LICENSE file.
