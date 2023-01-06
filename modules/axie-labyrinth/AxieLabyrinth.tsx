import React, { FC } from 'react';

import { AxieMaze } from './axie-maze/AxieMazeNoSsr';
import Classes from './AxieLabyrinth.module.scss';

const AxieLabyrinth: FC = () => {
  return (
    <div className={Classes.AxieLabyrinth}>
      <AxieMaze />
    </div>
  );
};

export default AxieLabyrinth;
