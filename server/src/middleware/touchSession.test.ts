import assert from 'assert/strict';
import { Session } from 'server/model/session';
import { Action, getActions, MAX_IDLE_TIME } from './touchSession';

describe('touchSession middleware', () => {
  it('should expire idle sessions', () => {
    const now = Date.now();
    const expirationTimestamp = now + 1000;
    const lastActivityTimestamp = now - MAX_IDLE_TIME;

    const actions = getActions({
      session: {
        id: '',
        username: '',
        scopes: [],
        expirationTimestamp,
        lastActivityTimestamp,
      },
      currentTimestamp: now,
    });

    assert(actions.length === 2);
    assert(actions[0].type === 'session/delete');
    assert(actions[1].type === 'error');
    assert(actions[1].error.code === 'auth/sessionExpired');
  });

  it('should update lastActivityTimestamp for sessions that have been idle less than MAX_IDLE_TIME', () => {
    const now = Date.now();
    const expirationTimestamp = now + 1000;
    // idle for 1 millisecond less than the max
    const lastActivityTimestamp = now - MAX_IDLE_TIME + 1;

    const session: Session = {
      id: '',
      username: '',
      scopes: [],
      expirationTimestamp,
      lastActivityTimestamp,
    };

    const actions = getActions({
      session,
      currentTimestamp: now,
    });

    const expected: Action[] = [
      {
        type: 'session/update',
        session: {
          ...session,
          lastActivityTimestamp: now,
        },
      },
    ];

    assert.deepStrictEqual(actions, expected);
  });
});
