#!/usr/bin/env node

"use strict";

const yargs = require("yargs");
const figlet = require("figlet");
const chalk = require("chalk");
const Corestore = require("corestore");
const os = require("os");
const path = require("path");

const homeDir = os.homedir();
const store = new Corestore(path.join(homeDir, ".todo"));

const initialMessage =
  chalk.redBright(figlet.textSync("Todo .", { horizontalLayout: "full" })) +
  "\n\n" +
  chalk.blue(
    "Welcome to the Todo CLI tool!\nThis tool allows you to manage Your Todo.",
  );

console.log(initialMessage);
store.ready().then(async () => {
  // eslint-disable-next-line
  yargs
    .command(require("./commands/show")(store))
    .command(require("./commands/add")(store))
    .command(require("./commands/done")(store))
    .command(require("./commands/update")(store))
    .command(require("./commands/delete")(store))
    .demandCommand()
    .strict()
    .help().argv;
});
