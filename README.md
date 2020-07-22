# Cycle Token Stack
For the Fountry Virtual Tabletop (FVTT), this module helps you to cycle through tokens that are stacked upon one another using left-mouse clicks or a key stroke.

# Installation
Two ways to install the module for Foundry VTT.
1. Copy the file:
        https://github.com/aka-beer-buddy/fvtt-cycle-token-stack/raw/master/cycle-token-stack.zip 
   to your "Data/modules/" folder and extract the files.
OR
2. Copy the following link (not the file):
        https://raw.githubusercontent.com/aka-beer-buddy/fvtt-cycle-token-stack/master/module.json 
   and paste it in Foundry VTT application (press the "Install Module" button under "Add-on Modules" menu and enter the link in the edit box near the bottom).

# Features/Behaviors
 - Left-click on a token will either select it (if unselected) or invoke a cycle action which selects the next token in the stack and brings it to the top of the stack. Each subsequent left-click will cycle the stack once.
 - A keyboard shortcut behaves the same as a left-mouse click, either selecting the token being hovered over or cycling to a new token.
 - A tooltip appears below the current token to show names of all visible tokens for the player along with a 'check' if the token is selected and an 'eye' if the token is targeted.
 - The player can only cycle through tokens that they own.  The GM can cycle through all tokens in the stack.
 - In "select target" mode, the cycling of the stack is disabled, but the tooltip still appears and shows current selection and targeting states for stack.
 - Pressing the Shift, Ctrl, Alt, or Meta key will disable the cycling of tokens so as to let other behaviors pass through. This means that you cannot multi-select and cycle through tokens at the same time.
 - A stack is defined as any two ore more tokens overlapping with the current token being hovered over by the mouse. It may include tokens that are not directly under the mouse cursor.  This is done so that small tokens buried behind a large token can be retrieved without knowing the precise location of the buried token.
 
 # Module Configuration Settings
The Cycle Token Stack module has three configuration settings that each player can define:
 - Control when the tooltip is displayed, or hide it altogeather. Have the tooltip appear when two or more tokens are stacked up or when hovering over any token.
 - Control the click delay that the module waits before cycling the tokens. Any click or move happening before this delay will cancel the cycle operation. This is needed to avoid conflict with double-click behavior.  The delay is defined in milliseconds and defaults to 300 and need only be increased when accessability settings changes the double-click time span.  A value above 250 and below 1000 is recommended.
 - Define a keyboard shortcut that performs a cycle identical to left-click button.  The default is the '[' character (left square bracket).
 
 # Known Issues
 - Sometimes, a click is not registered. Clicking again will usually start the cycling again.
 - If the token is moved, the tooltip disappears. Moving the mouse off and back on the token after the drag operation will refresh the tooltip.
 - If a large token has a number of smaller ones spread around under it, the selection process goes 1) large token, 2) small token, 3) large token again, 4) other small token, 5) larget token again, etc.
 
 If you find any other issues or have suggestions, feel free to add an Issue to this project on GitHub.  Be sure to be specific in how to recreate it so that I can resolve it.

# Troubleshooting
 - Sometimes the cycling or keystroke becomes unresponsive. Moving the mouse cursor off the token and back on will 'wake up' the token cycle behavior.
 - Player cannot see the tooltip or nothing happens when clicking a token: If a player can only control a single token (or no tokens), then the tooltip will not be displayed and no cycling occurs. Check player permissions for token to see if they own the token.
 - Clicking multiple times causes character sheet to appear: This means you are clicking too quickly in succession. This is intended behavior. There is a required delay between clicks so that double-click functionality can pass through.

# Copyright Notice
This module copyright (c) 2020 by John Sandberg
Rights granted under the MIT License as stated in the LICENSE file.
