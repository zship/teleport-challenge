import React, { ReactElement, useState } from 'react';

export type LoginFunction = ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => Promise<void>;

type LoadingState = 'unsent' | 'loading' | 'done' | 'error';

type Fields = {
  username: string;
  password: string;
};

type State = {
  value: Fields;
  wasAttempted: { [K in keyof Fields]: boolean };
  errors: { [K in keyof Fields]: string[] };
};

const initialState: State = {
  value: {
    username: '',
    password: '',
  },
  wasAttempted: {
    username: false,
    password: false,
  },
  errors: {
    username: [],
    password: [],
  },
};

function getFieldErrors<K extends keyof Fields>(
  name: K,
  value: Fields[K],
): string[] {
  if (name === 'username' && value.length === 0) {
    return ['Username is required'];
  }
  if (name === 'password' && value.length === 0) {
    return ['Password is required'];
  }
  return [];
}

type HTMLInputElement = globalThis.HTMLInputElement;

export const Login = ({
  callLoginApi,
  loadingState,
  loginApiError,
}: {
  callLoginApi: LoginFunction;
  loadingState: LoadingState;
  loginApiError: string | null;
}): ReactElement => {
  const [state, setState] = useState(initialState);

  const handleChange = (e: React.ChangeEvent): void => {
    const target = e.target as HTMLInputElement;
    const name = target.name as keyof Fields;
    const value = target.value;
    let errors: string[] = [];
    // only show errors if the user has entered text and blurred the field at
    // least once
    if (state.wasAttempted[name]) {
      errors = getFieldErrors(name, value);
    }
    setState({
      ...state,
      value: {
        ...state.value,
        [name]: value,
      },
      errors: {
        ...state.errors,
        [name]: errors,
      },
    });
  };

  const handleBlur = (e: React.SyntheticEvent): void => {
    const target = e.target as HTMLInputElement;
    const name = target.name as keyof Fields;
    const value = target.value;
    const attempted = state.wasAttempted[name] || value.length > 0;
    let errors: string[] = [];
    if (attempted) {
      errors = getFieldErrors(name, value);
    }
    setState({
      ...state,
      wasAttempted: {
        ...state.wasAttempted,
        [name]: attempted,
      },
      value: {
        ...state.value,
        [name]: value,
      },
      errors: {
        ...state.errors,
        [name]: errors,
      },
    });
  };

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    let hasErrors = false;
    for (const name of Object.keys(state.value) as (keyof Fields)[]) {
      const value = state.value[name];
      state.wasAttempted[name] = true;
      const errors = getFieldErrors(name, value);
      if (errors.length > 0) {
        hasErrors = true;
      }
      state.errors[name] = errors;
    }
    setState({ ...state });

    if (hasErrors) {
      return;
    }

    const { username, password } = state.value;
    void callLoginApi({ username, password });
  };

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          name="username"
          type="text"
          className={state.errors.username.length > 0 ? 'error' : ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <ul className="input-errors">
          {state.errors.username.map((err) => (
            <li>{err}</li>
          ))}
        </ul>

        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          className={state.errors.password.length > 0 ? 'error' : ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <ul className="input-errors">
          {state.errors.password.map((err) => (
            <li>{err}</li>
          ))}
        </ul>

        <input
          type="submit"
          disabled={loadingState === 'loading'}
          value="Log in"
        />

        {loginApiError !== null ? (
          <ul className="server-error">{loginApiError}</ul>
        ) : null}
      </form>
    </div>
  );
};
