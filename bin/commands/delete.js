"use strict";

const Hyperbee = require("hyperbee");
const { select } = require("@clack/prompts");
const { equalKey } = require("../../helper/db_hepler");

const getTodosOptions = async (db, limit = 10) => {
  const options = [];
  const todoList = {};
  for await (const entry of db.createHistoryStream({
    limit,
  })) {
    todoList[entry.key] = entry.value;
  }

  const filteredTodoList = Object.fromEntries(
    Object.entries(todoList).filter(([key, value]) => value !== null),
  );

  for (const key in filteredTodoList) {
    const todo = todoList[key];
    options.push({
      value: key,
      label: `${todo?.todoTxt} || ${todo?.deadline} || ${todo?.status}`,
    });
  }

  options.push({ value: "none", label: "None" });

  return options;
};

module.exports = (store) => {
  return {
    command: "delete",
    describe: "delete todo",
    handler: async (argv) => {
      const core = store.get({ name: "todos" });
      const db = new Hyperbee(core, {
        keyEncoding: "utf-8",
        valueEncoding: "json",
      });

      const selectTodoKey = await select({
        message: "Select one or more todo marks as a done",
        options: await getTodosOptions(db),
      });

      if (selectTodoKey && selectTodoKey !== "none") {
        const seletedTodo = await db.get(selectTodoKey);
        await db.del(
          seletedTodo.key,
          {
            ...(seletedTodo?.value || {}),
            ...{ status: "done" },
          },
          { equalKey },
        );
      }

      await db.close();

      console.log("Deleted Successfully.");
    },
  };
};
