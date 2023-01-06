# axie-game-js-test-01

With typescript source code  given, let implement write a pathfinding algorithm to help axie out of the maze.

![Sample map](images/01.png?raw=true "Axie Labyrinth")

Gameplay:

- Axie only can do move action
- Have 2 kind object are key and door. Door only unlock if it same type with key
- Objective is move axie to gray goal

Requirement:

- Only call move function
    - this.onMoveAxie(-1, 0);
    - this.onMoveAxie(1, 0);
    - this.onMoveAxie(0, -1);
    - this.onMoveAxie(0, 1);
- Code can solve other map
- DO NOT change the game logic code. Can create new file, and interact with axie at here:
    
    ```tsx
    //***************YOUR CODE HERE**************************/
      onSimulateTurn(){
        //Do you check and give the action to reach the goal
        const floorMap = this.mazeState.floors[this.mazeState.currentFloorIdx];
        if(this.mazeState.axie.mapX > 3){
          this.onMoveAxie(-1, 0);
        } else {
          this.onMoveAxie(1, 0);
        }
      }
    ```
    

## Resources

- Base project are at this repository :
    - [https://github.com/axieinfinity/game-js-test-01](https://github.com/axieinfinity/game-js-test-01)

## Submission

- Create your own git repository so we can see your work process.

## Deadline

This test is designed for 2 - 5 hours of coding. We know you might be busy with your current work, the maximum deadline is **7 days** after you received this test.