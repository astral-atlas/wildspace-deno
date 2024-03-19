import {
  Component,
  createContext,
  h,
  useContext,
  useEffect,
  useRef,
  useState,
} from "@lukekaalim/act";
import { DocSheet, markdownToSheet } from "../ComponentDoc/mod.ts";
import { CreateUserForm } from "./CreateUserForm.ts";
// @deno-types="vite-text"
import readme from "./readme.md?raw";
import { FramePresenter } from "../ComponentDoc/FramePresenter.ts";
import { sesameService } from "./deps.ts";
import { SesameUser, userDefinition } from "../SesameModels/user.ts";
import { BigTable } from "../BigTable/BigTable.ts";
import {
  SesameDataService,
  UnauthenticatedSesameDataService,
} from "../Data/SesameDataService/mod.ts";
import { LoginUserForm } from "./LoginUserForm.ts";
import { models } from "../ModelDoc/deps.ts";
import { MemorySesameStore } from "../Data/SesameDataService/stores.ts";
import { StoreVisualzer } from "../Data/DataDoc/mod.ts";

const demoContext = createContext<null | {
  sesame: SesameDataService;
  stores: MemorySesameStore;
}>(null);
const useDemoContext = () => {
  const context = useContext(demoContext);
  if (!context) throw new Error();
  return context;
};

const DemoProvider: Component = ({ children }) => {
  const stores = useRef(sesameService.createMemorySesameStore()).current;
  useEffect(() => {
    const users = stores.users.memory()
    users.push({
      value: { id: '12345', name: 'luke', passwordSecretId: '100' },
      key: { sort: '12345' }
    });
    stores.users.onMemoryUpdate.next(users);
    const secrets = stores.secrets.memory();
    secrets.push({
      value: { id: '100', value: 'hunter2' },
      key: { sort: '100' }
    })
  }, [])
  const sesame = useRef(
    sesameService.createStoredSesameDataService(stores, {
      type: "admin",
      userId: "luke",
    })
  ).current;
  
  return h(demoContext.Provider, { value: { sesame, stores } }, children);
};

const CreateUserDemo = () => {
  const { sesame } = useDemoContext();

  return h("div", { style: { display: "flex", flexDirection: "column" } }, [
    h(
      FramePresenter,
      { height: `200px` },
      h(CreateUserForm, {
        async onSubmitCreateUser({ username, password }) {
          await sesame.user.create({ name: username, password });
        },
      })
    ),
  ]);
};
const LoginDemo = () => {
  const { sesame } = useDemoContext();
  const [user, setUser] = useState<SesameUser | null>(null);

  return [
    h(FramePresenter, { height: `200px` }, [
      h(LoginUserForm, {
        async onLogin({ username, password }) {
          const { user } = await sesame.loginUser(username, password);
          console.log(user);
          setUser(user);
        },
      }),
    ]),
    h("pre", {}, JSON.stringify({ user }, null, 2)),
  ];
};

const ServiceDemo = () => {
  const { stores } = useDemoContext();

  return [
    h(StoreVisualzer, { name: 'Users', store: stores.users }),
    h(StoreVisualzer, { name: 'Secrets', store: stores.secrets }),
  ]
};

const demos = {
  create_user_demo: CreateUserDemo,
  service_demo: ServiceDemo,
  login_user_demo: LoginDemo,
};

export const authenticationDocs: DocSheet[] = [
  markdownToSheet("Authentication", readme, demos, DemoProvider),
];
