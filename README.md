# Cycle Token Stack
In Fountry Virtual Table Top (FVTT), this module helps you to cycle through tokens that are stacked upon one another using left-mouse clicks.
 - The player can only cycle through tokens that they can control.  The GM can cycle through all tokens in the stack.
 - A tooltip appears below the current token to show names of all visible tokens for the player along with a 'check' if the token is selected/controlled and an 'eye' if the token is targeted.
 - In "select target" mode, the selection/control of tokens doesn't change, but the tooltip still appears and shows current targeting states for stack.
 - Pressing the Shift, Ctrl, Alt, or Meta key when clicking will disable the cycling of tokens. This means that you cannot multi-select and cycle through tokens at the same time.
 - A stack is defined as any two ore more tokens overlapping with the current token(s) being hovered over by the mouse. It may include tokens that are not directly under the mouse cursor.  This is done so that small tokens buried behind a large token can be retrieved without knowing the precise location of the buried token.
 
 # Module Configuration Settings
The Cycle Token Stack module has two configuration settings in the world that the GM can manipulate:
 - Control when the tooltip is displayed, or hide it altogeather. Have the tooltip appear when two or more tokens are stacked up or when hovering over any token.
 - Control the click delay that the module waits before cycling the tokens. Any click or move happening before this delay will cancel the cycle operation. This is needed to avoid conflict with double-click behavior.  The delay is defined in milliseconds and defaults to 300.  A value above 250 and below 1000 is recommended.
 
 # Known Issues
 - The tooltip sometimes does not show or update after a click when the token being clicked is not controlled. Moving the mouse will refresh the tooltip.
 - Sometimes, a click is not registered. Clicking again will usually start the cycling again.
 - If the token is moved, the tooltip disappears. Moving the mouse after the drag operation will refresh the tooltip.
 
 If you find any other issues or have suggestions, feel free to add an Issue to this project.  Be sure to be specific in how to recreate it so that I can resolve it.

# Troubleshooting
 - Sometimes the cycling becomes unresponsive. Moving the mouse cursor away from the token and back will 'wake up' the token cycle behavior.
 - Sometimes clicks do not cycle the token: Cicking again will usually resume the cycling.
 - Player cannot see the tooltip or nothing happens when clicking: If a player can only control a single token (or no tokens), then the tooltip will not be displayed and no cycling occurs. Check player permissions for token to see if they are allowed to control the token.
