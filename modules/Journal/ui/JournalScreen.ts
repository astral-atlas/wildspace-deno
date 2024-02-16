import { carpentry } from "../../Universe/deps.ts";
import { act, actCommon } from "../deps.ts";
import { GameController, GameID, Game } from "../mod.ts";
import { JournalService } from "../service.ts";
import { JournalColumn } from "./JournalColumn.ts";

import { formula } from "./deps.ts";
// @deno-types="vite-css"
import styles from './styles.module.css';

const bgURL = new URL('./bg.png', import.meta.url).href;

console.log(styles);

const { h, useState, useEffect } = act;

export type JournalScreenEvent =
  | { type: 'game-create', name: string }
  | { type: 'game-select', gameId: null | GameID }
  | { type: 'room-enter', roomId: carpentry.RoomID }
  | { type: 'library-enter' }

export type JournalScreenProps = {
  selectedGame: null | Game,
  allGames: Game[],
  rooms: { name: string, id: string, players: number }[],

  onEvent?: (event: JournalScreenEvent) => unknown,
}

export const JournalScreen: act.Component<JournalScreenProps> = ({
  selectedGame,
  allGames,
  rooms,
  onEvent = _ => {},
}) => {
  const onSelectGameInput = (event: InputEvent) => {
    const element = (event.target as HTMLSelectElement);
    if (element.value.startsWith('game:')) {
      const gameId = element.value.slice(5);
      if (!gameId)
        return;
      onEvent({ type: 'game-select', gameId })
    } else {
      onEvent({ type: 'game-select', gameId: null });
    }
  }

  return [
    h('div', { className: styles.screen }, [
      h('img', { src: bgURL, className: styles.background }),
      h('div', { className: styles.content }, [
        h('div', { className: styles.column }, [
          h('select', { onInput: onSelectGameInput, className: styles.button }, [
            allGames.map(game => h('option', { value: 'game:' + game.id }, game.name)),
            h('option', { value: 'new_game' }, 'Create New Game'),
          ]),
          selectedGame && [
            h('hr', { className: styles.line }),
            rooms.map(room => h('span', {}, [
              h('button', { className: styles.button }, room.name),
              h('span', { className: styles.count }, room.players)
            ])),
            h('hr', { className: styles.line }),
            h('button', { className: styles.button }, 'Library')
          ],
        ]),
        !selectedGame && [
          h(CreateGameForm, { onEvent }),
        ],
      ]),
    ]),
  ]
};

export type CreateGameFormProps = {
  onEvent: (event: JournalScreenEvent) => unknown,
}


const CreateGameForm: act.Component<CreateGameFormProps> = ({
  onEvent
}) => {
  const [name, setName] = useState('MyGame');

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onEvent({ type: 'game-create', name });
  };

  return h('form', { onSubmit }, [
    h(formula.LabeledTextInput, { label: 'Game Name', value: name, onInput: setName }),
    h('input', { type: 'submit' }),
  ])
};