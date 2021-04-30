Bulls and cows
-----------------------------------

[Bulls and cows](https://en.wikipedia.org/wiki/Bulls_and_Cows) (also known as MOO, guess numbers and 1A2B) game implemented in html and javascript. 

Play the game [here](https://bladepan.github.io/bullsandcows/).

The game also includes a simple algorithm that plays the game (PermutationPlayer in [game.js](game.js)). The algorithm keeps a list of all possilbe targets, it chooses one possible targets as guess and eliminates targets that become impossible when the game progresses. This algorithm is not optimal, but it is faster than the more optimal solutions and not so much worse off in terms of average steps to reach the answer. 

It would be interesting to implement an algorithm that plays the game like a human. TBD


# Related
- [The game of MOO](https://www.pepsplace.org.uk/Trivia/Moo/Moo.pdf)
- [Strategies for playing MOO, or “Bulls and Cows”](http://slovesnov.users.sourceforge.net/bullscows/bulls_and_cows.pdf)
