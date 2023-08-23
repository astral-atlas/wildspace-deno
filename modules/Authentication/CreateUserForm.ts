import { act, formula, sesameService } from "./deps.ts"
// @deno-types="vite-css"
import styles from './CreateUserForm.module.css';
const { h, useState } = act;

export type CreateUserFormProps = {
  onSubmitCreateUser: (createUserRequest: {
    username: string,
    password: string
  }) => Promise<void>,
}

export const CreateUserForm: act.Component<CreateUserFormProps> = ({
  onSubmitCreateUser
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmitCreateUser({ username, password });
    setUsername('');
    setPassword('');
  };
  return h('form', { onSubmit, class: styles.createUserForm }, [
    h(formula.LabeledTextInput, {
      label: 'Username',
      value: username,
      onInput: setUsername,
    }),
    h(formula.LabeledTextInput, {
      label: 'Password',
      value: password,
      onInput: setPassword,
      type: 'password'
    }),
    h('input', { type: 'submit', value: 'SUBMIT' }),
  ])
}
