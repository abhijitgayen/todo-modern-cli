"use strict";

const Hyperbee = require("hyperbee");
const { select } = require("@clack/prompts");
const { equalKey } = require("../../helper/db_hepler");
const p = require("@clack/prompts");

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

  if (
    Object.keys(filteredTodoList).length === 0 &&
    filteredTodoList.constructor === Object
  ) {
    return {};
  }

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

const getUpdatedTodo = async (seletedTodo = {}) => {
  console.log(seletedTodo, "seletedTodo");
  const updatedOps = await p.group(
    {
      todoTxt: () =>
        p.text({
          message: "Could you enter your updated todo?",
          placeholder: "Enter Your Todo",
          initialValue: seletedTodo.todoTxt,
          validate(value) {
            if (value.length === 0) return "Value is required!";
          },
        }),
      deadline: () =>
        p.text({
          message: "When are you updating the dateline? (YYYY-MM-DD)",
          placeholder: "Enter Deadline",
          initialValue: seletedTodo?.deadline,
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
  return { ...seletedTodo, ...updatedOps };
};

module.exports = (store) => {
  return {
    command: "update",
    describe: "update todo",
    handler: async (argv) => {
      const core = store.get({ name: "todos" });
      const db = new Hyperbee(core, {
        keyEncoding: "utf-8",
        valueEncoding: "json",
      });

      const todosOptions = await getTodosOptions(db);

      if (
        Object.keys(todosOptions).length === 0 &&
        todosOptions.constructor === Object
      ) {
        console.log("There are no todo.");
        return;
      }

      const selectTodoKey = await select({
        message: "Select one or more todo marks as a done",
        options: todosOptions,
      });

      if (selectTodoKey && selectTodoKey !== "none") {
        const seletedTodo = await db.get(selectTodoKey);
        const updatedTodo = await getUpdatedTodo(seletedTodo?.value);

        await db.put(seletedTodo?.key, updatedTodo, { equalKey });
      }

      await db.close();

      console.log("Updated Successfully.");
    },
  };
};
