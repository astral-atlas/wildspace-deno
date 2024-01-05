import {
  DocSheet,
  createDocContext,
  markdownToSheet,
} from "../ComponentDoc/mod.ts";
import { act, sesameModels, simpleSystem, storage } from "./deps.ts";

import { createSesameBackend } from "./backend.ts";

import * as formula from "../Formula/mod.ts";
import * as actCommon from "../ActCommon/mod.ts";

// @deno-types="vite-text"
import readme from "./readme.md?raw";
import {
  StoreVisualzer,
  AnyMemoryClient,
  SystemComponentsPreview,
} from "../Data/DataDoc/mod.ts";
import { userSystemDef } from "./systems.ts";
import { universeDocContext } from "../Universe/docs.ts";
import { WildspaceFeatureDoc } from "../WildspaceDocCommon/mod.ts";

const { h, useState } = act;
const { useAsync } = actCommon;

const { useDocContext, Provider } = createDocContext((_, { world, backend, demo }) => {

  const user = world.partitions.get("user");
  const secret = world.partitions.get("secret");
  const sessionToken = world.partitions.get("sessionToken");
  const names = world.partitions.get("names");
  if (!user || !secret || !sessionToken || !names) throw new Error();
  const partitions = { user, secret, sessionToken, names };

  return { backend, partitions, world };
}, universeDocContext.useDocContext);

const AccessForm = ({
  action = "Create Account",
  onSubmit = (username: string, password: string) => {},
}) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onFormSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return h(
    "form",
    {
      onSubmit: onFormSubmit,
      style: {
        margin: "8px",
        padding: "8px",
        border: "1px solid black",
      },
    },
    [
      h("legend", {}, action),
      h(formula.LabeledTextInput, {
        label: "Username",
        value: username,
        onInput: setUsername,
      }),
      h(formula.LabeledTextInput, {
        label: "Password",
        value: password,
        onInput: setPassword,
      }),
      h("button", { type: "submit" }, action),
    ]
  );
};

const Demo: act.Component = () => {
  const { partitions, backend, world } = useDocContext();
  const [user, setUser] = useState<sesameModels.SesameUser | null>(null);
  const [token, setToken] = useState<sesameModels.SessionToken | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  const onSubmitCreateAccount = async (username: string, password: string) => {
    const user = await backend.sesame.service.createUser(username, password);
    const { token, secret } = await backend.sesame.service.createSession(
      user.id,
      "MyComputer"
    );
    setUser(user);
    setToken(token);
    setSecret(secret);
  };
  const onSubmitLogIn = async (username: string, password: string) => {
    const user = await backend.sesame.service.validateUser(username, password);
    if (!user) {
      setUser(null);
      setToken(null);
      setSecret(null);
    } else {
      const { token, secret } = await backend.sesame.service.createSession(
        user.id,
        "MyComputer"
      );
      setUser(user);
      setToken(token);
      setSecret(secret);
    }
  };
  const onLogoutClick = () => {
    setUser(null);
    setToken(null);
    setSecret(null);
  };

  const onValidateClick = async (
    token: sesameModels.SessionToken,
    secret: string
  ) => {
    alert(
      JSON.stringify(
        await backend.sesame.service.validateSession(token, secret),
        null,
        2
      )
    );
  };

  const [access, setAccess] = useState<"login" | "signup">("login");

  return [
    !user &&
      h("div", {}, [
        h("button",
          { disabled: access === "signup", onClick: () => setAccess("signup") },
          "Create Account"
        ),
        h("button",
          { disabled: access === "login", onClick: () => setAccess("login") },
          "Log In"
        ),
      ]),
    access === "signup" &&
      h(AccessForm, {
        action: "Create Account",
        onSubmit: onSubmitCreateAccount,
      }),
    access === "login" &&
      h(AccessForm, {
        action: "Log In",
        onSubmit: onSubmitLogIn,
      }),

    user && h("button", { onClick: onLogoutClick }, "Log Out"),
    token &&
      secret &&
      h("button",
        { onClick: () => onValidateClick(token, secret) },
        "Validate"
      ),
    user && h("pre", {}, JSON.stringify(user, null, 2)),

    h(SystemComponentsPreview, {
      systemDef: userSystemDef,
      world,
      components: backend.sesame.users as simpleSystem.Components<any>,
    }),
    h(StoreVisualzer, {
      store: partitions.user as unknown as AnyMemoryClient,
      name: "user",
    }),
    h(StoreVisualzer, {
      store: partitions.secret as unknown as AnyMemoryClient,
      name: "secret",
    }),
    h(StoreVisualzer, {
      store: partitions.sessionToken as unknown as AnyMemoryClient,
      name: "sessionToken",
    }),
    h(StoreVisualzer, {
      store: partitions.names as unknown as AnyMemoryClient,
      name: "names",
    }),
  ];
};

const FeatureDoc = () => {
  return h(WildspaceFeatureDoc, { name: 'Sesame', path: 'modules/Sesame/mod.ts' })
}

const components = {
  Demo,
  FeatureDoc,
};

export const sesameDocs: DocSheet[] = [
  markdownToSheet("Sesame", readme, components, Provider),
];
