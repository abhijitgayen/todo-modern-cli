"use strict";

const Hyperbee = require("hyperbee");
const p = require("@clack/prompts");
const { equalKey } = require("../../helper/db_hepler");

module.exports = (store) => {
  return {
    command: "add",
    describe: "add a todo in todo list",
    handler: async (argv) => {
      const core = store.get({ name: "todos" });
      const db = new Hyperbee(core, {
        keyEncoding: "utf-8",
        valueEncoding: "json",
      });

      const todoData = await p.group(
        {
          todoTxt: () =>
            p.text({
              message: "Could you enter your todo?",
              placeholder: "Enter Your Todo",
              validate(value) {
                if (value.length === 0) return "Value is required!";
              },
            }),
          deadline: () =>
            p.text({
              message: "When are you expecting it to be done? (YYYY-MM-DD)",
              placeholder: "Enter Deadline",
              validate(value) {
                if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  return "Invalid date format! Use YYYY-MM-DD.";
                }
                const inputDate = new Date(value);
                if (inputDate.toString() === "Invalid Date") {
                  return "Invalid date!";
                }
                if (inputDate < new Date()) {
                  return "Deadline should be in the future!";
                }
              },
            }),
        },
        {
          onCancel: ({ results }) => {
            p.cancel("Operation cancelled.");
            process.exit(0);
          },
        },
      );

      await db.put(
        new Date().getTime(),
        {
          ...todoData,
          ...{ status: "created" },
        },
        { equalKey },
      );

      await db.close();

      console.log("Added Successfully.");
    },
  };
};
