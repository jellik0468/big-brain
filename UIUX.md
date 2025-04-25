In the register and Login page I used error state that pops up above the login or register button
when error is encounter, like diffrent password and comfirmpassword, existing email, invalid email and password.
And the error msg goes away once user change input.

If admin's browser has the token(in the local storage) admin will be directed to the dashboard page directly.

Dashboard page
Once user login (admin with a valid token) there will be a navbar on top, allow easy navigation to dashboar, logout and history sessions. When user points at each game it is made to show shadow and cursor pointer to indicate it is clikable. Every button in dashboard page has color transition when cover to let user know they are pointing at it.

Every button in dashboard when click will either confirm or ask for more infomation(add game name) with a modal, and once Ok or next is clicked in the modal, the modal content change to successful or unsuccessful action notification.

Stop game is hidden until game is running, a game (div) have a color of blue normally and when it is running  it is turned to orange, so user can easily tell with visual. When game is running the start game button would be hidden so user can only see stop game, so It would be obvious. In the Game Started model user will see a copy join link, where when they click "Link copied to clipboard" will pops up under to tell user on successful copy.

The grid changes its layout based on small 1, medium 2, or big 3, screen to fill dashboard better.

Game Edit page
Player can click on the game (the whole div) to enter the edit page for that game, where they can change game name and thumbnail (preview is availble), and easily add and delete question or go to question edit page.

Question Edit page
When quesiton type is single, admin can only have add up to 6 answers and no less than 2 (When answer is two can't delete any more answers)and pick of only one correct asnwer, 

When question type is multiple, admin can only have add up to 6 answers and no less than 2 (When answer is two can't delete any more answers) and unlimited correct answer,

When question type is judgement, admin is fored to have true and false and pick one to be correct.

When save question is clicked, I check if answer or question is empty if true, modal reminder will pops up.
When saved successfully, user will be informed and bring back to the Game Edit page.

YoutubeURL and image can be added and deleted and the deleted button only exist  when it is added.

Go back page allow admin to discard changes and go back to the Game Edit page.

Session History page
We have currently active sessions, most recent sessions and archived sessions
Active sessions part allow user to quickly find an active session and go in to the control page.
Recent sessions are most recent ended sessions for every game, it allows user quickly retrieve the result they are looking for.
Archived sessions is all the past sessions.

Session control page / Admin result page
If a session is active, the sesion control screen is displayed, where admin can see the sessionId, current question number, and time remaining for that specific question. Also button to advance question and stop session.
When user click stop session either in this session control page, or dashboard page. In other words, a session is inactive, the session control page will become admin result page, if no player have ever joined, error msg will shown as there is no point showing, else admin will be able to see the session results.

If a game has useAdvancedScoring on admin will see a description of how it is calculated on the result page.

Join / Play page
The join and play page is made dark blue to feel a bit arcade.

By pasting the website player is bring directly to the join page, where they have to answer a name, if the session is onto the first question or more, when player click join a error  msg will pops up above the join button saying they cant join a ongoing session.

A stardew valley mp4 will be played after player has entered their name, but the game hasn't been started

Once they are in the gaming phrase, they can see the time remaining, and the answer they have selected.

Once the game finished, they will see their answers to correspondsing questions.

If a game has useAdvancedScoring on they will see a description of how it is calculated on the result page.