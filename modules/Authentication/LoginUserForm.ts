import { useState } from "@lukekaalim/act";
import { LabeledTextInput } from "../Formula/LabeledInput.ts";
import { act } from "./deps.ts"
const { h } = act;

export type UserLoginRequest = {
  username: string,
  password: string,
}

export type LoginUserFormProps = {
  onLogin: (request: UserLoginRequest) => unknown,
}

export const LoginUserForm: act.Component<LoginUserFormProps> = ({
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onLogin({
      username,
      password,
    });
    setUsername('');
    setPassword('');
  }

  return h('form', { onSubmit }, [
    h(LabeledTextInput, {
      label: 'Username', value: username, onInput: setUsername
    }),
    h(LabeledTextInput, {
      label: 'Password', value: password, onInput: setPassword,
      type: 'password'
    }),
    h('input', { type: 'submit', value: "Login" }),
  ]);
}