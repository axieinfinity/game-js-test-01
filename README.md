# axie-game-js-test-01

Using the given source code (typescript), implement a pathfinding algorithm to help the Axie get out of the maze.

![Sample map](images/01.png?raw=true "Axie Labyrinth")

Gameplay:

- Axie only can do move action
- There are 2 kind objects: Key and Gate. The Gate can be unlocked if the Axie has the key with the same color
- The simulation ends when the Axie reaches and unlocks the Gray Gate

Requirement:

- Use these functions to move the Axie
    - this.moveAxie(-1, 0);
    - this.moveAxie(1, 0);
    - this.moveAxie(0, -1);
    - this.moveAxie(0, 1);
- Code can solve other map
- DO NOT change the game logic code. You can create new files or functions.
- Your algorithm code should be placed in this function, this function is called each 0.25 second:
    
    ```tsx
    //***************YOUR CODE HERE**************************/
    onSimulateTurn(){
      //Do you check and give the action to reach the goal
      const floorMap = this.mazeState.floors[this.mazeState.currentFloorIdx];

      let targetPos = new PIXI.Point();
      for (let y = 0; y < MS.MAP_SIZE; y++) {
          for (let x = 0; x < MS.MAP_SIZE; x++) {
              const roomVal = this.mazeState.getRoomValue(x, y);
              if (roomVal == MS.MAP_CODE_END) {
                  targetPos = new PIXI.Point(x, y); 
              }
          }
      }
      const ranVal = Math.random() * 4;
      if (ranVal == 0 && this.mazeState.testMove(-1, 0) == MS.MOVE_RESULT_VALID) {
          this.moveAxie(-1, 0);
      }
      else if (ranVal == 1 && this.mazeState.testMove(1, 0) == MS.MOVE_RESULT_VALID) {
          this.moveAxie(1, 0);
      }
      else if (ranVal == 2 && this.mazeState.testMove(0, -1) == MS.MOVE_RESULT_VALID) {
          this.moveAxie(0, -1);
      }
      else if (ranVal == 3 && this.mazeState.testMove(0, 1) == MS.MOVE_RESULT_VALID) {
          this.moveAxie(0, 1);
      }
    }
    ```
    

## Resources

- Base project repository:
    - [https://github.com/axieinfinity/game-js-test-01](https://github.com/axieinfinity/game-js-test-01)

## Submission

- Create your own git repository so we can see your work process.

## Deadline

This test is designed for 5 - 10 hours of coding. We know you might be busy with your current work, the maximum deadline is **7 days** after you received this test.
