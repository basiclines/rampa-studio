import { c as t } from "./engine-DvouyXcp.js";
function c(e, o) {
  const n = typeof e == "string" ? document.querySelector(e) : e;
  if (!n)
    throw new Error(`typetype: Element "${e}" not found`);
  return t(n, o);
}
export {
  c as typetype
};
