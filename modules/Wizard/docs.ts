import { doc } from "../ComponentDoc/mod.ts";

import "./asset/docs.ts";

doc({
  id: 'Wizard',
  readmeURL: new URL('./readme.md', import.meta.url),
});
