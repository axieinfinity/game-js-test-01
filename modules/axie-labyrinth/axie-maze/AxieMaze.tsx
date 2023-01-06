import * as PIXI from 'pixi.js';
import React, { useEffect, useRef } from 'react';

import s from '../axie-figure/styles.module.css';
import { AxieMazeGame } from './AxieMazeGame';

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;

export const AxieMaze = () => {
  const container = useRef<HTMLDivElement>(null);
  const gameRef = useRef<AxieMazeGame>(null);

  useEffect(() => {
    if (!container) return;
    if (!container.current) return;
    const canvasContainer = container.current;
    if (canvasContainer.childElementCount > 0) {
      canvasContainer.lastChild?.remove();
    }

    const { offsetWidth, offsetHeight } = canvasContainer;
    const game = new AxieMazeGame({
      transparent: false,
      resolution: window.devicePixelRatio,
      autoStart: true,
      width: offsetWidth,
      height: offsetHeight,
      backgroundColor: 0x70C8F7,
      // preserveDrawingBuffer: true
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    gameRef.current = game;

    const roninAddress = '';
    gameRef.current.initGame();
    canvasContainer.appendChild(game.view);

    return () => {
      // gameRef.current.cleanUpKeyListeners();
      if (game) {
        game.destroy();
      }
    };
  }, []);

  return (
    <div className={s.container}>
      <div ref={container} className={s.canvas}></div>
    </div>
  );
};
