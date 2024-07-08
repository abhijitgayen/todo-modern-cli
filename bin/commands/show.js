"use strict";

const Hyperbee = require("hyperbee");

module.exports = (store) => {
  return {
    command: "show",
    describe: "show todo",
    handler: async (argv) => {
      const core = store.get({ name: "todos" });
      const db = new Hyperbee(core, {
        keyEncoding: "utf-8",
        valueEncoding: "json",
      });

      const todoList = {};

      for await (const entry of db.createHistoryStream({})) {
        todoList[entry.key] = entry.value;
      }

      const filteredTodoList = Object.fromEntries(
        Object.entries(todoList).filter(([key, value]) => value !== null),
      );

      if (
        Object.keys(filteredTodoList).length === 0 &&
        filteredTodoList.constructor === Object
      ) {
        console.log("There are No todo in the list");
        return;
      }

      const transformedTodoList = Object.keys(filteredTodoList).map((key) => {
        return {
          ...filteredTodoList[key],
        };
      });

      console.table(transformedTodoList);

      await db.close();
    },
  };
};
