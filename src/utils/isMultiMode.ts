import { argv } from "process";

const isMultiMode = () => argv.slice(2).some((arg) => arg === "--multi");

export { isMultiMode };
